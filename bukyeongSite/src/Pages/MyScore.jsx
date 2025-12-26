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

  // Get student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

  // Fetch student ranks for all games and score history
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

        // Fetch ranks for all games and all scores in parallel
        const [ranksResult, scoresResult] = await Promise.all([
          getStudentAllRanks(studentId),
          getAllStudentScores(studentId)
        ]);

        if (!ranksResult || Object.keys(ranksResult).filter(k => ranksResult[k]).length === 0) {
          setError('아직 게임 기록이 없습니다.');
        } else {
          setAllRanks(ranksResult);
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
            if (!rankInfo) return null;

            return (
              <div key={gameType} className="game-score-card">
                <h2 className="score-card-title">
                  <span className="card-icon">{config.icon}</span>
                  {config.name}
                </h2>

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
              </div>
            );
          })}
        </div>

        {/* 기록이 하나도 없을 때 */}
        {Object.values(allRanks).every(rank => !rank) && (
          <div className="no-scores-state">
            <span className="no-scores-icon">🎮</span>
            <p>아직 게임 기록이 없습니다</p>
            <p className="no-scores-hint">게임을 플레이하고 QR 코드로 점수를 등록해보세요!</p>
          </div>
        )}

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
