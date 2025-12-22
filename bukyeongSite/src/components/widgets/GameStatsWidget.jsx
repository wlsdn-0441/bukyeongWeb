// src/components/widgets/GameStatsWidget.jsx
import { useState, useEffect } from 'react';
import { subscribeToRanking, getStudentRank } from '../../services/gameService';
import { getStudentIdFromStorage } from '../../services/studentService';
import './GameStatsWidget.css';

const GameStatsWidget = () => {
  const [ranking, setRanking] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 학번 정보 가져오기
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

  // ============================================
  // 실시간 TOP 3 랭킹 구독
  // ============================================
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToRanking((rankingData) => {
      setRanking(rankingData);
      setLoading(false);
    }, 3); // TOP 3만 가져오기

    return () => {
      unsubscribe();
    };
  }, []);

  // ============================================
  // 개인 순위 조회 (로그인 시)
  // ============================================
  useEffect(() => {
    if (!studentId) {
      setMyRank(null);
      return;
    }

    const fetchMyRank = async () => {
      try {
        const rankData = await getStudentRank(studentId);
        setMyRank(rankData);
      } catch (err) {
        console.error('[GameStatsWidget] 개인 순위 조회 실패:', err);
        setMyRank(null);
      }
    };

    fetchMyRank();
  }, [studentId]);

  // 메달 아이콘 반환
  const getMedal = (index) => {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[index] || `${index + 1}위`;
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

  // 에러 또는 데이터 없음
  if (error || ranking.length === 0) {
    return (
      <div className="game-stats-widget">
        <div className="stats-empty">
          <span className="empty-icon">🎮</span>
          <p>아직 게임 기록이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-stats-widget">
      {/* 개인 통계 (로그인 시) */}
      {myRank && (
        <div className="my-stats">
          <div className="stat-item">
            <span className="stat-label">내 순위</span>
            <span className="stat-value gradient-text">
              {myRank.rank}위
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">내 기록</span>
            <span className="stat-value gradient-text">
              {myRank.score}ms
            </span>
          </div>
        </div>
      )}

      {/* TOP 3 랭킹 */}
      <div className="top-ranking">
        <div className="ranking-header">
          <span className="ranking-title">🏆 TOP 3</span>
        </div>
        {ranking.map((student, index) => (
          <div className="rank-item" key={student.studentId}>
            <span className="rank-medal">{getMedal(index)}</span>
            <span className="rank-id">{student.studentId}</span>
            <span className="rank-score gradient-text">
              {student.scores.reaction}ms
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameStatsWidget;
