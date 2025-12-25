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
import { getStudentRank, getAllStudentScores } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import './MyScore.css';

export default function MyScore() {
  const navigate = useNavigate();
  const [rankData, setRankData] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

  // Fetch student rank and all scores on mount
  useEffect(() => {
    const fetchData = async () => {
      // Check if student ID exists
      if (!studentId) {
        setError('학번을 먼저 등록해주세요.');
        setLoading(false);
        return;
      }

      try {
        console.log('[MyScore] Fetching data for:', studentId);

        // Fetch rank and all scores in parallel
        const [rankResult, scoresResult] = await Promise.all([
          getStudentRank(studentId),
          getAllStudentScores(studentId)
        ]);

        if (!rankResult || scoresResult.length === 0) {
          setError('아직 게임 기록이 없습니다.');
        } else {
          setRankData(rankResult);
          setScoreHistory(scoresResult);
        }
      } catch (err) {
        console.error('[MyScore] Fetch error:', err);
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
            <div className="error-actions">
              {!studentId ? (
                <button
                  className="action-button primary"
                  onClick={() => navigate('/')}
                >
                  학번 등록하기
                </button>
              ) : (
                <button
                  className="action-button primary"
                  onClick={() => navigate('/ranking')}
                >
                  랭킹 보기
                </button>
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

  // Success state (has score)
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

        {/* Rank Card */}
        <div className="rank-card">
          <div className="rank-badge">
            <div className="rank-number">{rankData.rank}</div>
            <div className="rank-label">순위</div>
          </div>
          <div className="rank-total">
            전체 {rankData.total}명 중
          </div>
        </div>

        {/* Score Display */}
        <div className="score-card">
          <h2 className="score-card-title">반응속도 게임</h2>
          <ScoreDisplay
            gameType="reaction"
            score={rankData.score}
            size="large"
            showLabel={false}
          />
          <p className="score-hint">낮을수록 좋아요!</p>
        </div>

        {/* Percentile Info */}
        <div className="percentile-card">
          <div className="percentile-icon">📊</div>
          <div className="percentile-content">
            <strong>상위 {Math.round((rankData.rank / rankData.total) * 100)}%</strong>
            <p className="percentile-description">
              {rankData.rank <= 3 && '🎉 최상위권입니다!'}
              {rankData.rank > 3 && rankData.rank <= 10 && '🔥 상위권입니다!'}
              {rankData.rank > 10 && rankData.rank <= rankData.total * 0.3 && '👍 평균 이상입니다!'}
              {rankData.rank > rankData.total * 0.3 && '💪 더 좋은 기록에 도전해보세요!'}
            </p>
          </div>
        </div>

        {/* Score History */}
        {scoreHistory.length > 0 && (
          <div className="score-history-section">
            <h2 className="history-title">📜 전체 기록 ({scoreHistory.length}개)</h2>
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
                      showLabel={false}
                    />
                    {record.score === rankData.score && (
                      <span className="best-badge">🏆 최고 기록</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="my-score-actions">
          <button
            className="action-button primary"
            onClick={() => navigate('/ranking')}
          >
            전체 랭킹 보기
          </button>
          <button
            className="action-button secondary"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* Refresh Button */}
        <button
          className="refresh-button"
          onClick={() => window.location.reload()}
        >
          🔄 새로고침
        </button>
      </div>
    </div>
  );
}
