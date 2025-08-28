# 데이터베이스 연결 옵션

## 1. Firebase Realtime Database (추천)

### 장점
- 설정이 매우 간단
- 실시간 동기화 자동 지원
- 무료 사용량 충분
- 서버 관리 불필요

### 구현 예시
```html
<!-- Firebase SDK 추가 -->
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"></script>
```

```javascript
// Firebase 설정
const firebaseConfig = {
  // Firebase 콘솔에서 받은 설정
};

// 예약 저장
function saveToFirebase(reservations) {
  const today = new Date().toDateString();
  const dbRef = firebase.database().ref(`reservations/${today}/${currentSession}`);
  dbRef.set(reservations);
}

// 실시간 동기화
firebase.database().ref('reservations').on('value', (snapshot) => {
  const data = snapshot.val();
  updateLocalReservations(data);
});
```

## 2. JSON Server (로컬 개발용)

### 간단한 REST API 서버
```bash
npm install -g json-server
```

```json
// db.json
{
  "reservations": {
    "2025-08-28": {
      "morning": {},
      "afternoon": {}
    }
  }
}
```

```bash
json-server --watch db.json --port 3000
```

## 3. SQLite + Express.js

### 가장 기본적인 서버 구성
```javascript
// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const db = new sqlite3.Database('reservations.db');

// 예약 저장 API
app.post('/api/reservations', (req, res) => {
  const { date, session, reservations } = req.body;
  // SQLite에 저장
});

// 예약 조회 API
app.get('/api/reservations/:date/:session', (req, res) => {
  // SQLite에서 조회
});
```

## 4. 클라우드 옵션들

### Supabase (PostgreSQL)
- Firebase와 유사하지만 관계형 DB
- 실시간 기능 지원
- 무료 티어 제공

### PlanetScale (MySQL)
- 서버리스 MySQL
- 스키마 변경 쉬움
- 무료 티어 제공

### Railway/Vercel
- 간단한 배포
- 데이터베이스 연결 쉬움
