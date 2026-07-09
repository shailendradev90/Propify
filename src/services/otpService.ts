import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isDemoMode } from './firebase';
import { checkRateLimit, formatBlockedTime } from '../utils/rateLimiter';
import { AppUser } from '../types';

// In-memory OTP store (for development without a real SMS provider)
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// Generate a 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate a deterministic email from phone number for Firebase Auth.
 * This allows us to create/sign-in Firebase Auth accounts for phone users.
 */
const phoneToEmail = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `user${cleaned}@credokin.app`;
};

/**
 * Generate a deterministic password from phone number.
 * This allows us to always sign in the same phone user.
 */
const phoneToPassword = (phone: string): string => {
  const cleaned = phone.replace(/[^0-9]/g, '');
  return `Propify${cleaned}!`;
};

/**
 * Send OTP to the given phone number.
 * 
 * In production, integrate with a real SMS provider (Twilio, MSG91, Firebase Cloud Functions, etc.).
 * Currently generates OTP and logs it to console for development/testing.
 */
export const sendOtp = async (phoneNumber: string): Promise<void> => {
  // Check rate limit
  const rateLimit = checkRateLimit(phoneNumber, 'LOGIN');
  if (!rateLimit.allowed) {
    const blockedTime = rateLimit.blockedFor
      ? formatBlockedTime(rateLimit.blockedFor)
      : 'a while';
    throw new Error(`Too many OTP requests. Please try again in ${blockedTime}.`);
  }

  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  // Generate OTP
  const code = generateOtp();
  otpStore[formattedPhone] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiry
  };

  // Log OTP for development (in production, this would be sent via SMS API)
  console.log(`\n📱 ========================================`);
  console.log(`📱 OTP for ${formattedPhone}: ${code}`);
  console.log(`📱 ========================================\n`);

  // Simulate network delay for sending SMS
  await new Promise(resolve => setTimeout(resolve, 1000));
};

/**
 * Verify the OTP entered by the user.
 */
export const verifyOtp = async (phoneNumber: string, otp: string): Promise<void> => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  const stored = otpStore[formattedPhone];

  if (!stored) {
    throw new Error('No OTP was sent to this number. Please request a new OTP.');
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[formattedPhone];
    throw new Error('OTP has expired. Please request a new one.');
  }

  if (stored.code !== otp) {
    throw new Error('Incorrect OTP. Please check and try again.');
  }

  // OTP verified successfully - clean up
  delete otpStore[formattedPhone];

  // Simulate verification delay
  await new Promise(resolve => setTimeout(resolve, 300));
};

/**
 * After successful OTP verification, sign in or create the user in Firebase Auth.
 * Uses a deterministic email/password derived from the phone number so we can
 * always authenticate the same phone user.
 */
export const signInAfterOtpVerification = async (phoneNumber: string): Promise<AppUser> => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

  // In demo mode, create a temporary user without touching Firebase Auth
  if (isDemoMode) {
    const demoUser: AppUser = {
      uid: `phone_${formattedPhone.replace(/\+/g, '')}`,
      email: '',
      fullName: 'User',
      phone: formattedPhone,
      role: 'user',
      createdAt: Date.now(),
    };
    return demoUser;
  }

  const email = phoneToEmail(formattedPhone);
  const password = phoneToPassword(formattedPhone);

  try {
    // Try to sign in first (existing user)
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    // Load user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as AppUser;
    }

    // User exists in Auth but not in Firestore - create the profile
    const appUser: AppUser = {
      uid,
      email,
      fullName: 'User',
      phone: formattedPhone,
      role: 'user',
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', uid), appUser);
    return appUser;

  } catch (signInError: any) {
    // If sign-in fails (user doesn't exist), create a new account
    if (
      signInError.code === 'auth/user-not-found' ||
      signInError.code === 'auth/invalid-credential' ||
      signInError.code === 'auth/wrong-password' ||
      signInError.code === 'auth/invalid-email'
    ) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;

        const appUser: AppUser = {
          uid,
          email,
          fullName: 'User',
          phone: formattedPhone,
          role: 'user',
          createdAt: Date.now(),
        };

        await setDoc(doc(db, 'users', uid), appUser);
        return appUser;
      } catch (createError: any) {
        // If creation also fails, try sign-in once more (race condition handling)
        if (createError.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          const uid = cred.user.uid;
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            return userDoc.data() as AppUser;
          }
          const appUser: AppUser = {
            uid,
            email,
            fullName: 'User',
            phone: formattedPhone,
            role: 'user',
            createdAt: Date.now(),
          };
          await setDoc(doc(db, 'users', uid), appUser);
          return appUser;
        }
        throw createError;
      }
    }
    throw signInError;
  }
};

/**
 * Check if there's a pending OTP for the given phone number.
 */
export const hasPendingOtp = (phoneNumber: string): boolean => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  const stored = otpStore[formattedPhone];
  return !!stored && Date.now() <= stored.expiresAt;
};

/**
 * Reset OTP state for a phone number.
 */
export const resetOtp = (phoneNumber: string): void => {
  const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  delete otpStore[formattedPhone];
};