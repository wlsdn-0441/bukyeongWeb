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
  // 드래그 관련 props
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
  // 터치 이벤트 props (모바일 지원)
  cardId,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  return (
    <article
      className={`card ${isClickable ? 'card-clickable' : ''} ${isDragging ? 'card-dragging' : ''} ${isDragOver ? 'card-drag-over' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : -1}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      data-card-id={cardId}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ cursor: draggable ? 'grab' : undefined }}
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