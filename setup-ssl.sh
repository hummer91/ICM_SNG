#!/bin/bash

# SSL 인증서 설정 스크립트
# 이 스크립트를 sudo 권한으로 실행하세요

echo "🔐 ICM SNG SSL 인증서 설정을 시작합니다..."

# 1. 임시 HTTP 전용 설정으로 먼저 시작
echo "📋 임시 HTTP 전용 nginx 설정 복사 중..."
cp /home/linuxuser_2/var/www/html/ICM_SNG/nginx-icm-sng-http.conf /etc/nginx/sites-available/icm-sng
ln -sf /etc/nginx/sites-available/icm-sng /etc/nginx/sites-enabled/icm-sng

# 2. nginx 설정 테스트
echo "🧪 nginx 설정 테스트 중..."
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ nginx 설정에 오류가 있습니다."
    exit 1
fi

# 3. nginx 재시작
echo "🔄 nginx 재시작 중..."
systemctl reload nginx

# 4. SSL 인증서 획득
echo "🔒 Let's Encrypt SSL 인증서 획득 중..."
certbot --nginx -d icm.slotrogue.monster --non-interactive --agree-tos --email admin@slotrogue.monster

# 5. SSL 인증서 설치 후 HTTPS 설정으로 교체
echo "🔄 HTTPS 설정으로 업그레이드 중..."
cp /home/linuxuser_2/var/www/html/ICM_SNG/nginx-icm-sng.conf /etc/nginx/sites-available/icm-sng
nginx -t && systemctl reload nginx

# 5. 자동 갱신 설정 확인
echo "🔄 SSL 자동 갱신 설정 확인 중..."
certbot renew --dry-run

echo "✅ SSL 인증서 설정이 완료되었습니다!"
echo "🌐 https://icm.slotrogue.monster 로 접속해보세요!"

# 6. nginx 상태 확인
echo "📊 nginx 상태:"
systemctl status nginx --no-pager -l

echo ""
echo "🎉 설정 완료!"
echo "   HTTP:  http://icm.slotrogue.monster"
echo "   HTTPS: https://icm.slotrogue.monster"