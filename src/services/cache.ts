import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@credokin_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Get cached data if it exists and hasn't expired.
 */
export const getCached = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();

    if (now - entry.timestamp > entry.ttl) {
      // Cache expired, remove it
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
};

/**
 * Store data in cache with a TTL.
 */
export const setCache = async <T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Ignore cache write errors
  }
};

/**
 * Remove a specific cache entry.
 */
export const invalidateCache = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch {
    // Ignore
  }
};

/**
 * Remove all cache entries matching a prefix pattern.
 */
export const invalidateCachePattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX) && k.includes(pattern));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Ignore
  }
};

/**
 * Clear all cached data.
 */
export const clearAllCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch {
    // Ignore
  }
};