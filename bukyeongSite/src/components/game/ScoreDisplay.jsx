/**
 * Score Display Component
 *
 * Displays game score with type and visual styling
 * Supports all game types (reaction, color, memory, balloon)
 */

import { GAME_CONFIG } from '../../config/gameConfig';
import './ScoreDisplay.css';

export default function ScoreDisplay({ gameType, score, size = 'large', showLabel = true }) {
  const formatScore = (type, value) => {
    const config = GAME_CONFIG[type];
    if (!config) return value;
    return `${value}${config.unit}`;
  };

  const getGameTypeLabel = (type) => {
    const config = GAME_CONFIG[type];
    return config?.name || type;
  };

  const getScoreDescription = (type) => {
    const config = GAME_CONFIG[type];
    if (!config) return '';
    return config.betterWhen === 'lower' ? '낮을수록 좋아요!' : '높을수록 좋아요!';
  };

  return (
    <div className={`score-display score-display-${size}`}>
      {showLabel && (
        <div className="score-label">{getGameTypeLabel(gameType)}</div>
      )}
      <div className="score-value">{formatScore(gameType, score)}</div>
      {size === 'large' && (
        <div className="score-description">
          {getScoreDescription(gameType)}
        </div>
      )}
    </div>
  );
}
