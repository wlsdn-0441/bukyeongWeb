// src/components/common/Card.jsx
import { memo } from 'react';
import './Card.css';

const Card = memo(({
  title,
  children,
  className = '',
  footer,
  onClick,
  isClickable = false,
  avatar,
  subtitle,
  headerAction,
  // 화살표 버튼 관련 props
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  canMoveUp = false,
  canMoveDown = false,
  canMoveLeft = false,
  canMoveRight = false,
}) => {
  // 화살표 버튼이 하나라도 있는지 확인
  const hasArrowButtons = onMoveUp || onMoveDown || onMoveLeft || onMoveRight;

  // 화살표 버튼 클릭 핸들러 (이벤트 버블링 방지)
  const handleArrowClick = (e, handler) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    handler?.();
  };

  return (
    <article
      className={`card ${isClickable ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : -1}
      onKeyDown={isClickable ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      {title && (
        <header className="card-header">
          <div className="card-header-content">
            {avatar && (
              <div className="card-avatar">
                {typeof avatar === 'string' ? (
                  <img src={avatar} alt="" className="card-avatar-img" />
                ) : (
                  avatar
                )}
              </div>
            )}
            <div className="card-title-group">
              <h2 className="card-title">{title}</h2>
              {subtitle && <p className="card-subtitle">{subtitle}</p>}
            </div>
          </div>
          {/* 화살표 버튼 그룹 */}
          {hasArrowButtons && (
            <div className="card-arrow-controls">
              {/* 모바일: 상하 버튼만 표시 */}
              <div className="card-arrow-mobile">
                <button
                  className="card-arrow-button card-arrow-up"
                  onClick={(e) => handleArrowClick(e, onMoveUp)}
                  disabled={!canMoveUp}
                  aria-label="위로 이동"
                  title="위로 이동"
                >
                  ↑
                </button>
                <button
                  className="card-arrow-button card-arrow-down"
                  onClick={(e) => handleArrowClick(e, onMoveDown)}
                  disabled={!canMoveDown}
                  aria-label="아래로 이동"
                  title="아래로 이동"
                >
                  ↓
                </button>
              </div>
              {/* PC: 상하좌우 버튼 모두 표시 */}
              <div className="card-arrow-desktop">
                <div className="card-arrow-row">
                  <button
                    className="card-arrow-button card-arrow-up"
                    onClick={(e) => handleArrowClick(e, onMoveUp)}
                    disabled={!canMoveUp}
                    aria-label="위로 이동"
                    title="위로 이동"
                  >
                    ↑
                  </button>
                </div>
                <div className="card-arrow-row">
                  <button
                    className="card-arrow-button card-arrow-left"
                    onClick={(e) => handleArrowClick(e, onMoveLeft)}
                    disabled={!canMoveLeft}
                    aria-label="왼쪽으로 이동"
                    title="왼쪽으로 이동"
                  >
                    ←
                  </button>
                  <button
                    className="card-arrow-button card-arrow-right"
                    onClick={(e) => handleArrowClick(e, onMoveRight)}
                    disabled={!canMoveRight}
                    aria-label="오른쪽으로 이동"
                    title="오른쪽으로 이동"
                  >
                    →
                  </button>
                </div>
                <div className="card-arrow-row">
                  <button
                    className="card-arrow-button card-arrow-down"
                    onClick={(e) => handleArrowClick(e, onMoveDown)}
                    disabled={!canMoveDown}
                    aria-label="아래로 이동"
                    title="아래로 이동"
                  >
                    ↓
                  </button>
                </div>
              </div>
            </div>
          )}
          {headerAction && (
            <div className="card-header-action">
              {headerAction}
            </div>
          )}
        </header>
      )}

      <section className="card-body">
        {children}
      </section>

      {footer && (
        <footer className="card-footer">
          {footer}
        </footer>
      )}
    </article>
  );
});

Card.displayName = 'Card';

export default Card;