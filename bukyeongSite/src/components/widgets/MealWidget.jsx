// src/components/widgets/MealWidget.jsx
import { memo, useState, useEffect } from 'react';
import { getTodayMealData } from '../../services/mealService';
import './MealWidget.css';

const MealWidget = memo(() => {
  const [todayMeal, setTodayMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTodayMeal = async () => {
      try {
        setLoading(true);
        const data = await getTodayMealData();
        setTodayMeal(data);
        setError(null);
      } catch (err) {
        console.error('급식 데이터 로딩 실패:', err);
        setError('급식 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadTodayMeal();
  }, []);

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