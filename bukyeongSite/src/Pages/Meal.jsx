// src/Pages/Meal.jsx
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // React Query 훅 import
import Card from '../components/common/Card';
import { getWeekMealData } from '../services/mealService';
import './Meal.css';

const Meal = () => {
  const navigate = useNavigate();

  // ============================================
  // React Query를 사용한 주간 급식 데이터 캐싱
  // ============================================
  // useQuery: 월~금 급식 데이터를 가져오고 캐싱
  // - MealWidget에서 이미 오늘 데이터를 불러왔다면, 그 데이터는 캐시에 존재
  // - 이 페이지에서 주간 데이터를 요청하면, 오늘 데이터는 재사용되고 나머지만 fetch
  const {
    data: weekMeals = [],  // 서버에서 받아온 주간 급식 배열 (기본값: 빈 배열)
    isLoading: loading,    // 로딩 중 여부
    error,                 // 에러 객체
  } = useQuery({
    // queryKey: 캐시를 식별하는 고유 키
    // ['meal', 'week'] → "이번 주 급식" 데이터를 식별
    // 'today'와 다른 키를 사용하여 주간 데이터 별도 관리
    queryKey: ['meal', 'week'],

    // queryFn: 실제 데이터를 가져오는 함수
    // getWeekMealData()를 호출하여 월~금 급식 정보 fetch (5개 API 호출)
    queryFn: getWeekMealData,

    // staleTime: 주간 급식은 자주 변경되지 않으므로 10분간 캐시 유지
    // 사용자가 페이지를 왔다갔다해도 10분간은 API 재호출 안 함
    staleTime: 1000 * 60 * 10, // 10분
  });

  if (loading) {
    return (
      <div className="meal-page">
        <button
          onClick={() => navigate('/')}
          className="meal-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="meal-loading">급식 정보를 불러오는 중...</div>
      </div>
    );
  }

  // 에러 발생 시 에러 메시지 표시
  if (error) {
    return (
      <div className="meal-page">
        <button
          onClick={() => navigate('/')}
          className="meal-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="meal-error">
          {error.message || '급식 정보를 불러오는데 실패했습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className="meal-page">
      <button
        onClick={() => navigate('/')}
        className="meal-back-button"
      >
        ← 홈으로 돌아가기
      </button>

      <h1 className="meal-page-title">
        이번 주 급식표
      </h1>

      <div className="meal-cards-container">
        {weekMeals.map((meal, index) => (
          <Card
            key={index}
            title={`${meal.day} (${meal.date})`}
          >
            <div className="meal-card-content">
              <div className="meal-time-section">
                <h3 className="meal-time-title">
                  🌅 아침
                </h3>
                <ul className="meal-time-list">
                  {meal.breakfast.length > 0 ? (
                    meal.breakfast.map((item, idx) => (
                      <li key={idx} className="meal-time-item">
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="meal-time-item">급식 정보 없음</li>
                  )}
                </ul>
              </div>

              <div className="meal-time-section">
                <h3 className="meal-time-title">
                  ☀️ 점심
                </h3>
                <ul className="meal-time-list">
                  {meal.lunch.length > 0 ? (
                    meal.lunch.map((item, idx) => (
                      <li key={idx} className="meal-time-item">
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="meal-time-item">급식 정보 없음</li>
                  )}
                </ul>
              </div>

              <div className="meal-time-section">
                <h3 className="meal-time-title">
                  🌙 저녁
                </h3>
                <ul className="meal-time-list">
                  {meal.dinner.length > 0 ? (
                    meal.dinner.map((item, idx) => (
                      <li key={idx} className="meal-time-item">
                        • {item}
                      </li>
                    ))
                  ) : (
                    <li className="meal-time-item">급식 정보 없음</li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Meal;
