import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { signIn } from '../../services/auth';
import { colors, radius, spacing } from '../../theme';
import { UserRole } from '../../types';

interface Props {
  navigation: any;
  route: { params?: { role?: UserRole } };
}

const LoginScreen: React.FC<Props> = ({ navigation, route }) => {
  const role: UserRole = route.params?.role ?? 'user';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.h1}>Welcome back</Text>
          <Text style={styles.sub}>
            Sign in as {role === 'dealer' ? 'Dealer / Owner' : 'User'}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email Address"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button title="Sign in" onPress={onSubmit} loading={loading} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Signup', { role })}
          style={styles.linkWrap}>
          <Text style={styles.linkSub}>Don't have an account? </Text>
          <Text style={styles.link}>Create one</Text>
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
});

export default LoginScreen;
