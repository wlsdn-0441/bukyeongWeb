import { useState, useEffect } from 'react';
import { getStudentIdFromStorage, clearStudentId } from '../services/studentService';
import EditStudentIdForm from '../components/common/EditStudentIdForm';
import AuthButton from '../components/common/AuthButton';
import { getCurrentUser } from '../services/authService';
import './About.css';

export default function About() {
  // 현재 등록된 학번 정보 가져오기
  const studentData = getStudentIdFromStorage();

  // 편집 모드 상태
  const [isEditingStudentId, setIsEditingStudentId] = useState(false);

  // Firebase 인증 상태
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user on mount
    const currentUser = getCurrentUser();
    setUser(currentUser);
    console.log('[About] Current user:', currentUser?.email || currentUser?.uid || 'anonymous');
  }, []);

  const handleShowOnboarding = () => {
    // localStorage에서 방문 기록 제거
    localStorage.removeItem('bukyeongPortalVisited');

    console.log('[About] 온보딩 화면 다시 보기 - localStorage 제거');
    console.log('[About] 페이지 새로고침 중...');

    // 페이지 새로고침하여 온보딩 표시
    location.reload();
  };

  const handleStartEdit = () => {
    console.log('[About] 학번 편집 모드 시작');
    setIsEditingStudentId(true);
  };

  const handleCancelEdit = () => {
    console.log('[About] 학번 편집 취소');
    setIsEditingStudentId(false);
  };

  const handleEditComplete = () => {
    console.log('[About] 학번 편집 완료');
    // EditStudentIdForm에서 reload 처리하므로 여기서는 상태만 변경
    setIsEditingStudentId(false);
  };

  const handleDeleteStudentId = async () => {
    if (confirm('학번을 삭제하시겠습니까? 시간표를 이용하려면 다시 등록해야 합니다.')) {
      console.log('[About] 학번 삭제');
      await clearStudentId();
      console.log('[About] 페이지 새로고침 중...');
      location.reload();
    }
  };

  const handleRegisterStudentId = () => {
    console.log('[About] 학번 등록 - 학번 입력 모달 표시 플래그 설정');
    // 온보딩을 건너뛰고 학번 입력 모달만 표시
    localStorage.setItem('bukyeongPortalVisited', 'true');
    localStorage.setItem('showStudentIdModal', 'true');
    console.log('[About] 페이지 새로고침 중...');
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
            <h2>🎓 학번 관리</h2>
            {studentData ? (
              <>
                {!isEditingStudentId ? (
                  <>
                    <div className="student-info-display">
                      <div className="student-info-label">현재 등록된 학번</div>
                      <div className="student-info-value">
                        {studentData.formatted}
                      </div>
                      <div className="student-info-id">
                        학번: {studentData.studentId}
                      </div>
                    </div>
                    <div className="student-button-group">
                      <button
                        className="student-action-button change"
                        onClick={handleStartEdit}
                      >
                        <span>🔄 학번 변경하기</span>
                      </button>
                      <button
                        className="student-action-button delete"
                        onClick={handleDeleteStudentId}
                      >
                        <span>🗑️ 학번 삭제하기</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <EditStudentIdForm
                    currentStudentData={studentData}
                    onCancel={handleCancelEdit}
                    onComplete={handleEditComplete}
                  />
                )}
              </>
            ) : (
              <>
                <p>
                  학번이 등록되어 있지 않습니다. 학번을 등록하면 우리 반 시간표를 확인할 수 있습니다.
                </p>
                <button
                  className="student-action-button register"
                  onClick={handleRegisterStudentId}
                >
                  <span>➕ 학번 등록하기</span>
                </button>
              </>
            )}
          </section>

          <section className="about-section">
            <h2>🔐 계정 관리</h2>
            {user ? (
              <>
                {user.isAnonymous ? (
                  <>
                    <p>
                      현재 익명 사용자로 이용 중입니다.
                    </p>
                    <p>
                      Google 로그인 시 여러 기기에서 학번을 동기화할 수 있습니다.
                      브라우저 데이터가 삭제되어도 학번이 안전하게 보관됩니다.
                    </p>
                    <div className="auth-notice">
                      <span className="notice-icon">ℹ️</span>
                      <div className="notice-content">
                        <strong>학교 공식계정만 로그인 가능합니다</strong>
                        <div className="notice-detail">
                          <strong>@saja.hs.kr</strong> 도메인의 이메일만 사용할 수 있습니다.
                        </div>
                      </div>
                    </div>
                    <div className="auth-button-container">
                      <AuthButton user={user} />
                    </div>
                  </>
                ) : (
                  <>
                    <p>
                      Google 계정으로 로그인되었습니다.
                    </p>
                    <p>
                      학번 데이터가 안전하게 저장되며, 다른 기기에서도 자동으로 동기화됩니다.
                    </p>
                    <div className="auth-info-container">
                      <AuthButton user={user} />
                    </div>
                  </>
                )}
              </>
            ) : (
              <p>인증 정보를 불러오는 중...</p>
            )}
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
