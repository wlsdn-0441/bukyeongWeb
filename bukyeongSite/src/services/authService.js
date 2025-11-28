/**
 * Firebase Authentication Service
 *
 * Handles:
 * - Anonymous sign-in (first-time users)
 * - Google OAuth sign-in
 * - Account linking (anonymous → Google)
 * - Auth state persistence
 */

import {
  signInAnonymously,
  signInWithPopup,
  linkWithPopup,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const CONSOLE_PREFIX = '[AuthService]';

/**
 * Sign in anonymously (for first-time users)
 * @returns {Promise<User>} Firebase user object
 */
export const signInAnonymous = async () => {
  try {
    const result = await signInAnonymously(auth);
    console.log(`${CONSOLE_PREFIX} 익명 로그인 성공:`, result.user.uid);
    return result.user;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} 익명 로그인 실패:`, error);
    throw error;
  }
};

/**
 * Sign in with Google
 * @returns {Promise<User>} Firebase user object
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(`${CONSOLE_PREFIX} Google 로그인 성공:`, result.user.email);
    return result.user;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Google 로그인 실패:`, error);
    throw error;
  }
};

/**
 * Link anonymous account to Google account
 * @returns {Promise<User>} Firebase user object
 */
export const linkAnonymousToGoogle = async () => {
  try {
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    console.log(`${CONSOLE_PREFIX} 계정 연결 성공:`, result.user.email);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/credential-already-in-use') {
      // User already has Google account - sign in instead
      console.warn(`${CONSOLE_PREFIX} Google 계정이 이미 존재 - 로그인으로 전환`);
      return await signInWithGoogle();
    }
    console.error(`${CONSOLE_PREFIX} 계정 연결 실패:`, error);
    throw error;
  }
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Called with user object when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current user
 * @returns {User|null} Current Firebase user or null
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Check if user is anonymous
 * @returns {boolean} True if current user is anonymous
 */
export const isAnonymous = () => {
  return auth.currentUser?.isAnonymous ?? false;
};

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await auth.signOut();
    console.log(`${CONSOLE_PREFIX} 로그아웃 성공`);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} 로그아웃 실패:`, error);
    throw error;
  }
};
