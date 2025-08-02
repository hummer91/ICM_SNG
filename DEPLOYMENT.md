# ICM SNG 앱 배포 가이드

## 📋 배포 전 준비사항

1. **도메인 설정** (선택사항)
   - 서브도메인 사용시: `icm.yourdomain.com`
   - 서브디렉토리 사용시: `yourdomain.com/icm`

2. **프로젝트 빌드**
   ```bash
   # 프로젝트 디렉토리로 이동
   cd /home/linuxuser_2/var/www/html/ICM_SNG
   
   # 의존성 설치
   pnpm install
   
   # 프로덕션 빌드
   pnpm build
   ```

## 🚀 Nginx 설정

### 1. Nginx 설정 파일 복사
```bash
# 설정 파일을 sites-available로 복사
sudo cp nginx-icm-sng.conf /etc/nginx/sites-available/icm-sng

# 설정 파일 편집 (도메인 수정)
sudo nano /etc/nginx/sites-available/icm-sng
```

### 2. 도메인 설정 수정
```nginx
# 실제 도메인으로 변경
server_name icm.yourdomain.com;

# 또는 IP 주소로 직접 접속시
server_name YOUR_SERVER_IP;

# 또는 기존 도메인의 서브디렉토리로 운영시
# location /icm/ 블록 추가
```

### 3. 설정 활성화
```bash
# 심볼릭 링크 생성
sudo ln -s /etc/nginx/sites-available/icm-sng /etc/nginx/sites-enabled/

# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl reload nginx
```

## 🌐 접속 방법

### 개발 환경 (로컬)
```bash
# Vite 개발 서버 실행
pnpm dev

# http://localhost:3000 접속
```

### 프로덕션 환경 (서버)
1. **도메인 설정한 경우**
   - http://icm.yourdomain.com

2. **IP로 직접 접속**
   - http://YOUR_SERVER_IP

3. **서브디렉토리로 설정한 경우**
   - http://yourdomain.com/icm

## 🔧 트러블슈팅

### 1. 403 Forbidden 오류
```bash
# 디렉토리 권한 확인
ls -la /home/linuxuser_2/var/www/html/ICM_SNG

# 권한 수정
sudo chown -R www-data:www-data /home/linuxuser_2/var/www/html/ICM_SNG
sudo chmod -R 755 /home/linuxuser_2/var/www/html/ICM_SNG
```

### 2. 404 Not Found 오류
```bash
# index.html 파일 존재 확인
ls -la /home/linuxuser_2/var/www/html/ICM_SNG/index.html

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/icm-sng-error.log
```

### 3. 정적 파일이 로드되지 않음
```bash
# 빌드 파일 확인 (프로덕션인 경우)
ls -la /home/linuxuser_2/var/www/html/ICM_SNG/dist/

# 개발 파일 확인
ls -la /home/linuxuser_2/var/www/html/ICM_SNG/src/
```

## 🔒 SSL 인증서 설정 (선택사항)

```bash
# Let's Encrypt 설치
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d icm.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

## 📝 유지보수

### 로그 확인
```bash
# 접속 로그
sudo tail -f /var/log/nginx/icm-sng-access.log

# 에러 로그
sudo tail -f /var/log/nginx/icm-sng-error.log
```

### 업데이트 배포
```bash
# 코드 업데이트 후
cd /home/linuxuser_2/var/www/html/ICM_SNG
pnpm build

# 캐시 클리어 (필요시)
sudo nginx -s reload
```

## 🎯 성능 최적화

1. **gzip 압축**: 이미 설정됨
2. **정적 파일 캐싱**: 1년으로 설정됨
3. **CDN 사용**: 향후 고려 사항
4. **HTTP/2**: SSL 설정시 자동 활성화

## 📱 모바일 접속

모바일 기기에서 접속시:
- 반응형 디자인이 적용되어 자동으로 모바일 레이아웃으로 전환
- 터치 제스처 지원 (향후 구현 예정)