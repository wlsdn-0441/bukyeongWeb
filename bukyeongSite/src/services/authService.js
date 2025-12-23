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
  signInWithRedirect,
  linkWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const CONSOLE_PREFIX = '[AuthService]';
const ALLOWED_DOMAIN = '@saja.hs.kr';

/**
 * Check if email domain is allowed
 * @param {string} email - Email to check
 * @returns {boolean} True if domain is allowed
 */
const isAllowedDomain = (email) => {
  if (!email) return false;
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN);
};

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
 * Sign in with Google (redirect method - no popup blocker)
 * This will redirect the page to Google sign-in
 * Use handleRedirectResult() to get the result after redirect
 */
export const signInWithGoogle = async () => {
  try {
    console.log(`${CONSOLE_PREFIX} Google 로그인 시작 (redirect)`);
    await signInWithRedirect(auth, googleProvider);
    // Page will redirect - no return value
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Google 로그인 실패:`, error);
    throw error;
  }
};

/**
 * Link anonymous account to Google account (redirect method)
 * This will redirect the page to Google sign-in
 * Use handleRedirectResult() to get the result after redirect
 */
export const linkAnonymousToGoogle = async () => {
  try {
    const currentUser = auth.currentUser;
    console.log(`${CONSOLE_PREFIX} ========== 계정 연결 시작 ==========`);
    console.log(`${CONSOLE_PREFIX} 현재 사용자:`, {
      uid: currentUser?.uid,
      email: currentUser?.email,
      isAnonymous: currentUser?.isAnonymous,
      providerId: currentUser?.providerId
    });

    if (!currentUser) {
      throw new Error('현재 로그인된 사용자가 없습니다');
    }

    if (!currentUser.isAnonymous) {
      throw new Error('이미 인증된 계정입니다');
    }

    console.log(`${CONSOLE_PREFIX} linkWithRedirect() 호출 중...`);
    await linkWithRedirect(currentUser, googleProvider);
    console.log(`${CONSOLE_PREFIX} linkWithRedirect() 호출 완료 (페이지 리다이렉트 예정)`);
    // Page will redirect - no return value
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} ========== 계정 연결 실패 ==========`);
    console.error(`${CONSOLE_PREFIX} 에러 코드:`, error.code);
    console.error(`${CONSOLE_PREFIX} 에러 메시지:`, error.message);
    console.error(`${CONSOLE_PREFIX} 전체 에러:`, error);
    throw error;
  }
};

/**
 * Handle redirect result after Google sign-in
 * Call this on app initialization to process redirect results
 * @returns {Promise<{success: boolean, user?: User, error?: Error}>}
 */
export const handleRedirectResult = async () => {
  try {
    const startTime = performance.now();
    console.log(`${CONSOLE_PREFIX} ========== 리다이렉트 결과 확인 시작 ==========`);
    console.log(`${CONSOLE_PREFIX} 현재 Auth 상태:`, {
      currentUser: auth.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        isAnonymous: auth.currentUser.isAnonymous
      } : 'null'
    });

    const result = await getRedirectResult(auth);
    const duration = performance.now() - startTime;

    console.log(`${CONSOLE_PREFIX} getRedirectResult() 완료 (${duration.toFixed(2)}ms)`);
    console.log(`${CONSOLE_PREFIX} 결과 타입:`, result ? 'UserCredential' : 'null');

    if (!result) {
      // No redirect result (normal page load)
      console.log(`${CONSOLE_PREFIX} ========== 리다이렉트 결과 없음 (일반 페이지 로드) ==========`);
      return { success: true };
    }

    const email = result.user?.email;
    const uid = result.user?.uid;
    const isAnonymous = result.user?.isAnonymous;
    const providerId = result.user?.providerId;
    const providerData = result.user?.providerData;

    console.log(`${CONSOLE_PREFIX} ========== 리다이렉트 로그인 성공! ==========`);
    console.log(`${CONSOLE_PREFIX} 사용자 정보:`, {
      email,
      uid,
      isAnonymous,
      providerId,
      providerData: providerData?.map(p => ({
        providerId: p.providerId,
        email: p.email,
        uid: p.uid
      }))
    });

    // Check if email domain is allowed
    if (email && !isAllowedDomain(email)) {
      console.warn(`${CONSOLE_PREFIX} ========== 도메인 체크 실패 ==========`);
      console.warn(`${CONSOLE_PREFIX} 허용되지 않은 도메인:`, email);
      console.warn(`${CONSOLE_PREFIX} 허용 도메인: @saja.hs.kr`);
      console.warn(`${CONSOLE_PREFIX} 로그아웃 후 익명 계정으로 전환합니다...`);

      // Sign out immediately and re-login as anonymous
      await auth.signOut();
      console.log(`${CONSOLE_PREFIX} 로그아웃 완료`);

      await signInAnonymous();
      console.log(`${CONSOLE_PREFIX} 익명 로그인 완료`);

      const error = new Error('DOMAIN_NOT_ALLOWED');
      error.email = email;
      return { success: false, error };
    }

    console.log(`${CONSOLE_PREFIX} ========== 도메인 체크 통과! ==========`);
    console.log(`${CONSOLE_PREFIX} 이메일: ${email} (@saja.hs.kr 확인됨)`);
    console.log(`${CONSOLE_PREFIX} 로그인 성공 및 세션 저장 완료`);
    return { success: true, user: result.user };
  } catch (error) {
    // 일반적인 에러 코드 처리
    if (error.code === 'auth/credential-already-in-use') {
      // User already has Google account - this is OK
      console.warn(`${CONSOLE_PREFIX} Google 계정이 이미 존재`);
      return { success: true };
    }

    if (error.code === 'auth/account-exists-with-different-credential') {
      console.error(`${CONSOLE_PREFIX} 다른 인증 방법으로 이미 계정이 존재합니다.`);
      return { success: false, error };
    }

    if (error.code === 'auth/popup-blocked') {
      console.error(`${CONSOLE_PREFIX} 팝업이 차단되었습니다.`);
      return { success: false, error };
    }

    console.error(`${CONSOLE_PREFIX} 리다이렉트 결과 처리 실패:`, {
      code: error.code,
      message: error.message
    });
    return { success: false, error };
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
