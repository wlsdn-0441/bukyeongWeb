import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import './DraggableFloatingNav.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function DraggableFloatingNav() {
  // ==============================================
  // React Router 연동
  // ==============================================
  const location = useLocation();
  const navigate = useNavigate();

  // ==============================================
  // 상태 관리 (State Management)
  // ==============================================
  const [activeIndex, setActiveIndex] = useState(0); // 현재 활성화된 메뉴 인덱스
  const [isDragging, setIsDragging] = useState(false); // 드래그 중인지 여부
  const [indicatorPos, setIndicatorPos] = useState({ left: 0, width: 0 }); // 인디케이터 위치/크기
  const [hoveredItems, setHoveredItems] = useState([]); // 인디케이터와 겹치는 항목들
  const [isAnimating, setIsAnimating] = useState(false); // 인디케이터 이동 애니메이션 중 여부
  const [isLongPressActive, setIsLongPressActive] = useState(false); // 롱프레스 활성화 여부
  const [isNavigating, setIsNavigating] = useState(false); // 네비게이션 진행 중 여부

  // ==============================================
  // Ref 참조 (References)
  // ==============================================
  const navContainerRef = useRef(null); // 네비게이션 컨테이너
  const navRefs = useRef([]); // 각 메뉴 항목 DOM 참조
  const indicatorRef = useRef(null); // 인디케이터 DOM 참조
  const rafRef = useRef(null); // requestAnimationFrame ID
  const animationTimerRef = useRef(null); // 애니메이션 타이머 ID
  const targetPosRef = useRef({ left: 0, width: 0 }); // 드래그 중 목표 위치
  const dragRafRef = useRef(null); // 드래그 애니메이션 RAF ID
  const longPressTimerRef = useRef(null); // 롱프레스 타이머 ID
  const touchStartPosRef = useRef({ x: 0, y: 0 }); // 터치 시작 위치
  const navigationTimerRef = useRef(null); // 네비게이션 타이머 ID
  const isNavigatingRef = useRef(false); // 네비게이션 진행 중 여부 (즉시 확인용 ref)

  // ==============================================
  // 메뉴 항목 데이터 (Navigation Items)
  // ==============================================
  const navItems = useMemo(() => [
    {
      path: '/',
      name: '홈',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      path: '/meal',
      name: '급식표',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2" />
          <path d="M12 12v10" />
          <path d="M8 22h8" />
          <path d="M10 2v4" />
          <path d="M14 2v4" />
        </svg>
      )
    },
    {
      path: '/timetable',
      name: '시간표',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )
    },
    {
      path: '/about',
      name: '소개',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9v.01" />
          <path d="M9 12v.01" />
          <path d="M9 15v.01" />
          <path d="M9 18v.01" />
        </svg>
      )
    }
  ], []);

  // ==============================================
  // 로고 스타일 계산 (Logo Style Calculation)
  // 인디케이터 겹침에 따른 로고 투명도/크기 변화
  // SVG는 currentColor를 사용하여 부모의 color를 자동 상속
  // ==============================================
  const getLogoStyle = useCallback((isActive, overlapRatio, enhancedRatio) => {
    if (isActive) {
      return {
        opacity: 1,
        transform: 'scale(1.2)'
      };
    }

    return {
      opacity: Math.max(0.5, 0.5 + enhancedRatio * 0.5),
      transform: overlapRatio > 0
        ? `scale(${1 + enhancedRatio * 0.2})`
        : 'scale(1)'
    };
  }, []);

  // ==============================================
  // 인디케이터 겹침 계산 (Overlap Calculation)
  // requestAnimationFrame으로 성능 최적화
  // ==============================================
  const calculateOverlappingItems = useCallback((indicatorLeft, indicatorWidth) => {
    // 이전 프레임 취소
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const indicatorRight = indicatorLeft + indicatorWidth;

      const overlapping = navRefs.current
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => element)
        .map(({ element, index }) => {
          const itemLeft = element.offsetLeft;
          const itemRight = itemLeft + element.offsetWidth;
          const overlapStart = Math.max(indicatorLeft, itemLeft);
          const overlapEnd = Math.min(indicatorRight, itemRight);
          const overlapWidth = Math.max(0, overlapEnd - overlapStart);
          const overlapRatio = overlapWidth / element.offsetWidth;

          return { index, ratio: overlapRatio, overlapWidth };
        })
        .filter(({ overlapWidth }) => overlapWidth > 0)
        .map(({ index, ratio }) => ({ index, ratio }));

      setHoveredItems(overlapping);
    });
  }, []);

  // ==============================================
  // 인디케이터 위치 업데이트 (Indicator Position Update)
  // 클릭이나 탭으로 메뉴 변경 시 호출
  // ==============================================
  const updateIndicatorPosition = useCallback((index) => {
    const element = navRefs.current[index];
    if (element) {
      const newPos = {
        left: element.offsetLeft,
        width: element.offsetWidth
      };
      setIndicatorPos(newPos);
      calculateOverlappingItems(newPos.left, newPos.width);

      // 이전 애니메이션 타이머 취소 (여러 번 클릭 시 겹침 방지)
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      // 인디케이터 이동 시 출렁임 애니메이션 활성화
      setIsAnimating(true);
      // 애니메이션 지속 시간 후 비활성화 (CSS transition과 동기화: 1.2초)
      animationTimerRef.current = setTimeout(() => setIsAnimating(false), 1200);
    }
  }, [calculateOverlappingItems]);

  // 현재 마우스/터치 위치에서 가장 가까운 항목 찾기
  const findNearestItem = useCallback((xPosition) => {
    const container = navContainerRef.current;
    if (!container) return activeIndex;

    const containerRect = container.getBoundingClientRect();
    const relativeX = xPosition - containerRect.left;

    const distances = navRefs.current
      .map((element, index) => ({ element, index }))
      .filter(({ element }) => element)
      .map(({ element, index }) => ({
        index,
        distance: Math.abs(relativeX - (element.offsetLeft + element.offsetWidth / 2))
      }));

    if (distances.length === 0) return activeIndex;

    return distances.reduce((nearest, current) =>
      current.distance < nearest.distance ? current : nearest
    ).index;
  }, [activeIndex]);

  // ==============================================
  // 드래그 시작 핸들러 (Drag Start Handlers)
  // 드래그 시작 시 출렁임 애니메이션 비활성화 및 목표 위치 초기화
  // ==============================================
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setIsAnimating(false); // 드래그 중에는 출렁임 애니메이션 비활성화
    // 목표 위치를 현재 위치로 초기화
    targetPosRef.current = { ...indicatorPos };
  };

  const handleTouchStart = (e) => {
    // 터치 시작 위치 저장
    const touch = e.touches[0];
    touchStartPosRef.current = {
      x: touch.clientX,
      y: touch.clientY
    };

    // 롱프레스 타이머 시작 (500ms)
    longPressTimerRef.current = setTimeout(() => {
      // 롱프레스 활성화
      setIsLongPressActive(true);
      setIsDragging(true);
      setIsAnimating(false);
      targetPosRef.current = { ...indicatorPos };

      // 햅틱 피드백 (지원하는 기기에서만)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  };

  // ==============================================
  // 드래그 중 목표 위치 설정 (Set Target Position During Drag)
  // 직접 인디케이터를 움직이지 않고 목표 위치만 설정
  // ==============================================
  const handleMove = (clientX) => {
    if (!isDragging) return;

    const container = navContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const relativeX = clientX - containerRect.left;

    const indicatorWidth = indicatorPos.width;
    let newLeft = relativeX - indicatorWidth / 2;

    const maxLeft = container.offsetWidth - indicatorWidth;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    // 목표 위치만 설정 (실제 이동은 useEffect의 RAF에서 처리)
    targetPosRef.current = {
      left: newLeft,
      width: indicatorWidth
    };
  };

  // 마우스 이동
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    handleMove(e.clientX);
  };

  // 터치 이동
  const handleTouchMove = (e) => {
    const hasTouchPoints = e.touches?.length > 0;
    if (!hasTouchPoints) return;

    const touch = e.touches[0];

    // 롱프레스 대기 중일 때: 이동 거리 체크
    if (longPressTimerRef.current && !isLongPressActive) {
      const moveDistance = Math.sqrt(
        Math.pow(touch.clientX - touchStartPosRef.current.x, 2) +
        Math.pow(touch.clientY - touchStartPosRef.current.y, 2)
      );

      // 10px 이상 이동하면 롱프레스 취소 (일반 스크롤 허용)
      if (moveDistance > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
      return;
    }

    // 롱프레스 활성화 상태에서만 드래그
    if (!isDragging || !isLongPressActive) return;

    // 스크롤 방지
    e.preventDefault();

    handleMove(touch.clientX);
  };

  // 드래그 종료
  const handleDragEnd = (clientX) => {
    if (!isDragging) return;

    setIsDragging(false);

    const nearestIndex = findNearestItem(clientX);
    setActiveIndex(nearestIndex);
    updateIndicatorPosition(nearestIndex);

    // 드래그로 선택한 페이지로 이동
    const targetPath = navItems[nearestIndex]?.path;
    if (targetPath && targetPath !== location.pathname && !isNavigating && !isNavigatingRef.current) {
      // 중복 터치 방지를 위해 마지막 클릭 시간 업데이트
      lastClickTimeRef.current = Date.now();

      // 이전 네비게이션 타이머 취소
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }

      // ref와 state 모두 업데이트 (즉시 확인용 + UI 반영용)
      isNavigatingRef.current = true;
      setIsNavigating(true);
      navigate(targetPath);

      // 네비게이션 완료 후 상태 초기화 (500ms로 증가)
      navigationTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
        navigationTimerRef.current = null;
      }, 500);
    }
  };

  // 마우스 드래그 종료
  const handleMouseUp = (e) => {
    handleDragEnd(e.clientX);
  };

  // 터치 드래그 종료
  const handleTouchEnd = (e) => {
    // 롱프레스 타이머 취소
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const hasChangedTouches = e.changedTouches?.length > 0;

    // 롱프레스 활성화 상태였으면 드래그 종료 처리
    if (isLongPressActive && hasChangedTouches) {
      handleDragEnd(e.changedTouches[0].clientX);
    }

    // 롱프레스 상태 초기화
    setIsLongPressActive(false);
  };

  // ==============================================
  // 항목 클릭 핸들러 (Item Click Handler)
  // 더블클릭 방지 및 네비게이션 중복 방지
  // ==============================================
  const lastClickTimeRef = useRef(0);

  const handleItemClick = (e, index) => {
    // Link의 기본 동작 방지 (중복 네비게이션 방지)
    e.preventDefault();
    e.stopPropagation();

    // 드래그 중이거나 네비게이션 진행 중이면 즉시 무시 (ref 먼저 확인)
    if (isDragging || isNavigatingRef.current || isNavigating) {
      return;
    }

    // 중복 터치 방지: 600ms 이내 연속 클릭 무시 (400ms → 600ms로 증가)
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    if (timeSinceLastClick < 600) {
      return;
    }

    const targetPath = navItems[index]?.path;

    // 같은 경로로의 네비게이션 방지
    if (targetPath === location.pathname) {
      // 같은 페이지 클릭 시 인디케이터 위치만 업데이트
      lastClickTimeRef.current = now;
      setActiveIndex(index);
      updateIndicatorPosition(index);
      return;
    }

    // 마지막 클릭 시간 즉시 업데이트 (다음 클릭 차단)
    lastClickTimeRef.current = now;

    // 이전 네비게이션 타이머 취소
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }

    // ref와 state 모두 즉시 업데이트 (다중 보호)
    isNavigatingRef.current = true;
    setIsNavigating(true);
    setActiveIndex(index);
    updateIndicatorPosition(index);

    // 네비게이션 실행
    if (targetPath) {
      // requestAnimationFrame으로 한 프레임 지연하여 상태 업데이트 확실히 적용
      requestAnimationFrame(() => {
        navigate(targetPath);
      });

      // 네비게이션 완료 후 상태 초기화 (500ms로 증가)
      navigationTimerRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
        setIsNavigating(false);
        navigationTimerRef.current = null;
      }, 500);
    } else {
      isNavigatingRef.current = false;
      setIsNavigating(false);
    }
  };

  // 초기 위치 설정
  useEffect(() => {
    updateIndicatorPosition(activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 경로에 따라 activeIndex 동기화 및 네비게이션 상태 초기화
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1 && currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }

    // 경로가 변경되면 네비게이션 타이머 취소 및 상태 초기화 (ref도 함께)
    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
      navigationTimerRef.current = null;
    }
    isNavigatingRef.current = false;
    setIsNavigating(false);
  }, [location.pathname, navItems, activeIndex]);

  // activeIndex 변경 시 위치 업데이트
  useEffect(() => {
    if (!isDragging) {
      updateIndicatorPosition(activeIndex);
    }
  }, [activeIndex, isDragging, updateIndicatorPosition]);

  // 리사이즈 대응
  useEffect(() => {
    const handleResize = () => {
      updateIndicatorPosition(activeIndex);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, updateIndicatorPosition]);

  // ==============================================
  // 드래그 중 부드러운 애니메이션 (Smooth Drag Animation)
  // 속도 제한을 적용하여 자연스러운 움직임 구현
  // 모바일과 데스크탑에서 다른 속도 적용
  // ==============================================
  useEffect(() => {
    if (!isDragging) return;

    // 모바일에서는 더 빠른 속도로 설정 (화면 크기가 작아 느리게 느껴지는 것 보정)
    const MAX_SPEED = window.innerWidth <= 768 ? 10 : 9; // 프레임당 최대 이동 거리 (px)
    const LERP_FACTOR = 0.15; // 보간 계수 (0~1, 낮을수록 부드럽고 느림)

    const animate = () => {
      setIndicatorPos(currentPos => {
        const targetLeft = targetPosRef.current.left;
        const currentLeft = currentPos.left;

        // 목표까지의 거리
        const distance = targetLeft - currentLeft;

        // Lerp (Linear Interpolation) - 부드러운 감속 효과
        let movement = distance * LERP_FACTOR;

        // 최대 속도 제한
        if (Math.abs(movement) > MAX_SPEED) {
          movement = Math.sign(movement) * MAX_SPEED;
        }

        const newLeft = currentLeft + movement;

        // 겹치는 항목 계산
        calculateOverlappingItems(newLeft, currentPos.width);

        return {
          ...currentPos,
          left: newLeft
        };
      });

      dragRafRef.current = requestAnimationFrame(animate);
    };

    dragRafRef.current = requestAnimationFrame(animate);

    return () => {
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
      }
    };
  }, [isDragging, calculateOverlappingItems]);

  // cleanup: 컴포넌트 언마운트 시 RAF 및 타이머 취소
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (dragRafRef.current) {
        cancelAnimationFrame(dragRafRef.current);
      }
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  // 전역 이벤트 리스너
  useEffect(() => {
    if (isDragging && isLongPressActive) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // passive: false로 설정하여 preventDefault 작동 허용
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isLongPressActive, indicatorPos]);

  return (
    <div className={`draggable-nav-wrapper ${isDragging ? 'is-dragging' : ''} ${isNavigating ? 'navigating' : ''}`}>
      <nav className="draggable-floating-nav">
        <div className="nav-container" ref={navContainerRef}>
          {/* 애플 리퀴드 글래스 인디케이터 */}
          <div
            ref={indicatorRef}
            className={`floating-indicator ${isDragging ? 'dragging' : ''} ${isAnimating ? 'wobbling' : ''}`}
            style={{
              left: `${indicatorPos.left}px`,
              width: `${indicatorPos.width}px`,
              transition: isDragging
                ? 'none' // 드래그 중에는 JS가 완전히 제어
                : 'all 0.9s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            {/* 리퀴드 레이어들 */}
            <div className="liquid-layer liquid-layer-1"></div>
            <div className="liquid-layer liquid-layer-2"></div>
          </div>

          {/* 네비게이션 항목들 */}
          {navItems.map((item, index) => {
            const overlappingItem = hoveredItems.find(h => h.index === index);
            const overlapRatio = overlappingItem?.ratio ?? 0;
            const isActive = index === activeIndex;
            const enhancedRatio = Math.pow(overlapRatio, 0.4);
            const logoStyle = getLogoStyle(isActive, overlapRatio, enhancedRatio);

            return (
              <Link
                key={item.name}
                to={item.path}
                ref={(el) => (navRefs.current[index] = el)}
                className={`nav-item ${isActive ? 'active' : ''} ${isNavigating ? 'navigating' : ''}`}
                onClick={(e) => handleItemClick(e, index)}
              >
                <span className="nav-item-content">
                  <span className="nav-item-logo" style={logoStyle}>
                    {item.icon}
                  </span>
                  <span className="nav-item-text">{item.name}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {isDragging && <div className="drag-overlay" />}
    </div>
  );
}

export default DraggableFloatingNav;