# Assets 폴더

이 폴더는 프로젝트의 정적 자산들을 저장하는 곳입니다.

## 폴더 구조

```
assets/
├── images/          # 이미지 파일들 (PNG, JPG, SVG 등)
├── fonts/           # 웹폰트 파일들
├── icons/           # 아이콘 파일들
└── documents/       # 문서 파일들 (PDF 등)
```

## 사용 방법

HTML에서 자산을 참조할 때는 상대 경로를 사용하세요:

```html
<!-- 이미지 -->
<img src="assets/images/logo.png" alt="로고">

<!-- 아이콘 -->
<img src="assets/icons/menu.svg" alt="메뉴">
```

CSS에서 자산을 참조할 때:

```css
/* 배경 이미지 */
.hero {
    background-image: url('../assets/images/hero-bg.jpg');
}

/* 웹폰트 */
@font-face {
    font-family: 'CustomFont';
    src: url('../assets/fonts/custom-font.woff2') format('woff2');
}
```