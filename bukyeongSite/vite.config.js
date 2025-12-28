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
            // 'maskable'을 제거하고 'any'만 남겨서 원본 비율을 유지하도록 합니다.
            purpose: 'any'
          }
        ]
      },
      // 개발 모드에서도 PWA 활성화 (테스트 시 true로 변경 가능)
      devOptions: {
        enabled: false
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https?:\/\/(firestore\.googleapis\.com|.*\.firebaseio\.com|identitytoolkit\.googleapis\.com|securetoken\.googleapis\.com).*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: ({ request }) => request.mode === 'navigate' && request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: ({ url, request }) => {
              return url.pathname.includes('/api/') && request.method === 'GET';
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: ({ url, request }) => {
              return /\.(?:js|css|woff|woff2|ttf|otf)$/i.test(url.pathname) && request.method === 'GET';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ url, request }) => {
              return /\.(?:png|jpg|jpeg|svg|gif|webp)$/i.test(url.pathname) && request.method === 'GET';
            },
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
    }),
  ],

  build: {
    rollupOptions: {
      output: {
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
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