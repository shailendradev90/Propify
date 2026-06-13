import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isDemoMode } from './firebase';
import * as ImagePicker from 'expo-image-picker';

export interface MediaAsset {
  uri: string;
  type: 'image' | 'video';
  name: string;
}

/**
 * Request permissions for media library access.
 */
export const requestMediaPermissions = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return status === 'granted';
};

/**
 * Pick multiple images from the library.
 * Uses single-selection mode called in a loop for reliable picker dismissal.
 */
export const pickImages = async (): Promise<MediaAsset[]> => {
  const granted = await requestMediaPermissions();
  if (!granted) {
    throw new Error('Permission to access media library is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: false,
    quality: 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return [];

  return result.assets.map((asset, index) => ({
    uri: asset.uri,
    type: 'image' as const,
    name: `image_${Date.now()}_${index}.jpg`,
  }));
};

/**
 * Pick a single video from the library.
 */
export const pickVideo = async (): Promise<MediaAsset | null> => {
  const granted = await requestMediaPermissions();
  if (!granted) {
    throw new Error('Permission to access media library is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
    allowsMultipleSelection: false,
    quality: 0.8,
    videoMaxDuration: 120, // 2 minutes max
  });

  if (result.canceled || !result.assets || result.assets.length === 0) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: 'video' as const,
    name: `video_${Date.now()}.mp4`,
  };
};

/**
 * Upload a single media file to Firebase Storage and return its download URL.
 */
export const uploadMedia = async (
  asset: MediaAsset,
  userId: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  if (isDemoMode) {
    // In demo mode, return the local URI directly
    await new Promise(resolve => setTimeout(resolve, 500));
    return asset.uri;
  }

  const folder = asset.type === 'image' ? 'property-images' : 'property-videos';
  const storagePath = `${folder}/${userId}/${asset.name}`;
  const storageRef = ref(storage, storagePath);

  // Fetch the file as a blob
  const response = await fetch(asset.uri);
  const blob = await response.blob();

  // Upload
  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: asset.type === 'image' ? 'image/jpeg' : 'video/mp4',
  });

  // Get download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Upload multiple media files to Firebase Storage.
 * Returns an object with arrays of image URLs and video URLs.
 */
export const uploadMultipleMedia = async (
  assets: MediaAsset[],
  userId: string,
  onProgress?: (overallProgress: number) => void,
): Promise<{ imageUrls: string[]; videoUrls: string[] }> => {
  const imageUrls: string[] = [];
  const videoUrls: string[] = [];
  let completed = 0;

  for (const asset of assets) {
    const url = await uploadMedia(asset, userId);
    if (asset.type === 'image') {
      imageUrls.push(url);
    } else {
      videoUrls.push(url);
    }
    completed++;
    if (onProgress) {
      onProgress(completed / assets.length);
    }
  }

  return { imageUrls, videoUrls };
};

/**
 * Upload a profile photo to the profile-photos folder in Firebase Storage.
 */
export const uploadProfilePhoto = async (
  asset: MediaAsset,
  userId: string,
): Promise<string> => {
  if (isDemoMode) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return asset.uri;
  }

  const storagePath = `profile-photos/${userId}/${asset.name}`;
  const storageRef = ref(storage, storagePath);

  const response = await fetch(asset.uri);
  const blob = await response.blob();

  const snapshot = await uploadBytes(storageRef, blob, {
    contentType: 'image/jpeg',
  });

  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
};

/**
 * Delete a media file from Firebase Storage by its download URL.
 */
export const deleteMedia = async (url: string): Promise<void> => {
  if (isDemoMode) return;
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Failed to delete media from storage:', error);
  }
};