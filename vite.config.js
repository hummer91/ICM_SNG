import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';
import { resolve } from 'path';
import { viteSecurityPlugin } from './server-config/vite-security.js';

export default defineConfig({
  // 플러그인 설정
  plugins: [
    // 보안 헤더 플러그인
    viteSecurityPlugin(),

    // 구형 브라우저 지원
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],

  // 개발 서버 설정
  server: {
    port: 3000,
    host: true, // 네트워크에서 접근 가능
    open: true, // 브라우저 자동 열기
    hmr: {
      overlay: true, // HMR 오류 오버레이 표시
    },
  },

  // 빌드 설정
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // 청크 분할 전략
        manualChunks: {
          chart: ['chart.js'],
        },
        // 파일명 패턴
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 청크 크기 경고 임계값
    chunkSizeWarningLimit: 500,
  },

  // 경로 별칭 설정
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@js': resolve(__dirname, 'src/js'),
      '@css': resolve(__dirname, 'src/css'),
      '@data': resolve(__dirname, 'src/data'),
      '@assets': resolve(__dirname, 'public/assets'),
    },
  },

  // CSS 설정
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false,
      },
    },
  },

  // 성능 최적화
  optimizeDeps: {
    include: ['chart.js'],
  },
});
