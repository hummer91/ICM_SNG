# Utils 폴더

이 폴더는 유틸리티 함수들과 헬퍼 모듈들을 저장하는 곳입니다.

## 폴더 구조

```
utils/
├── helpers.js       # 일반적인 헬퍼 함수들
├── api.js           # API 관련 유틸리티
├── storage.js       # 로컬 스토리지 헬퍼
├── validation.js    # 유효성 검사 함수들
└── constants.js     # 상수 정의
```

## 유틸리티 작성 가이드

### 1. 헬퍼 함수 예시

```javascript
/**
 * 문자열 유틸리티
 */
export const StringUtils = {
    /**
     * 문자열 첫 글자를 대문자로 변환
     * @param {string} str - 변환할 문자열
     * @returns {string} 변환된 문자열
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * 문자열을 kebab-case로 변환
     * @param {string} str - 변환할 문자열
     * @returns {string} kebab-case 문자열
     */
    toKebabCase(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }
};
```

### 2. 상수 정의 예시

```javascript
/**
 * 애플리케이션 상수
 */
export const CONSTANTS = {
    API_BASE_URL: 'https://api.example.com',
    LOCAL_STORAGE_KEYS: {
        USER_PREFERENCES: 'user_preferences',
        THEME: 'theme'
    },
    BREAKPOINTS: {
        MOBILE: 480,
        TABLET: 768,
        DESKTOP: 1024
    }
};
```

### 3. 사용 방법

```javascript
import { StringUtils } from './utils/helpers.js';
import { CONSTANTS } from './utils/constants.js';

// 헬퍼 함수 사용
const title = StringUtils.capitalize('hello world');

// 상수 사용
const apiUrl = CONSTANTS.API_BASE_URL;
```