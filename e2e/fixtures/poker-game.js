/**
 * ICM 포커 앱 전용 Playwright 픽스처
 */
import { test as base, expect } from '@playwright/test';

/**
 * 포커 게임 픽스처 - ICM 계산 및 퀴즈 기능 전용
 */
export const test = base.extend({
  /**
   * 포커 게임 페이지 객체
   */
  pokerGame: async ({ page }, use) => {
    const pokerGame = new PokerGamePage(page);
    await pokerGame.goto();
    await pokerGame.waitForInitialization();
    await use(pokerGame);
  },
});

/**
 * 포커 게임 페이지 객체 모델
 */
class PokerGamePage {
  constructor(page) {
    this.page = page;
    
    // 주요 요소 셀렉터
    this.selectors = {
      // 퀴즈 관련
      pushButton: 'button[data-testid="push-button"], button[data-action="push"]',
      foldButton: 'button[data-testid="fold-button"], button[data-action="fold"]',
      newScenarioButton: 'button[data-testid="new-scenario"], button.new-scenario-btn',
      checkAnswerButton: 'button[data-testid="check-answer"], button.check-answer-btn',
      
      // 포커 테이블
      pokerTable: '.poker-table, .game-table',
      playerCards: '[data-player-index]',
      heroPlayer: '[data-player-index="3"], .hero-player',
      potAmount: '.pot-amount, .pot-size',
      
      // 시나리오 정보
      scenarioTitle: '#scenario-title, .scenario-title',
      scenarioHand: '#scenario-hand, .scenario-hand',
      scenarioPosition: '#scenario-position, .scenario-position',
      scenarioStack: '#scenario-stack, .scenario-stack',
      
      // 피드백 및 결과
      feedbackModal: '.feedback-modal, .result-modal',
      correctAnswer: '.correct-answer, .answer-correct',
      wrongAnswer: '.wrong-answer, .answer-wrong',
      evDisplay: '.ev-display, .icm-ev',
      
      // 통계 
      statsPanel: '.stats-panel, .quiz-stats',
      accuracyRate: '.accuracy-rate',
      totalQuestions: '.total-questions'
    };
  }

  /**
   * 앱으로 이동하고 초기화 대기
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 앱 초기화 완료 대기
   */
  async waitForInitialization() {
    // 포커 테이블이 로드될 때까지 대기
    await this.page.waitForSelector(this.selectors.pokerTable, { timeout: 10000 });
    
    // 시나리오 데이터 로드 대기
    await this.page.waitForFunction(() => {
      return window.ScenarioManager && window.ScenarioManager.getCurrentScenario();
    }, { timeout: 10000 });
    
    // HERO 플레이어가 설정될 때까지 대기
    await this.page.waitForSelector(this.selectors.heroPlayer, { timeout: 5000 });
  }

  /**
   * Push 버튼 클릭
   */
  async clickPush() {
    await this.page.click(this.selectors.pushButton);
    await this.page.waitForTimeout(500); // 애니메이션 대기
  }

  /**
   * Fold 버튼 클릭  
   */
  async clickFold() {
    await this.page.click(this.selectors.foldButton);
    await this.page.waitForTimeout(500); // 애니메이션 대기
  }

  /**
   * 새 시나리오 로드
   */
  async loadNewScenario() {
    await this.page.click(this.selectors.newScenarioButton);
    await this.waitForScenarioLoad();
  }

  /**
   * 정답 확인 버튼 클릭
   */
  async checkAnswer() {
    await this.page.click(this.selectors.checkAnswerButton);
    await this.page.waitForSelector(this.selectors.feedbackModal, { timeout: 5000 });
  }

  /**
   * 시나리오 로드 완료 대기
   */
  async waitForScenarioLoad() {
    await this.page.waitForFunction(() => {
      const scenario = window.ScenarioManager?.getCurrentScenario();
      return scenario && scenario.situation && scenario.situation.heroCards;
    }, { timeout: 5000 });
  }

  /**
   * 현재 시나리오 정보 가져오기
   */
  async getScenarioInfo() {
    return await this.page.evaluate(() => {
      return window.ScenarioManager?.getCurrentScenario();
    });
  }

  /**
   * 퀴즈 통계 가져오기
   */
  async getQuizStats() {
    return await this.page.evaluate(() => {
      return window.ScenarioManager?.getQuizStats();
    });
  }

  /**
   * ICM EV 계산 결과 가져오기
   */
  async getICMAnalysis() {
    const scenario = await this.getScenarioInfo();
    return scenario?.icmAnalysis;
  }

  /**
   * 플레이어 상태 확인
   */
  async getPlayerStates() {
    return await this.page.evaluate(() => {
      const players = [];
      for (let i = 0; i < 6; i++) {
        const element = document.querySelector(`[data-player-index="${i}"]`);
        if (element) {
          const nameElement = element.querySelector('.player-name');
          const chipsElement = element.querySelector('.chip-bb-main, .player-chips');
          
          players.push({
            index: i,
            name: nameElement?.textContent || '',
            chips: chipsElement?.textContent || '',
            isHero: element.classList.contains('hero-player') || nameElement?.classList.contains('hero-player'),
            isEmpty: nameElement?.classList.contains('empty-seat')
          });
        }
      }
      return players;
    });
  }

  /**
   * 콘솔 에러 확인
   */
  async getConsoleErrors() {
    const errors = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    return errors;
  }

  /**
   * 네트워크 요청 모니터링
   */
  async monitorNetworkRequests() {
    const requests = [];
    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    return requests;
  }
}

export { expect };