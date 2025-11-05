// src/data/mealData.js
export const weekMeals = [
  {
    day: '월요일',
    date: '2025-10-27',
    breakfast: ['흰쌀밥', '미역국', '김치', '계란후라이'],
    lunch: ['카레라이스', '단무지', '과일', '우유'],
    dinner: ['비빔밥', '된장국', '김', '샐러드'],
  },
  {
    day: '화요일',
    date: '2025-10-28',
    breakfast: ['잡곡밥', '북어국', '김치', '햄'],
    lunch: ['돈까스', '스파게티', '샐러드', '우유'],
    dinner: ['김치찌개', '흰쌀밥', '김', '나물'],
  },
  {
    day: '수요일',
    date: '2025-10-29',
    breakfast: ['흰쌀밥', '콩나물국', '김치', '계란말이'],
    lunch: ['짜장면', '탕수육', '단무지', '과일'],
    dinner: ['제육볶음', '된장국', '흰쌀밥', '김'],
  },
  {
    day: '목요일',
    date: '2025-10-30',
    breakfast: ['잡곡밥', '시래기국', '김치', '소시지'],
    lunch: ['닭갈비', '샐러드', '흰쌀밥', '우유'],
    dinner: ['된장찌개', '불고기', '김', '나물'],
  },
  {
    day: '금요일',
    date: '2025-10-31',
    breakfast: ['흰쌀밥', '미역국', '김치', '햄'],
    lunch: ['햄버거', '감자튀김', '콜라', '샐러드'],
    dinner: ['김치찌개', '삼겹살', '쌈채소', '흰쌀밥'],
  },
];

// 오늘 날짜에 해당하는 급식 정보를 반환하는 함수
export const getTodayMeal = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (일요일) ~ 6 (토요일)

  // 주말이면 월요일 메뉴 반환
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return weekMeals[0];
  }

  // 월요일(1) ~ 금요일(5)에 해당하는 메뉴 반환
  return weekMeals[dayOfWeek - 1] || weekMeals[0];
};
