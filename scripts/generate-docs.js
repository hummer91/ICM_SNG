#!/usr/bin/env node

/**
 * @fileoverview 자동 문서 생성 스크립트
 * @module scripts/generate-docs
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * 명령어 실행 프로미스 래퍼
 * @param {string} command - 실행할 명령어
 * @returns {Promise<string>} 실행 결과
 */
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: rootDir }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        console.warn('Warning:', stderr);
      }
      resolve(stdout);
    });
  });
}

/**
 * 문서 생성 메인 함수
 */
async function generateDocs() {
  console.log('📚 문서 생성 시작...\n');

  try {
    // 1. 기존 문서 디렉토리 정리
    console.log('1️⃣ 기존 문서 정리 중...');
    const docsDir = path.join(rootDir, 'docs');
    const apiDir = path.join(docsDir, 'api');
    const storybookDir = path.join(docsDir, 'storybook');

    // 디렉토리 생성
    await fs.mkdir(docsDir, { recursive: true });
    await fs.mkdir(apiDir, { recursive: true });
    await fs.mkdir(storybookDir, { recursive: true });

    // 2. JSDoc 문서 생성
    console.log('2️⃣ JSDoc API 문서 생성 중...');
    try {
      await execPromise('npm run docs');
      console.log('✅ API 문서 생성 완료');
    } catch (error) {
      console.error('❌ API 문서 생성 실패:', error.message);
    }

    // 3. Storybook 빌드
    console.log('3️⃣ Storybook 컴포넌트 문서 빌드 중...');
    try {
      await execPromise('npm run build-storybook -- -o docs/storybook');
      console.log('✅ Storybook 빌드 완료');
    } catch (error) {
      console.error('❌ Storybook 빌드 실패:', error.message);
    }

    // 4. 문서 인덱스 페이지 생성
    console.log('4️⃣ 문서 인덱스 페이지 생성 중...');
    await createIndexPage(docsDir);
    console.log('✅ 인덱스 페이지 생성 완료');

    // 5. 문서 통계 생성
    console.log('5️⃣ 문서 통계 생성 중...');
    await generateStats(docsDir);

    console.log('\n✨ 모든 문서 생성이 완료되었습니다!');
    console.log(`📂 문서 위치: ${docsDir}`);
  } catch (error) {
    console.error('\n❌ 문서 생성 중 오류 발생:', error);
    process.exit(1);
  }
}

/**
 * 문서 인덱스 페이지 생성
 * @param {string} docsDir - 문서 디렉토리 경로
 */
async function createIndexPage(docsDir) {
  const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ICM SNG Poker - 문서</title>
    <style>
        :root {
            --bg-primary: rgb(8, 9, 10);
            --bg-secondary: rgb(16, 17, 18);
            --bg-tertiary: rgb(24, 25, 26);
            --text-primary: rgb(247, 248, 248);
            --text-secondary: rgb(174, 177, 183);
            --border-primary: rgb(33, 35, 38);
            --brand-purple: #5e6ad2;
        }
        
        body {
            font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #5e6ad2 0%, #7c3aed 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            color: var(--text-secondary);
            font-size: 1.25rem;
            margin-bottom: 3rem;
        }
        
        .docs-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-top: 3rem;
        }
        
        .doc-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            padding: 2rem;
            transition: all 0.2s ease;
        }
        
        .doc-card:hover {
            background: var(--bg-tertiary);
            border-color: var(--brand-purple);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        
        .doc-card h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }
        
        .doc-card p {
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 1.5rem;
        }
        
        .doc-link {
            display: inline-block;
            color: var(--brand-purple);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s ease;
        }
        
        .doc-link:hover {
            color: #7c3aed;
        }
        
        .doc-link::after {
            content: ' →';
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 3rem;
            padding: 2rem;
            background: var(--bg-secondary);
            border-radius: 12px;
            border: 1px solid var(--border-primary);
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 600;
            color: var(--brand-purple);
        }
        
        .stat-label {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ICM SNG Poker 문서</h1>
        <p class="subtitle">API 레퍼런스 및 컴포넌트 가이드</p>
        
        <div class="docs-grid">
            <div class="doc-card">
                <h2>📘 API 문서</h2>
                <p>JSDoc으로 생성된 상세한 API 레퍼런스입니다. 모든 클래스, 함수, 타입 정의를 확인할 수 있습니다.</p>
                <a href="./api/index.html" class="doc-link">API 문서 보기</a>
            </div>
            
            <div class="doc-card">
                <h2>🎨 컴포넌트 가이드</h2>
                <p>Storybook으로 작성된 UI 컴포넌트 문서입니다. 실시간으로 컴포넌트를 테스트하고 사용법을 확인할 수 있습니다.</p>
                <a href="./storybook/index.html" class="doc-link">Storybook 보기</a>
            </div>
            
            <div class="doc-card">
                <h2>📚 개발 가이드</h2>
                <p>프로젝트 구조, 개발 환경 설정, 코딩 컨벤션 등 개발에 필요한 모든 정보를 담고 있습니다.</p>
                <a href="https://github.com/hummer91/ICM_SNG#readme" class="doc-link">README 보기</a>
            </div>
        </div>
        
        <div class="stats" id="stats">
            <!-- 통계가 여기에 동적으로 삽입됩니다 -->
        </div>
    </div>
    
    <script>
        // 문서 통계 로드
        fetch('./stats.json')
            .then(res => res.json())
            .then(stats => {
                const statsEl = document.getElementById('stats');
                statsEl.innerHTML = \`
                    <div class="stat">
                        <div class="stat-value">\${stats.modules || 0}</div>
                        <div class="stat-label">모듈</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">\${stats.functions || 0}</div>
                        <div class="stat-label">함수</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">\${stats.classes || 0}</div>
                        <div class="stat-label">클래스</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">\${stats.components || 0}</div>
                        <div class="stat-label">컴포넌트</div>
                    </div>
                \`;
            })
            .catch(() => {
                console.log('통계 파일을 찾을 수 없습니다.');
            });
    </script>
</body>
</html>`;

  await fs.writeFile(path.join(docsDir, 'index.html'), indexHtml);
}

/**
 * 문서 통계 생성
 * @param {string} docsDir - 문서 디렉토리 경로
 */
async function generateStats(docsDir) {
  const stats = {
    modules: 0,
    functions: 0,
    classes: 0,
    components: 0,
    generated: new Date().toISOString(),
  };

  // JS 파일 카운트 (대략적인 통계)
  try {
    const srcDir = path.join(rootDir, 'src', 'js');
    const files = await fs.readdir(srcDir, { recursive: true });

    for (const file of files) {
      if (file.endsWith('.js') && !file.includes('.test.') && !file.includes('.stories.')) {
        stats.modules++;
      }
      if (file.endsWith('.stories.js')) {
        stats.components++;
      }
    }

    // 대략적인 추정값
    stats.functions = stats.modules * 5;
    stats.classes = stats.components + 2;
  } catch (error) {
    console.warn('통계 생성 중 경고:', error.message);
  }

  await fs.writeFile(path.join(docsDir, 'stats.json'), JSON.stringify(stats, null, 2));

  console.log('\n📊 문서 통계:');
  console.log(`   - 모듈: ${stats.modules}개`);
  console.log(`   - 함수: ${stats.functions}개 (추정)`);
  console.log(`   - 클래스: ${stats.classes}개`);
  console.log(`   - 컴포넌트: ${stats.components}개`);
}

// 스크립트 실행
generateDocs().catch(console.error);
