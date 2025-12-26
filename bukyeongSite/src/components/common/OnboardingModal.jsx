import { useState, useEffect } from 'react';
import './OnboardingModal.css';

const STORAGE_KEY = 'bukyeongPortalVisited';
const CONSOLE_PREFIX = '[Onboarding]';
const TOTAL_IMAGES = 3;
const AUTO_ADVANCE_TIME = 10000; // 10초

export default function OnboardingModal({ onComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // 온보딩 이미지 경로
  const images = [
    '/1.png',
    '/2.png',
    '/3.png'
  ];

  useEffect(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEY);

    console.groupCollapsed(`${CONSOLE_PREFIX} 이미지 기반 온보딩`);
    console.log('📁 컴포넌트:', 'OnboardingModal.jsx (Image-Based)');
    console.log('📂 위치:', 'src/components/common/');
    console.log('🖼️  총 이미지:', TOTAL_IMAGES);
    console.log('⏱️  자동 전환:', AUTO_ADVANCE_TIME / 1000 + '초');
    console.log('🔑 localStorage 키:', STORAGE_KEY);
    console.log('💾 현재 값:', hasVisited || 'null (첫 방문)');
    console.log('👀 모달 표시:', !hasVisited);
    console.log('');
    console.log('🔧 동작 원리:');
    console.log('  1. localStorage에서 방문 기록 확인');
    console.log('  2. 기록이 없으면 3개 이미지 순서대로 표시');
    console.log('  3. 화면 클릭 → 다음 이미지');
    console.log('  4. 10초 경과 → 자동으로 다음 이미지');
    console.log('  5. 마지막 이미지 완료 → localStorage 저장');
    console.log('');
    console.log('🔄 테스트용 리셋 명령어:');
    console.log(`  localStorage.removeItem('${STORAGE_KEY}'); location.reload();`);
    console.groupEnd();

    if (!hasVisited) {
      setShowModal(true);
      console.log(`${CONSOLE_PREFIX} 첫 방문 감지 - 온보딩 모달 표시`);
      console.log(`${CONSOLE_PREFIX} 이미지 1/${TOTAL_IMAGES} 표시 중`);
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

    return () => {
      document.body.classList.remove('onboarding-active');
    };
  }, [showModal]);

  // 이미지 변경 시 콘솔 로그
  useEffect(() => {
    if (showModal && currentImage > 0) {
      console.log(`${CONSOLE_PREFIX} 이미지 ${currentImage + 1}/${TOTAL_IMAGES} 표시 중`);
    }
  }, [currentImage, showModal]);

  // 10초 자동 전환 타이머
  useEffect(() => {
    if (!showModal) return;

    console.log(`${CONSOLE_PREFIX} 타이머 시작 - ${AUTO_ADVANCE_TIME / 1000}초 후 자동 전환`);

    const timer = setTimeout(() => {
      console.log(`${CONSOLE_PREFIX} 타이머 완료 - 자동 전환`);
      handleAdvance();
    }, AUTO_ADVANCE_TIME);

    // 클린업: 컴포넌트 언마운트 또는 currentImage 변경 시 타이머 취소
    return () => {
      console.log(`${CONSOLE_PREFIX} 타이머 취소`);
      clearTimeout(timer);
    };
  }, [showModal, currentImage]);

  const handleAdvance = () => {
    if (currentImage < TOTAL_IMAGES - 1) {
      setCurrentImage(prev => prev + 1);
      console.log(`${CONSOLE_PREFIX} 다음 이미지로 이동 (${currentImage + 2}/${TOTAL_IMAGES})`);
    } else {
      console.log(`${CONSOLE_PREFIX} 마지막 이미지 - 온보딩 완료`);
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

  const handleScreenClick = () => {
    console.log(`${CONSOLE_PREFIX} 화면 클릭 감지 - 다음으로 이동`);
    handleAdvance();
  };

  if (!showModal) return null;

  return (
    <div
      className={`onboarding-overlay ${isAnimating ? 'fade-out' : ''}`}
      onClick={handleScreenClick}
      role="dialog"
      aria-modal="true"
      aria-label="온보딩 화면"
    >
      <div className="onboarding-image-container">
        <img
          key={currentImage}
          src={images[currentImage]}
          alt={`온보딩 이미지 ${currentImage + 1}`}
          className="onboarding-image"
        />

        {/* 페이지 인디케이터 */}
        <div className="onboarding-indicators">
          {Array.from({ length: TOTAL_IMAGES }).map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index === currentImage ? 'active' : ''} ${index < currentImage ? 'completed' : ''}`}
              aria-current={index === currentImage}
              aria-label={`이미지 ${index + 1}`}
            />
          ))}
        </div>

        {/* 클릭 힌트 */}
        <p className="onboarding-hint">
          화면을 클릭하여 계속하기
        </p>
      </div>
    </div>
  );
}
