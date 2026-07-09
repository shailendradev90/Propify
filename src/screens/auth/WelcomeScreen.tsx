import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { loginAsDemo } = useAuth();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const card1Anim = useRef(new Animated.Value(0)).current;
  const card2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(card1Anim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(card2Anim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary, '#1a7a5a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        <View style={styles.container}>
          {/* Top Section - Logo & Title */}
          <Animated.View
            style={[
              styles.topSection,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoWrap}>
              <View style={styles.logoBg}>
                <Ionicons name="home" size={32} color={colors.bgWhite} />
              </View>
            </View>
            <Text style={styles.brandName}>CredoKin</Text>
            <Text style={styles.tagline}>Your trusted property partner</Text>

            {/* Trust badges */}
            <View style={styles.trustBadges}>
              <View style={styles.trustBadge}>
                <Ionicons name="shield-checkmark" size={14} color={colors.accent} />
                <Text style={styles.trustBadgeText}>Verified</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="checkmark-circle" size={14} color={colors.accent} />
                <Text style={styles.trustBadgeText}>Active Only</Text>
              </View>
              <View style={styles.trustBadge}>
                <Ionicons name="lock-closed" size={14} color={colors.accent} />
                <Text style={styles.trustBadgeText}>Secure</Text>
              </View>
            </View>
          </Animated.View>

          {/* Middle Section - Welcome Message */}
          <View style={styles.middleSection}>
            <Text style={styles.welcomeTitle}>Welcome!</Text>
            <Text style={styles.welcomeSubtitle}>
              Discover genuine, active properties{'\n'}verified just for you
            </Text>
          </View>

          {/* Bottom Section - Role Cards */}
          <View style={styles.bottomSection}>
            {/* Home Seeker Card */}
            <Animated.View style={{ opacity: card1Anim, transform: [{ scale: card1Anim }] }}>
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => navigation.navigate('Login', { role: 'user' })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.85)']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleCardIconWrap}>
                    <View style={[styles.roleIcon, styles.roleIconUser]}>
                      <Ionicons name="search" size={24} color={colors.primary} />
                    </View>
                  </View>
                  <View style={styles.roleCardContent}>
                    <Text style={styles.roleCardTitle}>Find a Property</Text>
                    <Text style={styles.roleCardDesc}>
                      Search & discover verified{'\n'}properties for your home
                    </Text>
                  </View>
                  <View style={styles.roleCardArrow}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Dealer Card */}
            <Animated.View style={{ opacity: card2Anim, transform: [{ scale: card2Anim }] }}>
              <TouchableOpacity
                style={styles.roleCard}
                onPress={() => navigation.navigate('Signup', { role: 'dealer' })}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[colors.primaryLight, 'rgba(13, 92, 63, 0.08)']}
                  style={styles.roleCardGradient}
                >
                  <View style={styles.roleCardIconWrap}>
                    <View style={[styles.roleIcon, styles.roleIconDealer]}>
                      <Ionicons name="briefcase" size={24} color={colors.primary} />
                    </View>
                  </View>
                  <View style={styles.roleCardContent}>
                    <Text style={styles.roleCardTitle}>List Properties</Text>
                    <Text style={styles.roleCardDesc}>
                      Register as a dealer to list{'\n'}& manage your properties
                    </Text>
                  </View>
                  <View style={styles.roleCardArrow}>
                    <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Demo Mode */}
            <View style={styles.demoSection}>
              <TouchableOpacity
                onPress={() => loginAsDemo('user')}
                style={styles.demoButton}
              >
                <Ionicons name="play-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.demoText}>Try Demo Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom tagline */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Only genuine active properties • No fake or inactive data
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: 250,
    left: -50,
  },
  decorCircle3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: 200,
    right: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  topSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  logoWrap: {
    marginBottom: spacing.lg,
  },
  logoBg: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  brandName: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.bgWhite,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  trustBadges: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  trustBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: '600',
  },
  middleSection: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.bgWhite,
    marginBottom: spacing.sm,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  roleCard: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  roleCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  roleCardIconWrap: {
    marginRight: spacing.xs,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleIconUser: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  roleIconDealer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  roleCardContent: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  roleCardDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  roleCardArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  demoText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
  },
});

export default WelcomeScreen;