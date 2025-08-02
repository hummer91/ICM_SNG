import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  test: {
    // 테스트 환경
    environment: 'happy-dom',
    
    // 글로벌 설정
    globals: true,
    
    // 커버리지 설정
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.js',
        '**/*.config.ts',
        '**/demo.js',
        'src/js/demo.js'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    
    // 셋업 파일
    setupFiles: ['./src/tests/setup.js'],
    
    // 테스트 포함 패턴
    include: [
      'src/**/*.{test,spec}.js',
      'src/tests/**/*.{test,spec}.js'
    ],
    
    // 테스트 제외 패턴
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.cache'
    ]
  },
  
  // 경로 별칭 설정 (vite.config.js와 동일하게)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@js': path.resolve(__dirname, './src/js'),
      '@css': path.resolve(__dirname, './src/css'),
      '@data': path.resolve(__dirname, './src/data'),
      '@assets': path.resolve(__dirname, './public/assets'),
      '@components': path.resolve(__dirname, './src/js/components')
    }
  }
});