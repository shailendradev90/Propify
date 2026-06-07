import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { createProperty } from '../../services/properties';
import { MediaAsset, pickImages, pickVideo, uploadMultipleMedia } from '../../services/mediaService';
import { colors, radius, spacing } from '../../theme';
import { ListingType, PropertyType } from '../../types';
import { validateAndSanitizeProperty, formatValidationErrors } from '../../utils/validation';
import { checkRateLimit, formatBlockedTime } from '../../utils/rateLimiter';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'builder-floor', 'villa', 'plot', 'commercial'];

interface Props {
  navigation: any;
}

const AddPropertyScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState<ListingType>('buy');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [price, setPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Media state
  const [selectedImages, setSelectedImages] = useState<MediaAsset[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaAsset | null>(null);

  useEffect(() => {
    if (user?.phone) {
      setOwnerPhone(user.phone);
    }
  }, [user?.phone]);

  const handlePickImages = async () => {
    try {
      const images = await pickImages();
      if (images.length > 0) {
        // Limit total images to 10
        const totalImages = [...selectedImages, ...images].slice(0, 10);
        setSelectedImages(totalImages);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to pick images.');
    }
  };

  const handlePickVideo = async () => {
    try {
      const video = await pickVideo();
      if (video) {
        setSelectedVideo(video);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to pick video.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setSelectedVideo(null);
  };

  const submit = async () => {
    if (!user) return;

    // Check rate limit
    const rateLimit = checkRateLimit(user.uid, 'CREATE_PROPERTY');
    if (!rateLimit.allowed) {
      const blockedTime = rateLimit.blockedFor
        ? formatBlockedTime(rateLimit.blockedFor)
        : 'a while';
      Alert.alert(
        'Too Many Requests',
        `You've created too many properties recently. Please try again in ${blockedTime}.`,
      );
      return;
    }

    try {
      setSaving(true);

      // Validate and sanitize input
      const validatedData = await validateAndSanitizeProperty({
        title,
        description,
        price,
        bedrooms,
        bathrooms,
        areaSqft,
        city,
        sector,
        pincode,
        address,
        ownerPhone,
        imageUrl: null,
      });

      // Upload media files to Firebase Storage
      let imageUrls: string[] = [];
      let videoUrls: string[] = [];

      const allMedia = [
        ...selectedImages,
        ...(selectedVideo ? [selectedVideo] : []),
      ];

      if (allMedia.length > 0) {
        setIsUploading(true);
        setUploadProgress(0);

        const result = await uploadMultipleMedia(
          allMedia,
          user.uid,
          (progress) => setUploadProgress(progress),
        );
        imageUrls = result.imageUrls;
        videoUrls = result.videoUrls;
        setIsUploading(false);
      }

      await createProperty({
        ownerId: user.uid,
        ownerName: user.fullName,
        ownerPhone: validatedData.ownerPhone,
        title: validatedData.title,
        description: validatedData.description,
        listingType,
        propertyType,
        price: Number(validatedData.price),
        bedrooms: Number(validatedData.bedrooms) || 0,
        bathrooms: Number(validatedData.bathrooms) || 0,
        areaSqft: Number(validatedData.areaSqft) || 0,
        city: validatedData.city,
        sector: validatedData.sector || undefined,
        pincode: validatedData.pincode,
        address: validatedData.address,
        images: imageUrls,
        videos: videoUrls.length > 0 ? videoUrls : undefined,
      });

      Alert.alert('Posted', 'Your property is now live.');
      navigation.goBack();
    } catch (e: any) {
      setIsUploading(false);
      // Handle validation errors
      if (e.name === 'ValidationError') {
        Alert.alert('Validation Error', formatValidationErrors(e));
      } else {
        Alert.alert('Failed', e?.message ?? 'Could not save property.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Post a property</Text>

        <Text style={styles.label}>Listing</Text>
        <View style={styles.chipRow}>
          <Chip label="For Sale" selected={listingType === 'buy'} onPress={() => setListingType('buy')} />
          <Chip label="For Rent" selected={listingType === 'rent'} onPress={() => setListingType('rent')} />
        </View>

        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {PROPERTY_TYPES.map(t => (
            <Chip
              key={t}
              label={t[0].toUpperCase() + t.slice(1)}
              selected={propertyType === t}
              onPress={() => setPropertyType(t)}
            />
          ))}
        </View>

        <Input label="Title" placeholder="e.g. 2BHK near city center" value={title} onChangeText={setTitle} />
        <Input
          label="Description"
          placeholder="Highlights, amenities, etc."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 96, textAlignVertical: 'top' }}
        />
        <Input
          label={listingType === 'rent' ? 'Monthly rent (₹)' : 'Price (₹)'}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Input label="Bedrooms" keyboardType="numeric" value={bedrooms} onChangeText={setBedrooms} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Bathrooms" keyboardType="numeric" value={bathrooms} onChangeText={setBathrooms} />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Area (sqft)" keyboardType="numeric" value={areaSqft} onChangeText={setAreaSqft} />
          </View>
        </View>

        <Input label="City" value={city} onChangeText={setCity} />
        <Input label="Sector / Area" value={sector} onChangeText={setSector} />
        <Input label="Pincode" keyboardType="numeric" value={pincode} onChangeText={setPincode} />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input
          label="Dealer phone"
          placeholder="+91 98765 43210"
          keyboardType="phone-pad"
          value={ownerPhone}
          onChangeText={setOwnerPhone}
        />

        {/* === Media Section === */}
        <Text style={styles.sectionTitle}>Property Photos & Videos</Text>

        {/* Images Grid */}
        <View style={styles.mediaSection}>
          <View style={styles.mediaGrid}>
            {selectedImages.map((img, index) => (
              <View key={`img-${index}`} style={styles.mediaThumbWrap}>
                <Image source={{ uri: img.uri }} style={styles.mediaThumb} />
                <TouchableOpacity
                  style={styles.removeMediaBtn}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={22} color={colors.danger || '#FF3B30'} />
                </TouchableOpacity>
                <View style={styles.imageBadge}>
                  <Ionicons name="image" size={10} color="#fff" />
                </View>
              </View>
            ))}

            {/* Add Image Button */}
            {selectedImages.length < 10 && (
              <TouchableOpacity style={styles.addMediaBtn} onPress={handlePickImages}>
                <Ionicons name="add-circle-outline" size={28} color={colors.primary} />
                <Text style={styles.addMediaText}>Add Photo</Text>
                <Text style={styles.addMediaSubtext}>
                  {selectedImages.length}/10
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Video Section */}
        <View style={styles.mediaSection}>
          {selectedVideo ? (
            <View style={styles.videoPreview}>
              <View style={styles.videoThumbWrap}>
                <View style={styles.videoThumb}>
                  <Ionicons name="videocam" size={32} color={colors.primary} />
                </View>
                <TouchableOpacity
                  style={styles.removeVideoBtn}
                  onPress={removeVideo}
                >
                  <Ionicons name="close-circle" size={22} color={colors.danger || '#FF3B30'} />
                </TouchableOpacity>
              </View>
              <View style={styles.videoInfo}>
                <Ionicons name="checkmark-circle" size={18} color="#34C759" />
                <Text style={styles.videoInfoText}>Video selected</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addVideoBtn} onPress={handlePickVideo}>
              <Ionicons name="videocam-outline" size={28} color={colors.primary} />
              <Text style={styles.addVideoText}>Add Video</Text>
              <Text style={styles.addVideoSubtext}>Max 2 minutes</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Progress */}
        {isUploading && (
          <View style={styles.uploadProgressSection}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.uploadProgressText}>
              Uploading media... {Math.round(uploadProgress * 100)}%
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.round(uploadProgress * 100)}%` },
                ]}
              />
            </View>
          </View>
        )}

        <Button
          title={saving ? 'Posting...' : 'Post property'}
          onPress={submit}
          loading={saving}
          disabled={saving}
        />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  mediaSection: {
    marginBottom: spacing.md,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  mediaThumbWrap: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
    borderRadius: radius.md,
  },
  removeMediaBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
  },
  imageBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  addMediaBtn: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
  },
  addMediaText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  addMediaSubtext: {
    fontSize: 10,
    color: colors.textMuted,
  },
  addVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    backgroundColor: colors.bgWhite,
  },
  addVideoText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  addVideoSubtext: {
    fontSize: 12,
    color: colors.textMuted,
  },
  videoPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    gap: spacing.md,
  },
  videoThumbWrap: {
    position: 'relative',
    width: 80,
    height: 60,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  videoThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  removeVideoBtn: {
    position: 'absolute',
    top: 2,
    right: 2,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
  },
  videoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  videoInfoText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  uploadProgressSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  uploadProgressText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border || '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});

export default AddPropertyScreen;