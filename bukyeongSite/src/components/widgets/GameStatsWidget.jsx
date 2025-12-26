// src/components/widgets/GameStatsWidget.jsx
import { useState, useEffect } from 'react';
import { subscribeToGameRanking } from '../../services/gameService';
import './GameStatsWidget.css';

// 게임 설정
const GAMES = [
  { id: 'reaction', name: '반응속도', icon: '⚡', unit: 'ms' },
  { id: 'color', name: '색깔 찾기', icon: '🎨', unit: '점' },
  { id: 'memory', name: '기억력', icon: '🧠', unit: '점' },
  { id: 'balloon', name: '풍선 터뜨리기', icon: '🎈', unit: '점' },
];

const GameStatsWidget = () => {
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);

  // ============================================
  // 실시간 TOP 1 랭킹 구독 (모든 게임)
  // ============================================
  useEffect(() => {
    const unsubscribers = [];

    GAMES.forEach(game => {
      const unsubscribe = subscribeToGameRanking(game.id, (rankingData) => {
        setRankings(prev => ({
          ...prev,
          [game.id]: rankingData[0] // TOP 1만 가져오기
        }));
        setLoading(false);
      }, 1);

      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // 이름 포맷
  const formatName = (student) => {
    if (!student) return '-';
    if (student.name) return student.name;
    return `학생 ${student.studentId}`;
  };

  // 점수 가져오기
  const getScore = (student, gameId) => {
    if (!student) return '-';
    return student.scores?.[gameId] || '-';
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="game-stats-widget">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>랭킹 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-stats-widget">
      {/* 게임별 TOP 1 미리보기 */}
      <div className="game-rankings-preview">
        {GAMES.map(game => {
          const topPlayer = rankings[game.id];

          return (
            <div className="game-rank-item" key={game.id}>
              <div className="game-rank-header">
                <span className="game-rank-icon">{game.icon}</span>
                <span className="game-rank-name">{game.name}</span>
              </div>
              <div className="game-rank-leader">
                {topPlayer ? (
                  <>
                    <span className="leader-medal">🥇</span>
                    <span className="leader-name">{formatName(topPlayer)}</span>
                    <span className="leader-score">
                      {getScore(topPlayer, game.id)} {game.unit}
                    </span>
                  </>
                ) : (
                  <span className="no-data">기록 없음</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameStatsWidget;
