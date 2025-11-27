/**
 * 학번 파싱 및 검증 유틸리티
 *
 * 학번 형식: 4자리 숫자 (예: 2611)
 * - 첫 번째 자리: 학년 (1-3)
 * - 두 번째 자리: 반 (1-9)
 * - 세-네 번째 자리: 번호 (01-99)
 *
 * 예시: 2611 = 2학년 6반 11번
 */

/**
 * 학번을 파싱하여 학년, 반, 번호로 분리
 * @param {string} studentId - 4자리 학번
 * @returns {Object} { isValid, grade, classNum, number, formatted, error }
 */
export const parseStudentId = (studentId) => {
  // 문자열로 변환
  const id = String(studentId).trim();

  // 길이 검증
  if (id.length !== 4) {
    return {
      isValid: false,
      error: '학번은 4자리여야 합니다'
    };
  }

  // 숫자 검증
  if (!/^\d{4}$/.test(id)) {
    return {
      isValid: false,
      error: '학번은 숫자만 입력 가능합니다'
    };
  }

  // 각 자리 추출
  const grade = id[0];
  const classNum = id[1];
  const number = id.slice(2);

  // 학년 검증 (1-3)
  if (grade < '1' || grade > '3') {
    return {
      isValid: false,
      error: '학년은 1-3 사이여야 합니다'
    };
  }

  // 반 검증 (1-9)
  if (classNum < '1' || classNum > '9') {
    return {
      isValid: false,
      error: '반은 1-9 사이여야 합니다'
    };
  }

  // 번호 검증 (01-99)
  const numValue = parseInt(number, 10);
  if (numValue < 1 || numValue > 99) {
    return {
      isValid: false,
      error: '번호는 01-99 사이여야 합니다'
    };
  }

  return {
    isValid: true,
    grade,
    classNum,
    number,
    formatted: `${grade}학년 ${classNum}반 ${number}번`
  };
};

/**
 * 입력값을 학번 형식으로 포맷팅 (숫자만 추출, 4자리 제한)
 * @param {string} value - 사용자 입력값
 * @returns {string} 포맷팅된 학번
 */
export const formatStudentIdInput = (value) => {
  // 숫자만 추출
  const numbers = value.replace(/\D/g, '');
  // 4자리로 제한
  return numbers.slice(0, 4);
};
