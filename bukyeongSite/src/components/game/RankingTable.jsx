/**
 * RankingTable Component - Display student rankings
 *
 * Features:
 * - Medal icons for top 3 (🥇🥈🥉)
 * - Highlight current user's row
 * - Mobile-responsive table
 * - Formatted score display (ms)
 * - Show only top 10 initially, scroll to see more
 */

import { memo, useState } from 'react';
import './RankingTable.css';

const RankingTable = memo(({
  rankings = [],
  currentStudentId = null,
  loading = false,
  emptyMessage = '아직 기록이 없습니다.',
  gameType = 'reaction' // 'reaction' or 'color'
}) => {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_DISPLAY = 10;
  // Get medal for top 3
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

  // Format class (e.g., "1215" → "1-2")
  const formatClass = (studentId) => {
    if (!studentId || studentId.length < 2) return '-';
    return `${studentId[0]}-${studentId[1]}`;
  };

  // Format name (fallback to student ID if no name)
  const formatName = (student) => {
    if (student.name) return student.name;
    return `학생 ${student.studentId}`;
  };

  // Get score unit based on game type
  const getScoreUnit = () => {
    if (gameType === 'reaction') return 'ms';
    if (gameType === 'color') return '점';
    return '';
  };

  // Determine which rankings to display
  const displayedRankings = showAll ? rankings : rankings.slice(0, INITIAL_DISPLAY);

  if (loading) {
    return (
      <div className="ranking-table-loading">
        <div className="loading-spinner"></div>
        <p>랭킹을 불러오는 중...</p>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="ranking-table-empty">
        <p className="empty-icon">📊</p>
        <p className="empty-message">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="ranking-table-container">
      <div className="ranking-table-wrapper">
        <table className="ranking-table">
          <thead>
            <tr>
              <th className="rank-col">순위</th>
              <th className="name-col">이름</th>
              <th className="class-col">반</th>
              <th className="score-col">기록</th>
            </tr>
          </thead>
          <tbody>
            {displayedRankings.map((student) => {
              const isCurrentUser = currentStudentId && student.studentId === currentStudentId;
              const medal = getMedal(student.rank);
              const score = student.scores?.[gameType];

              return (
                <tr
                  key={student.studentId}
                  className={`ranking-row ${isCurrentUser ? 'current-user' : ''} ${medal ? 'top-three' : ''}`}
                >
                  <td className="rank-col">
                    {medal ? (
                      <span className="rank-medal">{medal}</span>
                    ) : (
                      <span className="rank-number">{student.rank}</span>
                    )}
                  </td>
                  <td className="name-col">
                    {formatName(student)}
                    {isCurrentUser && <span className="you-badge">나</span>}
                  </td>
                  <td className="class-col">
                    {formatClass(student.studentId)}
                  </td>
                  <td className="score-col">
                    <span className="score-value">{score}</span>
                    <span className="score-unit">{getScoreUnit()}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show More Button */}
      {rankings.length > INITIAL_DISPLAY && !showAll && (
        <div className="show-more-section">
          <button
            className="show-more-button"
            onClick={() => setShowAll(true)}
          >
            <span className="show-more-icon">▼</span>
            <span className="show-more-text">
              더 보기 ({rankings.length - INITIAL_DISPLAY}명 더)
            </span>
          </button>
        </div>
      )}

      {/* Collapse Button */}
      {showAll && rankings.length > INITIAL_DISPLAY && (
        <div className="show-more-section">
          <button
            className="show-more-button collapse"
            onClick={() => setShowAll(false)}
          >
            <span className="show-more-icon">▲</span>
            <span className="show-more-text">접기</span>
          </button>
        </div>
      )}
    </div>
  );
});

RankingTable.displayName = 'RankingTable';

export default RankingTable;
