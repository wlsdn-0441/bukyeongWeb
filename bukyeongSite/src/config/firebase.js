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

// Set auth persistence to LOCAL (세션 유지)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('[Firebase] Auth persistence 설정 완료 (LOCAL)');
  })
  .catch((error) => {
    console.error('[Firebase] Auth persistence 설정 실패:', error);
  });

console.log('[Firebase] 초기화 완료');
