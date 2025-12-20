/**
 * Ranking Page - Real-time student rankings
 *
 * Features:
 * - Real-time updates using Firestore onSnapshot
 * - Display top 100 students
 * - Highlight current user
 * - Medal icons for top 3
 * - Mobile-responsive design
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingTable from '../components/game/RankingTable';
import { subscribeToRanking } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import './Ranking.css';

export default function Ranking() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const currentStudentId = studentData?.studentId;

  // Subscribe to real-time ranking updates
  useEffect(() => {
    console.log('[Ranking] Subscribing to ranking updates...');

    const unsubscribe = subscribeToRanking((rankingData) => {
      console.log('[Ranking] Received update:', rankingData.length, 'students');
      setRankings(rankingData);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('[Ranking] Unsubscribing from ranking updates');
      unsubscribe();
    };
  }, []);

  // Find current user's rank
  const currentUserRank = currentStudentId
    ? rankings.find(r => r.studentId === currentStudentId)?.rank
    : null;

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        {/* Header */}
        <header className="ranking-header">
          <h1 className="ranking-title">🏆 실시간 랭킹</h1>
          <p className="ranking-subtitle">
            반응속도 게임 순위 (낮을수록 좋아요!)
          </p>
        </header>

        {/* Current User Rank Badge */}
        {!loading && currentUserRank && (
          <div className="my-rank-badge">
            <span className="badge-icon">🎯</span>
            <span className="badge-text">
              내 순위: <strong>{currentUserRank}위</strong> / {rankings.length}명
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="ranking-error">
            <p className="error-icon">⚠️</p>
            <p className="error-message">{error}</p>
            <button
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Ranking Table */}
        {!error && (
          <RankingTable
            rankings={rankings}
            currentStudentId={currentStudentId}
            loading={loading}
            emptyMessage="아직 게임 기록이 없습니다. 첫 번째 플레이어가 되어보세요!"
          />
        )}

        {/* Action Buttons */}
        <div className="ranking-actions">
          <button
            className="action-button secondary"
            onClick={() => navigate('/my-score')}
          >
            내 점수 보기
          </button>
          <button
            className="action-button primary"
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* Live Update Indicator */}
        {!loading && rankings.length > 0 && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">실시간 업데이트 중</span>
          </div>
        )}
      </div>
    </div>
  );
}
