/**
 * Score Claim Page
 *
 * QR 코드 스캔 후 점수 수령 페이지
 * /claim?session={sessionId}
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getGameSession, validateSession, claimScore } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import ScoreDisplay from '../components/game/ScoreDisplay';
import StudentIdInput from '../components/game/StudentIdInput';
import './ClaimScore.css';

const ERROR_MESSAGES = {
  SESSION_NOT_FOUND: '세션을 찾을 수 없습니다. QR 코드를 다시 스캔해주세요.',
  ALREADY_CLAIMED: '이미 등록된 점수입니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. (15분 초과)',
  INVALID_STUDENT_ID: '올바른 학번 형식이 아닙니다. (4자리 숫자)',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
};

export default function ClaimScore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');

  const [session, setSession] = useState(null);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [claimed, setClaimed] = useState(false);
  const [showInput, setShowInput] = useState(false);

  // Auto-fill from localStorage if available
  const storedStudent = getStudentIdFromStorage();

  // Load session on mount
  useEffect(() => {
    if (!sessionId) {
      setError('세션 ID가 제공되지 않았습니다.');
      setLoading(false);
      return;
    }

    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const sessionData = await getGameSession(sessionId);
      const validationResult = validateSession(sessionData);

      setSession(sessionData);
      setValidation(validationResult);

      if (!validationResult.valid) {
        setError(ERROR_MESSAGES[validationResult.reason] || '세션 검증에 실패했습니다.');
      }
    } catch (err) {
      console.error('세션 로드 실패:', err);
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (studentId) => {
    if (!session || !validation?.valid) return;

    setClaiming(true);
    setError(null);

    try {
      await claimScore(sessionId, studentId, session);
      setClaimed(true);

      // Redirect to ranking after 2 seconds
      setTimeout(() => {
        navigate('/ranking');
      }, 2000);
    } catch (err) {
      console.error('점수 등록 실패:', err);
      setError('점수 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setClaiming(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="claim-page">
        <div className="claim-container">
          <div className="loading-spinner"></div>
          <p>세션 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !validation?.valid) {
    return (
      <div className="claim-page">
        <div className="claim-container">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">오류</h2>
            <p className="error-message">{error}</p>
            <button
              className="action-button secondary"
              onClick={() => navigate('/')}
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (claimed) {
    return (
      <div className="claim-page">
        <div className="claim-container">
          <div className="success-container">
            <div className="success-icon">🎉</div>
            <h2 className="success-title">점수 등록 완료!</h2>
            <p className="success-message">
              랭킹 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main claim flow
  if (!showInput) {
    // Game result display
    return (
      <div className="claim-page">
        <div className="claim-container">
          <div className="result-header">
            <h1 className="result-title">게임 결과</h1>
            <p className="result-subtitle">축하합니다! 게임을 완료했습니다.</p>
          </div>

          <ScoreDisplay
            gameType={session.gameType}
            score={session.score}
            size="large"
          />

          <div className="claim-info">
            <div className="info-icon">ℹ️</div>
            <div className="info-content">
              <strong>점수를 등록하면 실시간 랭킹에 표시됩니다!</strong>
              <p className="info-detail">
                같은 게임의 최고 점수만 유지됩니다.
              </p>
            </div>
          </div>

          <button
            className="action-button primary"
            onClick={() => setShowInput(true)}
          >
            점수 받기
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate('/ranking')}
          >
            랭킹 보기
          </button>
        </div>
      </div>
    );
  }

  // Student ID input
  return (
    <div className="claim-page">
      <div className="claim-container">
        <div className="input-header">
          <h2 className="input-title">학번 입력</h2>
          <p className="input-subtitle">
            4자리 학번을 입력해주세요
          </p>
        </div>

        <div className="score-summary">
          <ScoreDisplay
            gameType={session.gameType}
            score={session.score}
            size="small"
            showLabel={false}
          />
        </div>

        <StudentIdInput
          onSubmit={handleClaim}
          initialValue={storedStudent?.studentId || ''}
          autoFocus={true}
        />

        {error && (
          <div className="error-banner">
            <div className="error-icon">⚠️</div>
            <p>{error}</p>
          </div>
        )}

        <button
          className="back-button"
          onClick={() => setShowInput(false)}
          disabled={claiming}
        >
          ← 뒤로
        </button>

        {claiming && (
          <div className="claiming-overlay">
            <div className="loading-spinner"></div>
            <p>점수 등록 중...</p>
          </div>
        )}
      </div>
    </div>
  );
}
