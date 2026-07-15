import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';

interface Props {
  navigation: any;
}

interface MenuItem {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  screen: string;
  color?: string;
  badge?: string;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const isDealer = user?.role === 'dealer';

  const dealerMenuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      subtitle: 'Update your personal information',
      screen: 'EditProfile',
    },
    {
      icon: 'business-outline',
      label: 'Business Details',
      subtitle: 'Company info, RERA & address',
      screen: 'BusinessDetails',
    },
    {
      icon: 'home-outline',
      label: 'My Listings',
      subtitle: 'Manage your properties',
      screen: 'MyProperties',
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      subtitle: 'Manage alert preferences',
      screen: 'Notifications',
    },
  ];

  const userMenuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      subtitle: 'Update your personal information',
      screen: 'EditProfile',
    },
    {
      icon: 'heart-outline',
      label: 'Wishlist',
      subtitle: 'Your saved properties',
      screen: 'Wishlist',
    },
    {
      icon: 'call-outline',
      label: 'Contacted',
      subtitle: 'Properties you showed interest in',
      screen: 'Contacted',
    },
  ];

  const generalMenuItems: MenuItem[] = [
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      subtitle: 'FAQ, contact us',
      screen: 'Help',
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Privacy',
      subtitle: 'Legal information',
      screen: 'Terms',
    },
    {
      icon: 'information-circle-outline',
      label: 'About CredoKin',
      subtitle: 'Version 1.0.0',
      screen: 'About',
    },
  ];

  const menuItems = isDealer ? dealerMenuItems : userMenuItems;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradientOverlay isDealer={isDealer} />
          <View style={styles.profileCardContent}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, isDealer && styles.avatarDealer]}>
                <Text style={[styles.avatarText, isDealer && styles.avatarTextDealer]}>
                  {user?.fullName?.[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
            </View>
            <Text style={styles.userName}>{user?.fullName}</Text>
            <View style={styles.roleContainer}>
              <Ionicons
                name={isDealer ? 'briefcase' : 'person'}
                size={12}
                color={isDealer ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.roleText, isDealer && styles.roleTextDealer]}>
                {isDealer ? 'Dealer / Property Owner' : 'User'}
              </Text>
            </View>

            {/* Quick Info */}
            <View style={styles.quickInfoRow}>
              <View style={styles.quickInfoItem}>
                <Ionicons name="mail-outline" size={14} color={colors.textMuted} />
                <Text style={styles.quickInfoText} numberOfLines={1}>
                  {user?.email ?? '-'}
                </Text>
              </View>
              <View style={styles.quickInfoDivider} />
              <View style={styles.quickInfoItem}>
                <Ionicons name="call-outline" size={14} color={colors.textMuted} />
                <Text style={styles.quickInfoText} numberOfLines={1}>
                  {user?.phone ?? 'Not provided'}
                </Text>
              </View>
            </View>

            {/* Business Info (Dealer only) */}
            {isDealer && user?.businessName && (
              <View style={styles.businessInfoRow}>
                <Ionicons name="business-outline" size={14} color={colors.primary} />
                <Text style={styles.businessInfoText} numberOfLines={1}>
                  {user.businessName}
                  {user.reraNumber ? ` • RERA: ${user.reraNumber}` : ''}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>
            {isDealer ? 'Account Settings' : 'My Account'}
          </Text>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <Pressable
                key={item.screen}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => navigation.navigate(item.screen)}>
                <View style={[styles.menuIcon, { backgroundColor: (item.color || colors.primary) + '12' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color || colors.primary} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                {item.badge ? (
                  <View style={[styles.menuBadge, { backgroundColor: item.color || colors.primary }]}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* General Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>General</Text>
          <View style={styles.menuCard}>
            {generalMenuItems.map((item, index) => (
              <Pressable
                key={item.screen}
                style={[
                  styles.menuItem,
                  index < generalMenuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={() => {}}>
                <View style={[styles.menuIcon, { backgroundColor: (item.color || colors.textMuted) + '12' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color || colors.textMuted} />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemLabel}>{item.label}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Pressable style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple gradient overlay for the profile card top
const LinearGradientOverlay: React.FC<{ isDealer: boolean }> = ({ isDealer }) => {
  if (!isDealer) return null;
  return (
    <View
      style={[
        styles.cardGradientOverlay,
        {
          backgroundColor: colors.primary + '40',
          opacity: 0.06,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgWhite,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  profileCard: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  profileCardContent: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarDealer: {
    backgroundColor: colors.primary,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 32,
  },
  avatarTextDealer: {
    color: colors.bgWhite,
  },
  planBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.bgWhite,
  },
  planBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.bgWhite,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  roleText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  roleTextDealer: {
    color: colors.primary,
    fontWeight: '600',
  },
  quickInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  quickInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickInfoText: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
  },
  quickInfoDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  businessInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    alignSelf: 'stretch',
  },
  businessInfoText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  menuSection: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  menuSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    flex: 1,
    gap: 2,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  menuBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  menuBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.bgWhite,
    letterSpacing: 0.5,
  },
  signOutSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.danger + '30',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
});

export default ProfileScreen;