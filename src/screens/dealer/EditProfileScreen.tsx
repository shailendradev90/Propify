
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { uploadProfilePhoto } from '../../services/mediaService';
import { colors, radius, spacing } from '../../theme';

interface Props {
  navigation: any;
}

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profilePhoto ?? null);
  const [saving, setSaving] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const openImagePicker = async (useCamera: boolean) => {
    setPhotoModalVisible(false);
    // Wait for modal to fully dismiss
    await new Promise<void>(resolve => setTimeout(resolve, 600));
    try {
      const permResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permResult.status !== 'granted') {
        Alert.alert(
          'Permission Required',
          useCamera
            ? 'Camera access is needed to take a photo.'
            : 'Photo library access is needed to choose a photo.',
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processPhoto(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to pick image. Please try again.');
    }
  };

  const processPhoto = async (uri: string) => {
    try {
      setUploadingPhoto(true);
      const asset = { uri, type: 'image' as const, name: `profile_${Date.now()}.jpg` };
      const downloadUrl = await uploadProfilePhoto(asset, user?.uid ?? 'demo');
      setPhotoUri(downloadUrl);
      await updateProfile({ profilePhoto: downloadUrl });
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required.');
      return;
    }
    try {
      setSaving(true);
      await updateProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        ...(photoUri ? { profilePhoto: photoUri } : {}),
      });
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Pressable onPress={() => setPhotoModalVisible(true)} style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {fullName?.[0]?.toUpperCase() || user?.fullName?.[0]?.toUpperCase() || '?'}
                </Text>
              )}
              {uploadingPhoto && (
                <View style={styles.avatarOverlay}>
                  <ActivityIndicator color={colors.bgWhite} size="small" />
                </View>
              )}
            </View>
            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={14} color={colors.bgWhite} />
            </View>
          </Pressable>
          <Pressable
            style={styles.changePhotoButton}
            onPress={() => setPhotoModalVisible(true)}>
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
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
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* Photo Picker Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Change Profile Photo</Text>
            <View style={styles.modalOption}>
              <Pressable
                style={styles.modalOptionPressable}
                onPress={() => openImagePicker(false)}>
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="images-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionLabel}>Choose from Library</Text>
                  <Text style={styles.modalOptionSub}>Pick a photo from your gallery</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.modalOption}>
              <Pressable
                style={styles.modalOptionPressable}
                onPress={() => openImagePicker(true)}>
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="camera-outline" size={22} color={colors.primary} />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionLabel}>Take a Photo</Text>
                  <Text style={styles.modalOptionSub}>Use your camera to take a new photo</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
            {photoUri && (
              <View style={styles.modalOption}>
                <Pressable
                  style={styles.modalOptionPressable}
                  onPress={() => {
                    setPhotoModalVisible(false);
                    setPhotoUri(null);
                    updateProfile({ profilePhoto: '' });
                  }}>
                  <View style={[styles.modalOptionIcon, { backgroundColor: colors.danger + '12' }]}>
                    <Ionicons name="trash-outline" size={22} color={colors.danger} />
                  </View>
                  <View style={styles.modalOptionContent}>
                    <Text style={[styles.modalOptionLabel, { color: colors.danger }]}>Remove Photo</Text>
                    <Text style={styles.modalOptionSub}>Revert to your initial avatar</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            )}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setPhotoModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.bgWhite,
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 36,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.bgWhite,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  form: {
    backgroundColor: colors.bgWhite,
    borderRadius: radius.lg,
    marginHorizontal: spacing.lg,
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
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalOption: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  modalOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionContent: {
    flex: 1,
    gap: 2,
  },
  modalOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  modalOptionSub: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalCancel: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export default EditProfileScreen;