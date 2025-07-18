# Components 폴더

이 폴더는 재사용 가능한 JavaScript 컴포넌트들을 저장하는 곳입니다.

## 폴더 구조

```
components/
├── common/          # 공통 컴포넌트들
├── ui/              # UI 컴포넌트들
└── modules/         # 기능별 모듈 컴포넌트들
```

## 컴포넌트 작성 가이드

### 1. 기본 구조

```javascript
/**
 * 컴포넌트 이름 - 설명
 */
class ComponentName {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { ...this.defaultOptions, ...options };
        this.init();
    }

    get defaultOptions() {
        return {
            // 기본 옵션들
        };
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // 이벤트 리스너 설정
    }

    render() {
        // DOM 렌더링
    }

    destroy() {
        // 정리 작업
    }
}

export default ComponentName;
```

### 2. 사용 예시

```javascript
import ComponentName from './components/ComponentName.js';

// 컴포넌트 인스턴스 생성
const component = new ComponentName(
    document.getElementById('component-container'),
    {
        option1: 'value1',
        option2: 'value2'
    }
);
```

### 3. 네이밍 규칙

- 파일명: PascalCase (예: `NavigationMenu.js`)
- 클래스명: PascalCase (예: `NavigationMenu`)
- 메서드명: camelCase (예: `handleClick`)
- 프라이빗 메서드: `_` 접두사 (예: `_privateMethod`)