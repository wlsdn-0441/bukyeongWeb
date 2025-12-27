/**
 * useThemeColor Hook
 *
 * 모바일 브라우저의 상단 바(Status Bar) 색상을 동적으로 제어합니다.
 * - iOS Safari: meta[name="theme-color"]
 * - Android Chrome: meta[name="theme-color"]
 * - 다크모드 자동 대응
 *
 * @example
 * // App.jsx에서 사용
 * import useThemeColor from './hooks/useThemeColor';
 *
 * function App() {
 *   useThemeColor(); // 자동으로 테마에 맞게 색상 업데이트
 *   return <div>...</div>;
 * }
 */

import { useEffect } from 'react';

// 테마 색상 정의
const THEME_COLORS = {
  light: '#FAF7F2', // 카페 베이지 라이트 모드
  dark: '#2C2418',  // 카페 베이지 다크 모드 (초콜릿 브라운)
};

/**
 * 메타 태그의 theme-color를 업데이트하는 함수
 * @param {string} color - HEX 색상 코드
 */
const updateThemeColor = (color) => {
  // 기존 theme-color 메타 태그 찾기
  let metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])');

  if (metaThemeColor) {
    // 이미 존재하면 업데이트
    metaThemeColor.setAttribute('content', color);
  } else {
    // 없으면 새로 생성
    metaThemeColor = document.createElement('meta');
    metaThemeColor.name = 'theme-color';
    metaThemeColor.content = color;
    document.head.appendChild(metaThemeColor);
  }

  // iOS Safari 추가 대응: apple-mobile-web-app-status-bar-style
  let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) {
    // black-translucent: 상단 바가 투명하면서 배경색 반영
    appleStatusBar.setAttribute('content', 'black-translucent');
  }
};

/**
 * 현재 테마(light/dark) 감지 함수
 * @returns {'light' | 'dark'}
 */
const getCurrentTheme = () => {
  // 1순위: data-theme 속성 확인 (수동 테마 토글)
  const htmlElement = document.documentElement;
  const dataTheme = htmlElement.getAttribute('data-theme');

  if (dataTheme === 'light' || dataTheme === 'dark') {
    return dataTheme;
  }

  // 2순위: 시스템 다크모드 감지
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  // 기본값: 라이트 모드
  return 'light';
};

/**
 * useThemeColor Hook
 *
 * 자동으로 테마 변경을 감지하고 상단 바 색상을 업데이트합니다.
 *
 * @param {Object} options - 옵션 객체
 * @param {string} options.lightColor - 라이트 모드 색상 (기본: #FAF7F2)
 * @param {string} options.darkColor - 다크 모드 색상 (기본: #2C2418)
 */
const useThemeColor = (options = {}) => {
  const lightColor = options.lightColor || THEME_COLORS.light;
  const darkColor = options.darkColor || THEME_COLORS.dark;

  useEffect(() => {
    // 초기 theme-color 설정
    const theme = getCurrentTheme();
    const color = theme === 'dark' ? darkColor : lightColor;
    updateThemeColor(color);

    // MutationObserver: data-theme 속성 변경 감지
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = getCurrentTheme();
          const newColor = newTheme === 'dark' ? darkColor : lightColor;
          updateThemeColor(newColor);
        }
      });
    });

    // html 요소의 data-theme 속성 변경 감시
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // 시스템 다크모드 변경 감지 (prefers-color-scheme)
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleDarkModeChange = (e) => {
      // data-theme이 설정되어 있지 않을 때만 시스템 설정 따름
      const htmlElement = document.documentElement;
      const dataTheme = htmlElement.getAttribute('data-theme');

      if (!dataTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        const newColor = newTheme === 'dark' ? darkColor : lightColor;
        updateThemeColor(newColor);
      }
    };

    // iOS Safari 및 구형 브라우저 호환성 체크
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
    } else if (darkModeMediaQuery.addListener) {
      // 구형 Safari 대응
      darkModeMediaQuery.addListener(handleDarkModeChange);
    }

    // Cleanup
    return () => {
      observer.disconnect();

      if (darkModeMediaQuery.removeEventListener) {
        darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
      } else if (darkModeMediaQuery.removeListener) {
        darkModeMediaQuery.removeListener(handleDarkModeChange);
      }
    };
  }, [lightColor, darkColor]);
};

export default useThemeColor;
