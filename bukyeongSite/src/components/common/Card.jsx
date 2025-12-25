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
}) => {

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