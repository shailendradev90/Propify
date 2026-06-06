import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';
import { subscribeDealerProperties } from '../../services/properties';

interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  soldRented: number;
  enquiries: number;
}

const DealerDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeListings: 0,
    soldRented: 0,
    enquiries: 0,
  });
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeDealerProperties(user.uid, (items) => {
      setProperties(items);
      // Calculate stats from properties
      setStats({
        totalProperties: items.length,
        activeListings: items.length, // Assuming all are active if in the list
        soldRented: 0, // Would need to track from firebase
        enquiries: 0, // Would need to query from firebase
      });
    });
    return unsub;
  }, [user]);

  const StatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({
    icon,
    label,
    value,
    color,
  }) => (
    <View style={[styles.statCard, { borderColor: color }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.name}>{user?.fullName ?? 'Dealer'}</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.fullName?.[0]?.toUpperCase() ?? '?'}</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon="home-outline" label="Total Properties" value={stats.totalProperties} color={colors.primary} />
          <StatCard icon="checkmark-circle-outline" label="Active" value={stats.activeListings} color={colors.success} />
          <StatCard icon="swap-horizontal-outline" label="Sold/Rented" value={stats.soldRented} color={colors.warning} />
          <StatCard icon="chatbubble-outline" label="Enquiries" value={stats.enquiries} color={colors.accent} />
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.performanceCard}>
            <View style={styles.perfRow}>
              <Text style={styles.perfLabel}>Avg. Response Time</Text>
              <Text style={styles.perfValue}>2h 15m</Text>
            </View>
            <View style={styles.perfDivider} />
            <View style={styles.perfRow}>
              <Text style={styles.perfLabel}>Profile Views</Text>
              <Text style={styles.perfValue}>1,234</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: spacing.xs },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 24 },
  statsGrid: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  statContent: { flex: 1 },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  performanceCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  perfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  perfLabel: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  perfValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  perfDivider: { height: 1, backgroundColor: colors.border },
});

export default DealerDashboardScreen;
