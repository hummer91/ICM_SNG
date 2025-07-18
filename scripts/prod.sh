#!/bin/bash

# 프로덕션 환경 실행 스크립트

set -e

echo "🚀 프로덕션 환경을 시작합니다..."

# 환경 변수 파일 확인
if [ ! -f .env.production ]; then
    echo "❌ .env.production 파일이 없습니다. 프로덕션 환경 변수를 설정해주세요."
    exit 1
fi

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker를 시작해주세요."
    exit 1
fi

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너를 정리합니다..."
docker-compose -f docker-compose.prod.yml down

# 이미지 빌드
echo "🔨 프로덕션 Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml build

# 컨테이너 시작
echo "📦 프로덕션 컨테이너를 시작합니다..."
docker-compose -f docker-compose.prod.yml up -d

# 헬스 체크
echo "🏥 서비스 헬스 체크를 수행합니다..."
sleep 30

# 헬스 체크 확인
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ 서비스가 정상적으로 시작되었습니다!"
    echo "🌐 애플리케이션: http://localhost"
    echo "🗄️  pgAdmin: http://localhost:5050"
else
    echo "❌ 서비스 시작에 실패했습니다. 로그를 확인해주세요."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi