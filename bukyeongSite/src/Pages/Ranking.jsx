/**
 * Ranking Page - Unified ranking system with multiple game types
 *
 * Features:
 * - Multiple game types (reaction, color, etc.)
 * - Class filter (전체, 1-1, 1-2, etc.)
 * - Real-time updates using Firestore onSnapshot
 * - Display top rankings (10 initially, more on scroll)
 * - Highlight current user
 * - Medal icons for top 3
 * - Mobile-responsive design
 */

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import RankingTable from '../components/game/RankingTable';
import { subscribeToRanking, subscribeToColorRanking } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import './Ranking.css';

export default function Ranking() {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameType, setGameType] = useState('reaction'); // 'reaction' or 'color'
  const [classFilter, setClassFilter] = useState('all'); // 'all', '1-1', '1-2', etc.

  // Get current student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const currentStudentId = studentData?.studentId;

  // Subscribe to real-time ranking updates based on game type
  useEffect(() => {
    console.log(`[Ranking] Subscribing to ${gameType} ranking updates...`);
    setLoading(true);

    const subscribeFunction = gameType === 'color'
      ? subscribeToColorRanking
      : subscribeToRanking;

    const unsubscribe = subscribeFunction((rankingData) => {
      console.log(`[Ranking] Received ${gameType} update:`, rankingData.length, 'students');
      setRankings(rankingData);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount or game type change
    return () => {
      console.log(`[Ranking] Unsubscribing from ${gameType} ranking updates`);
      unsubscribe();
    };
  }, [gameType]);

  // Filter rankings by class
  const filteredRankings = useMemo(() => {
    if (classFilter === 'all') {
      return rankings;
    }

    // Filter by class (e.g., '1-1' matches studentId starting with '11')
    const classCode = classFilter.replace('-', ''); // '1-1' -> '11'
    const filtered = rankings.filter(student =>
      student.studentId?.startsWith(classCode)
    );

    // Re-calculate ranks for filtered results
    return filtered.map((student, index) => ({
      ...student,
      rank: index + 1
    }));
  }, [rankings, classFilter]);

  // Find current user's rank in filtered results
  const currentUserRank = currentStudentId
    ? filteredRankings.find(r => r.studentId === currentStudentId)?.rank
    : null;

  // Get game type title and description
  const getGameInfo = () => {
    switch (gameType) {
      case 'color':
        return {
          icon: '🎨',
          title: '색깔 찾기 랭킹',
          subtitle: '색깔 찾기 게임 순위 (높을수록 좋아요!)'
        };
      case 'reaction':
      default:
        return {
          icon: '⚡',
          title: '반응속도 랭킹',
          subtitle: '반응속도 게임 순위 (낮을수록 좋아요!)'
        };
    }
  };

  const gameInfo = getGameInfo();

  // Generate class options (1-1 to 3-9)
  const classOptions = useMemo(() => {
    const options = [{ value: 'all', label: '전체' }];
    for (let grade = 1; grade <= 3; grade++) {
      for (let classNum = 1; classNum <= 9; classNum++) {
        options.push({
          value: `${grade}-${classNum}`,
          label: `${grade}-${classNum}`
        });
      }
    }
    return options;
  }, []);

  return (
    <div className="ranking-page">
      <div className="ranking-container">
        {/* Header */}
        <header className="ranking-header">
          <h1 className="ranking-title">{gameInfo.icon} 실시간 랭킹</h1>
          <p className="ranking-subtitle">{gameInfo.subtitle}</p>
        </header>

        {/* Game Type Tabs */}
        <div className="game-type-tabs">
          <button
            className={`game-tab ${gameType === 'reaction' ? 'active' : ''}`}
            onClick={() => setGameType('reaction')}
          >
            <span className="tab-icon">⚡</span>
            <span className="tab-label">반응속도</span>
          </button>
          <button
            className={`game-tab ${gameType === 'color' ? 'active' : ''}`}
            onClick={() => setGameType('color')}
          >
            <span className="tab-icon">🎨</span>
            <span className="tab-label">색깔 찾기</span>
          </button>
        </div>

        {/* Class Filter */}
        <div className="ranking-filters">
          <div className="filter-group">
            <label htmlFor="class-filter" className="filter-label">
              🏫 반 선택:
            </label>
            <select
              id="class-filter"
              className="filter-select"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              {classOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {classFilter !== 'all' && (
            <button
              className="filter-reset"
              onClick={() => setClassFilter('all')}
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Current User Rank Badge */}
        {!loading && currentUserRank && (
          <div className="my-rank-badge">
            <span className="badge-icon">🎯</span>
            <span className="badge-text">
              내 순위: <strong>{currentUserRank}위</strong> / {filteredRankings.length}명
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
            rankings={filteredRankings}
            currentStudentId={currentStudentId}
            loading={loading}
            gameType={gameType}
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
        {!loading && filteredRankings.length > 0 && (
          <div className="live-indicator">
            <span className="live-dot"></span>
            <span className="live-text">실시간 업데이트 중</span>
          </div>
        )}
      </div>
    </div>
  );
}
