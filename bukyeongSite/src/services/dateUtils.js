// src/services/dateUtils.js

/**
 * ============================================
 * 날짜 관련 유틸리티 함수 모음
 * ============================================
 * 한국 시간(KST, UTC+9) 계산 및 다음 학교일 계산 로직 포함
 */

/**
 * 한국 시간(KST, UTC+9)을 반환하는 함수
 *
 * 왜 필요한가?
 * - JavaScript의 new Date()는 사용자의 로컬 시간을 반환
 * - 서버가 다른 시간대에 있을 수 있음
 * - 학교는 한국에 있으므로 항상 한국 시간 기준으로 판단해야 함
 *
 * @returns {Date} 한국 시간(UTC+9)의 Date 객체
 */
export const getKoreanTime = () => {
  // 현재 UTC 시간 가져오기
  const now = new Date();

  // UTC 시간을 밀리초로 변환
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);

  // 한국 시간(UTC+9) 계산
  const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000));

  return koreaTime;
};

/**
 * 다음 학교일(수업이 있는 날)을 계산하는 함수
 *
 * 로직:
 * 1. 주말(토요일, 일요일)이면 → 다음 주 월요일
 * 2. 평일 19시(오후 7시) 이후면 → 다음 학교일
 *    - 월~목 19시 이후 → 다음 날 (화~금)
 *    - 금요일 19시 이후 → 다음 주 월요일
 * 3. 평일 19시 이전 → 오늘
 *
 * 예시:
 * - 목요일 18:00 → 목요일 (오늘)
 * - 목요일 20:00 → 금요일 (내일)
 * - 금요일 20:00 → 다음 주 월요일
 * - 토요일 아무 시간 → 다음 주 월요일
 *
 * @returns {Date} 다음 학교일의 Date 객체
 */
export const getNextSchoolDay = () => {
  const now = getKoreanTime(); // 한국 시간 기준
  const dayOfWeek = now.getDay(); // 0=일, 1=월, 2=화, ..., 6=토
  const hour = now.getHours(); // 0-23 시간

  // ============================================
  // 케이스 1: 주말이면 다음 주 월요일
  // ============================================
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // 일요일(0)이면 +1일, 토요일(6)이면 +2일
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 2;
    return addDays(now, daysUntilMonday);
  }

  // ============================================
  // 케이스 2: 평일 19시 이후
  // ============================================
  if (hour >= 19) {
    // 금요일(5)이면 다음 주 월요일 (+3일)
    if (dayOfWeek === 5) {
      return addDays(now, 3);
    }
    // 월~목이면 다음 날 (+1일)
    return addDays(now, 1);
  }

  // ============================================
  // 케이스 3: 평일 19시 이전 → 오늘
  // ============================================
  return now;
};

/**
 * 날짜에 지정된 일수를 더하는 헬퍼 함수
 *
 * @param {Date} date - 기준 날짜
 * @param {number} days - 더할 일수
 * @returns {Date} 계산된 새 날짜
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 *
 * @param {Date} date - Date 객체
 * @returns {string} YYYYMMDD 형식의 날짜 문자열
 *
 * 예시: new Date(2025, 10, 23) → "20251123"
 */
export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 요일 이름 반환 (한글)
 *
 * @param {Date} date - Date 객체
 * @returns {string} 요일 이름 (예: "월요일", "화요일")
 */
export const getDayName = (date) => {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[date.getDay()];
};

/**
 * 요일 짧은 이름 반환 (한글)
 *
 * @param {Date} date - Date 객체
 * @returns {string} 요일 짧은 이름 (예: "월", "화")
 */
export const getShortDayName = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

/**
 * 디버깅용: 현재 시간과 다음 학교일 출력
 *
 * 개발 중 테스트용으로 사용
 * 콘솔에서 현재 로직이 어떻게 동작하는지 확인 가능
 */
export const debugSchoolDay = () => {
  const now = getKoreanTime();
  const nextSchoolDay = getNextSchoolDay();

  console.log('=== 다음 학교일 계산 디버그 ===');
  console.log('현재 한국 시간:', now.toLocaleString('ko-KR'));
  console.log('현재 요일:', getDayName(now));
  console.log('현재 시간:', now.getHours() + '시');
  console.log('다음 학교일:', nextSchoolDay.toLocaleString('ko-KR'));
  console.log('다음 학교일 요일:', getDayName(nextSchoolDay));
  console.log('================================');
};
