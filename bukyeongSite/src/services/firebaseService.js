/**
 * Firebase Service - Firestore CRUD Operations
 *
 * Handles all Firestore database operations:
 * - User data sync
 * - Student registration tracking
 * - Statistics aggregation
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

const CONSOLE_PREFIX = '[FirebaseService]';

/**
 * Sync student data to Firestore (users collection)
 * @param {string} userId - Firebase Auth UID
 * @param {Object} studentData - Student data object
 * @returns {Promise<void>}
 */
export const syncStudentDataToFirestore = async (userId, studentData) => {
  try {
    const userRef = doc(db, 'users', userId);

    await setDoc(userRef, {
      studentData,
      lastSyncAt: serverTimestamp()
    }, { merge: true });

    console.log(`${CONSOLE_PREFIX} Student data synced for user:`, userId);

    // Also create registration record for analytics
    await createStudentRegistration(userId, studentData);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Sync failed:`, error);
    throw error;
  }
};

/**
 * Fetch student data from Firestore
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object|null>} Student data or null
 */
export const fetchStudentDataFromFirestore = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      // studentData가 null이거나 undefined면 null 반환
      if (!data.studentData) {
        console.log(`${CONSOLE_PREFIX} No student data in user document`);
        return null;
      }
      console.log(`${CONSOLE_PREFIX} Student data fetched:`, data.studentData);
      return data.studentData;
    } else {
      console.log(`${CONSOLE_PREFIX} No student data found for user:`, userId);
      return null;
    }
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Fetch failed:`, error);
    throw error;
  }
};

/**
 * Create student registration record (for analytics)
 * @param {string} userId - Firebase Auth UID
 * @param {Object} studentData - Student data object
 * @returns {Promise<void>}
 */
const createStudentRegistration = async (userId, studentData) => {
  try {
    // First, mark all previous registrations as inactive
    const q = query(
      collection(db, 'studentRegistrations'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isActive: false })
    );
    await Promise.all(updatePromises);

    // Create new active registration
    await addDoc(collection(db, 'studentRegistrations'), {
      userId,
      studentId: studentData.studentId,
      grade: studentData.grade,
      classNum: studentData.classNum,
      number: studentData.number,
      formatted: studentData.formatted,
      registeredAt: serverTimestamp(),
      isActive: true
    });

    console.log(`${CONSOLE_PREFIX} Registration record created`);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Registration record failed:`, error);
    throw error;
  }
};

/**
 * Mark student data as inactive (on deletion)
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<void>}
 */
export const markStudentDataInactive = async (userId) => {
  try {
    // 1. Remove studentData from users/{userId} document
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      studentData: null,
      lastSyncAt: serverTimestamp()
    });
    console.log(`${CONSOLE_PREFIX} User document studentData removed`);

    // 2. Mark all active registrations as inactive
    const q = query(
      collection(db, 'studentRegistrations'),
      where('userId', '==', userId),
      where('isActive', '==', true)
    );
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map(doc =>
      updateDoc(doc.ref, { isActive: false })
    );
    await Promise.all(updatePromises);

    console.log(`${CONSOLE_PREFIX} Student data marked inactive`);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Mark inactive failed:`, error);
    throw error;
  }
};

/**
 * Update user auth information (authProvider, email)
 * @param {string} userId - Firebase Auth UID
 * @param {string} authProvider - 'google' or 'anonymous'
 * @param {string|null} email - User email or null
 * @returns {Promise<void>}
 */
export const updateUserAuthInfo = async (userId, authProvider, email) => {
  try {
    const userRef = doc(db, 'users', userId);

    await setDoc(userRef, {
      authProvider,
      email,
      createdAt: serverTimestamp()
    }, { merge: true });

    console.log(`${CONSOLE_PREFIX} User auth info updated:`, authProvider, email);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Update auth info failed:`, error);
    throw error;
  }
};

/**
 * Add a new letter to Firestore
 * @param {string} author - Author nickname
 * @param {string} content - Letter content
 * @returns {Promise<void>}
 */
export const addLetter = async (author, content) => {
  try {
    // Firebase 초기화 확인
    if (!db) {
      throw new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
    }

    await addDoc(collection(db, 'letters'), {
      author: author || '익명',
      content,
      createdAt: serverTimestamp()
    });

    console.log(`${CONSOLE_PREFIX} Letter added successfully`);
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Add letter failed:`, error);

    // 구체적인 에러 메시지 생성
    let errorMessage = '편지 작성에 실패했습니다.';

    if (error.code === 'permission-denied') {
      errorMessage = 'Firebase 권한이 없습니다. Firestore 규칙을 확인해주세요.';
    } else if (error.code === 'unavailable') {
      errorMessage = 'Firebase 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
    } else if (error.code === 'unauthenticated') {
      errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
    } else if (error.message?.includes('Firebase')) {
      errorMessage = error.message;
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    throw enhancedError;
  }
};

/**
 * Subscribe to letters collection with real-time updates
 * @param {Function} callback - Callback function to receive letters array
 * @param {Function} errorCallback - Optional error callback function
 * @returns {Function} Unsubscribe function
 */
export const subscribeToLetters = (callback, errorCallback = null) => {
  try {
    // Firebase 초기화 확인
    if (!db) {
      const error = new Error('Firebase가 초기화되지 않았습니다. 환경 변수를 확인해주세요.');
      if (errorCallback) errorCallback(error);
      throw error;
    }

    const q = query(
      collection(db, 'letters'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const letters = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // createdAt이 null인 경우 (서버 타임스탬프 pending) 현재 시간 사용
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));

          console.log(`${CONSOLE_PREFIX} Letters updated:`, letters.length, 'letters');
          callback(letters);
        } catch (error) {
          console.error(`${CONSOLE_PREFIX} Error processing snapshot:`, error);
          if (errorCallback) errorCallback(error);
        }
      },
      (error) => {
        // onSnapshot 에러 핸들러
        console.error(`${CONSOLE_PREFIX} Subscribe error:`, error);

        let errorMessage = '편지 목록을 불러오는 중 오류가 발생했습니다.';

        if (error.code === 'permission-denied') {
          errorMessage = 'Firebase 권한이 없습니다. Firestore 규칙을 확인해주세요.';
        } else if (error.code === 'unavailable') {
          errorMessage = 'Firebase 서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.';
        }

        if (errorCallback) {
          errorCallback(new Error(errorMessage));
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error(`${CONSOLE_PREFIX} Subscribe to letters failed:`, error);
    throw error;
  }
};
