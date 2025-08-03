import { Card } from './Card.js';

export default {
  title: 'Components/Card',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Linear Design System의 카드 컴포넌트입니다. 콘텐츠를 그룹화하고 시각적으로 구분합니다.',
      },
    },
  },
  argTypes: {
    title: {
      control: 'text',
      description: '카드 제목',
    },
    subtitle: {
      control: 'text',
      description: '카드 부제목',
    },
    content: {
      control: 'text',
      description: '카드 콘텐츠 (HTML 지원)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'bordered'],
      description: '카드 스타일 변형',
    },
    padding: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: '내부 여백 크기',
    },
    className: {
      control: 'text',
      description: '추가 CSS 클래스',
    },
  },
};

// 스토리 생성 헬퍼
const createCardStory = (args) => Card.create(args);

// 기본 카드
export const Default = {
  args: {
    title: '기본 카드',
    subtitle: '이것은 기본 카드 예시입니다',
    content: '<p>카드 콘텐츠가 여기에 표시됩니다. HTML을 사용할 수 있습니다.</p>',
    variant: 'default',
  },
  render: createCardStory,
};

// Elevated 카드
export const Elevated = {
  args: {
    title: 'Elevated 카드',
    subtitle: '그림자 효과가 적용된 카드',
    content: '<p>이 카드는 배경에서 떠 있는 것처럼 보입니다.</p>',
    variant: 'elevated',
  },
  render: createCardStory,
};

// Bordered 카드
export const Bordered = {
  args: {
    title: 'Bordered 카드',
    subtitle: '테두리가 있는 카드',
    content: '<p>이 카드는 명확한 테두리로 구분됩니다.</p>',
    variant: 'bordered',
  },
  render: createCardStory,
};

// 플레이어 정보 카드
export const PlayerCard = {
  render: () => {
    const card = Card.create({
      title: 'Player 1',
      subtitle: 'BTN Position',
      content: `
        <div class="player-stats" style="display: grid; gap: 0.5rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">스택:</span>
            <span style="color: var(--text-primary); font-weight: 500;">1,500</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">BB:</span>
            <span style="color: var(--text-primary); font-weight: 500;">15 BB</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">ICM EV:</span>
            <span style="color: var(--success); font-weight: 500;">33.3%</span>
          </div>
        </div>
      `,
      variant: 'elevated',
    });

    return card;
  },
};

// 통계 카드
export const StatsCard = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    container.style.gap = '1rem';

    const stats = [
      { title: '총 칩', value: '10,000', change: '+2,500' },
      { title: '평균 스택', value: '1,667', change: '-333' },
      { title: '블라인드', value: '100/200', change: 'Level 5' },
    ];

    stats.forEach((stat) => {
      const card = Card.create({
        content: `
          <div style="text-align: center;">
            <div style="font-size: 2rem; font-weight: 600; color: var(--text-primary);">
              ${stat.value}
            </div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">
              ${stat.title}
            </div>
            <div style="font-size: 0.75rem; color: var(--success); margin-top: 0.5rem;">
              ${stat.change}
            </div>
          </div>
        `,
        variant: 'bordered',
        padding: 'sm',
      });
      container.appendChild(card);
    });

    return container;
  },
};

// 포커 카드
export const PokerCard = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '0.5rem';
    container.style.flexWrap = 'wrap';

    const cards = [
      { rank: 'A', suit: '♠', color: 'black' },
      { rank: 'K', suit: '♥', color: 'red' },
      { rank: 'Q', suit: '♣', color: 'black' },
      { rank: 'J', suit: '♦', color: 'red' },
    ];

    cards.forEach(({ rank, suit, color }) => {
      const pokerCard = Card.createPokerCard({ rank, suit });
      if (color === 'red') {
        pokerCard.style.color = '#ef4444';
      }
      container.appendChild(pokerCard);
    });

    return container;
  },
};

// 액션 히스토리 카드
export const ActionHistory = {
  render: () => {
    const card = Card.create({
      title: '액션 히스토리',
      content: `
        <div style="display: grid; gap: 0.5rem; font-size: 0.875rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--text-secondary);">UTG:</span>
            <span style="color: var(--error);">Fold</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--text-secondary);">MP:</span>
            <span style="color: var(--error);">Fold</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--text-secondary);">CO:</span>
            <span style="color: var(--warning);">Raise 2.5x</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="color: var(--text-secondary);">BTN:</span>
            <span style="color: var(--text-muted);">...</span>
          </div>
        </div>
      `,
      variant: 'default',
    });

    return card;
  },
};

// 카드 그리드 레이아웃
export const CardGrid = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    container.style.gap = '1rem';

    for (let i = 1; i <= 6; i++) {
      const card = Card.create({
        title: `카드 ${i}`,
        subtitle: `서브타이틀 ${i}`,
        content: `<p>이것은 카드 ${i}의 콘텐츠입니다. 그리드 레이아웃에서 반응형으로 배치됩니다.</p>`,
        variant: i % 3 === 0 ? 'elevated' : i % 3 === 1 ? 'bordered' : 'default',
      });
      container.appendChild(card);
    }

    return container;
  },
};
