import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';
import { SubscriptionPlan } from '../../types';
import {
  PLAN_CONFIG,
  initiatePayment,
  activatePlan,
  markPaymentFailed,
} from '../../services/subscriptionService';

interface Props {
  navigation: any;
}

interface PlanFeature {
  label: string;
  basic: boolean | string;
  standard: boolean | string;
  premium: boolean | string;
}

const PLAN_FEATURES: PlanFeature[] = [
  { label: 'Active Listings',     basic: '5',      standard: '25',       premium: 'Unlimited' },
  { label: 'Featured Listings',   basic: false,    standard: '3/month',  premium: 'Unlimited' },
  { label: 'Photos per Listing',  basic: '10',     standard: '25',       premium: '50' },
  { label: 'Video Tours',         basic: false,    standard: true,       premium: true },
  { label: 'Priority in Search',  basic: false,    standard: true,       premium: true },
  { label: 'Analytics',           basic: 'Basic',  standard: 'Advanced', premium: 'Premium' },
  { label: 'Lead Management',     basic: false,    standard: true,       premium: true },
  { label: 'Dedicated Support',   basic: false,    standard: false,      premium: true },
  { label: 'Custom Branding',     basic: false,    standard: false,      premium: true },
];

const PLANS: {
  key: SubscriptionPlan;
  gradient: readonly [string, string];
  popular?: boolean;
}[] = [
  { key: 'basic',    gradient: ['#6B7280', '#9CA3AF'] as const },
  { key: 'standard', gradient: [colors.primary, colors.primaryDark] as const, popular: true },
  { key: 'premium',  gradient: ['#7C3AED', '#4F46E5'] as const },
];

// ── Pending payment state kept outside component so deep-link handler
//    can read it even if component re-renders ─────────────────────────────────
let _pendingPayment: { paymentId: string; dealerId: string; plan: SubscriptionPlan } | null = null;

// ── Component ────────────────────────────────────────────────────────────────

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { user, refresh } = useAuth();
  const currentPlan = user?.subscriptionPlan ?? 'basic';

  const [paying,    setPaying]    = useState<SubscriptionPlan | null>(null);
  const [verifying, setVerifying] = useState(false);

  // ── Deep-link handler ────────────────────────────────────────────────────
  // Razorpay redirects to:
  //   credokin://payment-complete?payment_id=xxx&razorpay_payment_id=yyy
  // or on cancel/failure:
  //   credokin://payment-complete?status=cancel&payment_id=xxx
  const handleDeepLink = useCallback(async (url: string) => {
    if (!url.includes('payment-complete')) return;

    const parsed = new URL(url);
    const status          = parsed.searchParams.get('status');
    const paymentId       = parsed.searchParams.get('payment_id')        ?? _pendingPayment?.paymentId;
    const razorpayPmtId   = parsed.searchParams.get('razorpay_payment_id');
    const plan            = (parsed.searchParams.get('plan')             ?? _pendingPayment?.plan) as SubscriptionPlan | null;
    const dealerId        = parsed.searchParams.get('dealer_id')         ?? _pendingPayment?.dealerId ?? user?.uid;

    _pendingPayment = null;
    setPaying(null);

    // Cancelled or errored
    if (status === 'cancel' || !razorpayPmtId || !paymentId || !plan || !dealerId) {
      if (paymentId) await markPaymentFailed(paymentId);
      if (status === 'cancel') {
        // user closed deliberately — no alert needed
        return;
      }
      Alert.alert('Payment Failed', 'Payment was not completed. No charge was made.');
      return;
    }

    // Success — activate plan in Firestore
    setVerifying(true);
    try {
      await activatePlan(dealerId, paymentId, plan, razorpayPmtId);
      await refresh();
      Alert.alert(
        '🎉 Payment Successful!',
        `Your ${PLAN_CONFIG[plan].label} plan is now active for 30 days.`,
        [{ text: 'Great!', onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert(
        'Activation Failed',
        err?.message ?? 'Payment received but plan activation failed. Please contact support.',
      );
    } finally {
      setVerifying(false);
    }
  }, [user, refresh, navigation]);

  useEffect(() => {
    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    return () => sub.remove();
  }, [handleDeepLink]);

  // ── Initiate payment ─────────────────────────────────────────────────────
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan || paying || verifying || !user) return;

    const cfg = PLAN_CONFIG[plan];

    Alert.alert(
      `Subscribe to ${cfg.label}`,
      `You will be charged ${cfg.priceLabel}/month.\n\nPay via UPI, card, or net-banking.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ${cfg.priceLabel}`,
          onPress: async () => {
            setPaying(plan);
            try {
              const { paymentId, dismissed } = await initiatePayment(
                user.uid,
                plan,
                { name: user.fullName, email: user.email, phone: user.phone },
              );

              if (dismissed) {
                // User closed browser — deep-link won't fire
                setPaying(null);
                return;
              }

              // Demo mode: no deep-link, activate immediately
              if (paymentId.startsWith('demo-')) {
                await refresh();
                Alert.alert('Demo Mode', 'Plan activated (demo). No real payment taken.');
                setPaying(null);
                return;
              }

              // Store pending state so deep-link handler can use it
              _pendingPayment = { paymentId, dealerId: user.uid, plan };
              // setPaying stays true until deep-link fires
            } catch (err: any) {
              Alert.alert('Error', err?.message ?? 'Could not open payment page. Try again.');
              setPaying(null);
            }
          },
        },
      ],
    );
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const renderFeatureValue = (value: boolean | string) => {
    if (value === true)  return <Ionicons name="checkmark-circle" size={18} color={colors.success} />;
    if (value === false) return <Ionicons name="close-circle"     size={18} color={colors.textMuted + '40'} />;
    return <Text style={styles.featureValueText}>{value}</Text>;
  };

  const meta = (key: SubscriptionPlan) => PLAN_CONFIG[key];
  const ui   = (key: SubscriptionPlan) => PLANS.find(p => p.key === key)!;

  // ── Verifying overlay ─────────────────────────────────────────────────────
  if (verifying) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.verifyingText}>Activating your plan…</Text>
        <Text style={styles.verifyingSubText}>Please do not close the app.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Current Plan Banner */}
        <View style={styles.currentPlanBanner}>
          <LinearGradient
            colors={ui(currentPlan).gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentPlanGradient}>
            <View style={styles.planBadge}>
              <Ionicons name="diamond" size={13} color={colors.bgWhite} />
              <Text style={styles.planBadgeText}>Current Plan</Text>
            </View>
            <Text style={styles.currentPlanName}>{meta(currentPlan).label}</Text>
            <Text style={styles.currentPlanPrice}>
              {meta(currentPlan).priceLabel}
              <Text style={styles.currentPlanPer}>/month</Text>
            </Text>
            {user?.subscriptionExpiry && (
              <Text style={styles.expiryText}>
                Valid until{' '}
                {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Payment method pills */}
        <View style={styles.upiRow}>
          {['⚡ UPI', '💳 Cards', '🏦 Net Banking', '👛 Wallets'].map(label => (
            <View key={label} style={styles.upiPill}>
              <Text style={styles.upiPillText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Plan Cards */}
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.planCardsScroll}
          decelerationRate="fast"
          snapToInterval={256}>
          {PLANS.map(plan => {
            const isActive = plan.key === currentPlan;
            const isBuying = paying === plan.key;
            const m = meta(plan.key);
            return (
              <Pressable
                key={plan.key}
                style={[styles.planCard, isActive && styles.planCardActive]}
                onPress={() => handleSelectPlan(plan.key)}
                disabled={isActive || !!paying || verifying}>
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>★ Popular</Text>
                  </View>
                )}
                <LinearGradient
                  colors={plan.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.planCardHeader}>
                  <Text style={styles.planCardLabel}>{m.label}</Text>
                  <Text style={styles.planCardPrice}>{m.priceLabel}</Text>
                  <Text style={styles.planCardPer}>/month</Text>
                </LinearGradient>

                <Text style={styles.planDescription}>{m.description}</Text>

                <View style={[
                  styles.payButton,
                  isActive && styles.payButtonActive,
                  isBuying && styles.payButtonBuying,
                ]}>
                  {isBuying
                    ? <ActivityIndicator size="small" color={colors.bgWhite} />
                    : <Text style={[
                        styles.payButtonText,
                        isActive && styles.payButtonTextActive,
                      ]}>
                        {isActive ? '✓ Active' : `Pay via UPI · ${m.priceLabel}`}
                      </Text>
                  }
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Secure payment notice */}
        <View style={styles.secureRow}>
          <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          <Text style={styles.secureText}>
            Payments secured by Razorpay. CredoKin never stores your payment details.
          </Text>
        </View>

        {/* Feature Comparison */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>What's Included</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeaderRow]}>
            <View style={styles.tableFeatureCol} />
            {PLANS.map(p => (
              <View key={p.key} style={styles.tablePlanCol}>
                <Text style={[
                  styles.tableHeaderText,
                  p.key === 'standard' && styles.tableHeaderHighlight,
                ]}>
                  {meta(p.key).label.slice(0, 3)}
                </Text>
              </View>
            ))}
          </View>
          {PLAN_FEATURES.map((feature, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
              <View style={styles.tableFeatureCol}>
                <Text style={styles.tableFeatureText}>{feature.label}</Text>
              </View>
              <View style={styles.tablePlanCol}>{renderFeatureValue(feature.basic)}</View>
              <View style={styles.tablePlanCol}>{renderFeatureValue(feature.standard)}</View>
              <View style={styles.tablePlanCol}>{renderFeatureValue(feature.premium)}</View>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  verifyingText: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  verifyingSubText: { fontSize: 13, color: colors.textMuted },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.bgWhite, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

  currentPlanBanner: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    borderRadius: radius.lg, overflow: 'hidden',
    elevation: 6, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  currentPlanGradient: { padding: spacing.xl, alignItems: 'center' },
  planBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.pill, marginBottom: spacing.md,
  },
  planBadgeText: { fontSize: 11, fontWeight: '600', color: colors.bgWhite, textTransform: 'uppercase', letterSpacing: 1 },
  currentPlanName: { fontSize: 26, fontWeight: '800', color: colors.bgWhite, marginBottom: spacing.xs },
  currentPlanPrice: { fontSize: 22, fontWeight: '700', color: colors.bgWhite },
  currentPlanPer: { fontSize: 13, fontWeight: '400', opacity: 0.8 },
  expiryText: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: spacing.sm },

  upiRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    paddingHorizontal: spacing.lg, marginTop: spacing.lg,
  },
  upiPill: {
    backgroundColor: colors.primaryLight, paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs, borderRadius: radius.pill,
  },
  upiPillText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  sectionTitle: {
    fontSize: 17, fontWeight: '700', color: colors.text,
    paddingHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.md,
  },
  planCardsScroll: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.sm },

  planCard: {
    width: 236, backgroundColor: colors.bgWhite, borderRadius: radius.lg,
    overflow: 'hidden', borderWidth: 2, borderColor: colors.border,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  planCardActive: { borderColor: colors.primary },
  popularBadge: {
    position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 1,
    backgroundColor: '#F59E0B', paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.pill,
  },
  popularText: { fontSize: 10, fontWeight: '700', color: colors.bgWhite },
  planCardHeader: { padding: spacing.lg, alignItems: 'center' },
  planCardLabel: { fontSize: 15, fontWeight: '700', color: colors.bgWhite, marginBottom: 2 },
  planCardPrice: { fontSize: 26, fontWeight: '800', color: colors.bgWhite },
  planCardPer: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  planDescription: {
    fontSize: 11, color: colors.textMuted, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, lineHeight: 17, minHeight: 50,
  },
  payButton: {
    margin: spacing.md, paddingVertical: 11, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', minHeight: 40,
    justifyContent: 'center',
  },
  payButtonActive:  { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  payButtonBuying:  { backgroundColor: colors.primary, borderColor: colors.primary },
  payButtonText:    { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  payButtonTextActive: { color: colors.primary },

  secureRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: radius.md,
  },
  secureText: { fontSize: 11, color: colors.textMuted, flex: 1, lineHeight: 17 },

  table: {
    marginHorizontal: spacing.lg, backgroundColor: colors.bgWhite,
    borderRadius: radius.lg, overflow: 'hidden',
    elevation: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 1 },
  },
  tableRow: {
    flexDirection: 'row', paddingVertical: spacing.md, alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  tableHeaderRow: { backgroundColor: colors.bg },
  tableRowEven: { backgroundColor: colors.bg + '50' },
  tableFeatureCol: { flex: 2, paddingLeft: spacing.md },
  tableFeatureText: { fontSize: 12, color: colors.text, fontWeight: '500' },
  tablePlanCol: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tableHeaderText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', textAlign: 'center' },
  tableHeaderHighlight: { color: colors.primary },
  featureValueText: { fontSize: 11, fontWeight: '600', color: colors.primary },
});

export default SubscriptionScreen;
