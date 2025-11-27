/**
 * 학번 관리 서비스
 *
 * localStorage 기반으로 학번을 저장하고 관리합니다.
 */

import { parseStudentId } from '../utils/studentIdParser';

const STORAGE_KEY = 'bukyeongStudentId';

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
 * 학번 등록 (localStorage 기반)
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

  // 2. localStorage 저장
  const studentData = {
    studentId,
    grade: parsed.grade,
    classNum: parsed.classNum,
    number: parsed.number,
    formatted: parsed.formatted,
    registeredAt: new Date().toISOString()
  };

  saveStudentIdToStorage(studentData);

  console.log('[StudentService] 학번 등록 완료:', studentData.formatted);
  return studentData;
};

/**
 * 학번 정보 삭제 (초기화)
 */
export const clearStudentId = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY); // sessionStorage도 정리
  console.log('[StudentService] 학번 정보 삭제 완료');
};

/**
 * 학번 존재 여부 확인
 * @returns {boolean} 학번이 저장되어 있으면 true
 */
export const hasStudentId = () => {
  return getStudentIdFromStorage() !== null;
};
