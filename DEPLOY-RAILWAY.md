# 🚂 Railway 배포 가이드

## Railway 배포 (추천 방법)

Railway는 Node.js + Socket.IO + SQLite를 완벽 지원합니다.

### 1. Railway 계정 생성
- https://railway.app 접속
- GitHub 계정으로 로그인

### 2. 프로젝트 배포
1. "New Project" 클릭
2. "Deploy from GitHub repo" 선택  
3. `seat_reserve` 저장소 선택
4. 자동 배포 시작

### 3. 환경변수 설정
Railway 대시보드에서 설정:
```
NODE_ENV=production
ADMIN_PASSWORD=강력한_비밀번호
PORT=3000
```

### 4. 도메인 설정
- Railway에서 자동으로 도메인 제공
- 커스텀 도메인도 설정 가능

**장점:**
✅ Socket.IO 완벽 지원
✅ SQLite 파일 유지
✅ 무료 플랜 제공
✅ 자동 HTTPS
✅ GitHub 연동으로 자동 배포

**단점:**
⚠️ 무료 플랜: 월 500시간 제한 (하지만 대부분 충분)
