import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, spacing } from '../../theme';

interface Props {
  navigation: any;
}

const BusinessDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [businessName, setBusinessName] = useState(user?.businessName ?? '');
  const [reraNumber, setReraNumber] = useState(user?.reraNumber ?? '');
  const [businessAddress, setBusinessAddress] = useState(user?.businessAddress ?? '');
  const [businessCity, setBusinessCity] = useState(user?.businessCity ?? '');
  const [businessPhone, setBusinessPhone] = useState(user?.businessPhone ?? '');
  const [businessWebsite, setBusinessWebsite] = useState(user?.businessWebsite ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile({
        businessName: businessName.trim(),
        reraNumber: reraNumber.trim(),
        businessAddress: businessAddress.trim(),
        businessCity: businessCity.trim(),
        businessPhone: businessPhone.trim(),
        businessWebsite: businessWebsite.trim(),
      });
      Alert.alert('Success', 'Business details updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update business details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Business Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="business" size={24} color={colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Your Business Profile</Text>
            <Text style={styles.infoSubtitle}>
              Add your business details to build trust with potential buyers and tenants.
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company / Agency Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Propify Realty"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>RERA Registration Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={reraNumber}
                onChangeText={setReraNumber}
                placeholder="e.g. HARERA/GGM/123/2024"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
              />
            </View>
            <Text style={styles.helperText}>
              RERA registration builds credibility with clients
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Address</Text>
            <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
              <Ionicons name="location-outline" size={20} color={colors.textMuted} style={{ marginTop: 4 }} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={businessAddress}
                onChangeText={setBusinessAddress}
                placeholder="Enter your business address"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City of Operation</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="map-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={businessCity}
                onChangeText={setBusinessCity}
                placeholder="e.g. Gurugram"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Business Phone</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={businessPhone}
                onChangeText={setBusinessPhone}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Website (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="globe-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={businessWebsite}
                onChangeText={setBusinessWebsite}
                placeholder="e.g. www.yourwebsite.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.bgWhite} size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.bgWhite} />
              <Text style={styles.saveButtonText}>Save Business Details</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  infoSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  form: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
  },
  textArea: {
    minHeight: 72,
    paddingTop: spacing.md,
  },
  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.bgWhite,
  },
});

export default BusinessDetailsScreen;