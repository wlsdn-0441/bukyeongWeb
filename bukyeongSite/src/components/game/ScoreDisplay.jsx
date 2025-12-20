/**
 * Score Display Component
 *
 * Displays game score with type and visual styling
 */

import './ScoreDisplay.css';

export default function ScoreDisplay({ gameType, score, size = 'large', showLabel = true }) {
  const formatScore = (type, value) => {
    if (type === 'reaction') {
      return `${value}ms`;
    }
    return value;
  };

  const getGameTypeLabel = (type) => {
    const labels = {
      reaction: '반응속도 게임'
    };
    return labels[type] || type;
  };

  return (
    <div className={`score-display score-display-${size}`}>
      {showLabel && (
        <div className="score-label">{getGameTypeLabel(gameType)}</div>
      )}
      <div className="score-value">{formatScore(gameType, score)}</div>
      {size === 'large' && (
        <div className="score-description">
          {gameType === 'reaction' && '낮을수록 좋아요!'}
        </div>
      )}
    </div>
  );
}
