import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const buildingSlide = useRef(new Animated.Value(100)).current;
  const checkFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for the logo icon
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    // Main animation sequence
    Animated.sequence([
      // 1. Logo icon appears with scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // 2. Brand name slides up
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      // 3. Tagline fades in
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 4. Trust checkmarks appear
      Animated.timing(checkFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 5. Buildings slide up
      Animated.timing(buildingSlide, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    pulse.start();

    const timer = setTimeout(() => {
      onFinish();
    }, 3500);

    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, []);

  return (
    <LinearGradient
      colors={[colors.primaryDark, '#063D2B', colors.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          {/* Glowing icon background */}
          <Animated.View
            style={[
              styles.iconGlow,
              {
                opacity: fadeAnim,
                transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']}
              style={styles.iconOuter}
            >
              <View style={styles.iconInner}>
                <Ionicons name="home" size={36} color={colors.bgWhite} />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Brand Name */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <Text style={styles.brandName}>CredoKin</Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={{ opacity: taglineFade }}>
            <Text style={styles.tagline}>Find Your Perfect Property</Text>
          </Animated.View>
        </View>

        {/* Trust Indicators */}
        <Animated.View style={[styles.trustSection, { opacity: checkFade }]}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="shield-checkmark" size={18} color={colors.accent} />
            </View>
            <Text style={styles.trustText}>100% Verified Listings</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            </View>
            <Text style={styles.trustText}>Only Active Properties</Text>
          </View>
          <View style={styles.trustDivider} />
          <View style={styles.trustItem}>
            <View style={styles.trustIconContainer}>
              <Ionicons name="sparkles" size={18} color={colors.accent} />
            </View>
            <Text style={styles.trustText}>No Fake or Inactive Data</Text>
          </View>
        </Animated.View>
      </View>

      {/* Cityscape at bottom */}
      <Animated.View
        style={[
          styles.cityscapeContainer,
          { transform: [{ translateY: buildingSlide }] },
        ]}
      >
        {/* Stars/dots in sky */}
        <View style={styles.starsContainer}>
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left: 20 + i * (SCREEN_WIDTH / 8.5),
                  top: 10 + (i % 3) * 15,
                  opacity: 0.3 + (i % 3) * 0.2,
                  width: 3 + (i % 2),
                  height: 3 + (i % 2),
                },
              ]}
            />
          ))}
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.15)']}
          style={styles.cityscapeGradient}
        >
          <View style={styles.cityscape}>
            {/* Building 1 */}
            <View style={[styles.building, styles.bld1]}>
              <View style={styles.bldWindows}>
                {[...Array(7)].map((_, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                  </View>
                ))}
              </View>
            </View>
            {/* Building 2 - tall */}
            <View style={[styles.building, styles.bld2]}>
              <View style={styles.bldWindows}>
                {[...Array(10)].map((_, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                  </View>
                ))}
              </View>
            </View>
            {/* Building 3 - medium */}
            <View style={[styles.building, styles.bld3]}>
              <View style={styles.bldWindows}>
                {[...Array(6)].map((_, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                  </View>
                ))}
              </View>
            </View>
            {/* Building 4 */}
            <View style={[styles.building, styles.bld4]}>
              <View style={styles.bldWindows}>
                {[...Array(8)].map((_, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                  </View>
                ))}
              </View>
            </View>
            {/* Building 5 */}
            <View style={[styles.building, styles.bld5]}>
              <View style={styles.bldWindows}>
                {[...Array(5)].map((_, i) => (
                  <View key={i} style={styles.windowRow}>
                    <View style={styles.windowSmall} />
                    <View style={styles.windowSmall} />
                  </View>
                ))}
              </View>
            </View>
            {/* Trees */}
            <View style={[styles.tree, { left: 10 }]} />
            <View style={[styles.tree, { left: SCREEN_WIDTH - 80 }]} />
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Version */}
      <Animated.View style={[styles.versionContainer, { opacity: checkFade }]}>
        <Text style={styles.versionText}>v1.0 • Made with ❤️</Text>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: 200,
    left: -60,
  },
  decorCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: 150,
    right: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  iconGlow: {
    marginBottom: spacing.xl,
  },
  iconOuter: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.bgWhite,
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  trustSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  trustIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trustText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  trustDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cityscapeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  star: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  cityscapeGradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cityscape: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: 50,
  },
  building: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    overflow: 'hidden',
  },
  bld1: {
    width: 55,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bld2: {
    width: 65,
    height: 130,
    backgroundColor: 'rgba(255,255,255,0.16)',
    marginHorizontal: 6,
  },
  bld3: {
    width: 50,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bld4: {
    width: 60,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginHorizontal: 6,
  },
  bld5: {
    width: 45,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  bldWindows: {
    padding: 5,
    gap: 4,
  },
  windowRow: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  windowSmall: {
    width: 8,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
  },
  tree: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 35,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderRadius: 12,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  versionText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SplashScreen;