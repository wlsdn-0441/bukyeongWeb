// src/services/mealService.js

/**
 * 급식 데이터를 서버리스 함수에서 가져오는 함수
 * @param {string} date - YYYYMMDD 형식의 날짜 문자열
 * @returns {Promise<Object>} 급식 데이터
 */
export const fetchMealData = async (date) => {
  try {
    console.log('API 요청:', `/api/meal?date=${date}`);
    const response = await fetch(`/api/meal?date=${date}`);

    console.log('API 응답 상태:', response.status);
    const text = await response.text();
    console.log('API 응답 원본:', text);

    const data = JSON.parse(text);
    console.log('API 응답 파싱:', data);

    if (!data.success) {
      throw new Error(data.error || '급식 정보를 불러오는데 실패했습니다.');
    }

    return data;
  } catch (error) {
    console.error('급식 데이터 fetch 에러:', error);
    throw error;
  }
};

/**
 * 급식 메뉴를 파싱하여 아침/점심/저녁으로 분류하는 함수
 * @param {Array} menuArray - API에서 받은 급식 메뉴 배열
 * @returns {Object} {breakfast: [], lunch: [], dinner: []}
 */
export const parseMealMenu = (menuArray) => {
  const result = {
    breakfast: [],
    lunch: [],
    dinner: []
  };

  if (!menuArray || menuArray.length === 0) {
    console.log('메뉴 배열이 비어있음:', menuArray);
    return result;
  }

  console.log('파싱할 메뉴 배열:', menuArray);

  menuArray.forEach(meal => {
    console.log('개별 메뉴 데이터:', meal);
    // DDISH_NM: 급식 메뉴, MMEAL_SC_NM: 식사 구분 (아침/점심/저녁)
    const mealType = meal.MMEAL_SC_NM;
    const menu = meal.DDISH_NM
      .replace(/\([^)]*\)/g, '') // 알레르기 정보 제거 (괄호와 내용)
      .split('<br/>')
      .map(item => item.trim())
      .filter(item => item.length > 0);

    console.log(`메뉴 타입: ${mealType}, 메뉴:`, menu);

    if (mealType === '조식' || mealType === '아침') {
      result.breakfast = menu;
    } else if (mealType === '중식' || mealType === '점심') {
      result.lunch = menu;
    } else if (mealType === '석식' || mealType === '저녁') {
      result.dinner = menu;
    }
  });

  console.log('파싱 결과:', result);
  return result;
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
 * 오늘 날짜의 급식 정보를 가져오는 함수
 * @returns {Promise<Object>} 오늘의 급식 정보
 */
export const getTodayMealData = async () => {
  const today = new Date();
  const dateStr = formatDateToYYYYMMDD(today);

  try {
    const data = await fetchMealData(dateStr);
    const parsedMenu = parseMealMenu(data.menu);

    return {
      date: dateStr,
      day: getDayName(today),
      ...parsedMenu,
      raw: data.menu // 원본 데이터도 포함
    };
  } catch (error) {
    console.error('오늘 급식 데이터 가져오기 실패:', error);
    return {
      date: dateStr,
      day: getDayName(today),
      breakfast: [],
      lunch: [],
      dinner: [],
      error: true
    };
  }
};

/**
 * 주간 급식 정보를 가져오는 함수 (월~금)
 * @returns {Promise<Array>} 이번 주 급식 정보 배열
 */
export const getWeekMealData = async () => {
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
      const data = await fetchMealData(dateStr);
      const parsedMenu = parseMealMenu(data.menu);

      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: getDayName(date),
        ...parsedMenu
      });
    } catch (error) {
      console.error(`${dateStr} 급식 데이터 가져오기 실패:`, error);
      weekData.push({
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        day: getDayName(date),
        breakfast: [],
        lunch: [],
        dinner: [],
        error: true
      });
    }
  }

  return weekData;
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
