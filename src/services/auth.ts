import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FbUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { AppUser, UserRole } from '../types';
import { validateAndSanitizeSignup, validateLogin } from '../utils/validation';
import { checkRateLimit, formatBlockedTime } from '../utils/rateLimiter';

export const subscribeAuth = (cb: (user: FbUser | null) => void) =>
  onAuthStateChanged(auth, cb);

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  phone?: string,
): Promise<AppUser> => {
  // Check rate limit for signup
  const rateLimit = checkRateLimit(email, 'SIGNUP');
  if (!rateLimit.allowed) {
    const blockedTime = rateLimit.blockedFor
      ? formatBlockedTime(rateLimit.blockedFor)
      : 'a while';
    throw new Error(`Too many signup attempts. Please try again in ${blockedTime}.`);
  }

  // Basic validation and sanitization (less strict for compatibility)
  try {
    const validatedData = await validateAndSanitizeSignup({
      email,
      password,
      fullName,
      phone,
    });

    if (!validatedData.phone?.trim()) {
      throw new Error('Phone number is required.');
    }

    const cred = await createUserWithEmailAndPassword(auth, validatedData.email, password);
    const appUser: AppUser = {
      uid: cred.user.uid,
      email: validatedData.email,
      fullName: validatedData.fullName,
      role,
      createdAt: Date.now(),
      ...(validatedData.phone ? { phone: validatedData.phone } : {}),
    };
    await setDoc(doc(db, 'users', cred.user.uid), appUser);
    return appUser;
  } catch (error: any) {
    // If validation fails, provide user-friendly error
    if (error.name === 'ValidationError') {
      throw new Error(error.errors?.[0] || error.message);
    }
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  // Check rate limit for login
  const rateLimit = checkRateLimit(email, 'LOGIN');
  if (!rateLimit.allowed) {
    const blockedTime = rateLimit.blockedFor
      ? formatBlockedTime(rateLimit.blockedFor)
      : 'a while';
    throw new Error(`Too many login attempts. Please try again in ${blockedTime}.`);
  }

  // Basic validation (less strict for login)
  try {
    const validatedData = await validateLogin({ email, password });
    const cred = await signInWithEmailAndPassword(auth, validatedData.email, password);
    return cred.user;
  } catch (error: any) {
    // If validation fails, provide user-friendly error
    if (error.name === 'ValidationError') {
      throw new Error(error.errors?.[0] || error.message);
    }
    throw error;
  }
};

export const signOut = () => fbSignOut(auth);

export const getAppUser = async (uid: string): Promise<AppUser | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<AppUser>): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), data as any);
};
