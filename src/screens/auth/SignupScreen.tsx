import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { signUp } from '../../services/auth';
import { colors, spacing } from '../../theme';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
  route: { params?: { role?: UserRole } };
}

const SignupScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role ?? 'user';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Name, email and password are required.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Missing fields', 'Phone number is required.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim(), password, name.trim(), role, phone.trim() || undefined);
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.h1}>Create account</Text>
          <Text style={styles.sub}>
            Register as {role === 'dealer' ? 'Dealer / Owner' : 'User'}
          </Text>
        </View>

        <View style={styles.form}>
          <Input label="Full name" placeholder="Your name" value={name} onChangeText={setName} />
          <Input
            label="Email Address"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Phone"
            placeholder="+91 9876543210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Password"
            placeholder="At least 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.passwordHints}>
            <Text style={styles.hintTitle}>Password Requirements:</Text>
            <View style={styles.hintRow}>
              <Text style={[styles.hintBullet, password.length >= 6 && styles.hintValid]}>•</Text>
              <Text style={[styles.hintText, password.length >= 6 && styles.hintValid]}>
                At least 6 characters
              </Text>
            </View>
          </View>
          <Button title="Create account" onPress={onSubmit} loading={loading} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login', { role })}
          style={styles.linkWrap}>
          <Text style={styles.linkSub}>Already have an account? </Text>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  header: { marginTop: spacing.xl, marginBottom: spacing.xxl },
  h1: { fontSize: 32, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  sub: { color: colors.textMuted, marginTop: spacing.sm, fontSize: 15, lineHeight: 22 },
  form: { marginBottom: spacing.xl },
  linkWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  linkSub: { color: colors.textMuted, fontSize: 15 },
  link: { color: colors.primary, fontWeight: '700', fontSize: 15 },
  passwordHints: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
  },
  hintTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  hintBullet: {
    fontSize: 16,
    color: colors.textMuted,
    marginRight: spacing.xs,
    width: 16,
  },
  hintText: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
  },
  hintValid: {
    color: colors.success,
    fontWeight: '600',
  },
});

export default SignupScreen;
