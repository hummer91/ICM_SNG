import { addons } from '@storybook/manager-api';
import { themes } from '@storybook/theming';

// Linear 스타일에 맞춘 Storybook 테마
addons.setConfig({
  theme: {
    ...themes.dark,
    brandTitle: 'ICM SNG Poker UI',
    brandUrl: '/',
    brandImage: undefined,
    brandTarget: '_self',

    // UI
    appBg: 'rgb(8, 9, 10)',
    appContentBg: 'rgb(16, 17, 18)',
    appBorderColor: 'rgb(33, 35, 38)',
    appBorderRadius: 8,

    // Typography
    fontBase: '"Inter Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontCode: 'monospace',

    // Text colors
    textColor: 'rgb(247, 248, 248)',
    textInverseColor: 'rgb(8, 9, 10)',
    textMutedColor: 'rgb(174, 177, 183)',

    // Toolbar colors
    barTextColor: 'rgb(247, 248, 248)',
    barSelectedColor: '#5e6ad2',
    barBg: 'rgb(16, 17, 18)',

    // Form colors
    inputBg: 'rgb(24, 25, 26)',
    inputBorder: 'rgb(33, 35, 38)',
    inputTextColor: 'rgb(247, 248, 248)',
    inputBorderRadius: 6,

    // Linear purple accent
    colorPrimary: '#5e6ad2',
    colorSecondary: '#5e6ad2',
  },
});
