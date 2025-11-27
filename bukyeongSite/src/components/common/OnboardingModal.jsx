import { useState, useEffect } from 'react';
import './OnboardingModal.css';

const STORAGE_KEY = 'bukyeongPortalVisited';
const CONSOLE_PREFIX = '[Onboarding]';
const TOTAL_PAGES = 4;

export default function OnboardingModal({ onComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일/데스크톱 감지
  useEffect(() => {
    const checkMobile = () => {
      // 768px 이하를 모바일로 간주
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 페이지 콘텐츠 정의
  const pages = [
    {
      icon: '🏫',
      title: '부경고등학교 포털에\n오신 것을 환영합니다!',
      subtitle: '학교 생활을 더 편리하게 만들어드립니다',
      content: null
    },
    {
      icon: '✨',
      title: '이곳에서 확인할 수 있어요',
      subtitle: null,
      content: (
        <div className="onboarding-features">
          <ul className="onboarding-list">
            <li>🍽️ 오늘의 급식 메뉴</li>
            <li>📚 우리 반 시간표</li>
            <li>☀️ 실시간 날씨 정보</li>
            <li>📢 학교 공지사항</li>
          </ul>
        </div>
      )
    },
    {
      icon: '💡',
      title: '이렇게 사용하세요',
      subtitle: null,
      content: (
        <div className="onboarding-features">
          <ul className="onboarding-list">
            <li>📱 홈 화면에 추가 가능</li>
            <li>🌓 다크모드 지원</li>
            <li>⚡ 실시간 정보 업데이트</li>
            <li>🔔 중요 공지사항 알림</li>
          </ul>
        </div>
      )
    },
    {
      icon: '🚀',
      title: '모든 준비가 완료되었습니다!',
      subtitle: '지금 바로 부경고 포털을 사용해보세요',
      content: null
    }
  ];

  useEffect(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEY);

    // 콘솔에 구현 방법 설명 출력
    console.groupCollapsed(`${CONSOLE_PREFIX} 구현 방법 설명 (멀티 페이지)`);
    console.log('📁 컴포넌트:', 'OnboardingModal.jsx (Multi-Page)');
    console.log('📂 위치:', 'src/components/common/');
    console.log('📄 총 페이지:', TOTAL_PAGES);
    console.log('🔑 localStorage 키:', STORAGE_KEY);
    console.log('💾 현재 값:', hasVisited || 'null (첫 방문)');
    console.log('👀 모달 표시:', !hasVisited);
    console.log('');
    console.log('🔧 동작 원리:');
    console.log('  1. localStorage에서 방문 기록 확인');
    console.log('  2. 기록이 없으면 4페이지 온보딩 표시');
    console.log('  3. 화면 아무 곳이나 클릭 → 다음 페이지');
    console.log('  4. 버튼 클릭 → 다음 페이지');
    console.log('  5. 마지막 페이지에서 완료 → localStorage 저장');
    console.log('');
    console.log('⌨️  키보드 단축키:');
    console.log('  - 방향키 → / Space / Enter: 다음 페이지');
    console.log('  - 방향키 ←: 이전 페이지');
    console.log('  - Escape: 온보딩 종료');
    console.log('');
    console.log('🔄 테스트용 리셋 명령어:');
    console.log(`  localStorage.removeItem('${STORAGE_KEY}'); location.reload();`);
    console.groupEnd();

    if (!hasVisited) {
      setShowModal(true);
      console.log(`${CONSOLE_PREFIX} 첫 방문 감지 - 온보딩 모달 표시`);
      console.log(`${CONSOLE_PREFIX} 페이지 1/${TOTAL_PAGES} 표시 중`);
    } else {
      console.log(`${CONSOLE_PREFIX} 재방문 사용자 - 모달 건너뜀`);
    }
  }, []);

  // 온보딩 표시 시 body에 클래스 추가하여 네비게이션 숨김
  useEffect(() => {
    if (showModal) {
      document.body.classList.add('onboarding-active');
      console.log(`${CONSOLE_PREFIX} 네비게이션 숨김 - body.onboarding-active 추가`);
    } else {
      document.body.classList.remove('onboarding-active');
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.classList.remove('onboarding-active');
    };
  }, [showModal]);

  // 페이지 이동 시 콘솔 로그
  useEffect(() => {
    if (showModal && currentPage > 0) {
      console.log(`${CONSOLE_PREFIX} 페이지 ${currentPage + 1}/${TOTAL_PAGES} 표시 중`);
      console.log(`${CONSOLE_PREFIX} 제목: "${pages[currentPage].title.split('\n')[0]}"`);
    }
  }, [currentPage]);

  // 키보드 네비게이션
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleAdvance();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            console.log(`${CONSOLE_PREFIX} 이전 페이지로 이동`);
          }
          break;
        case 'Escape':
          e.preventDefault();
          console.log(`${CONSOLE_PREFIX} Escape 키로 온보딩 종료`);
          handleComplete();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal, currentPage]);

  const handleAdvance = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      setCurrentPage(prev => prev + 1);
      console.log(`${CONSOLE_PREFIX} 다음 페이지로 이동 (${currentPage + 2}/${TOTAL_PAGES})`);
    } else {
      console.log(`${CONSOLE_PREFIX} 마지막 페이지 - 온보딩 완료`);
      handleComplete();
    }
  };

  const handleComplete = () => {
    console.log(`${CONSOLE_PREFIX} 온보딩 종료 프로세스 시작`);
    console.log(`${CONSOLE_PREFIX} localStorage 저장 중...`);

    setIsAnimating(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setShowModal(false);

      console.log(`${CONSOLE_PREFIX} 모달 닫힘`);
      console.log(`${CONSOLE_PREFIX} localStorage 업데이트:`, {
        key: STORAGE_KEY,
        value: 'true'
      });
      console.log(`${CONSOLE_PREFIX} 온보딩 완료 ✓`);

      // 온보딩 완료 콜백 호출
      if (onComplete) {
        onComplete();
      }
    }, 300);
  };

  const handleOverlayClick = (e) => {
    // 모바일에서는 클릭으로 넘어가기 비활성화 (버튼만 사용)
    if (isMobile) {
      console.log(`${CONSOLE_PREFIX} 모바일 환경 - 화면 클릭 무시`);
      return;
    }

    // Skip 버튼 클릭은 무시
    if (e.target.closest('.onboarding-skip')) return;

    // 모달 내부 클릭만 무시
    if (e.target === e.currentTarget) return;

    console.log(`${CONSOLE_PREFIX} 데스크톱 - 화면 클릭 감지`);
    handleAdvance();
  };

  if (!showModal) return null;

  const currentPageData = pages[currentPage];

  return (
    <div
      className={`onboarding-overlay ${isAnimating ? 'fade-out' : ''}`}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      aria-live="polite"
    >
      <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="onboarding-skip"
          onClick={handleComplete}
          aria-label="온보딩 건너뛰기"
        >
          ×
        </button>

        {/* 페이지 인디케이터 */}
        <div className="onboarding-indicators">
          {Array.from({ length: TOTAL_PAGES }).map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === currentPage ? 'active' : ''} ${index < currentPage ? 'completed' : ''}`}
              aria-current={index === currentPage}
              aria-label={`페이지 ${index + 1}`}
            />
          ))}
        </div>

        {/* 페이지 콘텐츠 */}
        <div
          key={currentPage}
          className="onboarding-page"
        >
          <div className="onboarding-icon">{currentPageData.icon}</div>

          <h1 id="onboarding-title" className="onboarding-title">
            {currentPageData.title.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < currentPageData.title.split('\n').length - 1 && <br />}
              </span>
            ))}
          </h1>

          {currentPageData.subtitle && (
            <p className="onboarding-subtitle">
              {currentPageData.subtitle}
            </p>
          )}

          {currentPageData.content && (
            <>
              <div className="onboarding-divider" />
              <div className="onboarding-content">
                {currentPageData.content}
              </div>
              <div className="onboarding-divider" />
            </>
          )}

          <button
            className="onboarding-button"
            onClick={handleAdvance}
          >
            <span>{currentPage === TOTAL_PAGES - 1 ? '시작하기 →' : '다음 →'}</span>
          </button>
        </div>

        {/* 힌트 텍스트 */}
        <p className="onboarding-hint">
          아무 곳이나 클릭하여 계속하기
        </p>
      </div>
    </div>
  );
}
