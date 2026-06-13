import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
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
  { label: 'Active Listings', basic: '5', standard: '25', premium: 'Unlimited' },
  { label: 'Featured Listings', basic: false, standard: '3/month', premium: 'Unlimited' },
  { label: 'Photo Uploads per Listing', basic: '10', standard: '25', premium: '50' },
  { label: 'Video Tours', basic: false, standard: true, premium: true },
  { label: 'Priority in Search Results', basic: false, standard: true, premium: true },
  { label: 'Analytics Dashboard', basic: 'Basic', standard: 'Advanced', premium: 'Premium' },
  { label: 'Lead Management', basic: false, standard: true, premium: true },
  { label: 'Dedicated Support', basic: false, standard: false, premium: true },
  { label: 'Custom Branding', basic: false, standard: false, premium: true },
  { label: 'API Access', basic: false, standard: false, premium: true },
];

const PLANS: { key: SubscriptionPlan; label: string; price: string; period: string; gradient: string[]; popular?: boolean }[] = [
  {
    key: 'basic',
    label: 'Basic',
    price: '₹499',
    period: '/month',
    gradient: ['#6B7280', '#9CA3AF'],
  },
  {
    key: 'standard',
    label: 'Standard',
    price: '₹1,499',
    period: '/month',
    gradient: [colors.primary, colors.primaryDark],
    popular: true,
  },
  {
    key: 'premium',
    label: 'Premium',
    price: '₹4,999',
    period: '/month',
    gradient: ['#7C3AED', '#4F46E5'],
  },
];

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const currentPlan = user?.subscriptionPlan ?? 'basic';

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    try {
      await updateProfile({
        subscriptionPlan: plan,
        subscriptionExpiry: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
      });
    } catch {}
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Ionicons name="checkmark-circle" size={20} color={colors.success} />;
    }
    if (value === false) {
      return <Ionicons name="close-circle" size={20} color={colors.textMuted + '40'} />;
    }
    return <Text style={styles.featureValueText}>{value}</Text>;
  };

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
            colors={PLANS.find(p => p.key === currentPlan)?.gradient ?? ['#6B7280', '#9CA3AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.currentPlanGradient}>
            <View style={styles.currentPlanBadge}>
              <Ionicons name="diamond" size={14} color={colors.bgWhite} />
              <Text style={styles.currentPlanBadgeText}>Current Plan</Text>
            </View>
            <Text style={styles.currentPlanName}>
              {PLANS.find(p => p.key === currentPlan)?.label ?? 'Basic'}
            </Text>
            <Text style={styles.currentPlanPrice}>
              {PLANS.find(p => p.key === currentPlan)?.price ?? '₹499'}
              <Text style={styles.currentPlanPeriod}>
                {PLANS.find(p => p.key === currentPlan)?.period ?? '/month'}
              </Text>
            </Text>
            {user?.subscriptionExpiry && (
              <Text style={styles.expiryText}>
                Valid until {new Date(user.subscriptionExpiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            )}
          </LinearGradient>
        </View>

        {/* Plan Cards */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.planCardsScroll}
            decelerationRate="fast"
            snapToInterval={260}>
            {PLANS.map(plan => {
              const isActive = plan.key === currentPlan;
              return (
                <Pressable
                  key={plan.key}
                  style={[styles.planCard, isActive && styles.planCardActive]}
                  onPress={() => handleSelectPlan(plan.key)}>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Ionicons name="star" size={10} color={colors.bgWhite} />
                      <Text style={styles.popularText}>Popular</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={plan.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.planCardHeader}>
                    <Text style={styles.planCardLabel}>{plan.label}</Text>
                    <Text style={styles.planCardPrice}>{plan.price}</Text>
                    <Text style={styles.planCardPeriod}>{plan.period}</Text>
                  </LinearGradient>
                  <View style={styles.planCardFeatures}>
                    {PLAN_FEATURES.slice(0, 5).map((feature, idx) => (
                      <View key={idx} style={styles.planFeatureRow}>
                        {feature[plan.key] === true ? (
                          <Ionicons name="checkmark" size={14} color={colors.success} />
                        ) : feature[plan.key] === false ? (
                          <Ionicons name="close" size={14} color={colors.textMuted + '40'} />
                        ) : (
                          <Text style={styles.planFeatureMini}>{feature[plan.key] as string}</Text>
                        )}
                        <Text style={styles.planFeatureLabel} numberOfLines={1}>
                          {feature.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.selectButton, isActive && styles.selectButtonActive]}>
                    <Text style={[styles.selectButtonText, isActive && styles.selectButtonTextActive]}>
                      {isActive ? 'Current Plan' : 'Select Plan'}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Feature Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Feature Comparison</Text>
          <View style={styles.comparisonTable}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableFeatureCol}>
                <Text style={styles.tableHeaderText}>Features</Text>
              </View>
              <View style={styles.tablePlanCol}>
                <Text style={styles.tableHeaderText}>Basic</Text>
              </View>
              <View style={styles.tablePlanCol}>
                <Text style={[styles.tableHeaderText, styles.tableHeaderHighlight]}>Std</Text>
              </View>
              <View style={styles.tablePlanCol}>
                <Text style={styles.tableHeaderText}>Pro</Text>
              </View>
            </View>

            {/* Table Rows */}
            {PLAN_FEATURES.map((feature, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                <View style={styles.tableFeatureCol}>
                  <Text style={styles.tableFeatureText}>{feature.label}</Text>
                </View>
                <View style={styles.tablePlanCol}>
                  {renderFeatureValue(feature.basic)}
                </View>
                <View style={styles.tablePlanCol}>
                  {renderFeatureValue(feature.standard)}
                </View>
                <View style={styles.tablePlanCol}>
                  {renderFeatureValue(feature.premium)}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  currentPlanBanner: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  currentPlanGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  currentPlanBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.bgWhite,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  currentPlanName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.bgWhite,
    marginBottom: spacing.xs,
  },
  currentPlanPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.bgWhite,
  },
  currentPlanPeriod: {
    fontSize: 14,
    fontWeight: '400',
    opacity: 0.8,
  },
  expiryText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: spacing.sm,
  },
  plansSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  planCardsScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  planCard: {
    width: 240,
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  planCardActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.bgWhite,
  },
  planCardHeader: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  planCardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgWhite,
    marginBottom: spacing.xs,
  },
  planCardPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.bgWhite,
  },
  planCardPeriod: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  planCardFeatures: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  planFeatureMini: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 14,
    textAlign: 'center',
  },
  planFeatureLabel: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  selectButton: {
    margin: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  selectButtonTextActive: {
    color: colors.primary,
  },
  comparisonSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  comparisonTable: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  tableHeaderHighlight: {
    color: colors.primary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: colors.bg + '40',
  },
  tableFeatureCol: {
    flex: 2,
    paddingLeft: spacing.md,
  },
  tableFeatureText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  tablePlanCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureValueText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default SubscriptionScreen;