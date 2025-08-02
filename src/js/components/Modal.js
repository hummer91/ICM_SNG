/**
 * 모달 컴포넌트
 * Linear 디자인 시스템의 모달 대화상자 구현
 */

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || '',
            content: options.content || '',
            footer: options.footer || null,
            size: options.size || 'medium', // small, medium, large, fullscreen
            closable: options.closable !== false,
            closeOnOverlay: options.closeOnOverlay !== false,
            closeOnEsc: options.closeOnEsc !== false,
            onOpen: options.onOpen || (() => {}),
            onClose: options.onClose || (() => {}),
            className: options.className || '',
            ...options
        };

        this.isOpen = false;
        this.element = null;
        this.focusableElements = [];
        this.lastFocusedElement = null;
    }

    /**
     * 모달 렌더링
     */
    render() {
        // 오버레이
        const overlay = document.createElement('div');
        overlay.className = `modal-overlay ${this.options.className}`;
        
        if (this.options.closeOnOverlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });
        }

        // 모달 콘텐츠
        const modal = document.createElement('div');
        modal.className = `modal-content modal-${this.options.size}`;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        
        if (this.options.title) {
            modal.setAttribute('aria-labelledby', 'modal-title');
        }

        // 헤더
        if (this.options.title || this.options.closable) {
            const header = document.createElement('div');
            header.className = 'modal-header';

            if (this.options.title) {
                const title = document.createElement('h2');
                title.id = 'modal-title';
                title.className = 'modal-title';
                title.textContent = this.options.title;
                header.appendChild(title);
            }

            if (this.options.closable) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close';
                closeBtn.innerHTML = '×';
                closeBtn.setAttribute('aria-label', '닫기');
                closeBtn.addEventListener('click', () => this.close());
                header.appendChild(closeBtn);
            }

            modal.appendChild(header);
        }

        // 바디
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        }
        
        modal.appendChild(body);

        // 푸터
        if (this.options.footer) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            if (typeof this.options.footer === 'string') {
                footer.innerHTML = this.options.footer;
            } else if (this.options.footer instanceof HTMLElement) {
                footer.appendChild(this.options.footer);
            } else if (Array.isArray(this.options.footer)) {
                // 버튼 배열인 경우
                this.options.footer.forEach(btn => {
                    const button = document.createElement('button');
                    button.className = `btn btn-${btn.variant || 'secondary'} btn-${btn.size || 'md'}`;
                    button.textContent = btn.text;
                    button.addEventListener('click', (e) => btn.onClick(e, this));
                    footer.appendChild(button);
                });
            }
            
            modal.appendChild(footer);
        }

        overlay.appendChild(modal);
        this.element = overlay;
        this.modalContent = modal;
        
        return overlay;
    }

    /**
     * 모달 열기
     */
    open() {
        if (this.isOpen) return;

        // 렌더링
        if (!this.element) {
            this.render();
        }

        // DOM에 추가
        const container = document.getElementById('modal-container') || document.body;
        container.appendChild(this.element);

        // 포커스 관리
        this.lastFocusedElement = document.activeElement;
        this.setupFocusTrap();

        // 애니메이션을 위한 지연
        requestAnimationFrame(() => {
            this.element.classList.add('active');
            this.focusFirstElement();
        });

        // ESC 키 리스너
        if (this.options.closeOnEsc) {
            this.escListener = (e) => {
                if (e.key === 'Escape') {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escListener);
        }

        // 바디 스크롤 방지
        document.body.style.overflow = 'hidden';

        this.isOpen = true;
        this.options.onOpen();
    }

    /**
     * 모달 닫기
     */
    close() {
        if (!this.isOpen) return;

        this.element.classList.remove('active');

        // 애니메이션 완료 후 제거
        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }

            // 포커스 복원
            if (this.lastFocusedElement) {
                this.lastFocusedElement.focus();
            }

            // 바디 스크롤 복원
            document.body.style.overflow = '';

            this.isOpen = false;
            this.options.onClose();
        }, 300);

        // ESC 리스너 제거
        if (this.escListener) {
            document.removeEventListener('keydown', this.escListener);
        }
    }

    /**
     * 포커스 트랩 설정
     */
    setupFocusTrap() {
        this.focusableElements = this.modalContent.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        if (this.focusableElements.length === 0) return;

        this.firstFocusable = this.focusableElements[0];
        this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

        this.modalContent.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === this.firstFocusable) {
                    e.preventDefault();
                    this.lastFocusable.focus();
                }
            } else {
                if (document.activeElement === this.lastFocusable) {
                    e.preventDefault();
                    this.firstFocusable.focus();
                }
            }
        });
    }

    /**
     * 첫 번째 요소에 포커스
     */
    focusFirstElement() {
        if (this.focusableElements.length > 0) {
            this.firstFocusable.focus();
        }
    }

    /**
     * 정적 팩토리 메서드
     */
    static create(options) {
        const modal = new Modal(options);
        return modal;
    }

    /**
     * 확인 대화상자
     */
    static confirm(options) {
        const modal = new Modal({
            title: options.title || '확인',
            content: options.message || '계속하시겠습니까?',
            size: 'small',
            footer: [
                {
                    text: options.cancelText || '취소',
                    variant: 'secondary',
                    onClick: (e, modal) => {
                        modal.close();
                        if (options.onCancel) options.onCancel();
                    }
                },
                {
                    text: options.confirmText || '확인',
                    variant: 'primary',
                    onClick: (e, modal) => {
                        modal.close();
                        if (options.onConfirm) options.onConfirm();
                    }
                }
            ]
        });
        
        modal.open();
        return modal;
    }

    /**
     * 알림 대화상자
     */
    static alert(options) {
        const modal = new Modal({
            title: options.title || '알림',
            content: options.message || '',
            size: 'small',
            footer: [
                {
                    text: options.buttonText || '확인',
                    variant: 'primary',
                    onClick: (e, modal) => {
                        modal.close();
                        if (options.onClose) options.onClose();
                    }
                }
            ]
        });
        
        modal.open();
        return modal;
    }
}