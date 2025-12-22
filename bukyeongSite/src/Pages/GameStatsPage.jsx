// src/Pages/GameStatsPage.jsx
import { useState, useEffect, useMemo } from 'react';
import { subscribeToRanking, getStudentRank } from '../services/gameService';
import { getStudentIdFromStorage } from '../services/studentService';
import './GameStatsPage.css';

const GameStatsPage = () => {
  const [ranking, setRanking] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // 학번 정보 가져오기
  const studentData = getStudentIdFromStorage();
  const studentId = studentData?.studentId;

  // ============================================
  // 실시간 TOP 100 랭킹 구독
  // ============================================
  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToRanking((rankingData) => {
      setRanking(rankingData);
      setLoading(false);
    }, 100); // TOP 100

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
        console.error('[GameStatsPage] 개인 순위 조회 실패:', err);
        setMyRank(null);
      }
    };

    fetchMyRank();
  }, [studentId]);

  // ============================================
  // 필터링된 랭킹 계산
  // ============================================
  const filteredRanking = useMemo(() => {
    return ranking.filter((student) => {
      // 학년 필터
      if (gradeFilter && student.studentId) {
        const grade = student.studentId.charAt(0);
        if (grade !== gradeFilter) return false;
      }

      // 반 필터
      if (classFilter && student.class) {
        if (student.class.toString() !== classFilter) return false;
      }

      return true;
    });
  }, [ranking, gradeFilter, classFilter]);

  // 필터 초기화
  const resetFilters = () => {
    setGradeFilter('');
    setClassFilter('');
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="game-stats-page">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>랭킹 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-stats-page">
      {/* 헤더 */}
      <div className="stats-header">
        <h1 className="stats-title">🎮 게임 통계</h1>

        {/* 개인 통계 (로그인 시) */}
        {myRank && (
          <div className="my-stats-card">
            <div className="stat-item">
              <span className="label">내 순위</span>
              <span className="value gradient-text">{myRank.rank}위</span>
            </div>
            <div className="stat-item">
              <span className="label">내 기록</span>
              <span className="value gradient-text">{myRank.score}ms</span>
            </div>
            <div className="stat-item">
              <span className="label">상위</span>
              <span className="value">
                {((myRank.rank / myRank.total) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 필터 */}
      <div className="stats-filters">
        <select
          className="filter-select"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
        >
          <option value="">전체 학년</option>
          <option value="1">1학년</option>
          <option value="2">2학년</option>
          <option value="3">3학년</option>
        </select>

        <select
          className="filter-select"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          <option value="">전체 반</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}반
            </option>
          ))}
        </select>

        {(gradeFilter || classFilter) && (
          <button className="filter-reset" onClick={resetFilters}>
            초기화
          </button>
        )}

        <div className="filter-info">
          {filteredRanking.length}명 / {ranking.length}명
        </div>
      </div>

      {/* 랭킹 테이블 */}
      <div className="ranking-table-container">
        {filteredRanking.length === 0 ? (
          <div className="no-results">
            <span className="no-results-icon">🔍</span>
            <p>필터 조건에 맞는 결과가 없습니다</p>
          </div>
        ) : (
          <table className="ranking-table">
            <thead>
              <tr>
                <th className="col-rank">순위</th>
                <th className="col-id">학번</th>
                <th className="col-class">반</th>
                <th className="col-score">점수</th>
              </tr>
            </thead>
            <tbody>
              {filteredRanking.map((student) => {
                const isMyRow = student.studentId === studentId;

                return (
                  <tr key={student.studentId} className={isMyRow ? 'my-row' : ''}>
                    <td className="col-rank">
                      {student.rank <= 3 && (
                        <span className="medal">
                          {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      )}
                      {student.rank}위
                    </td>
                    <td className="col-id">{student.studentId}</td>
                    <td className="col-class">{student.class || '-'}</td>
                    <td className="col-score gradient-text">
                      {student.scores.reaction}ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GameStatsPage;
