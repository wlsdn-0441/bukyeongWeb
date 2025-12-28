/**
 * MyScore Page - Personal score and ranking
 *
 * Features:
 * - Show personal best score
 * - Display current rank
 * - Require student ID (redirect if not set)
 * - Link to full ranking
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScoreDisplay from '../components/game/ScoreDisplay';
import { getAllStudentScores, getStudentAllRanks } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import { GAME_CONFIG } from '../config/gameConfig';
import './MyScore.css';

export default function MyScore() {
  const navigate = useNavigate();
  const [allRanks, setAllRanks] = useState({});
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('[MyScore] 🔄 Current state:', {
    loading,
    error,
    hasRanks: Object.keys(allRanks).length > 0,
    ranksKeys: Object.keys(allRanks)
  });

  // Get student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

  // Fetch student ranks for all games and score history
  useEffect(() => {
    const fetchData = async () => {
      // Check if student ID exists
      if (!studentId) {
        console.warn('[MyScore] No student ID found in localStorage');
        setError('학번을 먼저 등록해주세요.');
        setLoading(false);
        return;
      }

      try {
        console.log('[MyScore] 📊 Fetching data for student:', studentId);
        console.log('[MyScore] Student ID type:', typeof studentId);
        console.log('[MyScore] Student data:', studentData);

        // Ensure studentId is a string
        const studentIdStr = String(studentId);
        console.log('[MyScore] Using studentId:', studentIdStr);

        // Fetch ranks for all games and all scores in parallel
        const [ranksResult, scoresResult] = await Promise.all([
          getStudentAllRanks(studentIdStr),
          getAllStudentScores(studentIdStr)
        ]);

        console.log('[MyScore] ✅ Ranks result:', ranksResult);
        console.log('[MyScore] ✅ Scores result:', scoresResult);
        console.log('[MyScore] 🔍 Ranks result keys:', ranksResult ? Object.keys(ranksResult) : 'null');
        console.log('[MyScore] 🔍 Scores count:', scoresResult ? scoresResult.length : 0);

        // ranksResult가 null이거나 모든 게임 점수가 null인 경우에만 에러
        if (!ranksResult) {
          console.warn('[MyScore] Student not found in Firestore');
          setError('아직 게임 기록이 없습니다. QR 코드로 점수를 먼저 등록해주세요!');
          setAllRanks({});
          setScoreHistory([]);
        } else {
          const hasAnyScore = Object.values(ranksResult).some(rank => rank !== null);

          console.log('[MyScore] 🔍 Has any score?', hasAnyScore);
          console.log('[MyScore] 🔍 All ranks values:', Object.values(ranksResult));

          // 점수가 하나도 없을 때만 에러로 표시
          // 점수가 있으면 에러를 설정하지 않음 (일부 게임만 점수가 있어도 OK)
          if (!hasAnyScore) {
            console.warn('[MyScore] Student exists but has no game scores');
            setError('아직 게임 기록이 없습니다. QR 코드로 점수를 먼저 등록해주세요!');
          } else {
            // 점수가 있으면 에러 제거
            setError(null);
          }

          setAllRanks(ranksResult);
          setScoreHistory(scoresResult);
          console.log('[MyScore] 🎯 Data loaded successfully');
        }
      } catch (err) {
        console.error('[MyScore] ❌ Fetch error:', err);
        setError('점수를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  // Loading state
  if (loading) {
    return (
      <div className="my-score-page">
        <div className="my-score-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>점수를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (no student ID or no score)
  if (error) {
    return (
      <div className="my-score-page">
        <div className="my-score-container">
          <div className="error-state">
            <p className="error-icon">😢</p>
            <h2 className="error-title">기록이 없습니다</h2>
            <p className="error-message">{error}</p>
            {studentId && (
              <div style={{
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(200, 159, 119, 0.1)',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-light)'
              }}>
                <p style={{ margin: '0.25rem 0' }}>🔍 디버그 정보:</p>
                <p style={{ margin: '0.25rem 0' }}>학번: {studentId}</p>
                <p style={{ margin: '0.25rem 0' }}>타입: {typeof studentId}</p>
                <p style={{ margin: '0.25rem 0' }}>브라우저 콘솔(F12)에서 자세한 로그를 확인하세요.</p>
              </div>
            )}
            <div className="error-actions">
              {!studentId ? (
                <button
                  className="action-button primary"
                  onClick={() => navigate('/')}
                >
                  학번 등록하기
                </button>
              ) : (
                <>
                  <button
                    className="action-button primary"
                    onClick={() => navigate('/ranking-hub')}
                  >
                    랭킹 보기
                  </button>
                  <button
                    className="action-button secondary"
                    onClick={() => window.location.reload()}
                  >
                    새로고침
                  </button>
                </>
              )}
              <button
                className="action-button secondary"
                onClick={() => navigate('/')}
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state (has scores)
  return (
    <div className="my-score-page">
      <div className="my-score-container">
        {/* Header */}
        <header className="my-score-header">
          <h1 className="my-score-title">🎯 내 점수</h1>
          <p className="my-score-subtitle">
            {studentData?.grade}학년 {studentData?.classNum}반 {studentData?.number}번
          </p>
        </header>

        {/* 게임별 점수 카드 */}
        <div className="scores-grid">
          {Object.entries(GAME_CONFIG).map(([gameType, config]) => {
            const rankInfo = allRanks[gameType];
            const hasScore = rankInfo && rankInfo.score !== undefined;

            return (
              <div key={gameType} className={`game-score-card ${!hasScore ? 'no-score' : ''}`}>
                <h2 className="score-card-title">
                  <span className="card-icon">{config.icon}</span>
                  {config.name}
                </h2>

                {hasScore ? (
                  <>
                    <div className="rank-badge">
                      <div className="rank-number">{rankInfo.rank}</div>
                      <div className="rank-label">순위</div>
                    </div>

                    <div className="rank-total">
                      전체 {rankInfo.total}명 중
                    </div>

                    <ScoreDisplay
                      gameType={gameType}
                      score={rankInfo.score}
                      size="large"
                      showLabel={false}
                    />

                    <div className="percentile-info">
                      <strong>상위 {Math.round((rankInfo.rank / rankInfo.total) * 100)}%</strong>
                    </div>
                  </>
                ) : (
                  <div className="no-score-content">
                    <div className="no-score-icon">🔒</div>
                    <p className="no-score-text">기록 없음</p>
                    <p className="no-score-hint">게임을 플레이해보세요!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Score History */}
        {scoreHistory.length > 0 && (
          <div className="score-history-section">
            <h2 className="history-title">📊 점수 기록 ({scoreHistory.length}개)</h2>
            <div className="score-history-list">
              {scoreHistory.map((record, index) => (
                <div key={record.id} className="score-history-item">
                  <div className="history-item-header">
                    <span className="history-index">#{index + 1}</span>
                    <span className="history-date">
                      {record.claimedAt?.toDate().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="history-item-score">
                    <ScoreDisplay
                      gameType={record.gameType}
                      score={record.score}
                      size="small"
                      showLabel={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="my-score-actions">
          <button
            className="action-button secondary"
            onClick={() => navigate('/ranking-hub')}
          >
            전체 랭킹 보기
          </button>
          <button
            className="action-button primary"
            onClick={() => navigate('/')}
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
