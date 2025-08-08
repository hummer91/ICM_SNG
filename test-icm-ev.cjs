const { chromium } = require('playwright');

(async () => {
  console.log('🎮 ICM EV 표시 기능 테스트 시작...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 페이지 로드
    console.log('📄 페이지 로딩 중...');
    await page.goto('http://localhost:8000');
    
    // 페이지 로드 대기
    await page.waitForSelector('.poker-table', { timeout: 10000 });
    console.log('✅ 페이지 로드 완료');
    
    // 시나리오 로드 대기
    await page.waitForSelector('.push-btn', { timeout: 5000 });
    console.log('✅ 시나리오 로드 완료');
    
    // Push 버튼 클릭
    console.log('🔵 Push 버튼 클릭...');
    await page.click('.push-btn');
    
    // 선택 확인
    const isPushSelected = await page.$eval('.push-btn', el => el.classList.contains('selected'));
    console.log(`✅ Push 버튼 선택됨: ${isPushSelected}`);
    
    // 정답 확인 버튼 클릭
    console.log('✅ 정답 확인 버튼 클릭...');
    await page.click('#check-answer-btn');
    
    // 잠시 대기
    await page.waitForTimeout(1000);
    
    // 결과 확인
    console.log('🔍 결과 확인 중...');
    
    // 1. ICM 분석 패널이 나타났는지 확인
    const icmPanel = await page.$('.icm-analysis-panel');
    console.log(`📊 ICM 분석 패널 존재: ${!!icmPanel}`);
    
    if (icmPanel) {
      // EV 수치들 확인
      const pushEV = await page.$eval('.ev-option:first-child .ev-value', el => el.textContent);
      const foldEV = await page.$eval('.ev-option:last-child .ev-value', el => el.textContent);
      const evDiff = await page.$eval('.difference-value', el => el.textContent.trim());
      
      console.log(`📈 Push EV: ${pushEV}`);
      console.log(`📉 Fold EV: ${foldEV}`);
      console.log(`📊 EV 차이: ${evDiff}`);
    }
    
    // 2. 버튼 색상 변화 확인
    const pushBtnClass = await page.$eval('.push-btn', el => el.className);
    console.log(`🔵 Push 버튼 클래스: ${pushBtnClass}`);
    
    const hasPushCorrect = pushBtnClass.includes('correct-answer');
    const hasPushWrong = pushBtnClass.includes('wrong-answer');
    console.log(`✅ Push 버튼 정답 표시: ${hasPushCorrect}`);
    console.log(`❌ Push 버튼 오답 표시: ${hasPushWrong}`);
    
    // 3. Toast 메시지 확인
    const toastExists = await page.$('.toast');
    console.log(`💬 Toast 메시지 존재: ${!!toastExists}`);
    
    // 콘솔 에러 확인
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 콘솔 에러: ${msg.text()}`);
      }
    });
    
    // 2초 더 대기해서 모든 애니메이션 확인
    await page.waitForTimeout(2000);
    
    console.log('🎯 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    await browser.close();
  }
})();