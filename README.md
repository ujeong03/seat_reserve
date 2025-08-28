# 🪑 연구실 좌석 예약 시스템

Node.js + Socket.IO + SQLite 기반의 실시간 좌석 예약 시스템입니다.

## ✨ 주요 기능

- 🔄 **실시간 동기화**: Socket.IO를 통한 실시간 좌석 상태 업데이트
- 🎓 **학번 인증**: 데이터베이스 기반 학번 인증 시스템
- 👨‍💼 **관리자 기능**: 예약 관리, 학생 관리, 통계 대시보드
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- ⏰ **자동 리셋**: 오전/오후 세션별 자동 예약 초기화
- 🔒 **보안**: bcrypt 암호화, 입력 검증, CORS 설정

## 🚀 빠른 시작

### 로컬 실행
```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 설정값 입력

# 3. 서버 시작
npm start
```

### 접속 정보
- **사용자 페이지**: http://localhost:3000
- **관리자 페이지**: http://localhost:3000/admin.html
- **관리자 비밀번호**: 환경변수 설정값

## 📊 좌석 배치

```
    [창문]
    ┌─────────────────┐
    │  1   2    5   6 │
    │  3   4    7   8 │
    │                 │ [창문]
    │ 9  10 11 12 13  │
    │                 │
    └─[출입구]─────────┘
```

## 🛠️ 기술 스택

- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Database**: SQLite3
- **Frontend**: Vanilla JavaScript, CSS3
- **Security**: bcrypt, helmet, CORS
- **Deployment**: Vercel

## 📝 라이선스

MIT License