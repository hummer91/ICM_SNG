/**
 * 입력 필드 컴포넌트
 * Linear 디자인 시스템의 입력 필드 구현
 */

export class Input {
    constructor(options = {}) {
        this.options = {
            type: options.type || 'text',
            placeholder: options.placeholder || '',
            value: options.value || '',
            label: options.label || '',
            helper: options.helper || '',
            error: options.error || '',
            required: options.required || false,
            disabled: options.disabled || false,
            readonly: options.readonly || false,
            min: options.min || null,
            max: options.max || null,
            step: options.step || null,
            pattern: options.pattern || null,
            onChange: options.onChange || (() => {}),
            onFocus: options.onFocus || (() => {}),
            onBlur: options.onBlur || (() => {}),
            className: options.className || '',
            id: options.id || `input-${Date.now()}`,
            ...options
        };
    }

    /**
     * 입력 필드 렌더링
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.className = `input-wrapper ${this.options.className}`;

        // 라벨
        if (this.options.label) {
            const label = document.createElement('label');
            label.htmlFor = this.options.id;
            label.className = 'input-label';
            label.innerHTML = `
                ${this.options.label}
                ${this.options.required ? '<span class="required">*</span>' : ''}
            `;
            wrapper.appendChild(label);
        }

        // 입력 필드 컨테이너
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-container';

        // 입력 필드
        const input = document.createElement('input');
        input.type = this.options.type;
        input.id = this.options.id;
        input.className = `input ${this.options.error ? 'input-error' : ''}`;
        input.placeholder = this.options.placeholder;
        input.value = this.options.value;
        input.required = this.options.required;
        input.disabled = this.options.disabled;
        input.readOnly = this.options.readonly;

        // 숫자 타입 속성
        if (this.options.type === 'number') {
            if (this.options.min !== null) input.min = this.options.min;
            if (this.options.max !== null) input.max = this.options.max;
            if (this.options.step !== null) input.step = this.options.step;
        }

        // 패턴
        if (this.options.pattern) {
            input.pattern = this.options.pattern;
        }

        // 이벤트 리스너
        input.addEventListener('input', (e) => this.handleInput(e));
        input.addEventListener('focus', (e) => this.handleFocus(e));
        input.addEventListener('blur', (e) => this.handleBlur(e));

        inputContainer.appendChild(input);

        // 아이콘 (옵션)
        if (this.options.icon) {
            const icon = document.createElement('span');
            icon.className = 'input-icon';
            icon.innerHTML = this.options.icon;
            inputContainer.appendChild(icon);
        }

        wrapper.appendChild(inputContainer);

        // 헬퍼 텍스트 또는 에러
        if (this.options.error) {
            const error = document.createElement('span');
            error.className = 'input-error-text';
            error.textContent = this.options.error;
            wrapper.appendChild(error);
        } else if (this.options.helper) {
            const helper = document.createElement('span');
            helper.className = 'input-helper';
            helper.textContent = this.options.helper;
            wrapper.appendChild(helper);
        }

        this.element = wrapper;
        this.inputElement = input;
        return wrapper;
    }

    /**
     * 입력 이벤트 처리
     */
    handleInput(e) {
        this.options.value = e.target.value;
        this.options.onChange(e.target.value, e);
        
        // 실시간 유효성 검사
        if (this.options.validate) {
            this.validate();
        }
    }

    /**
     * 포커스 이벤트 처리
     */
    handleFocus(e) {
        this.element.classList.add('focused');
        this.options.onFocus(e);
    }

    /**
     * 블러 이벤트 처리
     */
    handleBlur(e) {
        this.element.classList.remove('focused');
        this.options.onBlur(e);
        
        // 블러 시 유효성 검사
        if (this.options.validate) {
            this.validate();
        }
    }

    /**
     * 유효성 검사
     */
    validate() {
        const isValid = this.inputElement.checkValidity();
        
        if (!isValid) {
            this.setError(this.inputElement.validationMessage);
        } else {
            this.clearError();
        }
        
        return isValid;
    }

    /**
     * 에러 설정
     */
    setError(message) {
        this.options.error = message;
        this.inputElement.classList.add('input-error');
        
        let errorElement = this.element.querySelector('.input-error-text');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'input-error-text';
            this.element.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    /**
     * 에러 제거
     */
    clearError() {
        this.options.error = '';
        this.inputElement.classList.remove('input-error');
        
        const errorElement = this.element.querySelector('.input-error-text');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * 값 가져오기
     */
    getValue() {
        return this.inputElement.value;
    }

    /**
     * 값 설정
     */
    setValue(value) {
        this.inputElement.value = value;
        this.options.value = value;
    }

    /**
     * 정적 팩토리 메서드
     */
    static create(options) {
        return new Input(options).render();
    }
}