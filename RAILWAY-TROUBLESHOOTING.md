# 🚂 Railway 배포 문제 해결 가이드

## ✅ 해결된 문제들

### 1. 서버가 시작되지 않는 문제
**증상**: Railway에 배포 후 서버가 시작되지 않음
**원인**: `src/server.js`의 서버 시작 조건이 Railway 환경을 고려하지 않음
**해결**: 서버 시작 조건을 `!isVercel`로 변경하여 Railway에서 정상 작동하도록 수정

### 2. 환경 변수 감지 오류
**증상**: Railway 환경이 제대로 감지되지 않음
**원인**: 잘못된 환경 변수 사용 (`RAILWAY_ENVIRONMENT` → `RAILWAY_ENVIRONMENT_ID` 또는 `RAILWAY_PROJECT_ID`)
**해결**: 올바른 Railway 환경 변수로 수정

### 3. 데이터베이스 초기화 문제
**증상**: Railway에서 데이터가 저장되지 않음
**원인**: production 환경을 모두 Vercel로 가정하여 메모리 DB 사용
**해결**: Railway 환경 감지 추가하여 파일 DB 사용하도록 수정

## 🔧 Railway 배포 체크리스트

### 필수 환경 변수
```
NODE_ENV=production
ADMIN_PASSWORD=your_strong_password
PORT=$PORT
```

### 선택적 환경 변수
```
CORS_ORIGIN=https://your-app.railway.app
```

## 🚨 주의사항

1. **PORT 변수**: 반드시 `$PORT`로 설정 (Railway가 자동 할당)
2. **ADMIN_PASSWORD**: 강력한 비밀번호 사용 필수
3. **데이터 지속성**: Railway는 파일 시스템을 제공하므로 SQLite 데이터가 유지됨

## 🧪 로컬 테스트 방법

Railway 환경을 시뮬레이션하여 테스트:
```bash
NODE_ENV=production RAILWAY_PROJECT_ID=test PORT=3000 npm start
```

## 📝 변경 사항 요약

- `src/server.js`: 서버 시작 로직 수정
- `src/database.js`: Railway 환경 감지 및 DB 경로 설정
- `DEPLOY.md`: 문서 일관성 개선

---
**결과**: Railway 배포가 이제 정상적으로 작동합니다! 🎉