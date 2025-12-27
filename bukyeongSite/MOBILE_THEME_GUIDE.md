# 📱 모바일 완벽 테마 색상 통일 가이드

아이폰 사파리(iOS Safari)와 안드로이드 크롬 등 모든 모바일 환경에서 웹 앱의 배경색과 기기 상/하단 시스템 영역의 색상을 완벽하게 통일하는 방법입니다.

---

## 📋 목차

1. [상단 바 (Status Bar) 색상 설정](#1-상단-바-status-bar-색상-설정)
2. [노치 대응 (Notch & Home Bar)](#2-노치-대응-notch--home-bar)
3. [오버스크롤 방지 (Bounce Effect)](#3-오버스크롤-방지-bounce-effect)
4. [사파리 가로 모드 (Safe Area)](#4-사파리-가로-모드-safe-area)
5. [동적 테마 색상 제어 (React)](#5-동적-테마-색상-제어-react)
6. [완벽 적용 체크리스트](#6-완벽-적용-체크리스트)

---

## 1. 상단 바 (Status Bar) 색상 설정

### 📝 index.html

```html
<!-- 🎨 테마 색상 설정 (라이트 모드) -->
<meta name="theme-color" content="#FAF7F2" />

<!-- 🌙 다크 모드 자동 대응 -->
<meta name="theme-color" content="#2C2418" media="(prefers-color-scheme: dark)" />

<!-- 📱 iOS Safari 전용 설정 -->
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

### 🎨 색상 의미

| 테마 | 색상 코드 | 설명 |
|------|-----------|------|
| **라이트 모드** | `#FAF7F2` | 카페 베이지 크림 색상 |
| **다크 모드** | `#2C2418` | 초콜릿 브라운 색상 |

### 📱 apple-mobile-web-app-status-bar-style 옵션

| 값 | 설명 | 추천 |
|----|------|------|
| `default` | 흰색 상단 바, 검은색 텍스트 | ❌ |
| `black` | 검은색 상단 바, 흰색 텍스트 | ❌ |
| **`black-translucent`** | **투명한 상단 바, 배경색 통일** | ✅ **추천** |

---

## 2. 노치 대응 (Notch & Home Bar)

### 📝 viewport 설정

```html
<!-- viewport-fit=cover로 노치 영역까지 색상 채우기 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

### 🎯 viewport-fit 옵션

| 값 | 설명 | 결과 |
|----|------|------|
| `auto` | 기본값 (Safe Area 안쪽만) | ❌ 노치에 흰색 여백 |
| **`cover`** | **전체 화면 커버** | ✅ **노치까지 배경색 채움** |
| `contain` | Safe Area 안쪽만 (auto와 동일) | ❌ 노치에 흰색 여백 |

### 💡 작동 원리

```
❌ viewport-fit=auto (기본값)
┌─────────────────────────┐
│ ████ 노치 (흰색 여백) ████ │
├─────────────────────────┤
│                         │
│    앱 콘텐츠 영역       │
│                         │
├─────────────────────────┤
│ ████ 홈바 (흰색 여백) ████ │
└─────────────────────────┘

✅ viewport-fit=cover (권장)
┌─────────────────────────┐
│ ████ 노치 (베이지 색) ████ │ ← 배경색으로 채워짐
├─────────────────────────┤
│                         │
│    앱 콘텐츠 영역       │
│                         │
├─────────────────────────┤
│ ████ 홈바 (베이지 색) ████ │ ← 배경색으로 채워짐
└─────────────────────────┘
```

---

## 3. 오버스크롤 방지 (Bounce Effect)

### 문제: 화면을 위/아래로 당기면 흰색 여백 노출

```
사용자가 화면을 아래로 당김
      ↓
┌─────────────────────────┐
│ ▓▓▓ 흰색 여백 ▓▓▓▓▓▓▓▓▓ │ ← 원하지 않는 흰색 공간
├─────────────────────────┤
│                         │
│    앱 콘텐츠 영역       │
│                         │
└─────────────────────────┘
```

### ✅ 해결: App.css에 추가

```css
/* ============================================ */
/* Global HTML & Body Styles - 모바일 완벽 대응 */
/* ============================================ */
html {
  /* 📱 오버스크롤 방지 - 흰색 여백 제거 */
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  overscroll-behavior-x: none;

  /* 🎨 배경색 설정 (Safe Area까지 채우기) */
  background-color: var(--bg-cream); /* 라이트 모드: #FAF7F2 */
}

body {
  /* 📱 오버스크롤 방지 - Bounce 효과 제거 */
  overscroll-behavior: none;
  overscroll-behavior-y: none;
  -webkit-overflow-scrolling: touch;

  /* iOS Safari 추가 최적화 */
  position: relative;
  width: 100%;
  overflow-x: hidden;
}
```

### 📊 브라우저 지원

| 속성 | iOS Safari | Android Chrome | 설명 |
|------|-----------|----------------|------|
| `overscroll-behavior` | ✅ 13.4+ | ✅ 63+ | 표준 속성 |
| `-webkit-overflow-scrolling` | ✅ 모든 버전 | ✅ 모든 버전 | iOS 부드러운 스크롤 |

---

## 4. 사파리 가로 모드 (Safe Area)

### 문제: 가로 모드 시 좌우 흰색 여백

```
가로 모드 (Landscape)
┌─────────────────────────────────────────┐
│흰│                                   │흰│ ← 좌우 Safe Area 흰색
│색│     앱 콘텐츠 영역                │색│
│여│                                   │여│
│백│                                   │백│
└─────────────────────────────────────────┘
```

### ✅ 해결: Safe Area Inset 적용

```css
html {
  /* 📏 Safe Area 패딩 (노치/홈바 대응) */
  padding: env(safe-area-inset-top)
           env(safe-area-inset-right)
           env(safe-area-inset-bottom)
           env(safe-area-inset-left);

  /* 🎨 배경색 설정 (Safe Area까지 채우기) */
  background-color: var(--bg-cream);
}
```

### 🎯 env() 함수 설명

| 값 | 설명 | 예시 |
|----|------|------|
| `safe-area-inset-top` | 상단 노치 높이 | 아이폰 X: 44px |
| `safe-area-inset-right` | 우측 Safe Area | 가로 모드: 44px |
| `safe-area-inset-bottom` | 하단 홈바 높이 | 아이폰 X: 34px |
| `safe-area-inset-left` | 좌측 Safe Area | 가로 모드: 44px |

### 💡 작동 원리

```css
/* iOS에서 자동으로 계산됨 */
padding: 44px   /* top: 노치 */
         44px   /* right: 가로 모드 */
         34px   /* bottom: 홈바 */
         0px;   /* left: 세로 모드 */
```

---

## 5. 동적 테마 색상 제어 (React)

### 📝 useThemeColor Hook 사용법

#### 1️⃣ 훅 import

```javascript
// App.jsx
import useThemeColor from './hooks/useThemeColor';
```

#### 2️⃣ 컴포넌트에서 호출

```javascript
function App() {
  // 자동으로 테마 감지 & 상단 바 색상 업데이트
  useThemeColor();

  return (
    <div className="app">
      {/* 앱 콘텐츠 */}
    </div>
  );
}
```

#### 3️⃣ 커스텀 색상 사용 (옵션)

```javascript
function App() {
  useThemeColor({
    lightColor: '#FAF7F2', // 라이트 모드 색상
    darkColor: '#2C2418',  // 다크 모드 색상
  });

  return <div className="app">...</div>;
}
```

### 🔄 자동 감지 기능

| 감지 대상 | 설명 | 작동 방식 |
|-----------|------|-----------|
| **data-theme 속성** | 수동 테마 토글 | `<html data-theme="dark">` 감지 |
| **prefers-color-scheme** | 시스템 다크모드 | OS 설정 변경 시 자동 업데이트 |
| **실시간 업데이트** | MutationObserver 사용 | 0.1초 이내 즉시 반영 |

### 📱 테마 전환 예시

```javascript
// 테마 토글 버튼 예시
const toggleTheme = () => {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  html.setAttribute('data-theme', newTheme);
  // ✅ useThemeColor가 자동으로 상단 바 색상 업데이트
};
```

### 🧪 테스트 방법

#### iOS Safari

1. **설정 > 개발자 > 웹 속성 검사기** 활성화
2. Safari에서 웹 앱 열기
3. **설정 > 디스플레이 및 밝기** → 다크 모드 ON/OFF
4. 상단 바 색상이 즉시 변경되는지 확인 ✅

#### Android Chrome

1. **chrome://inspect** 접속
2. 디바이스 연결 후 웹 앱 열기
3. **설정 > 디스플레이 > 다크 테마** ON/OFF
4. 상단 바 색상이 즉시 변경되는지 확인 ✅

---

## 6. 완벽 적용 체크리스트

### ✅ index.html

- [ ] `<meta name="viewport" ... viewport-fit=cover>` 추가
- [ ] `<meta name="theme-color" content="#FAF7F2">` 추가
- [ ] `<meta name="theme-color" content="#2C2418" media="(prefers-color-scheme: dark)">` 추가
- [ ] `<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">` 추가

### ✅ App.css

- [ ] `html { overscroll-behavior: none; }` 추가
- [ ] `html { background-color: var(--bg-cream); }` 추가
- [ ] `html { padding: env(safe-area-inset-...); }` 추가
- [ ] `body { overscroll-behavior: none; }` 추가
- [ ] `body { overflow-x: hidden; }` 추가

### ✅ React (App.jsx)

- [ ] `useThemeColor()` 훅 import
- [ ] App 컴포넌트 최상단에서 `useThemeColor()` 호출
- [ ] 테마 토글 기능 작동 확인

### ✅ 실기기 테스트

#### iOS Safari (아이폰)
- [ ] 세로 모드: 상단/하단 베이지 색상 확인
- [ ] 가로 모드: 좌우 베이지 색상 확인
- [ ] 위로 당기기: 흰색 여백 없는지 확인
- [ ] 아래로 당기기: 흰색 여백 없는지 확인
- [ ] 다크모드 전환: 상단 바 색상 즉시 변경 확인

#### Android Chrome
- [ ] 세로 모드: 상단 베이지 색상 확인
- [ ] 가로 모드: 좌우 베이지 색상 확인
- [ ] 위로 당기기: 흰색 여백 없는지 확인
- [ ] 아래로 당기기: 흰색 여백 없는지 확인
- [ ] 다크모드 전환: 상단 바 색상 즉시 변경 확인

---

## 🎨 현재 프로젝트 테마 색상

| 테마 | 배경색 (hex) | RGB | 설명 |
|------|-------------|-----|------|
| **라이트** | `#FAF7F2` | `rgb(250, 247, 242)` | 카페 베이지 크림 |
| **다크** | `#2C2418` | `rgb(44, 36, 24)` | 초콜릿 브라운 |

---

## 🔧 문제 해결 (Troubleshooting)

### ❓ 상단 바 색상이 안 바뀌어요

**원인:** meta 태그가 중복되었거나 잘못된 위치에 있음

**해결:**
```javascript
// 개발자 도구 Console에서 확인
document.querySelector('meta[name="theme-color"]').content
// 결과: "#FAF7F2" 또는 "#2C2418"

// 만약 "#ffffff"가 나온다면 useThemeColor() 호출 확인
```

### ❓ 오버스크롤 시 여전히 흰색 여백이 보여요

**원인:** CSS가 제대로 적용되지 않음

**해결:**
```css
/* 개발자 도구 Elements에서 확인 */
html {
  overscroll-behavior: none; /* ← 이 속성이 있는지 확인 */
  background-color: #FAF7F2; /* ← 배경색이 설정되어 있는지 확인 */
}
```

### ❓ Safe Area 패딩이 적용되지 않아요

**원인:** viewport-fit=cover 누락

**해결:**
```html
<!-- index.html에서 확인 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
                                                                        ↑
                                                                  이 부분 확인
```

### ❓ iOS에서만 가로 모드 시 흰색 여백이 생겨요

**원인:** env(safe-area-inset-*) 누락

**해결:**
```css
html {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
  /* ↑ 4개 값 모두 설정해야 함 */
}
```

---

## 📚 추가 자료

### 공식 문서
- [MDN - theme-color](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color)
- [Apple - Configuring Web Applications](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [MDN - overscroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior)
- [MDN - env()](https://developer.mozilla.org/en-US/docs/Web/CSS/env)

### 브라우저 지원
- iOS Safari: 15.0+ (권장 16.0+)
- Android Chrome: 73+ (권장 최신 버전)
- Samsung Internet: 11+ (권장 최신 버전)

---

## 🎯 최종 결과

모든 설정을 완료하면 다음과 같은 결과를 얻습니다:

✅ **iOS Safari (아이폰)**
- 상단 노치까지 베이지 색상 통일
- 하단 홈바까지 베이지 색상 통일
- 가로 모드 좌우 Safe Area 베이지 색상
- 오버스크롤 시 흰색 여백 없음
- 다크모드 자동 전환 (초콜릿 브라운)

✅ **Android Chrome**
- 상단 Status Bar 베이지 색상
- Navigation Bar 베이지 색상
- 오버스크롤 시 흰색 여백 없음
- 다크모드 자동 전환 (초콜릿 브라운)

✅ **모든 모바일 브라우저**
- 실시간 테마 전환 (<100ms)
- 시스템 다크모드 자동 감지
- 완벽한 색상 통일 경험 🎨

---

**작성일:** 2025-12-28
**프로젝트:** 부경고등학교 포털 (Cafe Beige Theme)
**버전:** 1.0.0
