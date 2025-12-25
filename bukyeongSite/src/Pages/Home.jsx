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
import { loadCardOrderFromStorage, saveCardOrderToStorage } from '../utils/cardOrderService';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // localStorage에서 학번 정보 읽기
  const studentData = getStudentIdFromStorage();

  // 카드 순서 상태 관리 (화살표 버튼으로 순서 변경 가능)
  const [cardOrder, setCardOrder] = useState(() => loadCardOrderFromStorage());

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

  // ============================================
  // 카드 순서 변경 핸들러
  // ============================================

  // 카드를 위로 이동 (이전 카드와 위치 교환)
  const handleMoveUp = (cardId) => {
    const currentIndex = cardOrder.indexOf(cardId);
    if (currentIndex <= 0) return; // 첫 번째 카드는 위로 이동 불가

    const newOrder = [...cardOrder];
    // 이전 카드와 위치 교환
    [newOrder[currentIndex - 1], newOrder[currentIndex]] =
      [newOrder[currentIndex], newOrder[currentIndex - 1]];

    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);
    console.log('[Home] 카드 위로 이동:', cardId, '→', newOrder);
  };

  // 카드를 아래로 이동 (다음 카드와 위치 교환)
  const handleMoveDown = (cardId) => {
    const currentIndex = cardOrder.indexOf(cardId);
    if (currentIndex >= cardOrder.length - 1) return; // 마지막 카드는 아래로 이동 불가

    const newOrder = [...cardOrder];
    // 다음 카드와 위치 교환
    [newOrder[currentIndex], newOrder[currentIndex + 1]] =
      [newOrder[currentIndex + 1], newOrder[currentIndex]];

    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);
    console.log('[Home] 카드 아래로 이동:', cardId, '→', newOrder);
  };

  // 카드를 왼쪽으로 이동 (2열 그리드에서 오른쪽 열 → 왼쪽 열)
  const handleMoveLeft = (cardId) => {
    const currentIndex = cardOrder.indexOf(cardId);
    // 오른쪽 열에 있는 카드만 왼쪽으로 이동 가능
    if (currentIndex % 2 !== 1) return;

    const newOrder = [...cardOrder];
    // 바로 왼쪽 카드와 위치 교환
    [newOrder[currentIndex - 1], newOrder[currentIndex]] =
      [newOrder[currentIndex], newOrder[currentIndex - 1]];

    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);
    console.log('[Home] 카드 왼쪽으로 이동:', cardId, '→', newOrder);
  };

  // 카드를 오른쪽으로 이동 (2열 그리드에서 왼쪽 열 → 오른쪽 열)
  const handleMoveRight = (cardId) => {
    const currentIndex = cardOrder.indexOf(cardId);
    // 왼쪽 열에 있고, 오른쪽에 카드가 있어야 이동 가능
    if (currentIndex % 2 !== 0 || currentIndex >= cardOrder.length - 1) return;

    const newOrder = [...cardOrder];
    // 바로 오른쪽 카드와 위치 교환
    [newOrder[currentIndex], newOrder[currentIndex + 1]] =
      [newOrder[currentIndex + 1], newOrder[currentIndex]];

    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);
    console.log('[Home] 카드 오른쪽으로 이동:', cardId, '→', newOrder);
  };

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
            {orderedCards.map((card, index) => (
              <Card
                key={card.id}
                title={card.title}
                isClickable={card.isClickable}
                onClick={card.isClickable ? () => navigate(card.route) : undefined}
                // 화살표 버튼 핸들러
                onMoveUp={() => handleMoveUp(card.id)}
                onMoveDown={() => handleMoveDown(card.id)}
                onMoveLeft={() => handleMoveLeft(card.id)}
                onMoveRight={() => handleMoveRight(card.id)}
                // 화살표 버튼 활성화 상태 (2열 그리드 기준)
                canMoveUp={index >= 2}  // 위에 행이 있음
                canMoveDown={index < orderedCards.length - 2}  // 아래에 행이 있음
                canMoveLeft={index % 2 === 1}  // 오른쪽 열에 있음
                canMoveRight={index % 2 === 0 && index < orderedCards.length - 1}  // 왼쪽 열이고 오른쪽에 카드 있음
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
