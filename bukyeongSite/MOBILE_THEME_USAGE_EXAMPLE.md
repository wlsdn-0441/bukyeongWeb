# 📱 useThemeColor 사용 예제

## App.jsx에 적용하기

### ✅ 최소 설정 (권장)

```javascript
// src/App.jsx
import React from 'react';
import useThemeColor from './hooks/useThemeColor';

function App() {
  // 🎨 모바일 상단 바 색상 자동 제어
  useThemeColor();

  return (
    <div className="app">
      {/* 기존 앱 콘텐츠 */}
    </div>
  );
}

export default App;
```

---

## 테마 토글 버튼과 함께 사용하기

### 📝 완전한 예제

```javascript
// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import useThemeColor from './hooks/useThemeColor';

function App() {
  // 🎨 모바일 상단 바 색상 자동 제어
  useThemeColor();

  // 현재 테마 상태 관리
  const [theme, setTheme] = useState(() => {
    // 로컬 스토리지에서 저장된 테마 불러오기
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    // 시스템 다크모드 감지
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  // 테마 변경 시 HTML 속성 업데이트
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // 테마 토글 함수
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    // ✅ useThemeColor가 자동으로 상단 바 색상 업데이트
  };

  return (
    <Router>
      <div className="app">
        {/* 테마 토글 버튼 */}
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === 'light' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
        </button>

        {/* 앱 라우트 */}
        <Routes>
          <Route path="/" element={<Home />} />
          {/* 기타 라우트... */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

---

## Context API와 함께 사용하기

### 📝 ThemeContext 패턴

```javascript
// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import useThemeColor from '../hooks/useThemeColor';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  // 🎨 모바일 상단 바 색상 자동 제어
  useThemeColor();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
```

```javascript
// src/App.jsx
import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import MainApp from './MainApp';

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

export default App;
```

```javascript
// src/components/ThemeToggleButton.jsx
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle-button">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

export default ThemeToggleButton;
```

---

## 페이지별 커스텀 색상 사용하기

### 📝 특정 페이지에서만 다른 색상 사용

```javascript
// src/pages/SpecialPage.jsx
import React from 'react';
import useThemeColor from '../hooks/useThemeColor';

function SpecialPage() {
  // 🎨 이 페이지에서만 특별한 색상 사용
  useThemeColor({
    lightColor: '#E8D5C4', // 더 밝은 베이지
    darkColor: '#1A1410',  // 더 어두운 브라운
  });

  return (
    <div className="special-page">
      <h1>특별한 페이지</h1>
      <p>이 페이지는 다른 색상을 사용합니다.</p>
    </div>
  );
}

export default SpecialPage;
```

**주의:** 페이지 이동 시 다시 기본 색상으로 돌아가지 않으므로, 라우트 구조를 고려해야 합니다.

---

## 시스템 다크모드 자동 감지만 사용하기

### 📝 토글 버튼 없이 자동으로만 동작

```javascript
// src/App.jsx
import React, { useEffect } from 'react';
import useThemeColor from './hooks/useThemeColor';

function App() {
  // 🎨 모바일 상단 바 색상 자동 제어
  useThemeColor();

  // 시스템 다크모드 변경 감지하여 data-theme 속성 업데이트
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    // 초기 설정
    updateTheme(darkModeMediaQuery);

    // 변경 감지
    darkModeMediaQuery.addEventListener('change', updateTheme);

    return () => {
      darkModeMediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  return (
    <div className="app">
      {/* 앱 콘텐츠 */}
    </div>
  );
}

export default App;
```

---

## 디버깅 & 테스트

### 🔍 현재 테마 색상 확인

```javascript
// 브라우저 개발자 도구 Console에서 실행
console.log('Current theme-color:', document.querySelector('meta[name="theme-color"]').content);
console.log('Current data-theme:', document.documentElement.getAttribute('data-theme'));
console.log('System dark mode:', window.matchMedia('(prefers-color-scheme: dark)').matches);
```

### 🧪 테마 강제 전환 (테스트용)

```javascript
// 브라우저 개발자 도구 Console에서 실행

// 다크모드로 전환
document.documentElement.setAttribute('data-theme', 'dark');

// 라이트모드로 전환
document.documentElement.setAttribute('data-theme', 'light');

// 테마 속성 제거 (시스템 설정 따름)
document.documentElement.removeAttribute('data-theme');
```

### 📱 실기기 테스트

#### iOS Safari
1. **설정 > 개발자 > 웹 속성 검사기** 활성화
2. Safari에서 앱 열기
3. Mac Safari에서 **개발 > [기기명] > [페이지]** 선택
4. Console에서 위 코드 실행

#### Android Chrome
1. **chrome://inspect** 접속
2. 디바이스 연결 후 앱 열기
3. **inspect** 버튼 클릭
4. Console에서 위 코드 실행

---

## 자주 묻는 질문 (FAQ)

### ❓ useThemeColor를 여러 컴포넌트에서 호출해도 되나요?

**답변:** 네, 가능합니다. 하지만 **App.jsx 최상단에서 한 번만 호출하는 것을 권장**합니다.

```javascript
// ✅ 권장: App.jsx에서 한 번만
function App() {
  useThemeColor();
  return <Router>...</Router>;
}

// ❌ 비권장: 여러 컴포넌트에서 호출
function Header() {
  useThemeColor(); // 불필요
  return <header>...</header>;
}
```

### ❓ 페이지 이동 시 색상이 깜빡입니다

**원인:** React Router의 페이지 전환 시 useEffect가 재실행됨

**해결:** App.jsx 최상단에서만 호출하고, 페이지 컴포넌트에서는 호출하지 않기

```javascript
// ✅ App.jsx
function App() {
  useThemeColor(); // 여기서만 호출
  return <Routes>...</Routes>;
}

// ❌ Page.jsx
function SomePage() {
  useThemeColor(); // 호출하지 않기
  return <div>...</div>;
}
```

### ❓ 빌드 후에도 작동하나요?

**답변:** 네, 프로덕션 빌드에서도 정상 작동합니다. 단, index.html의 meta 태그가 포함되어야 합니다.

```bash
# 빌드
npm run build

# dist/index.html에 meta 태그가 있는지 확인
cat dist/index.html | grep theme-color
```

### ❓ PWA로 설치 후에도 작동하나요?

**답변:** 네, PWA(Progressive Web App)로 설치한 후에도 정상 작동합니다.

```javascript
// manifest.json에도 theme_color 설정 권장
{
  "name": "부경고등학교",
  "short_name": "부경고",
  "theme_color": "#FAF7F2",
  "background_color": "#FAF7F2"
}
```

---

## 🎯 최종 체크리스트

프로젝트에 완벽하게 적용되었는지 확인하세요:

- [ ] `useThemeColor()` 훅을 App.jsx에서 import
- [ ] App 컴포넌트 최상단에서 `useThemeColor()` 호출
- [ ] 테마 토글 버튼 구현 (선택사항)
- [ ] 실기기(아이폰/안드로이드)에서 테스트
- [ ] 다크모드 전환 시 상단 바 색상 즉시 변경 확인
- [ ] 오버스크롤 시 흰색 여백 없는지 확인
- [ ] 가로 모드 시 좌우 Safe Area 색상 확인

---

**작성일:** 2025-12-28
**버전:** 1.0.0
