/**
 * Manual Claim Admin Page
 *
 * Features:
 * - Password protection
 * - Manual session ID input
 * - Manual student ID input
 * - Claim scores on behalf of students
 * - For cases where QR code fails
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentIdInput from '../../components/game/StudentIdInput';
import ScoreDisplay from '../../components/game/ScoreDisplay';
import { getGameSession, validateSession, claimScore } from '../../services/gameService';
import './ManualClaim.css';

// Admin password (in production, this should be environment variable)
const ADMIN_PASSWORD = 'bukyeong2024';

export default function ManualClaim() {
  const navigate = useNavigate();

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Session state
  const [sessionId, setSessionId] = useState('');
  const [session, setSession] = useState(null);
  const [sessionError, setSessionError] = useState('');
  const [sessionLoading, setSessionLoading] = useState(false);

  // Claim state
  const [showStudentInput, setShowStudentInput] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('비밀번호가 올바르지 않습니다.');
      setPassword('');
    }
  };

  // Handle session ID submission
  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    if (!sessionId.trim()) {
      setSessionError('세션 ID를 입력해주세요.');
      return;
    }

    setSessionLoading(true);
    setSessionError('');

    try {
      console.log('[ManualClaim] Fetching session:', sessionId);
      const fetchedSession = await getGameSession(sessionId);

      if (!fetchedSession) {
        setSessionError('세션을 찾을 수 없습니다. ID를 확인해주세요.');
        setSessionLoading(false);
        return;
      }

      // Validate session
      const validation = validateSession(fetchedSession);
      if (!validation.valid) {
        let errorMsg = '';
        switch (validation.reason) {
          case 'ALREADY_CLAIMED':
            errorMsg = '이미 수령된 세션입니다.';
            break;
          case 'SESSION_EXPIRED':
            errorMsg = '만료된 세션입니다.';
            break;
          default:
            errorMsg = '유효하지 않은 세션입니다.';
        }
        setSessionError(errorMsg);
        setSessionLoading(false);
        return;
      }

      setSession(fetchedSession);
      setShowStudentInput(true);
    } catch (error) {
      console.error('[ManualClaim] Session fetch error:', error);
      setSessionError('세션을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setSessionLoading(false);
    }
  };

  // Handle student ID submission
  const handleStudentIdSubmit = async (studentId) => {
    setClaiming(true);
    setClaimError('');

    try {
      console.log('[ManualClaim] Claiming score:', { sessionId, studentId });
      await claimScore(sessionId, studentId, session);
      setClaimSuccess(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setSessionId('');
        setSession(null);
        setShowStudentInput(false);
        setClaimSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('[ManualClaim] Claim error:', error);
      setClaimError('점수 등록 중 오류가 발생했습니다.');
    } finally {
      setClaiming(false);
    }
  };

  // Reset session
  const handleReset = () => {
    setSessionId('');
    setSession(null);
    setShowStudentInput(false);
    setSessionError('');
    setClaimError('');
    setClaimSuccess(false);
  };

  // Password screen
  if (!isAuthenticated) {
    return (
      <div className="manual-claim-page">
        <div className="manual-claim-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1 className="auth-title">🔒 관리자 인증</h1>
              <p className="auth-subtitle">수동 점수 등록을 위해 비밀번호를 입력하세요</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="auth-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className="auth-input"
                autoFocus
              />

              {authError && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <p>{authError}</p>
                </div>
              )}

              <button type="submit" className="auth-button">
                인증하기
              </button>
            </form>

            <button className="back-link" onClick={() => navigate('/')}>
              ← 홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (claimSuccess) {
    return (
      <div className="manual-claim-page">
        <div className="manual-claim-container">
          <div className="success-card">
            <p className="success-icon">✅</p>
            <h2 className="success-title">등록 완료!</h2>
            <p className="success-message">점수가 성공적으로 등록되었습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // Main admin interface
  return (
    <div className="manual-claim-page">
      <div className="manual-claim-container">
        {/* Header */}
        <header className="admin-header">
          <h1 className="admin-title">⚙️ 수동 점수 등록</h1>
          <p className="admin-subtitle">
            QR 코드 스캔이 실패한 경우 직접 점수를 등록할 수 있습니다
          </p>
        </header>

        {/* Session ID Input */}
        {!showStudentInput && (
          <div className="session-card">
            <h2 className="section-title">세션 ID 입력</h2>
            <form onSubmit={handleSessionSubmit} className="session-form">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                placeholder="예: ABC123"
                className="session-input"
                disabled={sessionLoading}
                autoFocus
              />

              {sessionError && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <p>{sessionError}</p>
                </div>
              )}

              <button
                type="submit"
                className="session-button"
                disabled={sessionLoading || !sessionId.trim()}
              >
                {sessionLoading ? '확인 중...' : '세션 확인'}
              </button>
            </form>
          </div>
        )}

        {/* Student ID Input */}
        {showStudentInput && session && (
          <>
            {/* Session Info */}
            <div className="session-info-card">
              <div className="info-header">
                <h3>세션 정보</h3>
                <button className="reset-button" onClick={handleReset}>
                  다시 입력
                </button>
              </div>
              <div className="info-content">
                <div className="info-row">
                  <span className="info-label">세션 ID:</span>
                  <span className="info-value">{sessionId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">게임:</span>
                  <span className="info-value">
                    {session.gameType === 'reaction' ? '반응속도' : session.gameType}
                  </span>
                </div>
              </div>
              <div className="score-preview">
                <ScoreDisplay
                  gameType={session.gameType}
                  score={session.score}
                  size="medium"
                />
              </div>
            </div>

            {/* Student ID Input */}
            <div className="student-card">
              <h2 className="section-title">학번 입력</h2>
              <StudentIdInput
                onSubmit={handleStudentIdSubmit}
                autoFocus={true}
              />

              {claimError && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <p>{claimError}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Action Links */}
        <div className="admin-links">
          <button className="link-button" onClick={() => navigate('/ranking')}>
            랭킹 보기
          </button>
          <button className="link-button" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>

      {/* Claiming Overlay */}
      {claiming && (
        <div className="claiming-overlay">
          <div className="loading-spinner"></div>
          <p>점수 등록 중...</p>
        </div>
      )}
    </div>
  );
}
