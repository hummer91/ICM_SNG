/**
 * 카드 컴포넌트
 * Linear 디자인 시스템의 카드 UI 구현
 */

export class Card {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      subtitle: options.subtitle || '',
      content: options.content || '',
      footer: options.footer || null,
      image: options.image || null,
      actions: options.actions || [],
      hoverable: options.hoverable !== false,
      onClick: options.onClick || null,
      className: options.className || '',
      variant: options.variant || 'default', // default, outlined, elevated
      ...options,
    };
  }

  /**
   * 카드 렌더링
   */
  render() {
    const card = document.createElement('div');
    card.className = `card card-${this.options.variant} ${this.options.hoverable ? 'card-hoverable' : ''} ${this.options.className}`;

    // 클릭 가능한 카드
    if (this.options.onClick) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', this.options.onClick);
    }

    // 이미지
    if (this.options.image) {
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'card-image';

      if (typeof this.options.image === 'string') {
        const img = document.createElement('img');
        img.src = this.options.image;
        img.alt = this.options.title || 'Card image';
        imageWrapper.appendChild(img);
      } else {
        imageWrapper.innerHTML = this.options.image;
      }

      card.appendChild(imageWrapper);
    }

    // 카드 바디
    const body = document.createElement('div');
    body.className = 'card-body';

    // 헤더 (제목 + 부제목)
    if (this.options.title || this.options.subtitle) {
      const header = document.createElement('div');
      header.className = 'card-header';

      if (this.options.title) {
        const title = document.createElement('h3');
        title.className = 'card-title';
        title.textContent = this.options.title;
        header.appendChild(title);
      }

      if (this.options.subtitle) {
        const subtitle = document.createElement('p');
        subtitle.className = 'card-subtitle';
        subtitle.textContent = this.options.subtitle;
        header.appendChild(subtitle);
      }

      body.appendChild(header);
    }

    // 콘텐츠
    if (this.options.content) {
      const content = document.createElement('div');
      content.className = 'card-content';

      if (typeof this.options.content === 'string') {
        content.innerHTML = this.options.content;
      } else if (this.options.content instanceof HTMLElement) {
        content.appendChild(this.options.content);
      }

      body.appendChild(content);
    }

    card.appendChild(body);

    // 푸터 또는 액션
    if (this.options.footer || this.options.actions.length > 0) {
      const footer = document.createElement('div');
      footer.className = 'card-footer';

      if (this.options.footer) {
        if (typeof this.options.footer === 'string') {
          footer.innerHTML = this.options.footer;
        } else if (this.options.footer instanceof HTMLElement) {
          footer.appendChild(this.options.footer);
        }
      }

      // 액션 버튼들
      if (this.options.actions.length > 0) {
        const actions = document.createElement('div');
        actions.className = 'card-actions';

        this.options.actions.forEach((action) => {
          const button = document.createElement('button');
          button.className = `btn btn-${action.variant || 'ghost'} btn-sm`;
          button.textContent = action.text;
          button.addEventListener('click', (e) => {
            e.stopPropagation(); // 카드 클릭 이벤트 방지
            action.onClick(e);
          });
          actions.appendChild(button);
        });

        footer.appendChild(actions);
      }

      card.appendChild(footer);
    }

    return card;
  }

  /**
   * 정적 팩토리 메서드
   */
  static create(options) {
    return new Card(options).render();
  }

  /**
   * 포커 카드 생성 (특수 용도)
   */
  static createPokerCard(options) {
    const rank = options.rank || 'A';
    const suit = options.suit || '♠';
    const suitColor = suit === '♥' || suit === '♦' ? 'red' : 'black';

    const cardOptions = {
      ...options,
      className: `poker-card ${suitColor} ${options.className || ''}`,
      content: `
                <div class="poker-card-inner">
                    <div class="poker-rank">${rank}</div>
                    <div class="poker-suit">${suit}</div>
                </div>
            `,
      hoverable: false,
    };

    return new Card(cardOptions).render();
  }

  /**
   * 통계 카드 생성 (특수 용도)
   */
  static createStatCard(options) {
    const { label, value, change, icon } = options;

    const cardOptions = {
      ...options,
      className: `stat-card ${options.className || ''}`,
      content: `
                <div class="stat-card-inner">
                    ${icon ? `<div class="stat-icon">${icon}</div>` : ''}
                    <div class="stat-content">
                        <div class="stat-label">${label}</div>
                        <div class="stat-value">${value}</div>
                        ${change ? `<div class="stat-change ${change > 0 ? 'positive' : 'negative'}">${change > 0 ? '+' : ''}${change}%</div>` : ''}
                    </div>
                </div>
            `,
    };

    return new Card(cardOptions).render();
  }
}
