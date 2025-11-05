// src/Pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import MealWidget from '../components/widgets/MealWidget';
import TimetableWidget from '../components/widgets/TimetableWidget';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: 1,
      title: '오늘의 급식',
      component: <MealWidget />,
      route: '/meal',
      isClickable: true,
    },

    {
      id: 2,
      title: '시간표',
      component: <TimetableWidget />,
      route: '/timetable',
      isClickable: true,
    },
    {
      id: 3,
      title: '날씨',
      component: (
        <div className="weather-widget">
          <p className="weather-icon">☀️</p>
          <p className="weather-temp">23°C</p>
          <p className="weather-status">맑음</p>
        </div>
      ),
      isClickable: false,
    },
    {
      id: 4,
      title: '공지사항',
      component: (
        <div className="notice-widget">
          <p className="notice-item">📢 내일은 체육대회가 있습니다.</p>
          <p className="notice-item">📌 급식 시간이 30분 앞당겨집니다.</p>
        </div>
      ),
      isClickable: false,
    },
  ];

  return (
    <div className="home-page">
      {/* <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">
            학교 대시보드
          </h1>
          <p className="home-subtitle">
            오늘의 학교 정보를 한눈에 확인하세요
          </p>
        </div>
      </div> */}

      <div className="home-content-wrapper">
        <div className="home-content">
          <div className="home-grid">
            {dashboardCards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                isClickable={card.isClickable}
                onClick={card.isClickable ? () => navigate(card.route) : undefined}
              >
                {card.component}

                {card.isClickable && (
                  <div className="home-view-more">
                    자세히 보기 →
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
