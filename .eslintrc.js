module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: [
        'eslint:recommended',
        'prettier'
    ],
    plugins: [
        'prettier'
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
        // Prettier 관련 규칙
        'prettier/prettier': 'error',
        
        // 일반적인 JavaScript 규칙
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'warn',
        
        // 코드 품질 규칙
        'prefer-const': 'error',
        'no-var': 'error',
        'prefer-arrow-callback': 'error',
        'arrow-spacing': 'error',
        'prefer-template': 'error',
        
        // 함수 관련 규칙
        'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
        'no-unused-expressions': 'error',
        
        // 객체 및 배열 관련 규칙
        'object-shorthand': 'error',
        'prefer-destructuring': ['error', {
            array: true,
            object: true
        }],
        
        // 세미콜론 규칙
        'semi': ['error', 'always'],
        
        // 따옴표 규칙
        'quotes': ['error', 'single', { avoidEscape: true }],
        
        // 들여쓰기 규칙
        'indent': ['error', 4, { SwitchCase: 1 }],
        
        // 기타 스타일 규칙
        'comma-dangle': ['error', 'never'],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
    },
    globals: {
        // 전역 변수 정의
        'Utils': 'readonly'
    }
};