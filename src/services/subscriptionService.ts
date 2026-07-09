/**
 * subscriptionService.ts
 *
 * Razorpay Web Checkout — works in Expo Go AND production builds.
 * No native module required.
 *
 * ── HOW IT WORKS ────────────────────────────────────────────────────────────
 *
 *  1. Dealer taps "Pay via UPI"
 *  2. A pending Payment doc is created in Firestore.
 *  3. expo-web-browser opens Razorpay's hosted payment page.
 *     URL format:
 *       https://api.razorpay.com/v1/checkout/embedded
 *       ?key_id=rzp_xxx&amount=49900&currency=INR&...
 *       &callback_url=credokin://payment-complete?payment_id=xxx
 *  4. Dealer pays with UPI / card / net-banking inside the browser.
 *  5. Razorpay redirects to the deep-link callback URL.
 *  6. App's Linking listener fires → activatePlan() writes to Firestore.
 *
 * ── SETUP ────────────────────────────────────────────────────────────────────
 *  1. Sign up at https://razorpay.com → get your Key ID.
 *  2. Add to .env:
 *       RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
 *  3. Register your deep-link scheme in app.config.js:
 *       scheme: 'credokin'   (already set)
 *  4. In Razorpay Dashboard → Settings → Website/App → add
 *       credokin://  as an allowed callback scheme.
 */

import { addDoc, collection, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import { db, isDemoMode } from './firebase';
import { Payment, PaymentStatus, SubscriptionPlan } from '../types';
import Constants from 'expo-constants';

const COL = 'payments';
const PLAN_DURATION_DAYS = 30;

// Deep-link scheme registered in app.config.js
const APP_SCHEME = 'credokin';

// Razorpay Key ID from env
const RAZORPAY_KEY_ID: string =
  (Constants.expoConfig?.extra?.razorpayKeyId as string | undefined) ?? '';

// ── Plan config ───────────────────────────────────────────────────────────────

export const PLAN_CONFIG: Record<
  SubscriptionPlan,
  { amountInPaise: number; label: string; priceLabel: string; description: string }
> = {
  basic: {
    amountInPaise: 49900,
    label: 'Basic',
    priceLabel: '₹499',
    description: '5 listings · Basic analytics',
  },
  standard: {
    amountInPaise: 149900,
    label: 'Standard',
    priceLabel: '₹1,499',
    description: '25 listings · Advanced analytics · Lead management',
  },
  premium: {
    amountInPaise: 499900,
    label: 'Premium',
    priceLabel: '₹4,999',
    description: 'Unlimited listings · Priority support · Custom branding',
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const createPendingPayment = async (
  dealerId: string,
  plan: SubscriptionPlan,
): Promise<string> => {
  const cfg = PLAN_CONFIG[plan];
  const payload: Omit<Payment, 'id'> = {
    dealerId,
    plan,
    amountInPaise: cfg.amountInPaise,
    currency: 'INR',
    status: 'pending',
    gateway: 'razorpay',
    createdAt: Date.now(),
  };
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
};

export const markPaymentFailed = (paymentId: string) =>
  updateDoc(doc(db, COL, paymentId), { status: 'failed' as PaymentStatus }).catch(() => {});

// ── activatePlan (called after confirmed payment) ─────────────────────────────

export const activatePlan = async (
  dealerId: string,
  paymentId: string,
  plan: SubscriptionPlan,
  razorpayPaymentId: string,
): Promise<number> => {
  const now = Date.now();
  const expiry = now + PLAN_DURATION_DAYS * 24 * 60 * 60 * 1000;

  await updateDoc(doc(db, COL, paymentId), {
    status: 'completed' as PaymentStatus,
    razorpayPaymentId,
    completedAt: now,
  });

  await updateDoc(doc(db, 'users', dealerId), {
    subscriptionPlan: plan,
    subscriptionExpiry: expiry,
  });

  return expiry;
};

// ── Main API ──────────────────────────────────────────────────────────────────

export interface DealerInfo {
  name: string;
  email: string;
  phone?: string;
}

export interface CheckoutResult {
  /** Firestore payment doc ID — pass to activatePlan() after deep-link returns */
  paymentId: string;
  /** true if dealer closed the browser without paying */
  dismissed: boolean;
}

/**
 * Opens Razorpay Web Checkout in an in-app browser.
 * Supports UPI, cards, net-banking and wallets — no native module needed.
 *
 * After this returns, listen for the deep-link
 *   credokin://payment-complete?status=success&payment_id=xxx&razorpay_payment_id=yyy
 * then call activatePlan() to write to Firestore.
 */
export const initiatePayment = async (
  dealerId: string,
  plan: SubscriptionPlan,
  dealer: DealerInfo,
): Promise<CheckoutResult> => {
  // ── Demo / missing key: instant mock success ──────────────────────────────
  if (isDemoMode || !RAZORPAY_KEY_ID) {
    return { paymentId: `demo-payment-${Date.now()}`, dismissed: false };
  }

  const cfg = PLAN_CONFIG[plan];
  const paymentId = await createPendingPayment(dealerId, plan);

  // Razorpay will redirect here after payment (success or failure)
  const callbackUrl =
    `${APP_SCHEME}://payment-complete` +
    `?payment_id=${encodeURIComponent(paymentId)}` +
    `&plan=${encodeURIComponent(plan)}` +
    `&dealer_id=${encodeURIComponent(dealerId)}`;

  // Build Razorpay Web Checkout URL
  // Docs: https://razorpay.com/docs/payment-gateway/web-integration/hosted/
  const params = new URLSearchParams({
    key_id:      RAZORPAY_KEY_ID,
    amount:      String(cfg.amountInPaise),
    currency:    'INR',
    name:        'CredoKin',
    description: `${cfg.label} Plan — ${cfg.description}`,
    prefill_name:    dealer.name,
    prefill_email:   dealer.email,
    prefill_contact: dealer.phone ?? '',
    notes_firestorePaymentId: paymentId,
    notes_dealerId:            dealerId,
    notes_plan:                plan,
    callback_url: callbackUrl,
    cancel_url:   `${APP_SCHEME}://payment-complete?status=cancel&payment_id=${encodeURIComponent(paymentId)}`,
    theme_color: '#0D5C3F',
  });

  const checkoutUrl = `https://api.razorpay.com/v1/checkout/embedded?${params.toString()}`;

  const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
    enableBarCollapsing: true,
  });

  const dismissed = result.type === 'cancel' || result.type === 'dismiss';

  if (dismissed) {
    await markPaymentFailed(paymentId);
  }

  return { paymentId, dismissed };
};

// ── Payment history ───────────────────────────────────────────────────────────

export const getPaymentHistory = async (dealerId: string): Promise<Payment[]> => {
  if (isDemoMode) return [];
  const q = query(
    collection(db, COL),
    where('dealerId', '==', dealerId),
    where('status', '==', 'completed'),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...(d.data() as Omit<Payment, 'id'>) }))
    .sort((a, b) => b.createdAt - a.createdAt);
};
