/** @type { import('@storybook/html').Preview } */

// Linear Design System 스타일 임포트
import '../src/css/main.css';
import '../src/css/components.css';

const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Linear 다크 테마 배경
    backgrounds: {
      default: 'linear-dark',
      values: [
        {
          name: 'linear-dark',
          value: 'rgb(8, 9, 10)',
        },
        {
          name: 'linear-secondary',
          value: 'rgb(16, 17, 18)',
        },
        {
          name: 'linear-tertiary',
          value: 'rgb(24, 25, 26)',
        },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },
  decorators: [
    (Story) => {
      // Linear 다크 테마 클래스 추가
      document.body.classList.add('linear-dark-theme');

      // Story 래퍼
      const wrapper = document.createElement('div');
      wrapper.style.padding = '2rem';
      wrapper.style.minHeight = '100vh';
      wrapper.style.backgroundColor = 'var(--bg-primary, rgb(8, 9, 10))';
      wrapper.style.color = 'var(--text-primary, rgb(247, 248, 248))';

      const storyElement = Story();
      if (typeof storyElement === 'string') {
        wrapper.innerHTML = storyElement;
      } else {
        wrapper.appendChild(storyElement);
      }

      return wrapper;
    },
  ],
};

export default preview;
