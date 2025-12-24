/**
 * Firebase Authentication Service
 *
 * Handles:
 * - Anonymous sign-in (익명 로그인만 사용)
 * - Auth state persistence
 */

import {
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const CONSOLE_PREFIX = '[AuthService]';

/**
 * Sign in anonymously (for first-time users)
 * @returns {Promise<User>} Firebase user object
 */
export const signInAnonymous = async () => {
  try {
    const startTime = performance.now();
    const result = await signInAnonymously(auth);
    const duration = performance.now() - startTime;

    console.log(`${CONSOLE_PREFIX} 익명 로그인 성공 (${duration.toFixed(2)}ms):`, result.user.uid);
    return result.user;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} 익명 로그인 실패:`, error);
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
