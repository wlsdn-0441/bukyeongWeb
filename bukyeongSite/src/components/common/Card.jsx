// src/components/common/Card.jsx
import { memo, useCallback, useEffect } from 'react';
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
  isLongPressing = false,
  // 터치 이벤트 props (모바일 지원)
  cardId,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}) => {
  // 드래그 시작 시 스크롤 방지
  const handleDragStartWrapper = useCallback((e) => {
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    onDragStart?.(e);
  }, [onDragStart]);

  // 드래그 종료 시 스크롤 복원
  const handleDragEndWrapper = useCallback((e) => {
    // body 스크롤 복원
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    onDragEnd?.(e);
  }, [onDragEnd]);

  // 터치 시작 시 스크롤 방지
  const handleTouchStartWrapper = useCallback((e) => {
    if (draggable) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    }

    onTouchStart?.(e);
  }, [draggable, onTouchStart]);

  // 터치 이동 시 스크롤 방지
  const handleTouchMoveWrapper = useCallback((e) => {
    if (draggable && isDragging) {
      e.preventDefault();
    }

    onTouchMove?.(e);
  }, [draggable, isDragging, onTouchMove]);

  // 터치 종료 시 스크롤 복원
  const handleTouchEndWrapper = useCallback((e) => {
    if (draggable) {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    onTouchEnd?.(e);
  }, [draggable, onTouchEnd]);

  // 드래그 오버 시 기본 동작 방지
  const handleDragOverWrapper = useCallback((e) => {
    e.preventDefault();
    onDragOver?.(e);
  }, [onDragOver]);

  // 컴포넌트 언마운트 시 스크롤 복원
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, []);

  return (
    <article
      className={`card ${isClickable ? 'card-clickable' : ''} ${isDragging ? 'card-dragging' : ''} ${isDragOver ? 'card-drag-over' : ''} ${isLongPressing ? 'card-long-pressing' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : 'article'}
      tabIndex={isClickable ? 0 : -1}
      draggable={draggable}
      onDragStart={handleDragStartWrapper}
      onDragOver={handleDragOverWrapper}
      onDrop={onDrop}
      onDragEnd={handleDragEndWrapper}
      data-card-id={cardId}
      onTouchStart={handleTouchStartWrapper}
      onTouchMove={handleTouchMoveWrapper}
      onTouchEnd={handleTouchEndWrapper}
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