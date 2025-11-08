// src/services/timetableService.js

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
 * 날짜를 YYYYMMDD 형식으로 변환
 * @param {Date} date - Date 객체
 * @returns {string} YYYYMMDD 형식의 날짜 문자열
 */
export const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * 오늘 날짜의 시간표 정보를 가져오는 함수
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Object>} 오늘의 시간표 정보
 */
export const getTodayTimetable = async (grade = "2", classNum = "6") => {
  const today = new Date();
  const dateStr = formatDateToYYYYMMDD(today);

  try {
    const data = await fetchTimetableData(dateStr, grade, classNum);
    const parsedTimetable = parseTimetable(data.timetable);

    return {
      date: dateStr,
      day: getDayName(today),
      grade: data.grade,
      classNum: data.classNum,
      timetable: parsedTimetable,
      raw: data.timetable // 원본 데이터도 포함
    };
  } catch (error) {
    console.error('오늘 시간표 데이터 가져오기 실패:', error);
    return {
      date: dateStr,
      day: getDayName(today),
      grade,
      classNum,
      timetable: [],
      error: true
    };
  }
};

/**
 * 주간 시간표 정보를 가져오는 함수 (월~금)
 * @param {string} grade - 학년 (기본값: "2")
 * @param {string} classNum - 반 (기본값: "6")
 * @returns {Promise<Array>} 이번 주 시간표 정보 배열
 */
export const getWeekTimetable = async (grade = "2", classNum = "6") => {
  const today = new Date();
  const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ...

  // 이번 주 월요일 계산
  const monday = new Date(today);
  const diff = currentDay === 0 ? -6 : 1 - currentDay;
  monday.setDate(today.getDate() + diff);

  const weekData = [];

  // 월요일부터 금요일까지 (5일)
  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = formatDateToYYYYMMDD(date);

    try {
      const data = await fetchTimetableData(dateStr, grade, classNum);
      const parsedTimetable = parseTimetable(data.timetable);

      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: getDayName(date),
        grade: data.grade,
        classNum: data.classNum,
        timetable: parsedTimetable
      });
    } catch (error) {
      console.error(`${dateStr} 시간표 데이터 가져오기 실패:`, error);
      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: getDayName(date),
        grade,
        classNum,
        timetable: [],
        error: true
      });
    }
  }

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

/**
 * 요일 이름 반환
 * @param {Date} date - Date 객체
 * @returns {string} 요일 이름
 */
const getDayName = (date) => {
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return days[date.getDay()];
};

/**
 * 요일 짧은 이름 반환
 * @param {Date} date - Date 객체
 * @returns {string} 요일 짧은 이름
 */
export const getShortDayName = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};
