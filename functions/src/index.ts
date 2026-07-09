/**
 * Firebase Cloud Functions — Stripe payment integration
 *
 * SETUP:
 *   1. cd functions && npm install stripe firebase-admin firebase-functions
 *   2. firebase functions:secrets:set STRIPE_SECRET_KEY
 *      (paste your Stripe Secret key: sk_live_... or sk_test_...)
 *   3. firebase deploy --only functions
 *
 * These two functions implement the payment flow:
 *
 *   createStripeCheckout  — creates a Stripe Checkout Session and redirects.
 *   verifyStripePayment   — verifies a completed session and activates the plan.
 */

import * as functions from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();
const db = admin.firestore();

// Stripe is initialised lazily so the secret is only read at runtime.
const getStripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' });

// ── Plan → Stripe Price ID map (must match subscriptionService.ts) ────────────
const PRICE_IDS: Record<string, string> = {
  basic:    'price_REPLACE_WITH_BASIC_PRICE_ID',
  standard: 'price_REPLACE_WITH_STANDARD_PRICE_ID',
  premium:  'price_REPLACE_WITH_PREMIUM_PRICE_ID',
};

// Subscription duration in days
const PLAN_DURATION_DAYS = 30;

// ── createStripeCheckout ──────────────────────────────────────────────────────
/**
 * GET /createStripeCheckout
 * Query params: dealerId, priceId, paymentId, successUrl, cancelUrl
 *
 * Creates a Stripe Checkout Session and redirects the browser to it.
 */
export const createStripeCheckout = functions.onRequest(
  { secrets: ['STRIPE_SECRET_KEY'], cors: true },
  async (req, res) => {
    const { dealerId, priceId, paymentId, successUrl, cancelUrl } = req.query as Record<string, string>;

    if (!dealerId || !priceId || !paymentId || !successUrl || !cancelUrl) {
      res.status(400).send('Missing required query parameters.');
      return;
    }

    // Verify the payment doc exists and is still pending
    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();
    if (!paymentSnap.exists || paymentSnap.data()?.status !== 'pending') {
      res.status(400).send('Invalid or expired payment record.');
      return;
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { dealerId, paymentId },
      subscription_data: {
        metadata: { dealerId, paymentId },
      },
    });

    // Store the session ID so verifyStripePayment can look it up
    await paymentRef.update({ stripeSessionId: session.id });

    // Redirect browser to Stripe Checkout
    res.redirect(303, session.url as string);
  },
);

// ── verifyStripePayment ───────────────────────────────────────────────────────
/**
 * POST /verifyStripePayment?paymentId=xxx
 *
 * Verifies the Stripe session is paid, then:
 *   1. Updates the `payments` doc to status=completed.
 *   2. Updates the dealer's `users` doc with the new plan + expiry.
 *
 * Returns JSON: { plan, expiry }
 */
export const verifyStripePayment = functions.onRequest(
  { secrets: ['STRIPE_SECRET_KEY'], cors: true },
  async (req, res) => {
    const { paymentId } = req.query as Record<string, string>;

    if (!paymentId) {
      res.status(400).json({ error: 'Missing paymentId.' });
      return;
    }

    const paymentRef = db.collection('payments').doc(paymentId);
    const paymentSnap = await paymentRef.get();

    if (!paymentSnap.exists) {
      res.status(404).json({ error: 'Payment record not found.' });
      return;
    }

    const payment = paymentSnap.data()!;

    // Already completed — return cached result (idempotent)
    if (payment.status === 'completed') {
      res.json({ plan: payment.plan, expiry: payment.completedAt + PLAN_DURATION_DAYS * 86400000 });
      return;
    }

    if (payment.status !== 'pending') {
      res.status(400).json({ error: 'Payment is not in a verifiable state.' });
      return;
    }

    const stripe = getStripe();
    const sessionId = payment.stripeSessionId;

    if (!sessionId) {
      res.status(400).json({ error: 'No Stripe session found for this payment.' });
      return;
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(402).json({ error: 'Payment has not been completed.' });
      return;
    }

    const now = Date.now();
    const expiry = now + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000;
    const plan = payment.plan as string;

    // Atomic batch: update payment + user profile
    const batch = db.batch();

    batch.update(paymentRef, {
      status: 'completed',
      completedAt: now,
      stripePaymentIntentId: session.payment_intent ?? null,
    });

    batch.update(db.collection('users').doc(payment.dealerId), {
      subscriptionPlan: plan,
      subscriptionExpiry: expiry,
    });

    await batch.commit();

    res.json({ plan, expiry });
  },
);

// ── stripeWebhook (optional but recommended) ─────────────────────────────────
/**
 * POST /stripeWebhook
 *
 * Handles Stripe webhook events for subscription lifecycle:
 *   - invoice.payment_succeeded  → renew expiry
 *   - customer.subscription.deleted → downgrade to basic
 *
 * Set your webhook secret:
 *   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 */
export const stripeWebhook = functions.onRequest(
  { secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'], cors: false },
  async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } catch {
      res.status(400).send('Webhook signature verification failed.');
      return;
    }

    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const dealerId = invoice.subscription_details?.metadata?.dealerId;
        if (dealerId) {
          const expiry = Date.now() + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000;
          await db.collection('users').doc(dealerId).update({ subscriptionExpiry: expiry });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const dealerId = sub.metadata?.dealerId;
        if (dealerId) {
          await db.collection('users').doc(dealerId).update({
            subscriptionPlan: 'basic',
            subscriptionExpiry: admin.firestore.FieldValue.delete(),
          });
        }
        break;
      }
    }

    res.json({ received: true });
  },
);
