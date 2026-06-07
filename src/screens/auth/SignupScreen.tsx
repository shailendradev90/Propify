import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signUp } from '../../services/auth';
import { colors, radius, spacing } from '../../theme';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
  route: { params?: { role?: UserRole } };
}

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role ?? 'dealer';

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const passwordValidation = {
    length: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
  const isPasswordValid = passwordValidation.length && passwordValidation.hasLetter && passwordValidation.hasNumber;

  const onSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required', 'Please enter your mobile number.');
      return;
    }
    if (phone.trim().length < 10) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please create a password.');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Weak password', 'Password must be at least 6 characters with letters and numbers.');
      return;
    }

    try {
      setLoading(true);
      await signUp(email.trim(), password, name.trim(), 'dealer', `+91${phone.trim()}`);
    } catch (e: any) {
      console.error('Signup error:', e);
      const code = e?.code || '';
      const msg = e?.message || 'Unable to create account.';
      Alert.alert('Sign up failed', code ? `${code}\n${msg}` : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* Header with gradient */}
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerDecor}>
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.bgWhite} />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.headerContent,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.headerIconWrap}>
            <Ionicons name="briefcase-outline" size={28} color={colors.bgWhite} />
          </View>
          <Text style={styles.headerTitle}>Dealer Registration</Text>
          <Text style={styles.headerSubtitle}>Create your dealer account to list properties</Text>
        </Animated.View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Ionicons name="person-outline" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder="Enter your full name"
                  placeholderTextColor={colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* Mobile Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number <Text style={styles.required}>*</Text></Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCodeBox}>
                  <Text style={styles.countryFlag}>🇮🇳</Text>
                  <Text style={styles.countryCode}>+91</Text>
                </View>
                <View style={[styles.inputRow, styles.phoneInputRow]}>
                  <View style={styles.inputIcon}>
                    <Ionicons name="call-outline" size={20} color={colors.textMuted} />
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="10-digit number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder="dealer@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password <Text style={styles.required}>*</Text></Text>
              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                </View>
                <TextInput
                  style={styles.inputField}
                  placeholder="Min. 6 characters"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <View style={styles.passwordHints}>
                <Text style={styles.hintTitle}>Password Strength</Text>
                <View style={styles.hintRow}>
                  <Ionicons
                    name={passwordValidation.length ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={passwordValidation.length ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.hintText, passwordValidation.length && styles.hintValid]}>
                    At least 6 characters
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Ionicons
                    name={passwordValidation.hasLetter ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={passwordValidation.hasLetter ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.hintText, passwordValidation.hasLetter && styles.hintValid]}>
                    Contains letters (a-z, A-Z)
                  </Text>
                </View>
                <View style={styles.hintRow}>
                  <Ionicons
                    name={passwordValidation.hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                    size={16}
                    color={passwordValidation.hasNumber ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.hintText, passwordValidation.hasNumber && styles.hintValid]}>
                    Contains numbers (0-9)
                  </Text>
                </View>
              </View>
            )}

            {/* Sign Up Button */}
            <TouchableOpacity style={styles.signUpWrap} onPress={onSubmit} disabled={loading}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signUpGradient}
              >
                <View style={styles.signUpButtonInner}>
                  <Text style={styles.signUpButtonText}>
                    {loading ? 'Creating Account...' : 'Create Dealer Account'}
                  </Text>
                  {!loading && (
                    <Ionicons name="arrow-forward" size={20} color={colors.bgWhite} />
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign In Link */}
            <View style={styles.signInWrap}>
              <Text style={styles.signInText}>Already have a dealer account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login', { role: 'dealer' })}>
                <Text style={styles.signInLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex1: { flex: 1 },
  headerGradient: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl + 10,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  headerDecor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  headerCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20,
    left: -30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerContent: {
    position: 'relative',
    zIndex: 1,
  },
  headerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.bgWhite,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl + 40,
  },
  formContainer: {
    marginTop: -10,
    paddingTop: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.danger,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: 6,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  phoneInputRow: {
    flex: 1,
  },
  passwordHints: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  hintText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  hintValid: {
    color: colors.success,
    fontWeight: '600',
  },
  signUpWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  signUpGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgWhite,
  },
  signInWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signInText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default SignupScreen;