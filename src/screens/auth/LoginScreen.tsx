import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
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
import { signIn } from '../../services/auth';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';
import { UserRole } from '../../types';
import { sendOtp, verifyOtp, signInAfterOtpVerification } from '../../services/otpService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: { params?: { role?: UserRole } };
}

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role ?? 'user';
  const isDealer = role === 'dealer';
  const { loginWithPhone } = useAuth();

  // Form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const otpFadeAnim = useRef(new Animated.Value(0)).current;
  const otpRefs = useRef<(TextInput | null)[]>([]);

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

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!mobileNumber.trim()) {
      Alert.alert('Required', 'Please enter your mobile number.');
      return;
    }
    if (mobileNumber.trim().length < 10) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      setLoading(true);
      await sendOtp(`+91${mobileNumber.trim()}`);
      setOtpSent(true);
      setResendTimer(30);
      Animated.timing(otpFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      setLoading(true);
      await sendOtp(`+91${mobileNumber.trim()}`);
      setResendTimer(30);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }
    try {
      setLoading(true);
      await verifyOtp(`+91${mobileNumber.trim()}`, otpString);
      // OTP verified - sign in or create user in Firebase Auth
      const phoneUser = await signInAfterOtpVerification(`+91${mobileNumber.trim()}`);
      // Since Firebase Auth's signInWithEmailAndPassword already signed the user in,
      // the AuthContext's subscribeAuth listener will pick up the user.
      // But we also set it directly via loginWithPhone for immediate UI update.
      loginWithPhone(phoneUser);
    } catch (e: any) {
      Alert.alert('Verification failed', e?.message ?? 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDealerLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    try {
      setLoading(true);
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
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
            <Ionicons
              name={isDealer ? 'briefcase-outline' : 'call-outline'}
              size={28}
              color={colors.bgWhite}
            />
          </View>
          <Text style={styles.headerTitle}>
            {isDealer ? 'Dealer Login' : 'Welcome Back'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isDealer
              ? 'Sign in with your email & password'
              : 'Sign in with your mobile number'}
          </Text>
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
            {isDealer ? (
              // Dealer: Email + Password Login
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
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

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputRow}>
                    <View style={styles.inputIcon}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
                    </View>
                    <TextInput
                      style={styles.inputField}
                      placeholder="••••••••"
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

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButtonWrap} onPress={handleDealerLogin} disabled={loading}>
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.loginGradient}
                  >
                    {loading ? (
                      <View style={styles.loadingDot}>
                        <Text style={styles.loginButtonText}>Signing in...</Text>
                      </View>
                    ) : (
                      <View style={styles.loginButtonInner}>
                        <Text style={styles.loginButtonText}>Sign In</Text>
                        <Ionicons name="arrow-forward" size={20} color={colors.bgWhite} />
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup', { role })}
                  style={styles.switchAuthWrap}
                >
                  <Text style={styles.switchAuthText}>New dealer? </Text>
                  <Text style={styles.switchAuthLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // User/Owner: Mobile + OTP Login
              <View style={styles.form}>
                {!otpSent ? (
                  // Step 1: Mobile Number Input
                  <>
                    <View style={styles.mobileInputSection}>
                      <Text style={styles.inputLabel}>Mobile Number</Text>
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
                            placeholder="Enter 10-digit number"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="phone-pad"
                            maxLength={10}
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                          />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.sendOtpWrap}
                      onPress={handleSendOtp}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginGradient}
                      >
                        <View style={styles.loginButtonInner}>
                          <Text style={styles.loginButtonText}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                          </Text>
                          {!loading && (
                            <Ionicons name="arrow-forward" size={20} color={colors.bgWhite} />
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                ) : (
                  // Step 2: OTP Verification
                  <Animated.View style={{ opacity: otpFadeAnim }}>
                    <View style={styles.otpSentSection}>
                      <View style={styles.otpSentIconWrap}>
                        <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
                      </View>
                      <Text style={styles.otpSentTitle}>OTP Sent!</Text>
                      <Text style={styles.otpSentSubtitle}>
                        We've sent a 6-digit code to{'\n'}
                        <Text style={styles.phoneHighlight}>+91 {mobileNumber}</Text>
                      </Text>
                    </View>

                    <View style={styles.otpContainer}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={ref => { otpRefs.current[index] = ref; }}
                          style={[
                            styles.otpBox,
                            digit ? styles.otpBoxFilled : null,
                          ]}
                          value={digit}
                          onChangeText={text => handleOtpChange(text.replace(/[^0-9]/g, ''), index)}
                          onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                        />
                      ))}
                    </View>

                    <TouchableOpacity
                      style={styles.sendOtpWrap}
                      onPress={handleVerifyOtp}
                      disabled={loading}
                    >
                      <LinearGradient
                        colors={[colors.primary, colors.primaryDark]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.loginGradient}
                      >
                        <View style={styles.loginButtonInner}>
                          <Text style={styles.loginButtonText}>
                            {loading ? 'Verifying...' : 'Verify & Sign In'}
                          </Text>
                          {!loading && (
                            <Ionicons name="checkmark-circle" size={20} color={colors.bgWhite} />
                          )}
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.resendRow}>
                      {resendTimer > 0 ? (
                        <Text style={styles.resendTimer}>
                          Resend OTP in {resendTimer}s
                        </Text>
                      ) : (
                        <TouchableOpacity onPress={handleResendOtp}>
                          <Text style={styles.resendLink}>Resend OTP</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.changeNumberBtn}
                      onPress={() => {
                        setOtpSent(false);
                        setOtp(['', '', '', '', '', '']);
                        setResendTimer(0);
                      }}
                    >
                      <Ionicons name="arrow-back" size={16} color={colors.primary} />
                      <Text style={styles.changeNumberText}>Change Number</Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            )}
          </Animated.View>

          {/* Role Switcher */}
          <View style={styles.roleSwitcher}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue as</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.altRoleButton}
            onPress={() =>
              navigation.replace('Login', {
                role: isDealer ? 'user' : 'dealer',
              })
            }
          >
            <Ionicons
              name={isDealer ? 'person-outline' : 'briefcase-outline'}
              size={18}
              color={colors.primary}
            />
            <Text style={styles.altRoleText}>
              {isDealer ? 'Login as Home Seeker' : 'Login as Dealer'}
            </Text>
          </TouchableOpacity>
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
  },
  form: {
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
  mobileInputSection: {
    marginBottom: spacing.md,
  },
  sendOtpWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  loginButtonWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingDot: {
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgWhite,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  // OTP styles
  otpSentSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingTop: spacing.md,
  },
  otpSentIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  otpSentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  otpSentSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  phoneHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: spacing.xl,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  resendRow: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  resendTimer: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  resendLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  changeNumberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  changeNumberText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  // Role switcher
  roleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  altRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  altRoleText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  switchAuthWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  switchAuthText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  switchAuthLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default LoginScreen;