// src/Pages/Meal.jsx
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import { weekMeals } from '../data/mealData';
import './Meal.css';

const Meal = () => {
  const navigate = useNavigate();

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
                  {meal.breakfast.map((item, idx) => (
                    <li key={idx} className="meal-time-item">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="meal-time-section">
                <h3 className="meal-time-title">
                  ☀️ 점심
                </h3>
                <ul className="meal-time-list">
                  {meal.lunch.map((item, idx) => (
                    <li key={idx} className="meal-time-item">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="meal-time-section">
                <h3 className="meal-time-title">
                  🌙 저녁
                </h3>
                <ul className="meal-time-list">
                  {meal.dinner.map((item, idx) => (
                    <li key={idx} className="meal-time-item">
                      • {item}
                    </li>
                  ))}
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
