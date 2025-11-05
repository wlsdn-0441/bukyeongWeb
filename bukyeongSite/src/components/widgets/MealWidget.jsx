// src/components/widgets/MealWidget.jsx
import { memo } from 'react';
import { getTodayMeal } from '../../data/mealData';
import './MealWidget.css';

const MealWidget = memo(() => {
  const todayMeal = getTodayMeal();

  return (
    <div className="meal-widget">
      <div className="meal-widget-header">
        <p className="meal-widget-day">{todayMeal.day}</p>
        <p className="meal-widget-date">{todayMeal.date}</p>
      </div>

      <div className="meal-section breakfast">
        <h3 className="meal-section-title">
          <span>🌅</span>
          <span>아침</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.breakfast.map((item, idx) => (
            <li key={idx} className="meal-item">
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="meal-section lunch">
        <h3 className="meal-section-title">
          <span>☀️</span>
          <span>점심</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.lunch.map((item, idx) => (
            <li key={idx} className="meal-item">
              • {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="meal-section dinner">
        <h3 className="meal-section-title">
          <span>🌙</span>
          <span>저녁</span>
        </h3>
        <ul className="meal-list">
          {todayMeal.dinner.map((item, idx) => (
            <li key={idx} className="meal-item">
              • {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

MealWidget.displayName = 'MealWidget';

export default MealWidget;