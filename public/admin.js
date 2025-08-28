// 관리자용 클라이언트 JavaScript

// 전역 변수
let socket;
let isAdmin = false;
let reservations = {};
let currentSession = 'morning';
let isMaintenanceMode = false;
let onlineUsersCount = 0;
let systemLogs = [];

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeAdminApp();
    initializeNavigation();
});

// 네비게이션 초기화
function initializeNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    
    // 햄버거 메뉴 토글
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        navOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // 오버레이 클릭 시 메뉴 닫기
    navOverlay.addEventListener('click', () => {
        closeNavMenu();
    });
    
    // 메뉴 아이템 클릭 시 메뉴 닫기
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            closeNavMenu();
        });
    });
}

// 네비게이션 메뉴 닫기
function closeNavMenu() {
    document.getElementById('hamburger-menu').classList.remove('active');
    document.getElementById('nav-menu').classList.remove('active');
    document.getElementById('nav-overlay').classList.remove('active');
    document.body.style.overflow = '';
}

// 관리자 앱 초기화
function initializeAdminApp() {
    // 세션 만료 확인 (30분)
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    const now = new Date().getTime();
    const sessionDuration = 30 * 60 * 1000; // 30분
    
    if (adminLoginTime && (now - parseInt(adminLoginTime)) > sessionDuration) {
        localStorage.removeItem('adminLoggedIn');
        localStorage.removeItem('adminLoginTime');
        showNotification('보안상 관리자 세션이 만료되었습니다.', 'warning');
    }
    
    // 로그인 상태 확인
    const savedAdminState = localStorage.getItem('adminLoggedIn');
    if (savedAdminState === 'true' && adminLoginTime) {
        showDashboard();
    } else {
        showLoginPanel();
    }
    
    // 소켓 초기화는 로그인 후에 진행
    updateTimeDisplay();
    
    // 정기적으로 시간 업데이트
    setInterval(updateTimeDisplay, 1000);
    setInterval(updateCurrentSession, 60000);
    
    // 세션 만료 체크 (5분마다)
    setInterval(checkSessionExpiry, 5 * 60 * 1000);
    
    // Enter 키로 로그인
    document.getElementById('admin-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticateAdmin();
        }
    });
    
    // 좌석 클릭 이벤트 등록
    initializeSeatClickEvents();
    
    debugLog('관리자 앱이 초기화되었습니다.');
}

// 세션 만료 체크
function checkSessionExpiry() {
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    if (!adminLoginTime) return;
    
    const now = new Date().getTime();
    const sessionDuration = 30 * 60 * 1000; // 30분
    
    if ((now - parseInt(adminLoginTime)) > sessionDuration) {
        logout();
        showNotification('보안상 관리자 세션이 만료되었습니다. 다시 로그인해주세요.', 'warning');
    }
}

// Socket.IO 초기화 (관리자 전용) - Vercel 환경에서는 폴링 모드 사용
function initializeAdminSocket() {
    // Socket.IO가 로드되지 않은 경우 (Vercel 환경) 폴링으로 대체
    if (typeof io === 'undefined') {
        console.log('🔄 Socket.IO 사용 불가 - 관리자 폴링 모드로 전환');
        startAdminPollingMode();
        return;
    }
    
    socket = io();
    
    // 연결 이벤트
    socket.on('connect', () => {
        debugLog('관리자로 서버에 연결되었습니다.');
        updateConnectionStatus(true);
        
        // 관리자로 등록
        socket.emit('admin-join');
        
        addLog('관리자 연결 성공', 'info');
    });
    
    socket.on('disconnect', () => {
        debugLog('서버와의 연결이 끊어졌습니다.');
        updateConnectionStatus(false);
        addLog('서버 연결 끊어짐', 'warning');
    });
    
    socket.on('connect_error', (error) => {
        debugLog('연결 오류:', error);
        updateConnectionStatus(false);
        addLog(`연결 오류: ${error.message}`, 'error');
    });
    
    // 데이터 동기화 이벤트
    socket.on('reservations-updated', (data) => {
        reservations = data;
        updateSeatDisplay();
        updateReservationStats();
        updateCurrentReservationsList();
        addLog(`예약 정보 업데이트 - ${Object.keys(data).length}개 예약`, 'info');
    });
    
    socket.on('session-updated', (data) => {
        currentSession = data.session;
        updateCurrentSession();
        updateNextResetTime(data.nextResetTime);
        addLog(`세션 변경: ${data.session === 'morning' ? '오전' : '오후'}`, 'info');
    });
    
    socket.on('maintenance-mode-updated', (isActive) => {
        isMaintenanceMode = isActive;
        updateMaintenanceMode();
        addLog(`점검 모드 ${isActive ? '활성화' : '비활성화'}`, 'warning');
    });
    
    socket.on('user-count-updated', (count) => {
        onlineUsersCount = count;
        updateOnlineUsersCount();
    });
    
    // 관리자 액션 결과
    socket.on('admin-action-result', (data) => {
        if (data.success) {
            showSuccess(data.message);
            addLog(`관리자 액션: ${data.action} - 성공`, 'info');
        } else {
            handleError(data.error);
            addLog(`관리자 액션: ${data.action} - 실패: ${data.error}`, 'error');
        }
    });
}

// 관리자 폴링 모드 (Socket.IO가 없는 환경용)
function startAdminPollingMode() {
    console.log('🔄 관리자 폴링 모드 시작');
    updateConnectionStatus(true);
    addLog('관리자 폴링 모드로 연결됨', 'info');
    
    // 초기 데이터 로드
    loadInitialData();
    
    // 정기적으로 데이터 업데이트 (15초마다 - 관리자는 더 자주)
    setInterval(async () => {
        try {
            await loadInitialData();
        } catch (error) {
            console.error('관리자 폴링 업데이트 실패:', error);
        }
    }, 15000);
    
    // 관리자 액션 후 즉시 업데이트
    window.forceAdminRefresh = () => {
        loadInitialData();
    };
}

// 로그인 패널 표시
function showLoginPanel() {
    document.getElementById('login-panel').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-password').focus();
}

// 대시보드 표시
function showDashboard() {
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    isAdmin = true;
    
    // 소켓이 아직 초기화되지 않았다면 초기화
    if (!socket) {
        initializeAdminSocket();
    }
    
    // 초기 데이터 로드
    loadInitialData();
}

// 관리자 인증
async function authenticateAdmin() {
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');
    
    if (!password) {
        showLoginError('비밀번호를 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminLoginTime', new Date().getTime().toString());
            document.getElementById('admin-password').value = '';
            errorElement.classList.add('hidden');
            showDashboard();
            showSuccess('관리자로 로그인했습니다.');
        } else {
            showLoginError('잘못된 비밀번호입니다.');
        }
    } catch (error) {
        showLoginError('로그인 중 오류가 발생했습니다.');
        console.error('Login error:', error);
    }
}

// 로그인 오류 표시
function showLoginError(message) {
    const errorElement = document.getElementById('login-error');
    errorElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    // 비밀번호 필드 포커스
    setTimeout(() => {
        document.getElementById('admin-password').select();
    }, 100);
}

// 로그아웃
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminLoginTime');
    isAdmin = false;
    
    if (socket) {
        socket.disconnect();
        socket = null;
    }
    
    showLoginPanel();
    showNotification('로그아웃되었습니다.', 'info');
}

// 로그인 취소 (홈으로 이동)
function cancelLogin() {
    window.location.href = 'index.html';
}

// 초기 데이터 로드
async function loadInitialData() {
    try {
        // 예약 정보 로드
        const reservationsResponse = await fetch('/reservations');
        const reservationsData = await reservationsResponse.json();
        reservations = reservationsData.reservations || {};
        
        // 시스템 상태 로드
        const statusResponse = await fetch('/api/admin/status');
        const statusData = await statusResponse.json();
        
        currentSession = statusData.session;
        isMaintenanceMode = statusData.maintenanceMode;
        
        // UI 업데이트
        updateSeatDisplay();
        updateReservationStats();
        updateCurrentReservationsList();
        updateMaintenanceMode();
        updateCurrentSession();
        
        addLog('초기 데이터 로드 완료', 'info');
    } catch (error) {
        addLog(`초기 데이터 로드 실패: ${error.message}`, 'error');
        handleError(error);
    }
}

// 예약 데이터만 다시 로드
async function loadReservations() {
    try {
        const reservationsResponse = await fetch('/reservations');
        const reservationsData = await reservationsResponse.json();
        reservations = reservationsData.reservations || {};
        
        // UI 업데이트
        updateSeatDisplay();
        updateReservationStats();
        updateCurrentReservationsList();
        
        debugLog('예약 데이터 새로고침 완료');
    } catch (error) {
        console.error('예약 데이터 로드 실패:', error);
        addLog(`예약 데이터 로드 실패: ${error.message}`, 'error');
    }
}

// API 호출 헬퍼 함수
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 좌석 표시 업데이트
function updateSeatDisplay() {
    document.querySelectorAll('.seat.mini').forEach(seat => {
        const seatId = seat.dataset.seat;
        
        // 모든 상태 클래스 제거
        seat.classList.remove('available', 'occupied', 'assigned');
        
        if (reservations[seatId]) {
            const reservation = reservations[seatId];
            
            // 새로운 데이터 구조 확인 (객체인지 문자열인지)
            if (typeof reservation === 'object') {
                if (reservation.isAssigned) {
                    seat.classList.add('assigned');
                    seat.title = `${seatId}번 - ${reservation.name}님 지정석`;
                } else {
                    seat.classList.add('occupied');
                    seat.title = `${seatId}번 - ${reservation.name}님이 예약`;
                }
            } else {
                // 이전 데이터 구조 호환성 (문자열)
                seat.classList.add('occupied');
                seat.title = `${seatId}번 - ${reservation}님이 예약`;
            }
        } else {
            seat.classList.add('available');
            seat.title = `${seatId}번 - 예약 가능`;
        }
    });
    
    // 좌석 클릭 이벤트 다시 등록
    initializeSeatClickEvents();
}

// 좌석 클릭 이벤트 초기화
function initializeSeatClickEvents() {
    document.querySelectorAll('.seat.mini').forEach(seat => {
        // 기존 이벤트 리스너 제거
        seat.removeEventListener('click', seat._clickHandler);
        
        // 새로운 클릭 핸들러 함수 생성
        seat._clickHandler = function() {
            const seatId = this.dataset.seat;
            const reservation = reservations[seatId];
            
            if (reservation && typeof reservation === 'object' && reservation.isAssigned) {
                // 지정된 좌석인 경우 지정 해제 확인
                if (confirm(`${seatId}번 좌석의 지정을 해제하시겠습니까?\n현재 지정자: ${reservation.name}`)) {
                    unassignSeat(seatId);
                }
            } else if (reservation) {
                // 일반 예약된 좌석인 경우
                showNotification(`${seatId}번 좌석은 ${typeof reservation === 'object' ? reservation.name : reservation}님이 예약 중입니다.`, 'info');
            } else {
                // 빈 좌석인 경우 바로 지정 모달 열기
                document.getElementById('assign-seat-number').value = seatId;
                showSeatAssignModal();
            }
        };
        
        // 새로운 이벤트 리스너 등록
        seat.addEventListener('click', seat._clickHandler);
    });
}

// 좌석 지정 해제
async function unassignSeat(seatId) {
    try {
        const response = await fetch(`/api/admin/assign-seat/${seatId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            updateSeatDisplay();
            loadReservations();
            addLog(`좌석 지정 해제: ${seatId}번`);
        } else {
            showError(data.message || '좌석 지정 해제에 실패했습니다.');
        }
    } catch (error) {
        console.error('좌석 지정 해제 오류:', error);
        showError('좌석 지정 해제에 실패했습니다.');
    }
}

// 예약 통계 업데이트
function updateReservationStats() {
    const totalSeats = 13;
    const occupiedSeats = Object.keys(reservations).length;
    const occupancyRate = Math.round((occupiedSeats / totalSeats) * 100);
    
    document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
    document.getElementById('occupied-seats').textContent = occupiedSeats;
}

// 현재 예약자 목록 업데이트
function updateCurrentReservationsList() {
    const container = document.getElementById('current-reservations');
    container.innerHTML = '';
    
    if (Object.keys(reservations).length === 0) {
        container.innerHTML = '<p class="no-reservations">현재 예약이 없습니다.</p>';
        return;
    }
    
    Object.entries(reservations).forEach(([seatId, reservation]) => {
        const item = document.createElement('div');
        item.className = 'reservation-item';
        
        let userName, isAssigned;
        if (typeof reservation === 'object') {
            userName = reservation.name;
            isAssigned = reservation.isAssigned;
        } else {
            userName = reservation;
            isAssigned = false;
        }
        
        const statusBadge = isAssigned ? '<span class="assigned-badge">지정석</span>' : '';
        const cancelButton = isAssigned ? 
            `<button onclick="unassignSeat('${seatId}')" class="admin-unassign-btn">지정해제</button>` :
            `<button onclick="adminCancelReservation('${seatId}')" class="admin-cancel-btn">취소</button>`;
        
        item.innerHTML = `
            <span class="seat-number">${seatId}번</span>
            <span class="user-name">${userName}</span>
            ${statusBadge}
            ${cancelButton}
        `;
        container.appendChild(item);
    });
}

// 시간 표시 업데이트
function updateTimeDisplay() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR');
    document.getElementById('current-time').textContent = timeString;
    
    // 다음 리셋 시간 계산
    const nextReset = getNextResetTime(now);
    const resetString = nextReset.toLocaleTimeString('ko-KR');
    document.getElementById('next-reset').textContent = resetString;
}

// 현재 세션 업데이트
function updateCurrentSession() {
    const now = new Date();
    const hour = now.getHours();
    
    // 새로운 세션 구분: 오전(0-12시), 오후(12-24시)
    if (hour >= 0 && hour < 12) {
        currentSession = 'morning';
    } else {
        currentSession = 'afternoon';
    }
    
    const sessionText = currentSession === 'morning' ? '오전 (00:00-11:59)' : '오후 (12:00-23:59)';
    document.getElementById('current-session').textContent = sessionText;
}

// 다음 리셋 시간 계산
function getNextResetTime(now) {
    const nextReset = new Date(now);
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 12) {
        // 오전 세션 - 다음 리셋은 정오 12:00
        nextReset.setHours(12, 0, 0, 0);
    } else {
        // 오후 세션 - 다음 리셋은 다음날 자정 00:00
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
    }
    
    return nextReset;
}

// 다음 리셋 시간 업데이트
function updateNextResetTime(nextResetTime) {
    const resetString = new Date(nextResetTime).toLocaleTimeString('ko-KR');
    document.getElementById('next-reset').textContent = resetString;
}

// 연결 상태 업데이트
function updateConnectionStatus(connected) {
    const indicator = document.getElementById('connection-indicator');
    const text = document.getElementById('connection-text');
    
    if (connected) {
        indicator.className = 'connection-indicator connected';
        text.textContent = '서버 연결됨';
    } else {
        indicator.className = 'connection-indicator disconnected';
        text.textContent = '서버 연결 끊어짐';
    }
}

// 온라인 사용자 수 업데이트
function updateOnlineUsersCount() {
    document.getElementById('online-users').textContent = `${onlineUsersCount}명`;
}

// 점검 모드 UI 업데이트
function updateMaintenanceMode() {
    const notice = document.getElementById('maintenance-notice');
    const btn = document.getElementById('maintenance-btn');
    
    if (isMaintenanceMode) {
        notice.classList.remove('hidden');
        btn.textContent = '🔧 점검 모드 해제';
        btn.classList.add('warning');
    } else {
        notice.classList.add('hidden');
        btn.textContent = '🔧 점검 모드';
        btn.classList.remove('warning');
    }
}

// 관리자 기능들
async function clearAllReservations() {
    if (!confirm('정말로 모든 예약을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    try {
        await apiCall('/api/admin/reservations', {
            method: 'DELETE'
        });
        addLog('전체 예약 초기화 실행', 'warning');
    } catch (error) {
        handleError(error, '예약 초기화에 실패했습니다.');
    }
}

async function forceSessionReset() {
    const newSession = currentSession === 'morning' ? 'afternoon' : 'morning';
    
    if (!confirm(`세션을 강제로 ${newSession === 'morning' ? '오전' : '오후'}으로 변경하시겠습니까?`)) {
        return;
    }
    
    try {
        await apiCall('/api/admin/reset-session', {
            method: 'POST',
            body: JSON.stringify({ session: newSession })
        });
        addLog(`세션 강제 변경: ${newSession}`, 'warning');
    } catch (error) {
        handleError(error, '세션 리셋에 실패했습니다.');
    }
}

async function toggleMaintenanceMode() {
    try {
        await apiCall('/api/admin/maintenance', {
            method: 'POST'
        });
        addLog(`점검 모드 토글 실행`, 'warning');
    } catch (error) {
        handleError(error, '점검 모드 변경에 실패했습니다.');
    }
}

async function exportData() {
    try {
        const today = new Date().toDateString();
        const exportData = {
            date: today,
            session: currentSession,
            timestamp: new Date().toISOString(),
            reservations: reservations,
            onlineUsers: onlineUsersCount,
            totalSeats: 13,
            occupiedSeats: Object.keys(reservations).length,
            occupancyRate: Math.round((Object.keys(reservations).length / 13) * 100),
            maintenanceMode: isMaintenanceMode,
            logs: systemLogs.slice(-100) // 최근 100개 로그만
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `seat-reservations-${today.replace(/\s/g, '-')}-${currentSession}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        addLog('데이터 내보내기 완료', 'info');
        showSuccess('데이터가 JSON 파일로 다운로드되었습니다.');
    } catch (error) {
        handleError(error, '데이터 내보내기에 실패했습니다.');
    }
}

// 관리자용 예약 취소
async function adminCancelReservation(seatId) {
    const reservation = reservations[seatId];
    
    // 지정된 좌석인지 확인
    if (typeof reservation === 'object' && reservation.isAssigned) {
        showError('지정된 좌석은 지정해제 버튼을 사용해주세요.');
        return;
    }
    
    const userName = typeof reservation === 'object' ? reservation.name : reservation;
    
    if (!confirm(`${seatId}번 자리의 예약을 취소하시겠습니까?\n예약자: ${userName}`)) {
        return;
    }
    
    try {
        await apiCall(`/reservations/${seatId}`, {
            method: 'DELETE',
            body: JSON.stringify({
                studentId: 'admin-cancel', // 관리자 취소 표시
                adminAction: true
            })
        });
        addLog(`관리자 예약 취소: ${seatId}번 (${userName})`, 'warning');
    } catch (error) {
        handleError(error, '예약 취소에 실패했습니다.');
    }
}

// 시스템 로그 관리
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    const logEntry = {
        timestamp,
        message,
        type
    };
    
    systemLogs.push(logEntry);
    
    // 최대 500개 로그만 유지
    if (systemLogs.length > 500) {
        systemLogs = systemLogs.slice(-500);
    }
    
    updateLogDisplay();
}

function updateLogDisplay() {
    const container = document.getElementById('log-container');
    
    // 최근 20개 로그만 표시
    const recentLogs = systemLogs.slice(-20);
    
    container.innerHTML = recentLogs.map(log => 
        `<div class="log-entry ${log.type}">[${log.timestamp}] ${log.message}</div>`
    ).join('');
    
    // 스크롤을 맨 아래로
    container.scrollTop = container.scrollHeight;
}

function clearLogs() {
    if (confirm('모든 로그를 삭제하시겠습니까?')) {
        systemLogs = [];
        updateLogDisplay();
        addLog('로그가 초기화되었습니다.', 'info');
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info', duration = 3000) {
    // 알림 컨테이너가 없으면 생성
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        pointer-events: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // 애니메이션으로 표시
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    // 클릭하면 즉시 제거
    notification.onclick = () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    };
}

// 에러 처리 함수
function handleError(error, defaultMessage = '오류가 발생했습니다.') {
    console.error('Error:', error);
    
    let message = defaultMessage;
    if (error.message) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
    
    showNotification(message, 'error');
    addLog(`오류: ${message}`, 'error');
}

// 성공 메시지 표시
function showSuccess(message) {
    showNotification(message, 'success');
}

// 에러 메시지 표시
function showError(message) {
    showNotification(message, 'error');
}

// 디버그 로그 함수
function debugLog(...args) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[ADMIN DEBUG]', ...args);
    }
}

// === 학생 관리 기능 ===

let allStudents = []; // 전체 학생 목록 저장

// 학생 목록 불러오기
async function loadStudentsList() {
    try {
        const response = await fetch('/api/admin/students');
        const data = await response.json();
        
        if (data.success) {
            allStudents = data.students;
            displayStudentsList(allStudents);
            addLog(`학생 목록 로딩 완료 (${allStudents.length}명)`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        handleError(error, '학생 목록을 불러오는데 실패했습니다.');
    }
}

// 학생 목록 표시
function displayStudentsList(students) {
    const container = document.getElementById('students-list');
    
    if (students.length === 0) {
        container.innerHTML = '<div class="no-data">등록된 학생이 없습니다.</div>';
        return;
    }
    
    const studentsHtml = students.map(student => `
        <div class="student-item" data-student-id="${student.student_id}">
            <div class="student-info">
                <div class="student-id">${student.student_id}</div>
                <div class="student-name">${student.name}</div>
                <div class="student-date">등록일: ${new Date(student.created_at).toLocaleDateString()}</div>
            </div>
            <div class="student-actions">
                <button onclick="deleteStudent('${student.student_id}', '${student.name}')" 
                        class="action-btn danger small">
                    🗑️ 삭제
                </button>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = studentsHtml;
}

// 학생 검색 필터
function filterStudents() {
    const searchTerm = document.getElementById('student-search').value.toLowerCase();
    
    if (!searchTerm) {
        displayStudentsList(allStudents);
        return;
    }
    
    const filteredStudents = allStudents.filter(student => 
        student.student_id.toLowerCase().includes(searchTerm) ||
        student.name.toLowerCase().includes(searchTerm)
    );
    
    displayStudentsList(filteredStudents);
}

// 새 학생 추가
async function addStudent() {
    const studentIdInput = document.getElementById('new-student-id');
    const studentNameInput = document.getElementById('new-student-name');
    
    const studentId = studentIdInput.value.trim();
    const studentName = studentNameInput.value.trim();
    
    if (!studentId || !studentName) {
        showNotification('학번과 이름을 모두 입력해주세요.', 'error');
        return;
    }
    
    // 학번 형식 간단 검증
    if (!/^\d+$/.test(studentId)) {
        showNotification('학번은 숫자만 입력해주세요.', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/admin/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                studentId: studentId,
                name: studentName
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            
            // 입력 필드 초기화
            studentIdInput.value = '';
            studentNameInput.value = '';
            
            // 목록 새로고침
            await loadStudentsList();
            
            addLog(`학생 추가: ${studentName}(${studentId})`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        handleError(error, '학생 추가에 실패했습니다.');
    }
}

// 학생 삭제
async function deleteStudent(studentId, studentName) {
    if (!confirm(`정말로 ${studentName}(${studentId}) 학생을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/students/${studentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            
            // 목록에서 해당 항목 제거 (애니메이션 효과)
            const studentElement = document.querySelector(`[data-student-id="${studentId}"]`);
            if (studentElement) {
                studentElement.style.opacity = '0.5';
                setTimeout(() => {
                    loadStudentsList();
                }, 300);
            }
            
            addLog(`학생 삭제: ${studentName}(${studentId})`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        handleError(error, '학생 삭제에 실패했습니다.');
    }
}

// 관리자 대시보드 표시 시 학생 목록도 로드
const originalShowDashboard = showDashboard;
showDashboard = function() {
    originalShowDashboard();
    // 대시보드 표시 후 학생 목록 로드
    setTimeout(() => {
        loadStudentsList();
    }, 100);
};

// 좌석 지정 기능
function showSeatAssignModal() {
    const modal = document.getElementById('seat-assign-modal');
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assign-start-date').value = today;
    
    // 1주일 후를 종료일 기본값으로 설정
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    document.getElementById('assign-end-date').value = nextWeek.toISOString().split('T')[0];
    
    modal.style.display = 'flex';
}

function closeSeatAssignModal() {
    const modal = document.getElementById('seat-assign-modal');
    modal.style.display = 'none';
    
    // 폼 초기화
    document.getElementById('assign-seat-number').value = '';
    document.getElementById('assign-student-name').value = '';
    document.getElementById('assign-student-id').value = '';
    document.getElementById('assign-start-date').value = '';
    document.getElementById('assign-end-date').value = '';
    document.getElementById('assign-permanent').checked = false;
}

async function assignSeat() {
    const seatNumber = document.getElementById('assign-seat-number').value;
    const studentName = document.getElementById('assign-student-name').value.trim();
    const studentId = document.getElementById('assign-student-id').value.trim();
    const startDate = document.getElementById('assign-start-date').value;
    const endDate = document.getElementById('assign-end-date').value;
    const isPermanent = document.getElementById('assign-permanent').checked;
    
    // 입력 검증
    if (!seatNumber) {
        showError('좌석을 선택해주세요.');
        return;
    }
    
    if (!studentName) {
        showError('학생 이름을 입력해주세요.');
        return;
    }
    
    if (!studentId) {
        showError('학번을 입력해주세요.');
        return;
    }
    
    if (!isPermanent && (!startDate || !endDate)) {
        showError('시작일과 종료일을 선택해주세요.');
        return;
    }
    
    if (!isPermanent && new Date(startDate) > new Date(endDate)) {
        showError('종료일은 시작일보다 늦어야 합니다.');
        return;
    }
    
    try {
        const assignmentData = {
            seatId: seatNumber,
            studentName,
            studentId,
            startDate: isPermanent ? null : startDate,
            endDate: isPermanent ? null : endDate,
            isPermanent
        };
        
        const response = await fetch('/api/admin/assign-seat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(assignmentData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(`${seatNumber}번 좌석이 ${studentName}(${studentId})님에게 지정되었습니다.`);
            closeSeatAssignModal();
            
            // 좌석 현황 업데이트
            updateSeatDisplay();
            loadReservations();
            
            const durationText = isPermanent ? '영구' : `${startDate} ~ ${endDate}`;
            addLog(`좌석 지정: ${seatNumber}번 → ${studentName}(${studentId}) [${durationText}]`);
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        handleError(error, '좌석 지정에 실패했습니다.');
    }
}

// 모달 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const modal = document.getElementById('seat-assign-modal');
    if (event.target === modal) {
        closeSeatAssignModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSeatAssignModal();
    }
});
