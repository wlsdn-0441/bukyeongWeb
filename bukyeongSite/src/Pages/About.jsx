import './About.css';

export default function About() {
  const handleShowOnboarding = () => {
    // localStorage에서 방문 기록 제거
    localStorage.removeItem('bukyeongPortalVisited');

    console.log('[About] 온보딩 화면 다시 보기 - localStorage 제거');
    console.log('[About] 페이지 새로고침 중...');

    // 페이지 새로고침하여 온보딩 표시
    location.reload();
  };

  return (
    <div className="about">
      <div className="about-container">
        <h1 className="about-title">부경고등학교 포털 소개</h1>

        <div className="about-content">
          <section className="about-section">
            <h2>📱 학교 생활의 모든 정보를 한눈에</h2>
            <p>
              부경고등학교 학생들을 위한 통합 포털 서비스입니다.
              급식 메뉴, 시간표, 날씨 정보, 학교 공지사항을
              빠르고 편리하게 확인할 수 있습니다.
            </p>
          </section>

          <section className="about-section">
            <h2>✨ 주요 기능</h2>
            <ul className="feature-list">
              <li>🍽️ 오늘의 급식 메뉴 및 주간 급식표</li>
              <li>📚 우리 반 시간표 확인</li>
              <li>☀️ 실시간 날씨 정보</li>
              <li>📢 학교 공지사항 알림</li>
              <li>🌓 다크모드 지원</li>
              <li>📱 PWA - 홈 화면에 추가 가능</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>🎯 온보딩 다시 보기</h2>
            <p>
              처음 방문 시 보여드린 소개 화면을 다시 보고 싶으신가요?
            </p>
            <button
              className="onboarding-restart-button"
              onClick={handleShowOnboarding}
            >
              <span>🚀 온보딩 화면 다시 보기</span>
            </button>
            <p className="onboarding-hint-text">
              * 버튼을 클릭하면 페이지가 새로고침되며 온보딩 화면이 표시됩니다.
            </p>
          </section>

          <section className="about-section">
            <h2>ℹ️ 정보</h2>
            <div className="info-grid">
              <div className="info-item">
                <strong>버전</strong>
                <span>1.0.0</span>
              </div>
              <div className="info-item">
                <strong>개발</strong>
                <span>부경고등학교</span>
              </div>
              <div className="info-item">
                <strong>플랫폼</strong>
                <span>React + Vite + Vercel</span>
              </div>
              <div className="info-item">
                <strong>최적화</strong>
                <span>PWA, Edge Functions, 캐싱</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
