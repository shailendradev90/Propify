import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.h1}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.fullName?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.role}>
          {user?.role === 'dealer' ? 'Dealer / Owner' : 'User'}
        </Text>

        <View style={styles.divider} />

        <Row icon="mail-outline" label={user?.email ?? '-'} />
        <Row icon="call-outline" label={user?.phone ?? 'Not provided'} />
      </View>

      <Button title="Sign out" variant="danger" onPress={signOut} />
    </Screen>
  );
};

const Row: React.FC<{ icon: any; label: string }> = ({ icon, label }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={18} color={colors.primary} />
    <Text style={styles.rowLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  h1: { fontSize: 32, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: { color: colors.primary, fontWeight: '700', fontSize: 32 },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  role: { color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg, fontSize: 14 },
  divider: { height: 1, backgroundColor: colors.border, width: '100%', marginVertical: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { marginLeft: spacing.md, color: colors.text, fontSize: 15, flex: 1 },
});

export default ProfileScreen;
