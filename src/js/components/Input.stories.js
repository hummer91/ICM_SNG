import { Input } from './Input.js';

export default {
  title: 'Components/Input',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Linear Design System의 입력 필드 컴포넌트입니다. 다양한 타입과 검증을 지원합니다.',
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'number', 'email', 'password', 'search'],
      description: '입력 필드 타입',
    },
    label: {
      control: 'text',
      description: '레이블 텍스트',
    },
    placeholder: {
      control: 'text',
      description: '플레이스홀더 텍스트',
    },
    value: {
      control: 'text',
      description: '초기 값',
    },
    required: {
      control: 'boolean',
      description: '필수 입력 여부',
    },
    disabled: {
      control: 'boolean',
      description: '비활성화 상태',
    },
    error: {
      control: 'text',
      description: '에러 메시지',
    },
    helperText: {
      control: 'text',
      description: '도움말 텍스트',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '입력 필드 크기',
    },
  },
};

// 스토리 생성 헬퍼
const createInputStory = (args) => {
  const input = Input.create({
    ...args,
    onChange: (value, event) => {
      console.log('Input changed:', value, event);
    },
  });
  return input;
};

// 기본 입력 필드
export const Default = {
  args: {
    type: 'text',
    label: '이름',
    placeholder: '이름을 입력하세요',
  },
  render: createInputStory,
};

// 숫자 입력
export const Number = {
  args: {
    type: 'number',
    label: '스택 크기 (BB)',
    placeholder: '10',
    min: 0.5,
    max: 100,
    step: 0.5,
  },
  render: createInputStory,
};

// 필수 입력
export const Required = {
  args: {
    type: 'text',
    label: '필수 필드',
    placeholder: '반드시 입력해야 합니다',
    required: true,
  },
  render: createInputStory,
};

// 에러 상태
export const WithError = {
  args: {
    type: 'email',
    label: '이메일',
    placeholder: 'example@email.com',
    value: 'invalid-email',
    error: '올바른 이메일 형식이 아닙니다',
  },
  render: createInputStory,
};

// 도움말 텍스트
export const WithHelperText = {
  args: {
    type: 'password',
    label: '비밀번호',
    placeholder: '비밀번호를 입력하세요',
    helperText: '최소 8자 이상, 영문과 숫자를 포함해야 합니다',
  },
  render: createInputStory,
};

// 비활성화 상태
export const Disabled = {
  args: {
    type: 'text',
    label: '비활성화된 필드',
    value: '수정할 수 없습니다',
    disabled: true,
  },
  render: createInputStory,
};

// 크기 변형
export const Sizes = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '1.5rem';

    ['sm', 'md', 'lg'].forEach((size) => {
      const input = Input.create({
        type: 'text',
        label: `${size.toUpperCase()} 크기`,
        placeholder: `${size} 크기 입력 필드`,
        size,
        onChange: (value) => console.log(`${size} input:`, value),
      });
      container.appendChild(input);
    });

    return container;
  },
};

// 포커 게임 입력 예시
export const PokerInputs = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gap = '1.5rem';
    container.style.maxWidth = '400px';

    // 스택 크기 입력
    const stackInput = Input.create({
      type: 'number',
      label: '스택 크기',
      placeholder: '15',
      min: 0.5,
      max: 100,
      step: 0.5,
      suffix: 'BB',
      helperText: '빅 블라인드 기준으로 입력하세요',
      onChange: (value) => console.log('Stack size:', value),
    });

    // 블라인드 레벨 입력
    const blindInput = Input.create({
      type: 'text',
      label: '블라인드 레벨',
      placeholder: '100/200',
      pattern: '^\\d+/\\d+$',
      helperText: 'SB/BB 형식으로 입력 (예: 100/200)',
      onChange: (value) => console.log('Blinds:', value),
    });

    // 플레이어 이름 입력
    const nameInput = Input.create({
      type: 'text',
      label: '플레이어 이름',
      placeholder: 'Hero',
      maxLength: 20,
      onChange: (value) => console.log('Player name:', value),
    });

    container.appendChild(stackInput);
    container.appendChild(blindInput);
    container.appendChild(nameInput);

    return container;
  },
};

// 검색 입력
export const Search = {
  render: () => {
    const searchInput = Input.create({
      type: 'search',
      placeholder: '핸드 레인지 검색...',
      icon: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="7" cy="7" r="5"/>
        <path d="M11 11L14 14"/>
      </svg>`,
      onChange: (value) => console.log('Search:', value),
    });

    return searchInput;
  },
};

// 폼 예시
export const FormExample = {
  render: () => {
    const form = document.createElement('form');
    form.style.display = 'grid';
    form.style.gap = '1.5rem';
    form.style.maxWidth = '400px';
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      console.log('Form submitted:', Object.fromEntries(formData));
    };

    const inputs = [
      {
        type: 'text',
        label: '토너먼트 이름',
        name: 'tournament',
        required: true,
        placeholder: 'Sunday Million',
      },
      {
        type: 'number',
        label: '바이인',
        name: 'buyin',
        placeholder: '10.50',
        min: 0,
        step: 0.01,
        prefix: '$',
      },
      {
        type: 'number',
        label: '참가자 수',
        name: 'players',
        placeholder: '6',
        min: 2,
        max: 10,
        value: '6',
      },
    ];

    inputs.forEach((config) => {
      const input = Input.create({
        ...config,
        onChange: (value) => console.log(`${config.name}:`, value),
      });
      form.appendChild(input);
    });

    // 제출 버튼
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = '생성하기';
    submitBtn.style.marginTop = '0.5rem';
    form.appendChild(submitBtn);

    return form;
  },
};
