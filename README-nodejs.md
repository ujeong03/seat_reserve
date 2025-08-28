# Node.js 연구실 자리 예약 시스템

## 🚀 빠른 시작

### 1. 필수 요구사항
- **Node.js** 16.0.0 이상 ([다운로드](https://nodejs.org/))
- **npm** (Node.js와 함께 설치됨)

### 2. 설치 방법

```powershell
# 1. 프로젝트 폴더로 이동
cd c:\Users\yhim0\sclab_seatmap

# 2. 필요한 패키지 설치
npm install

# 3. 서버 시작
npm start
```

### 3. 개발 모드 실행
```powershell
# nodemon 전역 설치 (파일 변경시 자동 재시작)
npm install -g nodemon

# 개발 모드로 실행
npm run dev
```

### 4. 접속
- **웹사이트**: http://localhost:3000
- **관리자 비밀번호**: admin123

## 📁 프로젝트 구조

```
sclab_seatmap/
├── server.js              # Node.js Express 서버
├── client.js              # 클라이언트 JavaScript (Socket.IO)
├── index.html             # 메인 HTML 페이지
├── style.css              # CSS 스타일
├── package.json           # Node.js 의존성 설정
├── firebase-config.js     # Firebase 설정 (백업용)
└── README-nodejs.md       # 이 파일
```

## 🔧 Node.js 버전의 주요 특징

### ✅ 백엔드 기능
- **Express.js** 웹 서버
- **Socket.IO** 실시간 양방향 통신
- **RESTful API** 엔드포인트
- **보안**: Helmet, CORS, Rate Limiting
- **압축**: Gzip 압축 지원
- **에러 핸들링**: 체계적인 오류 처리

### 🔄 실시간 동기화
- Socket.IO를 통한 실시간 데이터 동기화
- 자동 재연결 기능
- 하트비트를 통한 연결 상태 관리
- 비활성 사용자 자동 정리

### 👨‍💼 관리자 기능
- 비밀번호 해시화 (bcrypt)
- 모든 예약 초기화
- 점검 모드 토글
- 세션 강제 리셋
- 실시간 통계

### 📊 데이터 관리
- 메모리 기반 데이터 저장 (개발용)
- 세션별 통계 수집
- 자동 세션 리셋
- 온라인 사용자 추적

## 🌐 API 엔드포인트

### 일반 사용자 API
```
GET    /api/reservations        # 현재 예약 상황 조회
POST   /api/reservations        # 새로운 예약
DELETE /api/reservations/:id    # 예약 취소
GET    /api/stats              # 통계 조회
```

### 관리자 API
```
POST   /api/admin/login         # 관리자 로그인
DELETE /api/admin/reservations  # 모든 예약 초기화
POST   /api/admin/maintenance   # 점검 모드 토글
POST   /api/admin/reset-session # 세션 강제 리셋
```

### Socket.IO 이벤트
```javascript
// 클라이언트 → 서버
socket.emit('userOnline', userData);
socket.emit('updateUserName', name);
socket.emit('heartbeat');

// 서버 → 클라이언트
socket.on('initialData', data);
socket.on('reservationUpdate', data);
socket.on('onlineUsersUpdate', data);
socket.on('sessionReset', data);
socket.on('maintenanceMode', data);
```

## 🔒 보안 기능

### 비밀번호 보안
```javascript
// 관리자 비밀번호 변경 (server.js에서)
const bcrypt = require('bcryptjs');
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('새로운비밀번호', 10);
```

### Rate Limiting
- API 호출 제한: 15분에 100회
- DDoS 공격 방지

### CORS 설정
```javascript
// 특정 도메인만 허용하려면
const cors = require('cors');
app.use(cors({
    origin: ['http://localhost:3000', 'https://yourdomain.com']
}));
```

## 📱 클라이언트 기능

### Socket.IO 클라이언트
```javascript
// 자동 환경 감지
const socketUrl = window.location.hostname === 'localhost' ? 
    'http://localhost:3000' : window.location.origin;

const socket = io(socketUrl);
```

### API 호출
```javascript
// 예약하기
const result = await apiCall('/reservations', {
    method: 'POST',
    body: JSON.stringify({ seatId: '1-1', userName: '홍길동' })
});
```

## 🚀 배포 가이드

### 1. Heroku 배포
```bash
# Heroku CLI 설치 후
heroku create your-app-name
git add .
git commit -m "Initial commit"
git push heroku main
```

### 2. Railway 배포
```bash
# Railway CLI 설치 후
railway login
railway init
railway up
```

### 3. 환경 변수 설정
```bash
# 운영 환경에서는 환경 변수 사용
PORT=3000
ADMIN_PASSWORD=your-secure-password
NODE_ENV=production
```

## 🛠️ 개발 가이드

### 데이터베이스 연결 (선택사항)
```javascript
// MongoDB 연결 예시
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    seatId: String,
    userName: String,
    session: String,
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
```

### 로깅 추가
```javascript
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

### 테스트
```javascript
// Jest 테스트 예시
npm install --save-dev jest supertest

// package.json에 추가
"scripts": {
    "test": "jest"
}
```

## 🐛 트러블슈팅

### 포트 충돌
```powershell
# 포트 3000이 사용 중일 때
netstat -ano | findstr :3000
taskkill /PID [PID번호] /F

# 또는 다른 포트 사용
set PORT=3001 && npm start
```

### Socket.IO 연결 문제
```javascript
// 클라이언트에서 연결 상태 확인
socket.on('connect_error', (error) => {
    console.error('연결 오류:', error);
});
```

### CORS 오류
```javascript
// 개발 시 모든 도메인 허용
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
}));
```

## 📊 성능 최적화

### 클러스터링
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // 서버 코드
}
```

### Redis를 이용한 세션 관리
```javascript
const redis = require('redis');
const client = redis.createClient();

// 세션 저장
client.set('reservations', JSON.stringify(reservations));
```

---

**Node.js 버전의 장점:**
- ✅ 실시간 동기화 (Socket.IO)
- ✅ 확장 가능한 아키텍처
- ✅ RESTful API
- ✅ 보안 기능 내장
- ✅ 배포 용이성
- ✅ 데이터베이스 연동 가능

**Firebase vs Node.js 비교:**
- **Firebase**: 설정 간단, 관리 편함, 제한적 커스터마이징
- **Node.js**: 완전한 제어, 복잡한 로직 구현 가능, 높은 학습 곡선
