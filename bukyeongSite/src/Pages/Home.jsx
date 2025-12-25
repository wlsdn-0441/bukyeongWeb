// src/Pages/Home.jsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../components/common/Card';
import MealWidget from '../components/widgets/MealWidget';
import TimetableWidget from '../components/widgets/TimetableWidget';
import GameStatsWidget from '../components/widgets/GameStatsWidget';
import { getWeekMealData } from '../services/mealService';
import { getWeekTimetable } from '../services/timetableService';
import { getStudentIdFromStorage } from '../services/studentService';
import { loadCardOrderFromStorage } from '../utils/cardOrderService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // localStorage에서 학번 정보 읽기
  const studentData = getStudentIdFromStorage();

  // 카드 순서 상태 관리 (순서만 유지)
  const [cardOrder] = useState(() => loadCardOrderFromStorage());

  // ============================================
  // Prefetching: 백그라운드에서 미리 데이터 로딩
  // ============================================
  // 홈 화면 로딩 후 브라우저 유휴 시간에 주간 데이터를 미리 가져옴
  // - 급식표/시간표 페이지 진입 시 캐시에서 즉시 표시
  // - requestIdleCallback: 브라우저가 한가할 때 실행 (우선순위 낮음)
  useEffect(() => {
    // 학번이 없으면 시간표 prefetch 하지 않음
    if (!studentData) return;

    const { grade, classNum } = studentData;

    // requestIdleCallback 지원 여부 확인 (구형 브라우저 대응)
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => {
        // 주간 급식 데이터 미리 로딩
        queryClient.prefetchQuery({
          queryKey: ['meal', 'week'],
          queryFn: getWeekMealData,
        });

        // 주간 시간표 데이터 미리 로딩 (학번 기반)
        queryClient.prefetchQuery({
          queryKey: ['timetable', 'week', grade, classNum],
          queryFn: () => getWeekTimetable(grade, classNum),
        });
      });
    } else {
      // requestIdleCallback 미지원 시 setTimeout 사용 (fallback)
      setTimeout(() => {
        queryClient.prefetchQuery({
          queryKey: ['meal', 'week'],
          queryFn: getWeekMealData,
        });

        queryClient.prefetchQuery({
          queryKey: ['timetable', 'week', grade, classNum],
          queryFn: () => getWeekTimetable(grade, classNum),
        });
      }, 2000); // 2초 후 실행
    }
  }, [queryClient, studentData]);

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
      title: '게임 랭킹',
      component: <GameStatsWidget />,
      route: '/game-stats',
      isClickable: true,
    },
    // {
    //   id: 4,
    //   title: '날씨',
    //   component: (
    //     <div className="weather-widget">
    //       <p className="weather-icon">☀️</p>
    //       <p className="weather-temp">23°C</p>
    //       <p className="weather-status">맑음</p>
    //     </div>
    //   ),
    //   isClickable: false,
    // },
    // {
    //   id: 5,
    //   title: '공지사항',
    //   component: (
    //     <div className="notice-widget">
    //       <p className="notice-item">📢 내일은 체육대회가 있습니다.</p>
    //       <p className="notice-item">📌 급식 시간이 30분 앞당겨집니다.</p>
    //     </div>
    //   ),
    //   isClickable: false,
    // },
  ];

  // cardOrder에 따라 카드 정렬
  const orderedCards = useMemo(() => {
    return cardOrder
      .map(id => dashboardCards.find(card => card.id === id))
      .filter(Boolean);
  }, [cardOrder]);

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
            {orderedCards.map((card) => (
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
