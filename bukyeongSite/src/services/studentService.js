/**
 * 학번 관리 서비스
 *
 * localStorage 기반으로 학번을 저장하고 관리합니다.
 * Firebase Firestore와 자동 동기화됩니다.
 */

import { parseStudentId } from '../utils/studentIdParser';
import { syncStudentDataToFirestore, fetchStudentDataFromFirestore, markStudentDataInactive } from './firebaseService';
import { getCurrentUser } from './authService';

const STORAGE_KEY = 'bukyeongStudentId';
const LAST_SYNC_KEY = 'bukyeongLastSync';

/**
 * localStorage에서 학번 정보 읽기
 * @returns {Object|null} 학번 정보 또는 null
 */
export const getStudentIdFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);
    console.log('[StudentService] localStorage에서 학번 로드:', parsed.formatted);
    return parsed;
  } catch (error) {
    console.error('[StudentService] localStorage 읽기 실패:', error);
    return null;
  }
};

/**
 * localStorage에 학번 정보 저장
 * @param {Object} studentData - 학번 정보 객체
 */
export const saveStudentIdToStorage = (studentData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(studentData));
    console.log('[StudentService] localStorage 저장 완료:', studentData.formatted);
  } catch (error) {
    console.error('[StudentService] localStorage 저장 실패:', error);

    // Fallback: sessionStorage 사용 (시크릿 모드 대응)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(studentData));
      console.warn('[StudentService] sessionStorage로 fallback 저장 완료');
      alert('브라우저 저장 공간이 부족합니다. 이번 세션 동안만 학번이 유지됩니다.');
    } catch (sessionError) {
      console.error('[StudentService] sessionStorage 저장도 실패:', sessionError);
      throw error;
    }
  }
};

/**
 * 학번 등록 (localStorage + Firestore)
 * @param {string} studentId - 4자리 학번
 * @returns {Promise<Object>} 저장된 학번 정보
 */
export const registerStudentId = async (studentId) => {
  console.log('[StudentService] 학번 등록 시작:', studentId);

  // 1. 학번 파싱 및 검증
  const parsed = parseStudentId(studentId);
  if (!parsed.isValid) {
    console.error('[StudentService] 학번 검증 실패:', parsed.error);
    throw new Error(parsed.error);
  }

  // 2. 학번 데이터 생성
  const studentData = {
    studentId,
    grade: parsed.grade,
    classNum: parsed.classNum,
    number: parsed.number,
    formatted: parsed.formatted,
    registeredAt: new Date().toISOString()
  };

  // 3. localStorage 저장 (즉시)
  saveStudentIdToStorage(studentData);

  // 4. Firestore 동기화 (백그라운드)
  const user = getCurrentUser();
  if (user) {
    syncStudentDataToFirestore(user.uid, studentData).then(() => {
      localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
      console.log('[StudentService] Firestore 동기화 완료');
    }).catch(err => {
      console.error('[StudentService] Firestore 동기화 실패 (백그라운드):', err);
      // Don't throw - localStorage save succeeded
    });
  } else {
    console.warn('[StudentService] 인증되지 않은 사용자 - Firestore 동기화 건너뜀');
  }

  console.log('[StudentService] 학번 등록 완료:', studentData.formatted);
  return studentData;
};

/**
 * 학번 정보 삭제 (초기화 + Firestore 비활성화)
 */
export const clearStudentId = async () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY); // sessionStorage도 정리
  console.log('[StudentService] 학번 정보 삭제 완료');

  // Background: Mark as inactive in Firestore
  const user = getCurrentUser();
  if (user) {
    try {
      await markStudentDataInactive(user.uid);
      console.log('[StudentService] Firestore에서 비활성화 완료');
    } catch (error) {
      console.error('[StudentService] Firestore 비활성화 실패:', error);
      // Don't throw - localStorage deletion succeeded
    }
  }
};

/**
 * 학번 존재 여부 확인
 * @returns {boolean} 학번이 저장되어 있으면 true
 */
export const hasStudentId = () => {
  return getStudentIdFromStorage() !== null;
};

/**
 * Firestore에서 학번 데이터 복원
 * @returns {Promise<Object|null>} 복원된 학번 데이터 또는 null
 */
export const restoreFromFirestore = async () => {
  const user = getCurrentUser();
  if (!user) {
    console.warn('[StudentService] 인증되지 않은 사용자 - Firestore 복원 불가');
    return null;
  }

  // Check if localStorage already has data
  const localData = getStudentIdFromStorage();
  if (localData) {
    console.log('[StudentService] localStorage에 데이터 존재 - 복원 불필요');
    return localData;
  }

  // Fetch from Firestore
  try {
    const firestoreData = await fetchStudentDataFromFirestore(user.uid);
    if (firestoreData) {
      console.log('[StudentService] Firestore에서 복원:', firestoreData.formatted);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
      return firestoreData;
    } else {
      console.log('[StudentService] Firestore에 데이터 없음');
      return null;
    }
  } catch (error) {
    console.error('[StudentService] Firestore 복원 실패:', error);
    return null;
  }
};

/**
 * localStorage와 Firestore 간 스마트 동기화
 * 최신 타임스탬프를 가진 데이터를 양쪽에 모두 적용
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Object|null>} 동기화된 학번 데이터
 */
export const smartSync = async (userId) => {
  const localData = getStudentIdFromStorage();
  const firestoreData = await fetchStudentDataFromFirestore(userId);

  // Case 1: Only local data exists
  if (localData && !firestoreData) {
    console.log('[SmartSync] Local only - sync to Firestore');
    await syncStudentDataToFirestore(userId, localData);
    return localData;
  }

  // Case 2: Only Firestore data exists
  if (!localData && firestoreData) {
    console.log('[SmartSync] Firestore only - restore to local');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(firestoreData));
    return firestoreData;
  }

  // Case 3: Both exist - resolve conflict (last-write-wins)
  if (localData && firestoreData) {
    const localTime = new Date(localData.registeredAt).getTime();
    const firestoreTime = new Date(firestoreData.registeredAt).getTime();

    const winner = firestoreTime > localTime ? firestoreData : localData;
    console.log('[SmartSync] Conflict resolved - winner:', winner.formatted);

    // Update both storages with winner
    localStorage.setItem(STORAGE_KEY, JSON.stringify(winner));
    await syncStudentDataToFirestore(userId, winner);
    return winner;
  }

  // Case 4: Neither exists
  console.log('[SmartSync] No data in either storage');
  return null;
};
