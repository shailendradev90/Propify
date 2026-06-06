import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={[colors.primaryDark, colors.primary]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.iconWrapper}>
            <View style={styles.houseIcon}>
              <View style={styles.roof} />
              <View style={styles.house} />
              <View style={styles.door} />
            </View>
          </View>
          <Text style={styles.brandName}>Propify</Text>
          <Text style={styles.tagline}>Find Your Perfect Property</Text>
        </View>
        
        <View style={styles.buildingIllustration}>
          <View style={styles.building1} />
          <View style={styles.building2} />
          <View style={styles.building3} />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  houseIcon: {
    width: 50,
    height: 50,
    position: 'relative',
  },
  roof: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.bgWhite,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  house: {
    width: 40,
    height: 30,
    backgroundColor: colors.bgWhite,
    position: 'absolute',
    bottom: 0,
    left: 5,
    borderRadius: 4,
  },
  door: {
    width: 12,
    height: 16,
    backgroundColor: colors.primary,
    position: 'absolute',
    bottom: 0,
    left: 19,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  brandName: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.bgWhite,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  buildingIllustration: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    position: 'absolute',
    bottom: 80,
  },
  building1: {
    width: 60,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  building2: {
    width: 70,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  building3: {
    width: 55,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});

export default SplashScreen;

// Made with Bob
