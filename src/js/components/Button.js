/**
 * 버튼 컴포넌트
 * Linear 디자인 시스템의 버튼 스타일과 동작 구현
 */

export class Button {
    constructor(options = {}) {
        this.options = {
            text: options.text || 'Button',
            variant: options.variant || 'primary', // primary, secondary, ghost, outline
            size: options.size || 'md', // sm, md, lg
            icon: options.icon || null,
            disabled: options.disabled || false,
            loading: options.loading || false,
            onClick: options.onClick || (() => {}),
            className: options.className || '',
            ...options
        };
    }

    /**
     * 버튼 엘리먼트 생성
     */
    render() {
        const button = document.createElement('button');
        
        // 클래스 설정
        const classes = [
            'btn',
            `btn-${this.options.variant}`,
            `btn-${this.options.size}`,
            this.options.className
        ].filter(Boolean).join(' ');
        
        button.className = classes;
        
        // 속성 설정
        button.disabled = this.options.disabled || this.options.loading;
        
        // 내용 설정
        if (this.options.loading) {
            button.innerHTML = `
                <span class="btn-spinner"></span>
                <span>Loading...</span>
            `;
        } else {
            let content = '';
            if (this.options.icon) {
                content += `<span class="btn-icon">${this.options.icon}</span>`;
            }
            content += `<span>${this.options.text}</span>`;
            button.innerHTML = content;
        }
        
        // 이벤트 리스너
        button.addEventListener('click', (e) => {
            if (!this.options.disabled && !this.options.loading) {
                // 리플 효과 추가
                this.createRipple(e, button);
                this.options.onClick(e);
            }
        });
        
        return button;
    }

    /**
     * 리플 효과 생성
     */
    createRipple(event, button) {
        const ripple = document.createElement('span');
        ripple.classList.add('btn-ripple');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * 버튼 상태 업데이트
     */
    update(options) {
        Object.assign(this.options, options);
        return this.render();
    }

    /**
     * 정적 팩토리 메서드
     */
    static create(options) {
        return new Button(options).render();
    }

    /**
     * 버튼 그룹 생성
     */
    static createGroup(buttons, options = {}) {
        const group = document.createElement('div');
        group.className = `btn-group ${options.className || ''}`;
        
        buttons.forEach(btnOptions => {
            group.appendChild(Button.create(btnOptions));
        });
        
        return group;
    }
}