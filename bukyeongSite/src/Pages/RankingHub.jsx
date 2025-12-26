/**
 * RankingHub Page - Main ranking page with all games preview
 *
 * Features:
 * - Display all 4 games with top 3 preview
 * - QR code session parameter handling
 * - Navigate to detailed ranking pages
 * - Cafe beige theme
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { subscribeToGameRanking } from '../services/gameService';
import './RankingHub.css';

// Game configurations
const GAMES = [
  {
    id: 'reaction',
    name: '반응속도 게임',
    icon: '⚡',
    unit: 'ms',
    desc: '낮을수록 좋음',
    color: '#C89F77'
  },
  {
    id: 'color',
    name: '색깔 찾기 게임',
    icon: '🎨',
    unit: '점',
    desc: '높을수록 좋음',
    color: '#A67C52'
  },
  {
    id: 'memory',
    name: '기억력 게임',
    icon: '🧠',
    unit: '점',
    desc: '높을수록 좋음',
    color: '#8B6F47'
  },
  {
    id: 'balloon',
    name: '풍선 터뜨리기 게임',
    icon: '🎈',
    unit: '점',
    desc: '높을수록 좋음',
    color: '#D4A574'
  }
];

export default function RankingHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);

  // Handle session parameter for QR code
  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      // TODO: Fetch session data and redirect to appropriate game ranking
      console.log('[RankingHub] Session ID detected:', sessionId);
      // For now, we'll just redirect to reaction game as example
      // In production, fetch session data from Firestore to determine game type
      // navigate(`/ranking/reaction?session=${sessionId}`);
    }
  }, [searchParams, navigate]);

  // Subscribe to all game rankings (top 3 only)
  useEffect(() => {
    const unsubscribers = [];

    GAMES.forEach(game => {
      const unsubscribe = subscribeToGameRanking(game.id, (rankingData) => {
        setRankings(prev => ({
          ...prev,
          [game.id]: rankingData.slice(0, 3) // Top 3 only for preview
        }));
        setLoading(false);
      }, 3);

      unsubscribers.push(unsubscribe);
    });

    // Cleanup all subscriptions
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  // Format name (fallback to student ID if no name)
  const formatName = (student) => {
    if (!student) return '-';
    if (student.name) return student.name;
    return `학생 ${student.studentId}`;
  };

  // Get score for specific game
  const getScore = (student, gameId) => {
    if (!student) return '-';
    return student.scores?.[gameId] || '-';
  };

  // Get medal for rank
  const getMedal = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank;
    }
  };

  return (
    <div className="ranking-hub">
      <div className="ranking-hub-container">
        {/* Header */}
        <header className="hub-header">
          <h1 className="hub-title">🏆 게임 랭킹 보드</h1>
          <p className="hub-subtitle">
            각 게임별 상위 랭커를 확인하고 자세한 순위를 확인하세요!
          </p>
        </header>

        {/* Game Cards Grid */}
        <div className="game-cards-grid">
          {GAMES.map(game => (
            <div
              key={game.id}
              className="game-card"
              style={{ '--game-color': game.color }}
              onClick={() => navigate(`/ranking/${game.id}`)}
            >
              {/* Card Header */}
              <div className="game-card-header">
                <span className="game-icon">{game.icon}</span>
                <div className="game-info">
                  <h3 className="game-name">{game.name}</h3>
                  <p className="game-desc">{game.desc}</p>
                </div>
              </div>

              {/* Top 3 Preview */}
              <div className="top-three-preview">
                {loading ? (
                  <div className="preview-loading">로딩 중...</div>
                ) : rankings[game.id] && rankings[game.id].length > 0 ? (
                  <>
                    {rankings[game.id].map((student, index) => (
                      <div key={student.studentId} className={`preview-item rank-${index + 1}`}>
                        <span className="preview-medal">{getMedal(index + 1)}</span>
                        <span className="preview-name">{formatName(student)}</span>
                        <span className="preview-score">
                          {getScore(student, game.id)} {game.unit}
                        </span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="preview-empty">
                    <p>아직 기록이 없습니다</p>
                    <p className="empty-hint">첫 번째 플레이어가 되어보세요!</p>
                  </div>
                )}
              </div>

              {/* View More Button */}
              <button className="view-more-btn">
                <span>자세히 보기</span>
                <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>

        {/* Back to Home */}
        <div className="hub-actions">
          <button className="back-home-btn" onClick={() => navigate('/')}>
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
