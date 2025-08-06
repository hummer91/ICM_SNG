테스트 실행 방법

1. 단위 테스트 실행 (Vitest)

# 모든 테스트 실행

npm test

# 특정 테스트 파일만 실행

npm test src/js/icm.test.js
npm test src/js/pushfold.test.js
npm test src/js/validation.test.js

# watch 모드로 실행 (파일 변경 시 자동 재실행)

npm test -- --watch

# 커버리지 리포트 생성

npm test -- --coverage

2. 각 테스트 파일이 검증하는 내용

icm.test.js:

- ICM 확률 합계 검증 (100%)
- EV 계산 범위 검증 (-100% ~ +100%)
- Malmuth-Harville 공식 정확성
- 버블 팩터 계산

pushfold.test.js:

- Push/Fold 범위 일관성
- 핸드 표기법 검증 (AA, AKs, AKo 등)
- Nash Equilibrium 범위 계산
- 포지션별 범위 조정

validation.test.js:

- 스택 크기 유효성 (0.5~100 BB)
- 포지션 유효성
- 액션 시퀀스 검증
- 게임 설정 전체 검증

3. UI 테스트 실행 (Playwright)

# Playwright로 UI 확인

python3 check_ui.py

# 또는 Node.js로 실행

npx playwright test

4. 브라우저에서 직접 테스트

# 개발 서버 실행

python3 -m http.server 8000

# 브라우저에서 열기

# http://localhost:8000/test_player_names.html

이렇게 테스트를 실행하면 ICM 계산과 검증 기능이 제대로 작동하는지 확인할 수 있습니다.
