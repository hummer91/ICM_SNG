# SSL 인증서 설정 가이드

## 🔐 Let's Encrypt SSL 인증서 설치

### 1. 자동 설치 (추천)

```bash
# SSL 설정 스크립트 실행 (sudo 권한 필요)
sudo bash setup-ssl.sh
```

### 2. 수동 설치

#### Step 1: nginx 설정 적용

```bash
sudo cp nginx-icm-sng.conf /etc/nginx/sites-available/icm-sng
sudo ln -sf /etc/nginx/sites-available/icm-sng /etc/nginx/sites-enabled/icm-sng
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 2: SSL 인증서 획득

```bash
sudo certbot --nginx -d icm.slotrogue.monster
```

#### Step 3: 자동 갱신 설정 확인

```bash
sudo certbot renew --dry-run
```

## 📋 설정 완료 후 확인사항

### ✅ 정상 작동 확인

- **HTTP**: http://icm.slotrogue.monster (→ HTTPS로 리디렉션)
- **HTTPS**: https://icm.slotrogue.monster (SSL 보안 연결)

### 🔒 SSL 보안 점수 확인

- [SSL Labs](https://www.ssllabs.com/ssltest/analyze.html?d=icm.slotrogue.monster)
- 목표: A+ 등급

### 🔄 자동 갱신 확인

```bash
# crontab 확인
sudo crontab -l | grep certbot

# 갱신 테스트
sudo certbot renew --dry-run
```

## 🛠️ 트러블슈팅

### nginx 설정 오류

```bash
# 설정 파일 문법 검사
sudo nginx -t

# nginx 재시작
sudo systemctl restart nginx

# nginx 상태 확인
sudo systemctl status nginx
```

### SSL 인증서 오류

```bash
# 인증서 상태 확인
sudo certbot certificates

# 인증서 갱신
sudo certbot renew

# nginx 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### 방화벽 설정

```bash
# 포트 80, 443 열기
sudo ufw allow 80
sudo ufw allow 443
sudo ufw reload
```

## 📊 성능 최적화

설정된 SSL 최적화:

- **HTTP/2 활성화**: 더 빠른 로딩 속도
- **HSTS 헤더**: 브라우저에서 HTTPS 강제
- **보안 헤더**: XSS, 클릭재킹 방지
- **SSL 세션 캐싱**: 연결 속도 향상
- **Modern TLS**: TLS 1.2/1.3 지원

## 🔧 고급 설정

### CSP (Content Security Policy) 사용자 정의

현재 설정을 더 엄격하게 변경하려면 `nginx-icm-sng.conf`에서:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;" always;
```

### OCSP Stapling 활성화

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/icm.slotrogue.monster/chain.pem;
```

## 📅 유지보수

### 정기 점검 (월 1회)

1. SSL 인증서 만료일 확인
2. nginx 로그 점검
3. 보안 헤더 테스트
4. 성능 모니터링

### 자동 갱신 확인

Let's Encrypt 인증서는 90일마다 갱신이 필요하며, certbot이 자동으로 처리합니다:

```bash
# 갱신 스케줄 확인
sudo systemctl status certbot.timer
```
