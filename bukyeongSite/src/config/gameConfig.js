/**
 * Game Configuration
 *
 * 모든 게임 타입의 설정을 중앙에서 관리
 * 각 게임의 점수 비교 로직, 단위, 표시 정보 등을 정의
 */

export const GAME_CONFIG = {
  reaction: {
    id: 'reaction',
    name: '반응속도 게임',
    icon: '⚡',
    unit: 'ms',
    betterWhen: 'lower',
    desc: '낮을수록 좋음',
    color: '#C89F77',
    compareScores: (newScore, currentBest) => newScore < currentBest
  },
  color: {
    id: 'color',
    name: '색깔 찾기 게임',
    icon: '🎨',
    unit: '점',
    betterWhen: 'higher',
    desc: '높을수록 좋음',
    color: '#A67C52',
    compareScores: (newScore, currentBest) => newScore > currentBest
  },
  memory: {
    id: 'memory',
    name: '기억력 게임',
    icon: '🧠',
    unit: '점',
    betterWhen: 'higher',
    desc: '높을수록 좋음',
    color: '#8B6F47',
    compareScores: (newScore, currentBest) => newScore > currentBest
  },
  balloon: {
    id: 'balloon',
    name: '풍선 터뜨리기 게임',
    icon: '🎈',
    unit: '점',
    betterWhen: 'higher',
    desc: '높을수록 좋음',
    color: '#D4A574',
    compareScores: (newScore, currentBest) => newScore > currentBest
  }
};

/**
 * Helper: 새 점수가 최고 점수인지 확인
 *
 * @param {string} gameType - 게임 타입 (reaction, color, memory, balloon)
 * @param {number} newScore - 새로 제출된 점수
 * @param {number} currentBest - 현재 최고 점수
 * @returns {boolean} 새 점수가 더 좋으면 true
 */
export const isNewBestScore = (gameType, newScore, currentBest) => {
  // 기존 점수가 없으면 무조건 최고 점수
  if (!currentBest) return true;

  const config = GAME_CONFIG[gameType];
  if (!config) {
    console.warn(`[GameConfig] Unknown game type: ${gameType}, defaulting to 'higher is better'`);
    return newScore > currentBest;
  }

  return config.compareScores(newScore, currentBest);
};

/**
 * 모든 게임 타입 목록 반환
 * @returns {string[]} 게임 타입 배열
 */
export const getAllGameTypes = () => Object.keys(GAME_CONFIG);

/**
 * 특정 게임의 설정 가져오기
 * @param {string} gameType - 게임 타입
 * @returns {Object|null} 게임 설정 객체 또는 null
 */
export const getGameConfig = (gameType) => GAME_CONFIG[gameType] || null;

/**
 * 부스 게임의 gameType을 메인 사이트 형식으로 변환
 *
 * 부스 게임에서는 'colorfind'를 사용하지만, 메인 사이트에서는 'color'를 사용
 * 이 함수가 자동으로 변환하여 호환성을 보장합니다.
 *
 * @param {string} gameType - 원본 게임 타입
 * @returns {string} 정규화된 게임 타입
 *
 * @example
 * normalizeGameType('colorfind') // returns 'color'
 * normalizeGameType('color') // returns 'color'
 * normalizeGameType('reaction') // returns 'reaction'
 */
export const normalizeGameType = (gameType) => {
  const mapping = {
    'colorfind': 'color',  // 부스 게임 호환
    'color': 'color',
    'reaction': 'reaction',
    'memory': 'memory',
    'balloon': 'balloon',
    'quiz': 'memory'  // 퀴즈 게임을 기억력으로 매핑 (필요시)
  };

  const normalized = mapping[gameType] || gameType;

  // 개발 모드에서 변환 로그 출력
  if (normalized !== gameType) {
    console.log(`[GameConfig] gameType normalized: '${gameType}' → '${normalized}'`);
  }

  return normalized;
};
