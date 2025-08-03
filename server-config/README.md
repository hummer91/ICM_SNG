# 서버 설정 가이드

이 디렉토리는 ICM SNG 포커 앱의 프로덕션 서버 설정 파일을 포함합니다.

## 파일 설명

### nginx.conf

Nginx 웹 서버를 위한 보안 설정 파일입니다.

**주요 기능:**

- HTTP에서 HTTPS로 자동 리다이렉트
- SSL/TLS 설정 (TLS 1.2, 1.3)
- 보안 헤더 (HSTS, X-Frame-Options, CSP 등)
- gzip 압축
- 정적 파일 캐싱
- SPA 라우팅 지원

**사용법:**

```bash
# Nginx 설정에 포함
sudo cp nginx.conf /etc/nginx/sites-available/icm-sng.com
sudo ln -s /etc/nginx/sites-available/icm-sng.com /etc/nginx/sites-enabled/
sudo nginx -t  # 설정 테스트
sudo systemctl reload nginx
```

### apache.conf

Apache 웹 서버를 위한 보안 설정 파일입니다.

**주요 기능:**

- HTTP에서 HTTPS로 자동 리다이렉트
- SSL/TLS 설정
- 보안 헤더 설정
- mod_deflate를 통한 압축
- mod_expires를 통한 캐싱
- SPA 라우팅 지원

**사용법:**

```bash
# Apache 설정에 포함
sudo cp apache.conf /etc/apache2/sites-available/icm-sng.com.conf
sudo a2ensite icm-sng.com
sudo apache2ctl configtest  # 설정 테스트
sudo systemctl reload apache2
```

### vite-security.js

Vite 개발 서버를 위한 보안 미들웨어입니다.

**주요 기능:**

- 개발 환경에서 보안 헤더 적용
- CSP 정책 적용
- 선택적 HTTPS 리다이렉션

**사용법:**
이미 `vite.config.js`에 플러그인으로 통합되어 있습니다.

## SSL 인증서 설정

Let's Encrypt를 사용한 무료 SSL 인증서 발급:

```bash
# Certbot 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx  # Nginx 사용 시
# 또는
sudo apt install certbot python3-certbot-apache  # Apache 사용 시

# 인증서 발급
sudo certbot --nginx -d icm-sng.com -d www.icm-sng.com  # Nginx
# 또는
sudo certbot --apache -d icm-sng.com -d www.icm-sng.com  # Apache

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 보안 헤더 확인

설정이 올바르게 적용되었는지 확인하는 방법:

```bash
# 보안 헤더 확인
curl -I https://icm-sng.com

# 온라인 도구 사용
# - https://securityheaders.com/
# - https://observatory.mozilla.org/
```

## 권장 사항

1. **정기적인 업데이트**: 서버 소프트웨어와 SSL 인증서를 최신 상태로 유지
2. **백업**: 설정 파일 변경 전 항상 백업 생성
3. **모니터링**: 서버 로그를 정기적으로 확인
4. **방화벽**: UFW 또는 iptables로 불필요한 포트 차단

## 문제 해결

### Nginx 오류

```bash
# 설정 구문 확인
sudo nginx -t

# 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### Apache 오류

```bash
# 설정 구문 확인
sudo apache2ctl configtest

# 에러 로그 확인
sudo tail -f /var/log/apache2/error.log
```

### SSL 인증서 문제

```bash
# 인증서 상태 확인
sudo certbot certificates

# 수동 갱신
sudo certbot renew
```
