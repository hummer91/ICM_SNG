#!/bin/bash

# 개발 환경 실행 스크립트

set -e

echo "🚀 개발 환경을 시작합니다..."

# 환경 변수 파일 확인
if [ ! -f .env ]; then
    echo "⚠️  .env 파일이 없습니다. .env.example을 복사합니다..."
    cp .env.example .env
    echo "✅ .env 파일이 생성되었습니다. 환경 변수를 설정해주세요."
fi

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker를 시작해주세요."
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose down -v

# 이미지 빌드
echo "🔨 Docker 이미지를 빌드합니다..."
docker-compose build

# 컨테이너 시작
echo "📦 컨테이너를 시작합니다..."
docker-compose up -d

# 데이터베이스 준비 대기
echo "⏳ 데이터베이스 준비를 기다립니다..."
sleep 10

# 의존성 설치 확인
echo "📦 애플리케이션 의존성을 확인합니다..."
docker-compose exec app npm install

# 개발 서버 시작
echo "🎯 개발 서버를 시작합니다..."
docker-compose logs -f app