/**
 * 카드 순서 관리 서비스
 *
 * localStorage 기반으로 대시보드 카드 순서를 저장하고 관리합니다.
 */

const STORAGE_KEY = 'bukyeongDashboardCardOrder';
const DEFAULT_ORDER = [1, 2, 3, 4];

/**
 * localStorage에서 카드 순서 로드
 * @returns {Array<number>} 카드 ID 배열 [1, 2, 3, 4]
 */
export const loadCardOrderFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('[CardOrderService] localStorage에 저장된 순서 없음 - 기본 순서 사용');
      return DEFAULT_ORDER;
    }

    const parsed = JSON.parse(data);
    console.log('[CardOrderService] localStorage에서 카드 순서 로드:', parsed.order);
    return parsed.order || DEFAULT_ORDER;
  } catch (error) {
    console.error('[CardOrderService] localStorage 읽기 실패:', error);
    return DEFAULT_ORDER;
  }
};

/**
 * localStorage에 카드 순서 저장
 * @param {Array<number>} order - 카드 ID 배열
 */
export const saveCardOrderToStorage = (order) => {
  try {
    const data = {
      version: 1,
      order,
      lastModified: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('[CardOrderService] 카드 순서 저장 완료:', order);
  } catch (error) {
    console.error('[CardOrderService] localStorage 저장 실패:', error);

    // Fallback: sessionStorage 사용 (시크릿 모드 대응)
    try {
      const data = {
        version: 1,
        order,
        lastModified: new Date().toISOString()
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.warn('[CardOrderService] sessionStorage로 fallback 저장 완료');
    } catch (sessionError) {
      console.error('[CardOrderService] sessionStorage 저장도 실패:', sessionError);
    }
  }
};

/**
 * 기본 순서로 리셋
 * @returns {Array<number>} 기본 카드 순서
 */
export const resetCardOrderToDefault = () => {
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY); // sessionStorage도 정리
  console.log('[CardOrderService] 기본 순서로 리셋');
  return DEFAULT_ORDER;
};
