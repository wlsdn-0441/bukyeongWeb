import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'

import App from './App.jsx'
import "./App.css"

// Service Worker 등록 및 업데이트 감지
if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(swUrl, registration) {
      console.log('[PWA] Service Worker 등록됨:', swUrl);

      // 1시간마다 업데이트 확인
      if (registration) {
        setInterval(() => {
          console.log('[PWA] Service Worker 업데이트 확인 중...');
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      console.log('[PWA] 새로운 콘텐츠 사용 가능 - 자동 업데이트 중...');
      // 자동으로 새로운 Service Worker 활성화
      window.location.reload();
    },
    onOfflineReady() {
      console.log('[PWA] 오프라인 사용 준비 완료');
    },
    onRegisterError(error) {
      console.error('[PWA] Service Worker 등록 실패:', error);
    },
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
