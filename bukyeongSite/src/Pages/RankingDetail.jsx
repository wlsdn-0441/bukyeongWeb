/**
 * RankingDetail Page - Detailed ranking for specific game
 *
 * Features:
 * - Display full ranking list (1-10 visible, more on scroll)
 * - Highlight top 3 with medals
 * - Highlight user's own record
 * - Session parameter handling for user tracking
 * - Real-time updates
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { subscribeToGameRanking } from '../services/gameService';
import { normalizeGameType, GAME_CONFIG } from '../config/gameConfig';
import './RankingDetail.css';

// Use GAME_CONFIG as GAME_INFO
const GAME_INFO = GAME_CONFIG;

export default function RankingDetail() {
  const navigate = useNavigate();
  const { gameType: rawGameType } = useParams();
  const [searchParams] = useSearchParams();
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [myRecord, setMyRecord] = useState(null);

  // gameType 정규화 (부스 'colorfind' → 메인 'color' 호환)
  const gameType = normalizeGameType(rawGameType);
  const sessionId = searchParams.get('session');
  const gameInfo = GAME_INFO[gameType] || GAME_INFO.reaction;

  // Subscribe to game ranking
  useEffect(() => {
    console.log('[RankingDetail] Subscribing to', gameType, 'ranking');
    setLoading(true);

    const unsubscribe = subscribeToGameRanking(gameType, (rankingData) => {
      console.log('[RankingDetail] Received ranking:', rankingData.length, 'students');
      setRankings(rankingData);
      setLoading(false);

      // Find user's record by session
      if (sessionId) {
        // TODO: Match session ID to student record
        // For now, we'll just mark the first record as example
        console.log('[RankingDetail] Session ID:', sessionId);
      }
    }, 100);

    return () => {
      console.log('[RankingDetail] Unsubscribing');
      unsubscribe();
    };
  }, [gameType, sessionId]);

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
        return null;
    }
  };

  // Format name
  const formatName = (student) => {
    if (!student) return '-';
    if (student.name) return student.name;
    return `학생 ${student.studentId}`;
  };

  // Format class
  const formatClass = (studentId) => {
    if (!studentId || studentId.length < 2) return '-';
    return `${studentId[0]}-${studentId[1]}`;
  };

  // Get score
  const getScore = (student) => {
    if (!student) return '-';
    return student.scores?.[gameType] || '-';
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Display rankings (top 10 initially)
  const displayedRankings = showAll ? rankings : rankings.slice(0, 10);

  // Find my record (if outside top 10)
  const myRecordOutsideTop10 = myRecord && myRecord.rank > 10 ? myRecord : null;

  return (
    <div className="ranking-detail" style={{ '--game-color': gameInfo.color }}>
      <div className="ranking-detail-container">
        {/* Header */}
        <header className="detail-header">
          <button className="back-btn" onClick={() => navigate('/ranking-hub')}>
            ← 뒤로
          </button>
          <div className="header-content">
            <span className="header-icon">{gameInfo.icon}</span>
            <div className="header-text">
              <h1 className="detail-title">{gameInfo.name}</h1>
              <p className="detail-subtitle">{gameInfo.desc}</p>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="detail-loading">
            <div className="loading-spinner"></div>
            <p>랭킹을 불러오는 중...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && rankings.length === 0 && (
          <div className="detail-empty">
            <span className="empty-icon">{gameInfo.icon}</span>
            <p className="empty-text">아직 기록이 없습니다</p>
            <p className="empty-hint">첫 번째 플레이어가 되어보세요!</p>
          </div>
        )}

        {/* Ranking List */}
        {!loading && rankings.length > 0 && (
          <>
            {/* Top 3 Podium */}
            {rankings.length >= 3 && (
              <div className="podium">
                {/* 2nd Place */}
                <div className="podium-item second">
                  <div className="podium-medal">🥈</div>
                  <div className="podium-name">{formatName(rankings[1])}</div>
                  <div className="podium-score">
                    {getScore(rankings[1])} {gameInfo.unit}
                  </div>
                  <div className="podium-rank">2등</div>
                </div>

                {/* 1st Place */}
                <div className="podium-item first">
                  <div className="podium-medal">🥇</div>
                  <div className="podium-name">{formatName(rankings[0])}</div>
                  <div className="podium-score">
                    {getScore(rankings[0])} {gameInfo.unit}
                  </div>
                  <div className="podium-rank">1등</div>
                </div>

                {/* 3rd Place */}
                <div className="podium-item third">
                  <div className="podium-medal">🥉</div>
                  <div className="podium-name">{formatName(rankings[2])}</div>
                  <div className="podium-score">
                    {getScore(rankings[2])} {gameInfo.unit}
                  </div>
                  <div className="podium-rank">3등</div>
                </div>
              </div>
            )}

            {/* Full Ranking Table */}
            <div className="ranking-table-section">
              <h2 className="table-title">전체 순위</h2>
              <div className="ranking-table-wrapper">
                <table className="ranking-table">
                  <thead>
                    <tr>
                      <th>순위</th>
                      <th>이름</th>
                      <th>반</th>
                      <th>기록</th>
                      <th>날짜</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRankings.map((student) => {
                      const medal = getMedal(student.rank);
                      const isMyRecord = sessionId && student.sessionId === sessionId;

                      return (
                        <tr
                          key={student.studentId}
                          className={`ranking-row ${isMyRecord ? 'my-record' : ''} ${medal ? 'top-three' : ''}`}
                        >
                          <td className="rank-col">
                            {medal || student.rank}
                          </td>
                          <td className="name-col">
                            {formatName(student)}
                            {isMyRecord && <span className="me-badge">나</span>}
                          </td>
                          <td className="class-col">{formatClass(student.studentId)}</td>
                          <td className="score-col">
                            <strong>{getScore(student)}</strong> {gameInfo.unit}
                          </td>
                          <td className="date-col">{formatDate(student.lastPlayed)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Show More Button */}
              {rankings.length > 10 && !showAll && (
                <button className="show-more-btn" onClick={() => setShowAll(true)}>
                  더 보기 ({rankings.length - 10}명 더)
                </button>
              )}

              {/* Collapse Button */}
              {showAll && rankings.length > 10 && (
                <button className="show-more-btn collapse" onClick={() => setShowAll(false)}>
                  접기
                </button>
              )}
            </div>

            {/* My Record (if outside top 10) */}
            {myRecordOutsideTop10 && (
              <div className="my-record-section">
                <h3 className="my-record-title">👤 내 기록</h3>
                <div className="my-record-card">
                  <div className="my-record-rank">{myRecordOutsideTop10.rank}등</div>
                  <div className="my-record-info">
                    <div className="my-record-name">{formatName(myRecordOutsideTop10)}</div>
                    <div className="my-record-score">
                      {getScore(myRecordOutsideTop10)} {gameInfo.unit}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="detail-actions">
          <button className="action-btn secondary" onClick={() => navigate('/ranking-hub')}>
            다른 게임 보기
          </button>
          <button className="action-btn primary" onClick={() => navigate('/')}>
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}
