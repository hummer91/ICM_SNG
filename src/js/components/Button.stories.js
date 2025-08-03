import { Button } from './Button.js';

export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Linear Design System의 버튼 컴포넌트입니다. 다양한 스타일과 크기를 지원합니다.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: '버튼에 표시될 텍스트',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'danger'],
      description: '버튼 스타일 변형',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '버튼 크기',
    },
    disabled: {
      control: 'boolean',
      description: '버튼 비활성화 상태',
    },
    loading: {
      control: 'boolean',
      description: '로딩 상태 표시',
    },
    fullWidth: {
      control: 'boolean',
      description: '전체 너비 사용',
    },
    icon: {
      control: 'text',
      description: '아이콘 HTML (선택사항)',
    },
  },
};

// 스토리 생성 헬퍼
const createButtonStory = (args) => {
  const button = Button.create({
    ...args,
    onClick: () => {
      console.log('Button clicked!', args);
    },
  });
  return button;
};

// Primary 버튼
export const Primary = {
  args: {
    text: 'Primary Button',
    variant: 'primary',
    size: 'md',
  },
  render: createButtonStory,
};

// Secondary 버튼
export const Secondary = {
  args: {
    text: 'Secondary Button',
    variant: 'secondary',
    size: 'md',
  },
  render: createButtonStory,
};

// Ghost 버튼
export const Ghost = {
  args: {
    text: 'Ghost Button',
    variant: 'ghost',
    size: 'md',
  },
  render: createButtonStory,
};

// Danger 버튼
export const Danger = {
  args: {
    text: 'Danger Button',
    variant: 'danger',
    size: 'md',
  },
  render: createButtonStory,
};

// 크기 변형
export const Sizes = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '1rem';
    container.style.alignItems = 'center';
    container.style.flexWrap = 'wrap';

    ['sm', 'md', 'lg'].forEach((size) => {
      const button = Button.create({
        text: `Size ${size.toUpperCase()}`,
        variant: 'primary',
        size,
        onClick: () => console.log(`${size} button clicked`),
      });
      container.appendChild(button);
    });

    return container;
  },
};

// 로딩 상태
export const Loading = {
  args: {
    text: 'Loading...',
    variant: 'primary',
    loading: true,
    size: 'md',
  },
  render: createButtonStory,
};

// 비활성화 상태
export const Disabled = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '1rem';
    container.style.flexWrap = 'wrap';

    ['primary', 'secondary', 'ghost', 'danger'].forEach((variant) => {
      const button = Button.create({
        text: `Disabled ${variant}`,
        variant,
        disabled: true,
        onClick: () => console.log('This should not fire'),
      });
      container.appendChild(button);
    });

    return container;
  },
};

// 전체 너비
export const FullWidth = {
  args: {
    text: 'Full Width Button',
    variant: 'primary',
    fullWidth: true,
    size: 'md',
  },
  render: createButtonStory,
};

// 아이콘 버튼
export const WithIcon = {
  args: {
    text: 'Button with Icon',
    variant: 'primary',
    size: 'md',
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0L10.5 5.5L16 6.5L12 10.5L13 16L8 13L3 16L4 10.5L0 6.5L5.5 5.5L8 0Z"/></svg>',
  },
  render: createButtonStory,
};

// 포커 액션 버튼 예시
export const PokerActions = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '1rem';
    container.style.flexWrap = 'wrap';

    const actions = [
      { text: 'FOLD', variant: 'danger' },
      { text: 'CALL', variant: 'secondary' },
      { text: 'RAISE', variant: 'primary' },
      { text: 'ALL IN', variant: 'primary', className: 'all-in-button' },
    ];

    actions.forEach((action) => {
      const button = Button.create({
        ...action,
        size: 'lg',
        onClick: () => console.log(`${action.text} clicked`),
      });

      if (action.className) {
        button.classList.add(action.className);
        button.style.background = 'linear-gradient(135deg, #5e6ad2 0%, #7c3aed 100%)';
        button.style.fontWeight = '600';
      }

      container.appendChild(button);
    });

    return container;
  },
};
