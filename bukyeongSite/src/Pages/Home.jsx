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

  // 카드 순서 상태 관리
  const [cardOrder, setCardOrder] = useState(() => loadCardOrderFromStorage());

  // 드래그 중인 카드 추적
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);

  // 터치 드래그 추적
  const [touchStartY, setTouchStartY] = useState(null);
  const [isTouchDragging, setIsTouchDragging] = useState(false);

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
  // 드래그 이벤트 핸들러
  // ============================================

  // 드래그 시작
  const handleDragStart = (cardId) => {
    setDraggedCardId(cardId);
    // 드래그 중 스크롤 방지
    document.body.style.overflow = 'hidden';
    console.log('[Home] 드래그 시작:', cardId);
  };

  // 드래그 오버 (드롭 가능 영역 표시)
  const handleDragOver = (e, cardId) => {
    e.preventDefault(); // 필수: drop 이벤트를 활성화
    if (dragOverCardId !== cardId) {
      setDragOverCardId(cardId);
    }
  };

  // 드롭 (순서 변경)
  const handleDrop = (e, dropTargetCardId) => {
    e.preventDefault();

    // 스크롤 다시 허용
    document.body.style.overflow = '';

    if (!draggedCardId || draggedCardId === dropTargetCardId) {
      setDraggedCardId(null);
      setDragOverCardId(null);
      return;
    }

    console.log('[Home] 드롭:', draggedCardId, '→', dropTargetCardId);

    // 순서 변경 로직
    const newOrder = [...cardOrder];
    const draggedIndex = newOrder.indexOf(draggedCardId);
    const targetIndex = newOrder.indexOf(dropTargetCardId);

    // 배열에서 제거 후 새 위치에 삽입
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCardId);

    console.log('[Home] 새로운 순서:', newOrder);

    // 상태 업데이트 및 저장
    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);

    // 드래그 상태 초기화
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    console.log('[Home] 드래그 종료');
    // 스크롤 다시 허용
    document.body.style.overflow = '';
    setDraggedCardId(null);
    setDragOverCardId(null);
  };

  // ============================================
  // 터치 이벤트 핸들러 (모바일 지원)
  // ============================================

  // 터치 시작
  const handleTouchStart = (e, cardId) => {
    const touch = e.touches[0];
    setTouchStartY(touch.clientY);
    setDraggedCardId(cardId);
    setIsTouchDragging(false);
    console.log('[Home] 터치 시작:', cardId);
  };

  // 터치 이동
  const handleTouchMove = (e, cardId) => {
    if (!touchStartY || !draggedCardId) return;

    const touch = e.touches[0];
    const deltaY = Math.abs(touch.clientY - touchStartY);

    // 10px 이상 움직였을 때 드래그로 인식 (스크롤과 구분)
    if (deltaY > 10) {
      if (!isTouchDragging) {
        setIsTouchDragging(true);
        // 드래그 모드로 전환 시 스크롤 방지
        document.body.style.overflow = 'hidden';
      }
      e.preventDefault(); // 스크롤 방지

      // 터치 위치 아래의 요소 찾기
      const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
      const cardElement = elements.find(el => el.classList.contains('card'));

      if (cardElement) {
        const targetCardId = parseInt(cardElement.getAttribute('data-card-id'));
        if (targetCardId && targetCardId !== dragOverCardId) {
          setDragOverCardId(targetCardId);
        }
      }
    }
  };

  // 터치 종료
  const handleTouchEnd = (e, cardId) => {
    // 스크롤 다시 허용
    document.body.style.overflow = '';

    if (!isTouchDragging || !draggedCardId || !dragOverCardId) {
      // 드래그가 아닌 단순 탭
      setDraggedCardId(null);
      setDragOverCardId(null);
      setTouchStartY(null);
      setIsTouchDragging(false);
      return;
    }

    if (draggedCardId === dragOverCardId) {
      // 같은 카드에 드롭
      setDraggedCardId(null);
      setDragOverCardId(null);
      setTouchStartY(null);
      setIsTouchDragging(false);
      return;
    }

    console.log('[Home] 터치 드롭:', draggedCardId, '→', dragOverCardId);

    // 순서 변경 로직
    const newOrder = [...cardOrder];
    const draggedIndex = newOrder.indexOf(draggedCardId);
    const targetIndex = newOrder.indexOf(dragOverCardId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedCardId);

    console.log('[Home] 새로운 순서:', newOrder);

    setCardOrder(newOrder);
    saveCardOrderToStorage(newOrder);

    // 상태 초기화
    setDraggedCardId(null);
    setDragOverCardId(null);
    setTouchStartY(null);
    setIsTouchDragging(false);
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
            {orderedCards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                isClickable={card.isClickable}
                onClick={card.isClickable ? () => navigate(card.route) : undefined}
                // 드래그 기능 추가
                draggable={true}
                onDragStart={() => handleDragStart(card.id)}
                onDragOver={(e) => handleDragOver(e, card.id)}
                onDrop={(e) => handleDrop(e, card.id)}
                onDragEnd={handleDragEnd}
                isDragging={draggedCardId === card.id}
                isDragOver={dragOverCardId === card.id}
                // 터치 이벤트 추가 (모바일 지원)
                cardId={card.id}
                onTouchStart={(e) => handleTouchStart(e, card.id)}
                onTouchMove={(e) => handleTouchMove(e, card.id)}
                onTouchEnd={(e) => handleTouchEnd(e, card.id)}
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
