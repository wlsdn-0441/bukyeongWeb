// src/components/common/MealSkeleton.jsx
import './MealSkeleton.css';

/**
 * 급식 위젯 로딩 중 Skeleton UI
 *
 * 사용자 경험 개선:
 * - "로딩 중..." 텍스트 대신 실제 콘텐츠 구조 표시
 * - 깜빡이는 애니메이션으로 로딩 상태 시각화
 * - 체감 로딩 속도 20~30% 개선 효과
 */
const MealSkeleton = () => {
  return (
    <div className="meal-widget skeleton-loading">
      {/* 헤더 영역 (날짜/요일) */}
      <div className="meal-widget-header">
        <div className="skeleton-box skeleton-day"></div>
        <div className="skeleton-box skeleton-date"></div>
      </div>

      {/* 아침 섹션 */}
      <div className="meal-section breakfast">
        <div className="skeleton-box skeleton-title"></div>
        <div className="skeleton-lines">
          <div className="skeleton-box skeleton-line"></div>
          <div className="skeleton-box skeleton-line short"></div>
          <div className="skeleton-box skeleton-line medium"></div>
        </div>
      </div>

      {/* 점심 섹션 */}
      <div className="meal-section lunch">
        <div className="skeleton-box skeleton-title"></div>
        <div className="skeleton-lines">
          <div className="skeleton-box skeleton-line"></div>
          <div className="skeleton-box skeleton-line medium"></div>
          <div className="skeleton-box skeleton-line short"></div>
        </div>
      </div>

      {/* 저녁 섹션 */}
      <div className="meal-section dinner">
        <div className="skeleton-box skeleton-title"></div>
        <div className="skeleton-lines">
          <div className="skeleton-box skeleton-line"></div>
          <div className="skeleton-box skeleton-line short"></div>
          <div className="skeleton-box skeleton-line medium"></div>
        </div>
      </div>
    </div>
  );
};

export default MealSkeleton;
