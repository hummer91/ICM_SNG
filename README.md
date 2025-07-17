# HTML5 JavaScript 프론트엔드 프로젝트

HTML5 + Vanilla JavaScript + CSS3를 사용한 모던 프론트엔드 프로젝트입니다.

## 🚀 기능

- ✅ HTML5 시맨틱 구조
- ✅ Vanilla CSS3 스타일링 (CSS Variables, Flexbox, Grid)
- ✅ 모던 JavaScript ES6+ 기능
- ✅ ESLint & Prettier 코드 품질 관리
- ✅ 반응형 디자인
- ✅ 라이브 서버 개발 환경

## 📁 프로젝트 구조

```
├── src/
│   ├── index.html          # 메인 HTML 파일
│   ├── styles/
│   │   └── main.css        # 메인 CSS 파일
│   ├── scripts/
│   │   └── main.js         # 메인 JavaScript 파일
│   ├── assets/             # 정적 자산 (이미지, 폰트 등)
│   ├── components/         # 재사용 가능한 컴포넌트
│   └── utils/              # 유틸리티 함수들
├── package.json            # 프로젝트 설정
├── .eslintrc.js           # ESLint 설정
├── .prettierrc            # Prettier 설정
└── .gitignore             # Git 무시 파일 목록
```

## 🛠️ 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하여 프로젝트를 확인할 수 있습니다.

## 📝 사용 가능한 스크립트

- `npm start` - 라이브 서버 실행 (포트 3000)
- `npm run lint` - ESLint 검사 실행
- `npm run lint:fix` - ESLint 자동 수정
- `npm run format` - Prettier 포맷팅 실행
- `npm run format:check` - Prettier 포맷팅 검사

## 🎨 CSS 기능

### CSS Variables (커스텀 속성)
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
```

### 반응형 디자인
- Mobile: ~480px
- Tablet: ~768px
- Desktop: 1024px+

## 🔧 JavaScript 기능

### 모던 ES6+ 기능
- Arrow Functions
- Template Literals
- Destructuring
- Modules (import/export)
- Classes
- Async/Await

### 유틸리티 함수
```javascript
// DOM 선택기
Utils.$('#element-id')
Utils.$$('.class-name')

// 로컬 스토리지
Utils.storage.set('key', value)
Utils.storage.get('key')
```

## 📋 코드 품질

### ESLint 규칙
- ES2021 환경 설정
- Prettier 통합
- 코드 품질 및 스타일 규칙 적용

### Prettier 설정
- 세미콜론 사용
- 싱글 쿼트 사용
- 4스페이스 들여쓰기
- 80자 줄 길이 제한

## 🚀 배포

### 정적 호스팅
`src` 폴더의 내용을 정적 호스팅 서비스에 업로드:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### 빌드 프로세스
현재는 빌드 프로세스가 없는 순수 HTML/CSS/JS 프로젝트입니다. 필요에 따라 Webpack, Parcel 등의 번들러를 추가할 수 있습니다.

## 🤝 기여하기

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해주세요.