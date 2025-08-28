const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const Database = require('./database');

// 환경변수 로드
require('dotenv').config();

// 환경변수 설정 (먼저 선언)
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const NODE_ENV = process.env.NODE_ENV || 'development';
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV; // Vercel 환경 감지
const isRailway = process.env.RAILWAY_ENVIRONMENT; // Railway 환경 감지

// 데이터베이스 초기화
const db = new Database();

const app = express();
const server = http.createServer(app);

// Socket.IO는 Vercel이 아닌 환경에서만 사용
let io = null;
if (!isVercel) {
    io = socketIo(server, {
        cors: {
            origin: NODE_ENV === 'production' 
                ? [process.env.CORS_ORIGIN || "*"] 
                : "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });
    console.log('✅ Socket.IO 활성화됨');
} else {
    console.log('⚠️ Vercel 환경 - Socket.IO 비활성화됨');
}

// Socket.IO 이벤트 발송 헬퍼 (Vercel에서는 무시)
function emitToClients(event, data) {
    if (io) {
        io.emit(event, data);
    }
}

// 미들웨어 설정
app.use(helmet({
    contentSecurityPolicy: false // 개발 환경에서는 비활성화
}));
app.use(compression());
app.use(cors({
    origin: NODE_ENV === 'production' 
        ? [process.env.CORS_ORIGIN || "*"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
}));
app.use(express.json());
// 정적 파일 제공 (public 폴더만)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15분
    max: 100 // 최대 100개 요청
});
app.use('/api', limiter);

// 데이터 저장소 (실제 운영시에는 데이터베이스 사용)
let reservations = {
    morning: {},
    afternoon: {}
};

let onlineUsers = {};
let isMaintenanceMode = false;
let sessionStats = {
    morning: { totalReservations: 0, peakUsage: 0 },
    afternoon: { totalReservations: 0, peakUsage: 0 }
};

// 관리자 설정
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);
const serverStartTime = Date.now();

// 현재 세션 계산
function getCurrentSession() {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 12) {
        return 'morning';
    } else {
        return 'afternoon';
    }
}

// 다음 리셋 시간 계산
function getNextResetTime() {
    const now = new Date();
    const hour = now.getHours();
    const nextReset = new Date(now);
    
    if (hour >= 0 && hour < 12) {
        // 오전 세션 중 → 다음 리셋은 정오 12:00
        nextReset.setHours(12, 0, 0, 0);
    } else {
        // 오후 세션 중 → 다음 리셋은 다음날 자정 00:00
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
    }
    
    return nextReset;
}

// 통계 업데이트
function updateStats() {
    const currentSession = getCurrentSession();
    const reservationCount = Object.keys(reservations[currentSession]).length;
    const onlineCount = Object.keys(onlineUsers).length;
    
    sessionStats[currentSession].totalReservations = reservationCount;
    sessionStats[currentSession].peakUsage = Math.max(
        sessionStats[currentSession].peakUsage,
        onlineCount
    );
}

// API 라우트들

// 현재 예약 상황 조회 (기존 클라이언트용)
app.get('/reservations', (req, res) => {
    const currentSession = getCurrentSession();
    
    // 클라이언트에는 이름만 전송 (개인정보 보호)
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
            onlineUsers: Object.keys(onlineUsers).length,
            isMaintenanceMode
        }
    });
});

// 현재 예약 상황 조회 (관리자용 - 상세 정보 포함)
app.get('/api/reservations', (req, res) => {
    const currentSession = getCurrentSession();
    res.json({
        success: true,
        session: currentSession,
        reservations: reservations[currentSession],
        nextReset: getNextResetTime(),
        stats: {
            totalSeats: 13,
            occupiedSeats: Object.keys(reservations[currentSession]).length,
            onlineUsers: Object.keys(onlineUsers).length,
            isMaintenanceMode
        }
    });
});

// 예약하기
app.post('/reservations', async (req, res) => {
    console.log('예약 요청 받음:', req.body);
    const { seatId, studentId } = req.body;
    const currentSession = getCurrentSession();
    
    console.log(`예약 시도 - 좌석: ${seatId}, 학번: ${studentId}, 세션: ${currentSession}`);
    console.log('현재 예약 상황:', reservations[currentSession]);
    
    if (isMaintenanceMode) {
        console.log('점검 모드로 인한 예약 거부');
        return res.status(403).json({
            success: false,
            message: '현재 시스템 점검 중입니다.'
        });
    }
    
    if (!seatId || !studentId) {
        console.log('필수 정보 누락');
        return res.status(400).json({
            success: false,
            message: '자리 번호와 학번을 입력해주세요.'
        });
    }
    
    try {
        // 학번이 데이터베이스에 존재하는지 확인
        const student = await db.getStudentById(studentId);
        if (!student) {
            console.log(`등록되지 않은 학번: ${studentId}`);
            return res.status(400).json({
                success: false,
                message: '등록되지 않은 학번입니다. 학번을 다시 확인해주세요.'
            });
        }
        
        // 이미 예약된 자리인지 확인
        if (reservations[currentSession][seatId]) {
            console.log(`409 에러 발생 - 좌석 ${seatId}이 이미 예약됨`);
            return res.status(409).json({
                success: false,
                message: '이미 예약된 자리입니다.'
            });
        }
        
        // 사용자가 이미 다른 자리를 예약했는지 확인
        for (let seat in reservations[currentSession]) {
            if (reservations[currentSession][seat].studentId === studentId) {
                console.log(`사용자 ${studentId}가 이미 ${seat}번 자리를 예약했음`);
                return res.status(409).json({
                    success: false,
                    message: '이미 다른 자리를 예약하셨습니다.'
                });
            }
        }
        
        // 예약 정보 저장 (학번과 이름 모두 저장)
        reservations[currentSession][seatId] = {
            studentId: studentId,
            name: student.name,
            timestamp: new Date().toISOString()
        };
        
        updateStats();
        
        console.log(`예약 완료 - 좌석: ${seatId}, 학번: ${studentId}, 이름: ${student.name}`);
        
        // 클라이언트에는 이름만 전송 (개인정보 보호)
        const clientReservations = {};
        for (let seat in reservations[currentSession]) {
            clientReservations[seat] = reservations[currentSession][seat].name;
        }
        
        emitToClients('reservations-updated', clientReservations);
        emitToClients('reservation-success', { seatId, userName: student.name });
        
        res.json({
            success: true,
            message: `자리 ${seatId}번이 ${student.name}님으로 예약되었습니다.`,
            reservations: clientReservations
        });
        
    } catch (error) {
        console.error('예약 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 예약 취소
app.delete('/reservations/:seatId', async (req, res) => {
    const { seatId } = req.params;
    const { studentId } = req.body;
    const currentSession = getCurrentSession();
    
    if (isMaintenanceMode) {
        return res.status(403).json({
            success: false,
            message: '현재 시스템 점검 중입니다.'
        });
    }
    
    if (!reservations[currentSession][seatId]) {
        return res.status(404).json({
            success: false,
            message: '예약이 없는 자리입니다.'
        });
    }
    
    try {
        // 학번이 데이터베이스에 존재하는지 확인
        const student = await db.getStudentById(studentId);
        if (!student) {
            return res.status(400).json({
                success: false,
                message: '등록되지 않은 학번입니다. 학번을 다시 확인해주세요.'
            });
        }
        
        // 예약된 학번과 입력한 학번이 일치하는지 확인
        if (reservations[currentSession][seatId].studentId !== studentId) {
            return res.status(403).json({
                success: false,
                message: '본인이 예약한 자리만 취소할 수 있습니다.'
            });
        }
        
        delete reservations[currentSession][seatId];
        updateStats();
        
        console.log(`예약 취소 - 좌석: ${seatId}, 학번: ${studentId}`);
        
        // 클라이언트에는 이름만 전송
        const clientReservations = {};
        for (let seat in reservations[currentSession]) {
            clientReservations[seat] = reservations[currentSession][seat].name;
        }
        
        emitToClients('reservations-updated', clientReservations);
        emitToClients('cancellation-success', { seatId, studentId });
        
        res.json({
            success: true,
            message: `자리 ${seatId}번 예약이 취소되었습니다.`,
            reservations: clientReservations
        });
        
    } catch (error) {
        console.error('예약 취소 처리 중 오류:', error);
        res.status(500).json({
            success: false,
            message: '서버 오류가 발생했습니다.'
        });
    }
});

// 관리자 로그인
app.post('/api/admin/login', async (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            success: false,
            message: '비밀번호를 입력해주세요.'
        });
    }
    
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    
    if (!isValid) {
        return res.status(401).json({
            success: false,
            message: '잘못된 비밀번호입니다.'
        });
    }
    
    res.json({
        success: true,
        message: '관리자 로그인 성공',
        token: 'admin-token' // 실제로는 JWT 토큰 사용
    });
});

// 관리자 전용 - 모든 예약 초기화
app.delete('/api/admin/reservations', (req, res) => {
    // 실제로는 JWT 토큰 검증 필요
    const currentSession = getCurrentSession();
    
    reservations[currentSession] = {};
    updateStats();
    
    emitToClients('reservationUpdate', {
        session: currentSession,
        reservations: reservations[currentSession],
        stats: sessionStats[currentSession]
    });
    
    emitToClients('adminMessage', {
        type: 'info',
        message: '관리자가 모든 예약을 초기화했습니다.'
    });
    
    res.json({
        success: true,
        message: '모든 예약이 초기화되었습니다.'
    });
});

// 관리자 전용 - 학생 목록 조회
app.get('/api/admin/students', async (req, res) => {
    try {
        const students = await db.getAllStudents();
        res.json({
            success: true,
            students: students
        });
    } catch (error) {
        console.error('학생 목록 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 목록을 불러오는데 실패했습니다.'
        });
    }
});

// 관리자 전용 - 새 학생 추가
app.post('/api/admin/students', async (req, res) => {
    const { studentId, name } = req.body;
    
    if (!studentId || !name) {
        return res.status(400).json({
            success: false,
            message: '학번과 이름을 모두 입력해주세요.'
        });
    }
    
    try {
        const newStudent = await db.addStudent(studentId, name);
        res.json({
            success: true,
            message: `${name}(${studentId}) 학생이 추가되었습니다.`,
            student: newStudent
        });
    } catch (error) {
        console.error('학생 추가 오류:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            res.status(400).json({
                success: false,
                message: '이미 등록된 학번입니다.'
            });
        } else {
            res.status(500).json({
                success: false,
                message: '학생 추가에 실패했습니다.'
            });
        }
    }
});

// 관리자 전용 - 학생 삭제
app.delete('/api/admin/students/:studentId', async (req, res) => {
    const { studentId } = req.params;
    
    try {
        const deleted = await db.deleteStudent(studentId);
        if (deleted) {
            res.json({
                success: true,
                message: `학번 ${studentId} 학생이 삭제되었습니다.`
            });
        } else {
            res.status(404).json({
                success: false,
                message: '해당 학번을 찾을 수 없습니다.'
            });
        }
    } catch (error) {
        console.error('학생 삭제 오류:', error);
        res.status(500).json({
            success: false,
            message: '학생 삭제에 실패했습니다.'
        });
    }
});

// 관리자 전용 - 점검 모드 토글
app.post('/api/admin/maintenance', (req, res) => {
    isMaintenanceMode = !isMaintenanceMode;
    
    emitToClients('maintenanceMode', { enabled: isMaintenanceMode });
    
    res.json({
        success: true,
        message: `점검 모드가 ${isMaintenanceMode ? '활성화' : '비활성화'}되었습니다.`,
        maintenanceMode: isMaintenanceMode
    });
});

// 관리자 전용 - 시스템 상태 조회
app.get('/api/admin/status', (req, res) => {
    const currentSession = getCurrentSession();
    res.json({
        success: true,
        session: currentSession,
        maintenanceMode: isMaintenanceMode,
        onlineUsers: onlineUsers.size,
        totalReservations: Object.keys(reservations[currentSession] || {}).length,
        serverStartTime: serverStartTime,
        uptime: Date.now() - serverStartTime
    });
});

// 관리자 전용 - 세션 강제 리셋
app.post('/api/admin/reset-session', (req, res) => {
    const { session } = req.body;
    
    if (session !== 'morning' && session !== 'afternoon') {
        return res.status(400).json({
            success: false,
            message: 'Invalid session type'
        });
    }
    
    reservations[session] = {};
    
    emitToClients('sessionReset', { 
        session,
        message: `${session === 'morning' ? '오전' : '오후'} 세션이 리셋되었습니다.`
    });
    
    res.json({
        success: true,
        message: `${session} 세션이 리셋되었습니다.`
    });
});

// 통계 조회
app.get('/api/stats', (req, res) => {
    const currentSession = getCurrentSession();
    
    res.json({
        success: true,
        currentSession,
        stats: sessionStats,
        realtime: {
            totalSeats: 13,
            occupiedSeats: Object.keys(reservations[currentSession]).length,
            onlineUsers: Object.keys(onlineUsers).length,
            occupancyRate: Math.round((Object.keys(reservations[currentSession]).length / 13) * 100)
        }
    });
});

// Socket.IO 연결 처리 (개발환경에서만)
if (io) {
    io.on('connection', (socket) => {
    console.log('새로운 사용자 연결:', socket.id);
    
    // 사용자 온라인 상태 추가
    socket.on('userOnline', (userData) => {
        onlineUsers[socket.id] = {
            name: userData.name || '익명',
            connectedAt: new Date(),
            lastSeen: new Date()
        };
        
        updateStats();
        
        // 클라이언트에는 이름만 전송 (개인정보 보호)
        const clientReservations = {};
        const currentSession = getCurrentSession();
        for (let seat in reservations[currentSession]) {
            clientReservations[seat] = reservations[currentSession][seat].name;
        }
        
        // 현재 상황 전송
        socket.emit('initialData', {
            session: currentSession,
            reservations: clientReservations,
            onlineUsers: Object.keys(onlineUsers).length,
            nextReset: getNextResetTime(),
            isMaintenanceMode
        });
        
        // 다른 사용자들에게 온라인 사용자 수 업데이트
        emitToClients('onlineUsersUpdate', {
            count: Object.keys(onlineUsers).length
        });
    });
    
    // 관리자 연결 처리
    socket.on('admin-join', () => {
        console.log('관리자 연결:', socket.id);
        
        const currentSession = getCurrentSession();
        
        // 관리자에게는 상세 정보 포함하여 전송
        const clientReservations = {};
        for (let seat in reservations[currentSession]) {
            clientReservations[seat] = reservations[currentSession][seat].name;
        }
        
        // 관리자에게 현재 상황 전송
        socket.emit('reservations-updated', clientReservations);
        socket.emit('session-updated', {
            session: currentSession,
            nextResetTime: getNextResetTime()
        });
        socket.emit('user-count-updated', Object.keys(onlineUsers).length);
        socket.emit('maintenance-mode-updated', isMaintenanceMode);
    });
    
    // 사용자 이름 업데이트
    socket.on('updateUserName', (name) => {
        if (onlineUsers[socket.id]) {
            onlineUsers[socket.id].name = name;
            onlineUsers[socket.id].lastSeen = new Date();
        }
    });
    
    // 하트비트
    socket.on('heartbeat', () => {
        if (onlineUsers[socket.id]) {
            onlineUsers[socket.id].lastSeen = new Date();
        }
    });
    
    // 연결 해제
    socket.on('disconnect', () => {
        console.log('사용자 연결 해제:', socket.id);
        
        delete onlineUsers[socket.id];
        updateStats();
        
        emitToClients('onlineUsersUpdate', {
            count: Object.keys(onlineUsers).length
        });
    });
});
}

// 정적 파일 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 자동 세션 리셋 (매분마다 체크)
setInterval(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 정각에 세션 변경 체크 (06:00, 12:00)
    if (minute === 0 && (hour === 6 || hour === 12)) {
        const newSession = hour === 6 ? 'morning' : 'afternoon';
        
        // 예약 초기화
        reservations[newSession] = {};
        
        // 모든 클라이언트에게 세션 리셋 알림
        emitToClients('sessionReset', {
            session: newSession,
            message: `${newSession === 'morning' ? '오전' : '오후'} 세션이 시작되었습니다.`
        });
        
        console.log(`세션 자동 리셋: ${newSession}`);
    }
}, 60000);

// 비활성 사용자 정리 (5분마다)
setInterval(() => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);
    
    for (let socketId in onlineUsers) {
        if (onlineUsers[socketId].lastSeen < fiveMinutesAgo) {
            delete onlineUsers[socketId];
        }
    }
    
    updateStats();
    
    emitToClients('onlineUsersUpdate', {
        count: Object.keys(onlineUsers).length
    });
}, 5 * 60 * 1000);

// 에러 핸들링
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '서버 내부 오류가 발생했습니다.'
    });
});

// 404 핸들링
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '요청한 리소스를 찾을 수 없습니다.'
    });
});

// 서버 시작
const startServer = () => {
    const actualPort = PORT || 3000;
    server.listen(actualPort, '0.0.0.0', () => {
        console.log(`🚀 서버가 포트 ${actualPort}에서 실행 중입니다.`);
        if (isRailway) {
            console.log(`� Railway 환경에서 실행 중`);
        } else if (isVercel) {
            console.log(`📦 Vercel 환경에서 실행 중`);
        } else {
            console.log(`💻 로컬 환경에서 실행 중`);
            console.log(`�📱 웹사이트: http://localhost:${actualPort}`);
        }
        console.log(`🔧 관리자 비밀번호: ${ADMIN_PASSWORD}`);
    });
};

// Vercel이 아닌 환경에서만 서버 시작
if (!isVercel) {
    startServer();
}

module.exports = app;
