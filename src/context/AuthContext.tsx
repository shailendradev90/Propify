import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth, getAppUser, signOut as fbSignOut } from '../services/auth';
import { isDemoMode } from '../services/firebase';
import { AppUser, UserRole } from '../types';

const FAVORITES_KEY = '@propify_favorites';

interface AuthContextValue {
  loading: boolean;
  user: AppUser | null;
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  user: null,
  signOut: async () => {},
  refresh: async () => {},
  loginAsDemo: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      // ignore
    }
  };

  const load = async (uid: string | undefined) => {
    if (!uid) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await getAppUser(uid);
      setUser(u);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites]);

  useEffect(() => {
    if (isDemoMode) {
      setLoading(false);
      return;
    }
    try {
      const unsub = subscribeAuth(fbUser => {
        if (demo) return;
        setLoading(true);
        load(fbUser?.uid);
      });
      return unsub;
    } catch {
      setLoading(false);
      return undefined;
    }
  }, [demo]);

  const toggleFavorite = (propertyId: string) => {
    setFavorites(prev =>
      prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId],
    );
  };

  const value: AuthContextValue = {
    loading,
    user,
    favorites,
    toggleFavorite,
    isFavorite: (propertyId: string) => favorites.includes(propertyId),
    signOut: async () => {
      if (demo) {
        setDemo(false);
        setUser(null);
        return;
      }
      try {
        await fbSignOut();
      } catch {}
      setUser(null);
    },
    refresh: async () => {
      if (user && !demo) await load(user.uid);
    },
    loginAsDemo: (role: UserRole) => {
      setDemo(true);
      setUser({
        uid: role === 'dealer' ? 'demo-dealer' : 'demo-user',
        email: role === 'dealer' ? 'dealer@demo.app' : 'user@demo.app',
        fullName: role === 'dealer' ? 'Demo Dealer' : 'Demo User',
        phone: '+91 90000 00000',
        role,
        createdAt: Date.now(),
      });
      setLoading(false);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
