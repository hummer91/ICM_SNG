/**
 * HTML5 JavaScript Project - Main Script
 * 모던 JavaScript ES6+ 기능을 활용한 메인 스크립트
 */

// DOM이 완전히 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 HTML5 JavaScript Project 시작!');

    // 애플리케이션 초기화
    initializeApp();
});

/**
 * 애플리케이션 초기화 함수
 */
function initializeApp() {
    setupEventListeners();
    showWelcomeMessage();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    const demoButton = document.getElementById('demo-button');

    if (demoButton) {
        demoButton.addEventListener('click', handleDemoButtonClick);
    }

    // 키보드 이벤트 리스너
    document.addEventListener('keydown', handleKeyPress);

    // 윈도우 리사이즈 이벤트
    window.addEventListener('resize', debounce(handleWindowResize, 250));
}

/**
 * 데모 버튼 클릭 핸들러
 */
function handleDemoButtonClick() {
    const messages = [
        '안녕하세요! 👋',
        'JavaScript가 정상적으로 작동합니다! ✨',
        'HTML5 + CSS3 + JavaScript 조합이 완벽합니다! 🎉',
        'ESLint와 Prettier가 설정되어 있습니다! 🔧',
        '모던 웹 개발을 시작해보세요! 🚀'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showNotification(randomMessage, 'success');
}

/**
 * 키보드 이벤트 핸들러
 */
function handleKeyPress(event) {
    // ESC 키로 알림 닫기
    if (event.key === 'Escape') {
        hideAllNotifications();
    }

    // Ctrl + Enter로 데모 버튼 실행
    if (event.ctrlKey && event.key === 'Enter') {
        handleDemoButtonClick();
    }
}

/**
 * 윈도우 리사이즈 핸들러
 */
function handleWindowResize() {
    console.log(`윈도우 크기 변경: ${window.innerWidth}x${window.innerHeight}`);
}

/**
 * 환영 메시지 표시
 */
function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('프로젝트가 성공적으로 로드되었습니다!', 'info');
    }, 1000);
}

/**
 * 알림 표시 함수
 * @param {string} message - 표시할 메시지
 * @param {string} type - 알림 타입 (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    hideAllNotifications();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // 알림 스타일 추가
    addNotificationStyles();

    document.body.appendChild(notification);

    // 애니메이션 효과
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // 자동 제거 (5초 후)
    setTimeout(() => {
        if (notification.parentElement) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }, 5000);
}

/**
 * 모든 알림 숨기기
 */
function hideAllNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach(notification => {
        notification.remove();
    });
}

/**
 * 알림 스타일 동적 추가
 */
function addNotificationStyles() {
    if (document.getElementById('notification-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 400px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .notification.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .notification-success {
            background-color: #28a745;
        }
        
        .notification-error {
            background-color: #dc3545;
        }
        
        .notification-warning {
            background-color: #ffc107;
            color: #212529;
        }
        
        .notification-info {
            background-color: #17a2b8;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 1rem;
            padding: 0;
            line-height: 1;
        }
        
        .notification-close:hover {
            opacity: 0.7;
        }
        
        @media (max-width: 480px) {
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;

    document.head.appendChild(style);
}

/**
 * 디바운스 함수 - 이벤트 최적화
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 유틸리티 함수들
 */
const Utils = {
    /**
     * 요소 선택기
     * @param {string} selector - CSS 선택자
     * @returns {Element|null} 선택된 요소
     */
    $(selector) {
        return document.querySelector(selector);
    },

    /**
     * 복수 요소 선택기
     * @param {string} selector - CSS 선택자
     * @returns {NodeList} 선택된 요소들
     */
    $$(selector) {
        return document.querySelectorAll(selector);
    },

    /**
     * 클래스 토글
     * @param {Element} element - 대상 요소
     * @param {string} className - 토글할 클래스명
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },

    /**
     * 로컬 스토리지 헬퍼
     */
    storage: {
        set(key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },

        get(key) {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        },

        remove(key) {
            localStorage.removeItem(key);
        }
    }
};

// 전역 객체로 Utils 노출
window.Utils = Utils;
