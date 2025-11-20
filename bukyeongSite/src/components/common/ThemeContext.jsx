import { useState, useEffect } from "react";
import "./ThemeContext.css";

function ThemeToggle() {
  // ✅ 1. 초기 테마 설정: localStorage → OS 설정 → 기본값(light)
  const getInitialTheme = () => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    // OS 다크모드 감지
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // ✅ 2. 테마 변경 시 <html>에 적용 + 저장
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ✅ 3. 토글 함수
  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  // ✅ 4. UI 구성
  const isDark = theme === "dark";
  const icon = isDark ? "🌙" : "☀️";
  const label = isDark ? "라이트 모드로 변경" : "다크 모드로 변경";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span className="theme-icon" role="img" aria-label={label}>
        {icon}
      </span>
      <span className="theme-label">{isDark ? "라이트" : "다크"}</span>
    </button>
  );
}

export { ThemeToggle };

// 컴포넌트 외부에서 불러오려면 {} 로 감싸서 사용합니다.
// 불러오는 코드 예시 
// import {ThemeToggle} from "../common/ThemeContext";