# 🚀 배포 가이드

## ⚠️ 중요: 배포 방법 선택

현재 앱은 Socket.IO + SQLite를 사용하므로 **Vercel 서버리스 환경과 호환되지 않습니다**.

## 🎯 **추천 방법: Railway 배포**

Railway는 Node.js + Socket.IO + SQLite를 완벽 지원합니다.

### Railway 배포 단계:

1. **Railway 계정 생성**: https://railway.app
2. **GitHub로 로그인**
3. **"New Project" → "Deploy from GitHub repo"**
4. **`seat_reserve` 저장소 선택**
5. **환경변수 설정**:
   ```
   NODE_ENV=production
   ADMIN_PASSWORD=강력한_비밀번호
   ```
6. **자동 배포 완료!**

**Railway 장점:**
✅ Socket.IO 실시간 통신 지원
✅ SQLite 파일 저장 유지  
✅ 무료 플랜 제공 (월 500시간)
✅ 자동 HTTPS 제공
✅ GitHub 연동으로 자동 배포

---

## 🔄 **대안: Vercel용 단순화 버전**

실시간 기능 없이 Vercel에 배포하려면:

### 1. 클라이언트 코드 변경
`public/index.html`에서 스크립트 변경:
```html
<!-- 기존 -->
<script src="user.js"></script>

<!-- 변경 -->
<script src="user-serverless.js"></script>
```

### 2. 제한사항
⚠️ **실시간 동기화 없음** (5초마다 새로고침)  
⚠️ **데이터 휘발성** (서버 재시작시 초기화)  
⚠️ **관리자 실시간 모니터링 제한**  

### 3. Vercel 배포
1. 위 변경사항 적용 후 GitHub 푸시
2. Vercel에서 프로젝트 가져오기
3. 환경변수 설정:
   ```
   NODE_ENV=production
   ADMIN_PASSWORD=비밀번호
   ```

---

## 📊 **배포 방법 비교**

| 기능 | Railway | Vercel (단순화) |
|------|---------|----------------|
| 실시간 동기화 | ✅ | ❌ |
| 데이터 지속성 | ✅ | ❌ |
| 배포 복잡도 | 쉬움 | 쉬움 |
| 무료 사용량 | 500시간/월 | 무제한 |
| HTTPS | 자동 | 자동 |

## � **추가 리소스**

- [Railway 배포 상세 가이드](./DEPLOY-RAILWAY.md)
- [Vercel 문제 해결 가이드](https://vercel.com/docs/troubleshooting)

---
**추천**: 실시간 기능이 중요하다면 **Railway 사용**을 강력히 권장합니다!
