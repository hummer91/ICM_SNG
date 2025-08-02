#!/bin/bash

# ICM SNG 개발 서버 시작 스크립트

echo "🚀 ICM SNG 포커 학습 앱 개발 서버 시작"
echo "================================"

# 현재 디렉토리 확인
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# pnpm 설치 확인
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm이 설치되어 있지 않습니다."
    echo "📦 pnpm을 설치하는 중..."
    npm install -g pnpm
fi

# node_modules 확인
if [ ! -d "node_modules" ]; then
    echo "📦 의존성을 설치하는 중..."
    pnpm install
fi

# 개발 서버 시작
echo "✅ 개발 서버를 시작합니다..."
echo "🌐 http://localhost:3000 에서 접속 가능합니다"
echo "🛑 종료하려면 Ctrl+C를 누르세요"
echo "================================"

pnpm dev