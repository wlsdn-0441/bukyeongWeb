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
import { subscribeToGameRanking, getStudentAllRanks } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import { GAME_CONFIG } from '../config/gameConfig';
import './RankingHub.css';

// Convert GAME_CONFIG to array
const GAMES = Object.values(GAME_CONFIG);

export default function RankingHub() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rankings, setRankings] = useState({});
  const [loading, setLoading] = useState(true);
  const [myRanks, setMyRanks] = useState({});
  const [myRanksLoading, setMyRanksLoading] = useState(true);

  // Get student ID from localStorage
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

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

  // Fetch student's own ranks for all games
  useEffect(() => {
    const fetchMyRanks = async () => {
      if (!studentId) {
        setMyRanksLoading(false);
        return;
      }

      try {
        const ranksResult = await getStudentAllRanks(String(studentId));
        if (ranksResult) {
          setMyRanks(ranksResult);
        }
      } catch (error) {
        console.error('[RankingHub] Failed to fetch student ranks:', error);
      } finally {
        setMyRanksLoading(false);
      }
    };

    fetchMyRanks();
  }, [studentId]);

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
          {/* 나의 모든 점수 카드 */}
          <div
            className="game-card my-scores-card"
            style={{ '--game-color': '#E8D5C4' }}
            onClick={() => navigate('/my-score')}
          >
            <div className="game-card-header">
              <span className="game-icon">🎯</span>
              <div className="game-info">
                <h3 className="game-name">나의 모든 점수</h3>
                <p className="game-desc">내 게임 기록 모아보기</p>
              </div>
            </div>

            <div className="my-scores-preview">
              <div className="my-scores-hint">
                <p>📊 모든 게임의</p>
                <p>내 점수와 순위를</p>
                <p>한눈에 확인하세요!</p>
              </div>
            </div>

            <button className="view-more-btn">
              <span>내 점수 보기</span>
              <span className="arrow">→</span>
            </button>
          </div>

          {/* 게임 카드들 */}
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

              {/* My Rank Section */}
              {studentId ? (
                <div className="my-rank-section">
                  {myRanksLoading ? (
                    <div className="my-rank-loading">내 순위 로딩 중...</div>
                  ) : myRanks[game.id] ? (
                    <div className="my-rank-info">
                      <span className="my-rank-label">내 순위:</span>
                      <span className="my-rank-value">
                        {myRanks[game.id].rank}위 / {myRanks[game.id].total}명
                      </span>
                      <span className="my-rank-score">
                        {myRanks[game.id].score} {game.unit}
                      </span>
                    </div>
                  ) : (
                    <div className="my-rank-none">
                      <span className="my-rank-icon">🎮</span>
                      <span className="my-rank-text">아직 기록이 없습니다</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="my-rank-section no-student-id">
                  <div className="my-rank-register">
                    <span className="register-icon">📝</span>
                    <span className="register-text">학번을 등록하고 내 순위를 확인하세요!</span>
                    <button
                      className="register-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/');
                      }}
                    >
                      학번 등록하기
                    </button>
                  </div>
                </div>
              )}

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
