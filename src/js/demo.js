/**
 * 컴포넌트 데모 페이지 스크립트
 */

import { Button, Input, Card, Modal, Toast, Theme, RangeChart } from './components/index.js';

// 데모 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
  console.log('컴포넌트 데모 페이지 초기화');

  // 색상 데모
  renderColorDemo();

  // 타이포그래피 데모
  renderTypographyDemo();

  // 버튼 데모
  renderButtonDemo();

  // 입력 필드 데모
  renderInputDemo();

  // 카드 데모
  renderCardDemo();

  // 모달 데모
  renderModalDemo();

  // 토스트 데모
  renderToastDemo();

  // 레인지 차트 데모
  renderRangeChartDemo();

  // 포커 UI 데모
  renderPokerDemo();
});

/**
 * 색상 시스템 데모
 */
function renderColorDemo() {
  const container = document.querySelector('.color-grid');
  if (!container) {
    return;
  }

  const colorCategories = [
    { name: '배경', category: 'backgrounds' },
    { name: '텍스트', category: 'text' },
    { name: '테두리', category: 'border' },
    { name: '브랜드', category: 'brand' },
    { name: '시맨틱', category: 'semantic' },
  ];

  colorCategories.forEach(({ name, category }) => {
    const colors = Theme.colors[category];

    Object.entries(colors).forEach(([key, value]) => {
      const item = document.createElement('div');
      item.className = 'color-item';

      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor =
        typeof value === 'object' ? value['500'] || Object.values(value)[0] : value;

      // 밝은 색상인 경우 텍스트 색상 조정
      if (category === 'text' && key !== 'primary') {
        swatch.style.color = Theme.colors.backgrounds.primary;
      }

      const nameEl = document.createElement('div');
      nameEl.className = 'color-name';
      nameEl.textContent = `${name} - ${key}`;

      const valueEl = document.createElement('div');
      valueEl.className = 'color-value';
      valueEl.textContent = typeof value === 'object' ? JSON.stringify(value) : value;

      item.appendChild(swatch);
      item.appendChild(nameEl);
      item.appendChild(valueEl);
      container.appendChild(item);
    });
  });
}

/**
 * 타이포그래피 데모
 */
function renderTypographyDemo() {
  const container = document.querySelector('.typography-demo');
  if (!container) {
    return;
  }

  const sizes = [
    { name: 'XS', size: '12px', text: '가장 작은 텍스트 크기' },
    { name: 'SM', size: '13px', text: '작은 텍스트 크기' },
    { name: 'Base', size: '16px', text: '기본 텍스트 크기' },
    { name: 'LG', size: '18px', text: '큰 텍스트 크기' },
    { name: 'XL', size: '21px', text: '매우 큰 텍스트' },
    { name: '2XL', size: '24px', text: '제목용 텍스트' },
    { name: '3XL', size: '30px', text: '큰 제목' },
  ];

  sizes.forEach(({ name, size, text }) => {
    const item = document.createElement('div');
    item.className = 'typography-item';
    item.innerHTML = `
            <div class="typography-label">Font Size ${name} (${size})</div>
            <div style="font-size: ${size}">${text}</div>
        `;
    container.appendChild(item);
  });
}

/**
 * 버튼 데모
 */
function renderButtonDemo() {
  const container = document.querySelector('.button-demo');
  if (!container) {
    return;
  }

  // 버튼 변형
  const variants = ['primary', 'secondary', 'ghost', 'outline'];
  const variantRow = document.createElement('div');
  variantRow.className = 'button-row';
  variantRow.innerHTML =
    '<div style="width: 100%; margin-bottom: 16px;"><strong>버튼 변형</strong></div>';

  variants.forEach((variant) => {
    variantRow.appendChild(
      Button.create({
        text: variant.charAt(0).toUpperCase() + variant.slice(1),
        variant,
        onClick: () => Toast.info(`${variant} 버튼 클릭!`),
      }),
    );
  });

  container.appendChild(variantRow);

  // 버튼 크기
  const sizes = ['sm', 'md', 'lg'];
  const sizeRow = document.createElement('div');
  sizeRow.className = 'button-row';
  sizeRow.innerHTML =
    '<div style="width: 100%; margin-bottom: 16px;"><strong>버튼 크기</strong></div>';

  sizes.forEach((size) => {
    sizeRow.appendChild(
      Button.create({
        text: `Size ${size.toUpperCase()}`,
        size,
        onClick: () => Toast.info(`${size} 크기 버튼 클릭!`),
      }),
    );
  });

  container.appendChild(sizeRow);

  // 버튼 상태
  const stateRow = document.createElement('div');
  stateRow.className = 'button-row';
  stateRow.innerHTML =
    '<div style="width: 100%; margin-bottom: 16px;"><strong>버튼 상태</strong></div>';

  stateRow.appendChild(
    Button.create({
      text: '일반 버튼',
      onClick: () => Toast.success('버튼이 작동합니다!'),
    }),
  );

  stateRow.appendChild(
    Button.create({
      text: '비활성화',
      disabled: true,
    }),
  );

  stateRow.appendChild(
    Button.create({
      text: '로딩 중',
      loading: true,
    }),
  );

  container.appendChild(stateRow);

  // 버튼 그룹
  const groupDemo = document.createElement('div');
  groupDemo.className = 'button-group-demo';
  groupDemo.innerHTML = '<div style="margin-bottom: 16px;"><strong>버튼 그룹</strong></div>';

  groupDemo.appendChild(
    Button.createGroup([
      { text: '이전', variant: 'secondary' },
      { text: '다음', variant: 'primary' },
    ]),
  );

  container.appendChild(groupDemo);
}

/**
 * 입력 필드 데모
 */
function renderInputDemo() {
  const container = document.querySelector('.input-demo');
  if (!container) {
    return;
  }

  // 기본 입력
  container.appendChild(
    Input.create({
      label: '이름',
      placeholder: '이름을 입력하세요',
      helper: '한글 또는 영문으로 입력하세요',
      required: true,
    }),
  );

  // 이메일 입력
  container.appendChild(
    Input.create({
      type: 'email',
      label: '이메일',
      placeholder: 'email@example.com',
      required: true,
      pattern: '[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$',
    }),
  );

  // 숫자 입력
  container.appendChild(
    Input.create({
      type: 'number',
      label: '스택 크기 (BB)',
      placeholder: '10',
      min: 0.5,
      max: 100,
      step: 0.5,
      helper: '0.5 ~ 100 BB 사이의 값을 입력하세요',
    }),
  );

  // 비밀번호 입력
  container.appendChild(
    Input.create({
      type: 'password',
      label: '비밀번호',
      placeholder: '비밀번호를 입력하세요',
      helper: '8자 이상, 대소문자와 숫자 포함',
    }),
  );

  // 에러 상태
  container.appendChild(
    Input.create({
      label: '에러 예시',
      value: '잘못된 값',
      error: '올바른 형식이 아닙니다',
    }),
  );

  // 비활성화 상태
  container.appendChild(
    Input.create({
      label: '비활성화',
      value: '수정 불가',
      disabled: true,
    }),
  );
}

/**
 * 카드 데모
 */
function renderCardDemo() {
  const container = document.querySelector('.card-demo');
  if (!container) {
    return;
  }

  // 기본 카드
  container.appendChild(
    Card.create({
      title: '기본 카드',
      subtitle: 'Linear 디자인 시스템',
      content: '이것은 기본 카드 컴포넌트입니다. 제목, 부제목, 내용을 포함할 수 있습니다.',
      footer: '카드 푸터',
    }),
  );

  // 액션 카드
  container.appendChild(
    Card.create({
      title: '액션 카드',
      content: '버튼과 같은 액션을 포함할 수 있습니다.',
      actions: [
        { text: '취소', variant: 'ghost', onClick: () => Toast.info('취소됨') },
        { text: '확인', variant: 'primary', onClick: () => Toast.success('확인됨') },
      ],
    }),
  );

  // 통계 카드
  container.appendChild(
    Card.createStatCard({
      label: '총 칩',
      value: '1,500',
      change: 15,
      icon: '💰',
    }),
  );

  container.appendChild(
    Card.createStatCard({
      label: '승률',
      value: '67.5%',
      change: -2.3,
      icon: '📊',
    }),
  );

  // 클릭 가능한 카드
  container.appendChild(
    Card.create({
      title: '클릭 가능한 카드',
      content: '이 카드를 클릭해보세요!',
      onClick: () => Toast.info('카드가 클릭되었습니다!'),
    }),
  );
}

/**
 * 모달 데모
 */
function renderModalDemo() {
  const container = document.querySelector('.modal-demo');
  if (!container) {
    return;
  }

  // 기본 모달
  container.appendChild(
    Button.create({
      text: '기본 모달 열기',
      onClick: () => {
        const modal = Modal.create({
          title: '기본 모달',
          content:
            '<p>이것은 기본 모달 대화상자입니다.</p><p>다양한 내용을 포함할 수 있습니다.</p>',
          footer: [
            { text: '닫기', variant: 'secondary', onClick: (e, modal) => modal.close() },
            {
              text: '확인',
              variant: 'primary',
              onClick: (e, modal) => {
                Toast.success('확인되었습니다!');
                modal.close();
              },
            },
          ],
        });
        modal.open();
      },
    }),
  );

  // 확인 대화상자
  container.appendChild(
    Button.create({
      text: '확인 대화상자',
      variant: 'secondary',
      onClick: () => {
        Modal.confirm({
          title: '삭제 확인',
          message: '정말로 이 항목을 삭제하시겠습니까?',
          confirmText: '삭제',
          cancelText: '취소',
          onConfirm: () => Toast.success('삭제되었습니다!'),
          onCancel: () => Toast.info('취소되었습니다.'),
        });
      },
    }),
  );

  // 알림 대화상자
  container.appendChild(
    Button.create({
      text: '알림 대화상자',
      variant: 'outline',
      onClick: () => {
        Modal.alert({
          title: '알림',
          message: '작업이 성공적으로 완료되었습니다!',
          buttonText: '확인',
          onClose: () => console.log('알림 닫힘'),
        });
      },
    }),
  );
}

/**
 * 토스트 데모
 */
function renderToastDemo() {
  const container = document.querySelector('.toast-demo');
  if (!container) {
    return;
  }

  const types = [
    { type: 'success', text: '성공 토스트' },
    { type: 'error', text: '에러 토스트' },
    { type: 'warning', text: '경고 토스트' },
    { type: 'info', text: '정보 토스트' },
  ];

  types.forEach(({ type, text }) => {
    container.appendChild(
      Button.create({
        text,
        variant: type === 'error' ? 'primary' : 'secondary',
        onClick: () => Toast[type](`${text} 메시지입니다!`),
      }),
    );
  });

  // 액션 토스트
  container.appendChild(
    Button.create({
      text: '액션 토스트',
      variant: 'outline',
      onClick: () => {
        new Toast({
          message: '작업을 실행하시겠습니까?',
          type: 'info',
          action: {
            text: '실행',
            onClick: () => Toast.success('작업이 실행되었습니다!'),
          },
        }).show();
      },
    }),
  );
}

/**
 * 레인지 차트 데모
 */
function renderRangeChartDemo() {
  const container = document.querySelector('.rangechart-demo');
  if (!container) {
    return;
  }

  // 차트 크기 선택
  const sizeSelector = document.createElement('div');
  sizeSelector.style.marginBottom = '24px';
  sizeSelector.innerHTML = '<h3>차트 크기</h3>';

  const sizeButtons = Button.createGroup([
    { text: '작게', variant: 'secondary', onClick: () => updateChartSize('small') },
    { text: '중간', variant: 'primary', onClick: () => updateChartSize('medium') },
    { text: '크게', variant: 'secondary', onClick: () => updateChartSize('large') },
  ]);

  sizeSelector.appendChild(sizeButtons);
  container.appendChild(sizeSelector);

  // 샘플 데이터로 차트 생성
  const chartContainer = document.createElement('div');
  chartContainer.style.marginBottom = '32px';

  let currentChart;

  function updateChartSize(size) {
    chartContainer.innerHTML = '';
    currentChart = RangeChart.create({
      data: RangeChart.generateSampleData(),
      size,
      showEV: true,
      showLabels: true,
      onClick: (hand, ev) => {
        Toast.info(`${hand} 클릭: EV ${ev !== undefined ? ev.toFixed(3) : 'N/A'}`);
      },
      onHover: (hand, ev) => {
        if (hand) {
          document.getElementById('hover-info').textContent =
            `${hand}: EV ${ev !== undefined ? ev.toFixed(3) : 'N/A'}`;
        } else {
          document.getElementById('hover-info').textContent = '마우스를 올려 정보 확인';
        }
      },
    });
    chartContainer.appendChild(currentChart);
  }

  // 초기 차트 렌더링
  updateChartSize('medium');
  container.appendChild(chartContainer);

  // 호버 정보 표시
  const hoverInfo = document.createElement('div');
  hoverInfo.id = 'hover-info';
  hoverInfo.style.padding = '16px';
  hoverInfo.style.backgroundColor = 'var(--bg-tertiary)';
  hoverInfo.style.borderRadius = '8px';
  hoverInfo.style.textAlign = 'center';
  hoverInfo.textContent = '마우스를 올려 정보 확인';
  container.appendChild(hoverInfo);

  // 인터랙티브 데모
  const interactiveDemo = document.createElement('div');
  interactiveDemo.style.marginTop = '32px';
  interactiveDemo.innerHTML = '<h3>인터랙티브 기능</h3>';

  const features = document.createElement('ul');
  features.style.color = 'var(--text-secondary)';
  features.innerHTML = `
        <li>각 셀을 클릭하면 핸드 정보가 토스트로 표시됩니다</li>
        <li>마우스를 올리면 하단에 EV 정보가 표시됩니다</li>
        <li>EV ≥ 0.2인 핸드는 초록색으로 표시됩니다</li>
        <li>포켓 페어는 우측 상단에 점으로 표시됩니다</li>
        <li>수티드 핸드는 우측 하단에 's'가 표시됩니다</li>
    `;

  interactiveDemo.appendChild(features);
  container.appendChild(interactiveDemo);
}

/**
 * 포커 UI 데모
 */
function renderPokerDemo() {
  const container = document.querySelector('.poker-demo');
  if (!container) {
    return;
  }

  // 포커 테이블
  const tableDemo = document.createElement('div');
  tableDemo.className = 'poker-table-demo';

  const table = document.createElement('div');
  table.className = 'poker-table';
  tableDemo.appendChild(table);

  container.appendChild(tableDemo);

  // 포커 카드
  const cardsDemo = document.createElement('div');
  cardsDemo.innerHTML = '<h3 style="margin-bottom: 16px;">포커 카드</h3>';

  const cardsContainer = document.createElement('div');
  cardsContainer.className = 'poker-cards-demo';

  const cards = [
    { rank: 'A', suit: '♠' },
    { rank: 'K', suit: '♥' },
    { rank: 'Q', suit: '♦' },
    { rank: 'J', suit: '♣' },
    { rank: '10', suit: '♥' },
  ];

  cards.forEach((card) => {
    cardsContainer.appendChild(Card.createPokerCard(card));
  });

  cardsDemo.appendChild(cardsContainer);
  container.appendChild(cardsDemo);
}
