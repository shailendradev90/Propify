import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '../../theme';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
}

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [role, setRole] = useState<UserRole>('user');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Building Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.buildingGroup}>
            <View style={[styles.building, styles.building1]}>
              {[...Array(6)].map((_, i) => (
                <View key={i} style={styles.windowRow}>
                  <View style={styles.window} />
                  <View style={styles.window} />
                </View>
              ))}
            </View>
            <View style={[styles.building, styles.building2]}>
              {[...Array(8)].map((_, i) => (
                <View key={i} style={styles.windowRow}>
                  <View style={styles.window} />
                  <View style={styles.window} />
                  <View style={styles.window} />
                </View>
              ))}
            </View>
            <View style={[styles.building, styles.building3]}>
              {[...Array(5)].map((_, i) => (
                <View key={i} style={styles.windowRow}>
                  <View style={styles.window} />
                  <View style={styles.window} />
                </View>
              ))}
            </View>
          </View>
          <View style={styles.trees}>
            <View style={styles.tree} />
            <View style={styles.tree} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.welcomeTitle}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>

          <View style={styles.rolePicker}>
            <Pressable
              style={[styles.roleTab, role === 'user' && styles.roleTabActive]}
              onPress={() => {
                setRole('user');
                navigation.navigate('Login', { role: 'user' });
              }}>
              <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Home seeker</Text>
            </Pressable>
            <Pressable
              style={[styles.roleTab, role === 'dealer' && styles.roleTabActive]}
              onPress={() => {
                setRole('dealer');
                navigation.navigate('Login', { role: 'dealer' });
              }}>
              <Text style={[styles.roleText, role === 'dealer' && styles.roleTextActive]}>Dealer</Text>
            </Pressable>
          </View>

          <Text style={styles.infoText}>
            Choose your role to continue to the login screen.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: colors.bgWhite 
  },
  container: { 
    flex: 1 
  },
  illustrationContainer: {
    height: '40%',
    backgroundColor: colors.bgWhite,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  buildingGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  building: {
    borderTopLeftRadius: radius.md,
    borderTopRightRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  building1: {
    width: 70,
    height: 140,
    backgroundColor: '#B8E6D5',
  },
  building2: {
    width: 90,
    height: 180,
    backgroundColor: '#A0D9C8',
  },
  building3: {
    width: 65,
    height: 120,
    backgroundColor: '#B8E6D5',
  },
  windowRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-around',
  },
  window: {
    width: 12,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 2,
  },
  trees: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  tree: {
    width: 30,
    height: 40,
    backgroundColor: '#7BC9A8',
    borderRadius: 15,
  },
  content: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: spacing.xxl,
  },
  form: {
    gap: spacing.lg,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  rolePicker: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleTab: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
  },
  roleTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  roleTextActive: {
    color: colors.bgWhite,
  },
  forgotPassword: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.bgWhite,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  signupLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
});

export default WelcomeScreen;

// Made with Bob
