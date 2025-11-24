import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '부경고등학교 학생 포털',
        short_name: '부경고',
        description: '부경고등학교 급식표, 시간표 등을 확인할 수 있는 학생 포털',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Service Worker 캐싱 전략
        runtimeCaching: [
          {
            // API 요청 캐싱 (NetworkFirst 전략)
            urlPattern: /^https?:\/\/.*\/api\/.*/i,
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
            // 정적 파일 캐싱 (CacheFirst 전략)
            urlPattern: /\.(?:js|css|woff|woff2|ttf|otf)$/i,
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
            // 이미지 캐싱 (CacheFirst 전략)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
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
        // - 브라우저 캐싱 최적화 (라이브러리는 변경 빈도 낮음)
        // - 병렬 다운로드 가능 (HTTP/2)
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // React 관련 라이브러리는 react-vendor로 분리
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // React Query는 query-vendor로 분리
            if (id.includes('@tanstack')) {
              return 'query-vendor';
            }
            // Lucide 아이콘은 icons로 분리
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // 나머지 라이브러리는 vendor로 분리
            return 'vendor';
          }
        },
      },
    },

    // Minification: Terser 사용 (esbuild보다 압축률 높음)
    minify: 'terser',
    terserOptions: {
      compress: {
        // 프로덕션 환경에서 console 제거 (번들 크기 감소)
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
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
