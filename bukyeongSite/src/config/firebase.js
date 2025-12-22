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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

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
