/**
 * ICM SNG 포커 학습 앱 - 메인 진입점
 * 
 * @module main
 */

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('ICM SNG 포커 앱 시작');
    
    // 로딩 화면 제거
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 300);
        }, 1000);
    }
    
    // 앱 컨테이너에 기본 콘텐츠 추가
    const app = document.getElementById('app');
    app.innerHTML += `
        <header class="app-header">
            <h1>ICM SNG 포커 전략</h1>
            <p class="subtitle">6인 토너먼트 Push/Fold 최적화</p>
        </header>
        
        <main class="app-main">
            <div class="container">
                <p>앱이 성공적으로 로드되었습니다!</p>
                <p>Vite + pnpm 개발 환경이 구성되었습니다.</p>
            </div>
        </main>
    `;
});

// HMR (Hot Module Replacement) 지원
if (import.meta.hot) {
    import.meta.hot.accept(() => {
        console.log('HMR 업데이트 적용됨');
    });
}