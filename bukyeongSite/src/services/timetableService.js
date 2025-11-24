// src/services/timetableService.js

// 날짜 유틸리티 함수 import
// - getNextSchoolDay: 다음 학교일 계산 (주말/19시 이후 처리)
// - getKoreanTime: 한국 시간(UTC+9) 반환
// - formatDateToYYYYMMDD: 날짜를 YYYYMMDD 형식으로 변환
// - getDayName: 요일 이름 반환
import {
  getNextSchoolDay,
  getKoreanTime,
  formatDateToYYYYMMDD,
  getDayName
} from './dateUtils';

/**
 * 시간표 데이터를 서버리스 함수에서 가져오는 함수
 * @param {string} date - YYYYMMDD 형식의 날짜 문자열
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Object>} 시간표 데이터
 */
export const fetchTimetableData = async (date, grade = "2", classNum = "6") => {
  try {
    console.log('시간표 API 요청:', `/api/timetable?date=${date}&grade=${grade}&classNum=${classNum}`);
    const response = await fetch(`/api/timetable?date=${date}&grade=${grade}&classNum=${classNum}`);

    console.log('시간표 API 응답 상태:', response.status);
    const text = await response.text();
    console.log('시간표 API 응답 원본:', text);

    const data = JSON.parse(text);
    console.log('시간표 API 응답 파싱:', data);

    if (!data.success) {
      throw new Error(data.error || '시간표 정보를 불러오는데 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('시간표 데이터 fetch 에러:', error);
    throw error;
  }
};

/**
 * 시간표 배열을 교시별로 정렬하고 파싱하는 함수
 * @param {Array} timetableArray - API에서 받은 시간표 배열
 * @returns {Array} 교시별로 정렬된 시간표 배열
 */
export const parseTimetable = (timetableArray) => {
  if (!timetableArray || timetableArray.length === 0) {
    console.log('시간표 배열이 비어있음:', timetableArray);
    return [];
  }

  console.log('파싱할 시간표 배열:', timetableArray);

  // 교시별로 정렬
  const sortedTimetable = timetableArray
    .map(item => ({
      period: parseInt(item.PERIO), // 교시
      subject: item.ITRT_CNTNT || '자습', // 과목명
      teacher: item.ITRT_CNTNT || '', // 교사명 (데이터에 없으면 빈 문자열)
    }))
    .sort((a, b) => a.period - b.period);

  console.log('파싱 및 정렬 결과:', sortedTimetable);
  return sortedTimetable;
};

/**
 * ============================================
 * "다음 학교일"의 시간표 정보를 가져오는 함수
 * ============================================
 *
 * 함수명은 getTodayTimetable이지만, 실제로는 "다음 학교일"의 시간표를 반환
 *
 * 동작 방식:
 * - 평일 19시 이전: 오늘 시간표
 * - 평일 19시 이후: 다음 학교일 시간표 (금요일이면 월요일)
 * - 주말: 다음 주 월요일 시간표
 *
 * React Query 캐싱과 연계:
 * - 반환된 dateStr을 React Query의 queryKey에 포함시켜야 함
 * - 날짜가 바뀌면 자동으로 새 캐시 생성
 *
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Object>} 다음 학교일의 시간표 정보 + dateStr 포함
 */
export const getTodayTimetable = async (grade = "2", classNum = "6") => {
  // getNextSchoolDay(): 주말/19시 이후 로직을 적용한 "다음 학교일" 반환
  const schoolDay = getNextSchoolDay();
  const dateStr = formatDateToYYYYMMDD(schoolDay);

  try {
    const data = await fetchTimetableData(dateStr, grade, classNum);
    const parsedTimetable = parseTimetable(data.timetable);

    return {
      date: dateStr,
      day: getDayName(schoolDay), // schoolDay 사용 (다음 학교일 요일)
      grade: data.grade,
      classNum: data.classNum,
      timetable: parsedTimetable,
      raw: data.timetable // 원본 데이터도 포함
    };
  } catch (error) {
    console.error('시간표 데이터 가져오기 실패:', error);
    return {
      date: dateStr,
      day: getDayName(schoolDay), // schoolDay 사용
      grade,
      classNum,
      timetable: [],
      error: true
    };
  }
};

/**
 * 주간 시간표 정보를 가져오는 함수 (월~금)
 *
 * 한국 시간 기준으로 이번 주 월~금 시간표 데이터 fetch
 *
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Array>} 이번 주 시간표 정보 배열
 */
export const getWeekTimetable = async (grade = "2", classNum = "6") => {
  const today = getKoreanTime(); // 한국 시간 기준
  const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ...

  // 이번 주 월요일 계산
  const monday = new Date(today);
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + diff);

  // ============================================
  // 병렬 처리: 5일치 시간표를 동시에 요청
  // ============================================
  // 순차 처리 (before): 5초 소요
  // 병렬 처리 (after): 1초 소요 (80% 속도 향상)
  const promises = Array.from({ length: 5 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = formatDateToYYYYMMDD(date);

    return fetchTimetableData(dateStr, grade, classNum)
      .then(data => {
        const parsedTimetable = parseTimetable(data.timetable);
        return {
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          day: getDayName(date),
          grade: data.grade,
          classNum: data.classNum,
          timetable: parsedTimetable
        };
      })
      .catch(error => {
        console.error(`${dateStr} 시간표 데이터 가져오기 실패:`, error);
        return {
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          day: getDayName(date),
          grade,
          classNum,
          timetable: [],
          error: true
        };
      });
  });

  // Promise.all()로 모든 요청 동시 실행
  const weekData = await Promise.all(promises);
  return weekData;
};

/**
 * 특정 날짜의 시간표 정보를 가져오는 함수
 * @param {Date} date - Date 객체
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Object>} 해당 날짜의 시간표 정보
 */
export const getTimetableByDate = async (date, grade = "2", classNum = "6") => {
  const dateStr = formatDateToYYYYMMDD(date);

  try {
    const data = await fetchTimetableData(dateStr, grade, classNum);
    const parsedTimetable = parseTimetable(data.timetable);

    return {
      date: dateStr,
      day: getDayName(date),
      grade: data.grade,
      classNum: data.classNum,
      timetable: parsedTimetable,
      raw: data.timetable
    };
  } catch (error) {
    console.error(`${dateStr} 시간표 데이터 가져오기 실패:`, error);
    return {
      date: dateStr,
      day: getDayName(date),
      grade,
      classNum,
      timetable: [],
      error: true
    };
  }
};

// getDayName, getShortDayName 함수는 dateUtils.js에서 import하여 사용
// 외부에서 사용할 수 있도록 re-export
export { getShortDayName } from './dateUtils';
