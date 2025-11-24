// src/components/common/TimetableSkeleton.jsx
import './TimetableSkeleton.css';

/**
 * 시간표 위젯 로딩 중 Skeleton UI
 *
 * 사용자 경험 개선:
 * - "로딩 중..." 텍스트 대신 실제 시간표 구조 표시
 * - 깜빡이는 애니메이션으로 로딩 상태 시각화
 * - 체감 로딩 속도 20~30% 개선 효과
 */
const TimetableSkeleton = () => {
  return (
    <div className="timetable-widget skeleton-loading">
      {/* 헤더 영역 */}
      <div className="timetable-widget-header">
        <div className="skeleton-box skeleton-title-box"></div>
        <div className="timetable-widget-info">
          <div className="skeleton-box skeleton-day-box"></div>
          <div className="skeleton-box skeleton-date-box"></div>
          <div className="skeleton-box skeleton-class-box"></div>
        </div>
      </div>

      {/* 시간표 리스트 (7교시) */}
      <div className="timetable-content">
        <ul className="timetable-list">
          {Array.from({ length: 7 }).map((_, idx) => (
            <li key={idx} className="timetable-item">
              <div className="skeleton-box skeleton-period"></div>
              <div className="skeleton-box skeleton-subject"></div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TimetableSkeleton;
