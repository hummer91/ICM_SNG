# DNS 설정 가이드 - icm.slotrogue.monster

## 📋 DNS 설정 확인사항

### 1. 현재 서버 IP 확인

```bash
# 서버의 공인 IP 확인
curl -s ifconfig.me
# 또는
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### 2. DNS 레코드 추가

도메인 등록업체의 DNS 관리 페이지에서 다음 레코드를 추가하세요:

```
Type: A
Name: icm
Value: [서버의 IP 주소]
TTL: 3600 (또는 기본값)
```

### 3. DNS 전파 확인

```bash
# DNS 설정이 전파되었는지 확인
nslookup icm.slotrogue.monster

# 또는
dig icm.slotrogue.monster

# 또는 온라인 도구 사용
# https://www.whatsmydns.net/#A/icm.slotrogue.monster
```

## 🚀 빠른 테스트 (DNS 전파 전)

DNS가 전파되기 전에 테스트하려면 로컬 hosts 파일을 수정할 수 있습니다:

### Windows

1. 메모장을 관리자 권한으로 실행
2. `C:\Windows\System32\drivers\etc\hosts` 파일 열기
3. 다음 줄 추가:
   ```
   [서버IP] icm.slotrogue.monster
   ```

### Linux/Mac

```bash
sudo nano /etc/hosts
# 다음 줄 추가:
# [서버IP] icm.slotrogue.monster
```

## ⏱️ DNS 전파 시간

- 일반적으로 5분 ~ 48시간
- 대부분의 경우 1시간 이내 완료
- TTL 값이 낮을수록 빠르게 전파

## 🔍 문제 해결

### DNS가 제대로 설정되지 않은 경우

1. A 레코드가 올바르게 추가되었는지 확인
2. 서브도메인 이름이 정확한지 확인 (icm)
3. IP 주소가 정확한지 확인
4. DNS 캐시 클리어:

   ```bash
   # Windows
   ipconfig /flushdns

   # macOS
   sudo dscacheutil -flushcache

   # Linux
   sudo systemctl restart systemd-resolved
   ```

## ✅ 최종 확인

DNS 설정이 완료되면:

1. http://icm.slotrogue.monster 접속
2. ICM SNG 앱이 표시되는지 확인
3. HTTPS 설정을 위해 SSL 인증서 발급 진행
