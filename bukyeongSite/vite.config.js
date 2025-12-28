import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // 아이콘 파일을 캐시 목록에 추가합니다.
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png', 'icon-512x512.png'],
      manifest: {
        name: '부경고등학교 학생 포털',
        short_name: '부경고',
        description: '부경고등학교 급식표, 시간표 등을 확인할 수 있는 학생 포털',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      // 개발 모드에서도 PWA 활성화 (테스트용)
      devOptions: {
        enabled: false
      },
      workbox: {
        // 즉시 새 Service Worker 활성화
        skipWaiting: true,
        clientsClaim: true,
        // 캐시 정리 전략
        cleanupOutdatedCaches: true,
        // 네비게이션 요청은 네트워크 우선으로 처리
        navigateFallbackDenylist: [/^\/api/],
        // Service Worker 캐싱 전략
        runtimeCaching: [
          {
            // ⚠️ 모든 POST/PUT/DELETE 요청은 절대 캐싱하지 않음 (최우선 규칙)
            urlPattern: ({ request }) => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method),
            handler: 'NetworkOnly',
          },
          {
            // Firebase/Firestore 요청은 캐싱하지 않음 (모든 메서드)
            urlPattern: /^https?:\/\/(firestore\.googleapis\.com|.*\.firebaseio\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com).*/i,
            handler: 'NetworkOnly',
          },
          {
            // HTML 문서는 항상 네트워크 우선 (GET 요청만, 캐시 불일치 방지)
            urlPattern: ({ request }) => request.mode === 'navigate' && request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 24시간
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // API 요청 캐싱 (GET 요청만)
            urlPattern: ({ url, request }) => {
              return url.pathname.includes('/api/') && request.method === 'GET';
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24시간
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // 정적 파일 캐싱 (GET 요청만)
            urlPattern: ({ url, request }) => {
              return /\.(?:js|css|woff|woff2|ttf|otf)$/i.test(url.pathname) && request.method === 'GET';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30일
              },
            },
          },
          {
            // 이미지 캐싱 (GET 요청만)
            urlPattern: ({ url, request }) => {
              return /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname) && request.method === 'GET';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
              },
            },
          },
        ],
      },
    }),
  ],

  // ============================================
  // 번들 최적화 설정
  // ============================================
  build: {
    rollupOptions: {
      output: {
        // 코드 스플리팅: 라이브러리별로 청크 분리
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            return 'vendor';
          }
        },
      },
    },

    // Minification: Terser 사용 (esbuild보다 압축률 높음)
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,  // ✅ console.log 유지
        drop_debugger: false, // ✅ debugger 유지
      },
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})