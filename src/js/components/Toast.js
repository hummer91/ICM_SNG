/**
 * 토스트 알림 컴포넌트
 * Linear 디자인 시스템의 토스트 알림 구현
 */

export class Toast {
    constructor(options = {}) {
        this.options = {
            message: options.message || '',
            type: options.type || 'info', // success, error, warning, info
            duration: options.duration || 5000,
            position: options.position || 'top-right',
            dismissible: options.dismissible !== false,
            action: options.action || null,
            onClose: options.onClose || (() => {}),
            ...options
        };

        this.element = null;
        this.timeout = null;
    }

    /**
     * 토스트 렌더링
     */
    render() {
        const toast = document.createElement('div');
        toast.className = `toast toast-${this.options.type}`;
        
        // 아이콘
        const icon = this.getIcon();
        if (icon) {
            const iconEl = document.createElement('span');
            iconEl.className = 'toast-icon';
            iconEl.innerHTML = icon;
            toast.appendChild(iconEl);
        }

        // 메시지
        const message = document.createElement('span');
        message.className = 'toast-message';
        message.textContent = this.options.message;
        toast.appendChild(message);

        // 액션 버튼
        if (this.options.action) {
            const action = document.createElement('button');
            action.className = 'toast-action';
            action.textContent = this.options.action.text;
            action.addEventListener('click', () => {
                this.options.action.onClick();
                this.close();
            });
            toast.appendChild(action);
        }

        // 닫기 버튼
        if (this.options.dismissible) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.innerHTML = '×';
            closeBtn.setAttribute('aria-label', '닫기');
            closeBtn.addEventListener('click', () => this.close());
            toast.appendChild(closeBtn);
        }

        this.element = toast;
        return toast;
    }

    /**
     * 타입별 아이콘 가져오기
     */
    getIcon() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[this.options.type] || '';
    }

    /**
     * 토스트 표시
     */
    show() {
        // 렌더링
        if (!this.element) {
            this.render();
        }

        // 컨테이너 가져오기 또는 생성
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = `toast-container ${this.options.position}`;
            document.body.appendChild(container);
        }

        // 토스트 추가
        container.appendChild(this.element);

        // 애니메이션을 위한 지연
        requestAnimationFrame(() => {
            this.element.classList.add('show');
        });

        // 자동 닫기
        if (this.options.duration > 0) {
            this.timeout = setTimeout(() => {
                this.close();
            }, this.options.duration);
        }

        return this;
    }

    /**
     * 토스트 닫기
     */
    close() {
        if (!this.element) return;

        // 타임아웃 제거
        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        this.element.classList.remove('show');

        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.options.onClose();
        }, 300);
    }

    /**
     * 정적 메서드 - 성공 토스트
     */
    static success(message, options = {}) {
        return new Toast({
            message,
            type: 'success',
            ...options
        }).show();
    }

    /**
     * 정적 메서드 - 에러 토스트
     */
    static error(message, options = {}) {
        return new Toast({
            message,
            type: 'error',
            duration: 0, // 에러는 수동으로 닫기
            ...options
        }).show();
    }

    /**
     * 정적 메서드 - 경고 토스트
     */
    static warning(message, options = {}) {
        return new Toast({
            message,
            type: 'warning',
            ...options
        }).show();
    }

    /**
     * 정적 메서드 - 정보 토스트
     */
    static info(message, options = {}) {
        return new Toast({
            message,
            type: 'info',
            ...options
        }).show();
    }

    /**
     * 모든 토스트 제거
     */
    static clearAll() {
        const container = document.getElementById('toast-container');
        if (container) {
            const toasts = container.querySelectorAll('.toast');
            toasts.forEach(toast => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            });
        }
    }
}