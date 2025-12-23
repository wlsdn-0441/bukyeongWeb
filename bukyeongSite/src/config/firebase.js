/**
 * Firebase Configuration
 *
 * Initializes Firebase services:
 * - Authentication (Google + Anonymous)
 * - Firestore (Student data storage)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ============================================
// 환경 변수 검증
// ============================================
console.log('[Firebase] ========== 환경 변수 확인 ==========');
console.log('[Firebase] 환경:', import.meta.env.MODE);
console.log('[Firebase] 환경 변수 상태:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ 설정됨' : '❌ 없음',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ 설정됨' : '❌ 없음',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ 설정됨' : '❌ 없음',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ 설정됨' : '❌ 없음',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ 설정됨' : '❌ 없음',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ 설정됨' : '❌ 없음',
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// 필수 환경 변수 체크
const missingVars = [];
if (!firebaseConfig.apiKey) missingVars.push('VITE_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('VITE_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('VITE_FIREBASE_PROJECT_ID');
if (!firebaseConfig.appId) missingVars.push('VITE_FIREBASE_APP_ID');

if (missingVars.length > 0) {
  console.error('[Firebase] ❌ 필수 환경 변수가 설정되지 않았습니다!');
  console.error('[Firebase] 누락된 변수:', missingVars);
  console.error('[Firebase] Vercel Dashboard에서 환경 변수를 설정하세요');
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

console.log('[Firebase] ✅ 모든 필수 환경 변수 확인 완료');
console.log('[Firebase] =========================================');

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // 리다이렉트 URI를 명시적으로 설정하지 않음 (Firebase가 자동으로 처리)
});

// Auth initialization state
let authInitialized = false;

/**
 * Initialize Firebase Auth persistence
 * Must be called before any auth operations
 * @returns {Promise<void>}
 */
export const initializeFirebaseAuth = async () => {
  if (authInitialized) {
    console.log('[Firebase] Auth already initialized');
    return;
  }

  console.log('[Firebase] 인증 초기화 시작');
  const startTime = performance.now();

  try {
    await setPersistence(auth, browserLocalPersistence);
    authInitialized = true;

    const duration = performance.now() - startTime;
    console.log(`[Firebase] Persistence 완료 (${duration.toFixed(2)}ms)`);
  } catch (error) {
    console.error('[Firebase] Persistence 설정 실패:', error);
    throw error;
  }
};

console.log('[Firebase] 모듈 로드 시간:', new Date().toISOString());
