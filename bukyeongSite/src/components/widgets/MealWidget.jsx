// src/components/widgets/MealWidget.jsx
import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query'; // React Query 훅 import
import { getTodayMealData } from '../../services/mealService';
import { getNextSchoolDay, formatDateToYYYYMMDD } from '../../services/dateUtils';
import './MealWidget.css';

const MealWidget = memo(() => {
  // ============================================
  // 다음 학교일 계산 (캐싱 키에 사용)
  // ============================================
  // useMemo: 컴포넌트가 리렌더링되어도 날짜 계산을 한 번만 수행
  // - 평일 19시 이전: 오늘 날짜
  // - 평일 19시 이후: 다음 학교일 날짜
  // - 주말: 다음 주 월요일 날짜
  const schoolDateStr = useMemo(() => {
    const schoolDay = getNextSchoolDay();
    return formatDateToYYYYMMDD(schoolDay);
  }, []); // 빈 배열: 컴포넌트 마운트 시 한 번만 계산

  // ============================================
  // React Query를 사용한 데이터 캐싱
  // ============================================
  // useQuery: 서버 데이터를 가져오고 자동으로 캐싱하는 훅
  // - 장점 1: 홈에서 불러온 데이터를 Meal 페이지에서 재사용 가능
  // - 장점 2: 로딩/에러 상태 자동 관리
  // - 장점 3: 중복 요청 자동 제거 (같은 queryKey면 한 번만 요청)
  // - 장점 4: 날짜가 바뀌면 자동으로 새 캐시 생성 (queryKey에 날짜 포함)
  const {
    data: todayMeal,     // 서버에서 받아온 급식 데이터
    isLoading: loading,  // 로딩 중 여부 (true/false)
    error,               // 에러 객체 (에러 발생 시)
  } = useQuery({
    // queryKey: 캐시를 식별하는 고유 키
    // ['meal', schoolDateStr] → "특정 날짜의 급식" 데이터를 식별
    // 예: ['meal', '20251123'] → 2025년 11월 23일 급식
    // 19시가 지나거나 날짜가 바뀌면 schoolDateStr이 변경되어 새 캐시 생성
    queryKey: ['meal', schoolDateStr],

    // queryFn: 실제 데이터를 가져오는 함수
    // getTodayMealData()를 호출하여 다음 학교일 급식 정보 fetch
    queryFn: getTodayMealData,

    // staleTime: 이 쿼리만의 커스텀 설정 (App.jsx의 기본값 override)
    // 급식은 하루 단위로 변경되므로 5분간 캐시 유지
    staleTime: 1000 * 60 * 5, // 5분
  });

  if (loading) {
    return (
      <div className="meal-widget">
        <div className="meal-widget-loading">급식 정보 로딩 중...</div>
      </div>
    );
  }

  if (error || !todayMeal) {
    return (
      <div className="meal-widget">
        <div className="meal-widget-error">
          {error || '급식 정보를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="meal-widget">
      <div className="meal-widget-header">
        <p className="meal-widget-day">{todayMeal.day}</p>
        <p className="meal-widget-date">
          {todayMeal.date.slice(4, 6)}/{todayMeal.date.slice(6, 8)}
        </p>
      </div>

      <div className="meal-section breakfast">
        <h3 className="meal-section-title">
          <span>🌅</span>
          <span>아침</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.breakfast.length > 0 ? (
            todayMeal.breakfast.map((item, idx) => (
              <li key={idx} className="meal-item">
                • {item}
              </li>
            ))
          ) : (
            <li className="meal-item">급식 정보 없음</li>
          )}
        </ul>
      </div>

      <div className="meal-section lunch">
        <h3 className="meal-section-title">
          <span>☀️</span>
          <span>점심</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.lunch.length > 0 ? (
            todayMeal.lunch.map((item, idx) => (
              <li key={idx} className="meal-item">
                • {item}
              </li>
            ))
          ) : (
            <li className="meal-item">급식 정보 없음</li>
          )}
        </ul>
      </div>

      <div className="meal-section dinner">
        <h3 className="meal-section-title">
          <span>🌙</span>
          <span>저녁</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.dinner.length > 0 ? (
            todayMeal.dinner.map((item, idx) => (
              <li key={idx} className="meal-item">
                • {item}
              </li>
            ))
          ) : (
            <li className="meal-item">급식 정보 없음</li>
          )}
        </ul>
      </div>
    </div>
  );
});

MealWidget.displayName = 'MealWidget';

export default MealWidget;