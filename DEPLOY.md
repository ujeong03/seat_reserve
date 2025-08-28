# 🚀 배포 가이드

## ⚠️ 중요: 배포 방법 선택

현재 앱은 Socket.IO + SQLite를 사용하므로 **Vercel 서버리스 환경과 호환되지 않습니다**.

## 🎯 **추천 방법: Railway 배포**

Railway는 Node.js + Socket.IO + SQLite를 완벽 지원합니다.

### Railway 배포 단계:

1. **Railway 계정 생성**: https://railway.app
2. **GitHub로 로그인**
3. **"New Project" 클릭**
4. **GitHub 저장소 선택**: `sclab_seatmap`
5. **프로젝트 설정**:
   - Framework Preset: **Other**
   - Root Directory: **/** (기본값)
   - Build Command: 비워둠
   - Output Directory: 비워둠
   - Install Command: `npm install`

### 3. 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정하세요:

```
NODE_ENV=production
ADMIN_PASSWORD=your_secure_password_here
CORS_ORIGIN=https://your-project-name.railway.app
PORT=$PORT
```

**⚠️ 중요**: `ADMIN_PASSWORD`는 반드시 강력한 비밀번호로 설정하세요!

### 4. 배포 완료 후 테스트

✅ **기본 기능 테스트**
- [ ] 메인 페이지 (`https://your-project.railway.app`) 접속
- [ ] 좌석 선택 및 예약 기능
- [ ] 관리자 페이지 (`/admin.html`) 접속
- [ ] 실시간 동기화 확인

✅ **모바일 테스트**
- [ ] 모바일에서 접속 확인
- [ ] 반응형 디자인 확인

## 🛠️ 문제 해결

### 배포 실패 시
1. Vercel 대시보드의 "Functions" 탭에서 로그 확인
2. `vercel.json` 설정 확인
3. 환경변수 설정 확인

### SQLite 관련 이슈
- Vercel은 서버리스 환경이므로 데이터는 매 배포시 초기화됩니다
- 영구적인 데이터 저장이 필요하다면 외부 데이터베이스 서비스 사용을 권장합니다

### CORS 오류 시
- `CORS_ORIGIN` 환경변수에 실제 배포 도메인을 정확히 설정했는지 확인
- 예: `https://my-seat-app.vercel.app`

## 📞 지원

배포 중 문제가 발생하면 Railway 공식 문서를 참고하거나 GitHub Issues를 확인하세요.

---
**추천**: 실시간 기능이 중요하다면 **Railway 사용**을 강력히 권장합니다!
