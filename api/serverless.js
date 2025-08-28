const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// 메모리 기반 데이터 저장 (서버리스용)
let reservations = {
    morning: {},
    afternoon: {}
};

// 샘플 학생 데이터 (메모리 기반)
const students = {
    '20241001': '김철수',
    '20241002': '이영희', 
    '20241003': '박민수',
    '20241004': '정수진',
    '20241005': '장하나'
};

// 현재 세션 계산
function getCurrentSession() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 0 && hour < 12 ? 'morning' : 'afternoon';
}

// 다음 리셋 시간 계산
function getNextResetTime() {
    const now = new Date();
    const hour = now.getHours();
    const nextReset = new Date(now);
    
    if (hour >= 0 && hour < 12) {
        nextReset.setHours(12, 0, 0, 0);
    } else {
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
    }
    
    return nextReset;
}

// API 라우트들
app.get('/api/reservations', (req, res) => {
    const currentSession = getCurrentSession();
    const clientReservations = {};
    
    for (let seat in reservations[currentSession]) {
        clientReservations[seat] = reservations[currentSession][seat].name;
    }
    
    res.json({
        success: true,
        session: currentSession,
        reservations: clientReservations,
        nextReset: getNextResetTime(),
        stats: {
            totalSeats: 13,
            occupiedSeats: Object.keys(reservations[currentSession]).length,
            isMaintenanceMode: false
        }
    });
});

app.get('/reservations', (req, res) => {
    const currentSession = getCurrentSession();
    const clientReservations = {};
    
    for (let seat in reservations[currentSession]) {
        clientReservations[seat] = reservations[currentSession][seat].name;
    }
    
    res.json({
        success: true,
        session: currentSession,
        reservations: clientReservations,
        nextReset: getNextResetTime()
    });
});

app.post('/reservations', (req, res) => {
    const { seatId, studentId } = req.body;
    const currentSession = getCurrentSession();
    
    if (!students[studentId]) {
        return res.status(400).json({
            success: false,
            message: '등록되지 않은 학번입니다.'
        });
    }
    
    if (reservations[currentSession][seatId]) {
        return res.status(400).json({
            success: false,
            message: '이미 예약된 자리입니다.'
        });
    }
    
    // 한 명당 하나의 자리만 예약 가능
    for (let seat in reservations[currentSession]) {
        if (reservations[currentSession][seat].studentId === studentId) {
            return res.status(400).json({
                success: false,
                message: '이미 다른 자리를 예약하셨습니다.'
            });
        }
    }
    
    reservations[currentSession][seatId] = {
        studentId: studentId,
        name: students[studentId],
        timestamp: new Date().toISOString()
    };
    
    const clientReservations = {};
    for (let seat in reservations[currentSession]) {
        clientReservations[seat] = reservations[currentSession][seat].name;
    }
    
    res.json({
        success: true,
        message: `자리 ${seatId}번이 ${students[studentId]}님으로 예약되었습니다.`,
        reservations: clientReservations
    });
});

app.delete('/reservations/:seatId', (req, res) => {
    const { seatId } = req.params;
    const { studentId } = req.body;
    const currentSession = getCurrentSession();
    
    if (!reservations[currentSession][seatId]) {
        return res.status(404).json({
            success: false,
            message: '예약이 없는 자리입니다.'
        });
    }
    
    if (reservations[currentSession][seatId].studentId !== studentId) {
        return res.status(403).json({
            success: false,
            message: '본인이 예약한 자리만 취소할 수 있습니다.'
        });
    }
    
    delete reservations[currentSession][seatId];
    
    const clientReservations = {};
    for (let seat in reservations[currentSession]) {
        clientReservations[seat] = reservations[currentSession][seat].name;
    }
    
    res.json({
        success: true,
        message: `자리 ${seatId}번 예약이 취소되었습니다.`,
        reservations: clientReservations
    });
});

// 관리자 로그인
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

// 관리자 - 전체 예약 초기화
app.delete('/api/admin/reservations', (req, res) => {
    const currentSession = getCurrentSession();
    reservations[currentSession] = {};
    
    res.json({
        success: true,
        message: '모든 예약이 초기화되었습니다.'
    });
});

// 학생 목록 (관리자용)
app.get('/api/admin/students', (req, res) => {
    const studentList = Object.entries(students).map(([id, name]) => ({
        student_id: id,
        name: name
    }));
    
    res.json({
        success: true,
        students: studentList
    });
});

// 404 핸들링
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

module.exports = app;
