/** @type { import('@storybook/html-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-links',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal: async (config) => {
    // Linear Design System에 맞춘 스타일 경로 추가
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
    };
    return config;
  },
};

export default config;
