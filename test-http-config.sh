#!/bin/bash

echo "🧪 HTTP 전용 nginx 설정 테스트..."

# 1. HTTP 전용 설정 복사
sudo cp /home/linuxuser_2/var/www/html/ICM_SNG/nginx-icm-sng-http.conf /etc/nginx/sites-available/icm-sng
sudo ln -sf /etc/nginx/sites-available/icm-sng /etc/nginx/sites-enabled/icm-sng

# 2. nginx 설정 테스트
echo "📋 nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ nginx 설정 테스트 성공!"
    echo "🔄 nginx 재시작 중..."
    sudo systemctl reload nginx
    echo "✅ 설정 완료! http://icm.slotrogue.monster 접속 테스트 가능"
else
    echo "❌ nginx 설정에 오류가 있습니다."
    exit 1
fi