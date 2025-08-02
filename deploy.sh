#!/bin/bash

# ICM SNG 앱 배포 스크립트
# icm.slotrogue.monster 서브도메인 설정

echo "🚀 ICM SNG 앱을 icm.slotrogue.monster로 배포합니다"
echo "================================================"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 현재 디렉토리
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${YELLOW}1. Nginx 설정 파일 복사${NC}"
echo "다음 명령어를 실행하세요:"
echo -e "${GREEN}sudo cp $SCRIPT_DIR/nginx-icm-sng.conf /etc/nginx/sites-available/icm.slotrogue.monster${NC}"
echo ""

echo -e "${YELLOW}2. 사이트 활성화${NC}"
echo "다음 명령어를 실행하세요:"
echo -e "${GREEN}sudo ln -s /etc/nginx/sites-available/icm.slotrogue.monster /etc/nginx/sites-enabled/${NC}"
echo ""

echo -e "${YELLOW}3. Nginx 설정 테스트${NC}"
echo "다음 명령어를 실행하세요:"
echo -e "${GREEN}sudo nginx -t${NC}"
echo ""

echo -e "${YELLOW}4. Nginx 재시작${NC}"
echo "다음 명령어를 실행하세요:"
echo -e "${GREEN}sudo systemctl reload nginx${NC}"
echo ""

echo "================================================"
echo -e "${YELLOW}배포 완료 후:${NC}"
echo "✅ http://icm.slotrogue.monster 에서 접속 가능합니다"
echo ""
echo -e "${YELLOW}SSL 인증서 설정 (선택사항):${NC}"
echo -e "${GREEN}sudo certbot --nginx -d icm.slotrogue.monster${NC}"
echo ""

# 의존성 설치 확인
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}의존성이 설치되지 않았습니다. 설치하시겠습니까? (y/n)${NC}"
    read -r response
    if [[ "$response" == "y" ]]; then
        pnpm install
    fi
fi

# 빌드 옵션
echo -e "${YELLOW}프로덕션 빌드를 생성하시겠습니까? (y/n)${NC}"
echo "(개발 모드로만 실행하려면 n을 선택하세요)"
read -r response
if [[ "$response" == "y" ]]; then
    echo "빌드 중..."
    pnpm build
    echo -e "${GREEN}✅ 빌드 완료!${NC}"
fi

echo ""
echo "================================================"
echo "📝 수동으로 실행해야 할 명령어 요약:"
echo ""
echo "sudo cp $SCRIPT_DIR/nginx-icm-sng.conf /etc/nginx/sites-available/icm.slotrogue.monster"
echo "sudo ln -s /etc/nginx/sites-available/icm.slotrogue.monster /etc/nginx/sites-enabled/"
echo "sudo nginx -t"
echo "sudo systemctl reload nginx"
echo ""
echo "선택사항 (SSL):"
echo "sudo certbot --nginx -d icm.slotrogue.monster"