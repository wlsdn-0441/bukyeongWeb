// src/Pages/Meal.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { getWeekMealData } from '../services/mealService';
import './Meal.css';

const Meal = () => {
  const navigate = useNavigate();
  const [weekMeals, setWeekMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadWeekMeals = async () => {
      try {
        setLoading(true);
        const data = await getWeekMealData();
        setWeekMeals(data);
        setError(null);
      } catch (err) {
        console.error('급식 데이터 로딩 실패:', err);
        setError('급식 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadWeekMeals();
  }, []);

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

  if (error) {
    return (
      <div className="meal-page">
        <button
          onClick={() => navigate('/')}
          className="meal-back-button"
        >
          ← 홈으로 돌아가기
        </button>
        <div className="meal-error">{error}</div>
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
