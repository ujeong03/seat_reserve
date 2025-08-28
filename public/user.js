// 일반 사용자용 클라이언트 JavaScript

// 전역 변수
let socket;
let currentUser = '';
let selectedSeat = null;
let reservations = {};
let currentSession = 'morning';
let isMaintenanceMode = false;
let onlineUsersCount = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
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

// 앱 초기화
function initializeApp() {
    initializeSocket();
    initializeEventListeners();
    loadInitialData(); // 초기 데이터 로드 추가
    updateTimeDisplay();
    updateCurrentSession();
    
    // 정기적으로 시간 업데이트
    setInterval(updateTimeDisplay, 1000);
    setInterval(updateCurrentSession, 60000); // 1분마다 세션 확인
    
    // 반응형 지원
    window.addEventListener('resize', handleScreenResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // 키보드 단축키
    initializeKeyboardShortcuts();
    
    // 브라우저 지원 체크
    checkBrowserSupport();
    
    debugLog('사용자 앱이 초기화되었습니다.');
}

// Socket.IO 초기화 (Socket.IO가 사용 가능한 경우에만)
function initializeSocket() {
    // Socket.IO가 로드되지 않은 경우 (Vercel 환경) 폴링으로 대체
    if (typeof io === 'undefined') {
        console.log('🔄 Socket.IO 사용 불가 - 폴링 모드로 전환');
        startPollingMode();
        return;
    }
    
    socket = io();
    
    // 연결 이벤트
    socket.on('connect', () => {
        debugLog('서버에 연결되었습니다.');
        updateConnectionStatus(true);
        
        // 사용자 이름이 있으면 등록
        if (currentUser) {
            socket.emit('userOnline', { name: currentUser });
        } else {
            socket.emit('userOnline', { name: '익명' });
        }
    });
    
    socket.on('disconnect', () => {
        debugLog('서버와의 연결이 끊어졌습니다.');
        updateConnectionStatus(false);
        
        // 재연결 시도
        setTimeout(attemptReconnection, 2000);
    });
    
    socket.on('connect_error', (error) => {
        debugLog('연결 오류:', error);
        updateConnectionStatus(false);
        handleError('서버 연결에 실패했습니다.');
    });
    
    // 데이터 동기화 이벤트
    socket.on('reservations-updated', (data) => {
        reservations = data;
        updateSeatDisplay();
        debugLog('예약 정보가 업데이트되었습니다:', data);
    });
    
    socket.on('session-updated', (data) => {
        currentSession = data.session;
        updateCurrentSession();
        updateNextResetTime(data.nextResetTime);
        showNotification(`세션이 ${data.session === 'morning' ? '오전' : '오후'}으로 변경되었습니다.`, 'info');
    });
    
    socket.on('maintenance-mode-updated', (isActive) => {
        isMaintenanceMode = isActive;
        updateMaintenanceMode();
    });
    
    socket.on('user-count-updated', (count) => {
        onlineUsersCount = count;
        updateOnlineUsersCount();
    });
    
    // 예약 관련 이벤트
    socket.on('reservation-success', (data) => {
        showSuccess(`${data.seatId}번 좌석이 예약되었습니다.`);
    });
    
    socket.on('reservation-error', (error) => {
        handleError(error);
    });
    
    socket.on('cancellation-success', (data) => {
        showSuccess(`${data.seatId}번 좌석 예약이 취소되었습니다.`);
        
        // 예약 취소 성공 후 잠시 후 페이지 새로고침
        setTimeout(() => {
            window.location.reload();
        }, 1500); // 1.5초 후 새로고침
    });
    
    socket.on('cancellation-error', (error) => {
        handleError(error);
    });
    
    // 초기 데이터 수신
    socket.on('initialData', (data) => {
        debugLog('서버로부터 초기 데이터 수신:', data);
        
        reservations = data.reservations || {};
        currentSession = data.session;
        onlineUsersCount = data.onlineUsers || 0;
        isMaintenanceMode = data.isMaintenanceMode || false;
        
        // UI 업데이트
        updateSeatDisplay();
        updateCurrentSession();
        updateMaintenanceMode();
        updateOnlineUsersCount();
        
        debugLog('초기 데이터로 UI가 업데이트되었습니다.');
    });
}

// 폴링 모드 (Socket.IO가 없는 환경용)
function startPollingMode() {
    console.log('🔄 폴링 모드 시작');
    updateConnectionStatus(true);
    
    // 초기 데이터 로드
    loadInitialData();
    
    // 정기적으로 데이터 업데이트 (30초마다)
    setInterval(async () => {
        try {
            await loadInitialData();
        } catch (error) {
            console.error('폴링 업데이트 실패:', error);
        }
    }, 30000);
    
    // 예약 변경사항이 있을 때 즉시 업데이트
    window.forceRefresh = () => {
        loadInitialData();
    };
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 학번 입력
    const studentIdInput = document.getElementById('student-id');
    studentIdInput.addEventListener('input', function() {
        currentUser = this.value.trim();
        updateButtons();
        
        // 소켓에 사용자 등록
        if (currentUser && socket && socket.connected) {
            socket.emit('user-join', currentUser);
        }
    });
    
    studentIdInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
    
    // 좌석 클릭 이벤트
    document.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', function() {
            if (isMaintenanceMode && !isAdmin) {
                showNotification('점검 모드 중에는 예약할 수 없습니다.', 'error');
                return;
            }
            
            const seatId = this.dataset.seat;
            selectSeat(seatId);
        });
        
        // 키보드 접근성
        seat.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
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
            throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 초기 데이터 로드
async function loadInitialData() {
    try {
        debugLog('서버에서 초기 데이터를 로드합니다...');
        const response = await apiCall('/api/reservations');
        
        if (response.success) {
            reservations = response.reservations || {};
            currentSession = response.session;
            isMaintenanceMode = response.stats.isMaintenanceMode || false;
            onlineUsersCount = response.stats.onlineUsers || 0;
            
            // UI 업데이트
            updateSeatDisplay();
            updateCurrentSession();
            updateMaintenanceMode();
            updateOnlineUsersCount();
            
            debugLog('초기 데이터 로드 완료:', {
                reservations,
                session: currentSession,
                maintenanceMode: isMaintenanceMode
            });
        }
    } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
        handleError(error, '초기 데이터 로드에 실패했습니다.');
    }
}

// 좌석 선택
function selectSeat(seatId) {
    // 이전 선택 해제
    document.querySelectorAll('.seat').forEach(seat => {
        seat.classList.remove('selected');
    });
    
    // 새로운 선택
    selectedSeat = seatId;
    const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
    seatElement.classList.add('selected');
    
    updateSelectedSeatInfo();
    updateButtons();
    
    debugLog(`좌석 ${seatId}가 선택되었습니다.`);
}

// 좌석 예약
async function reserveSeat() {
    if (!currentUser || !selectedSeat) {
        showNotification('학번을 입력하고 좌석을 선택해주세요.', 'error');
        return;
    }
    
    if (isMaintenanceMode) {
        showNotification('점검 모드 중에는 예약할 수 없습니다.', 'error');
        return;
    }
    
    try {
        const result = await apiCall('/reservations', {
            method: 'POST',
            body: JSON.stringify({
                seatId: selectedSeat,
                studentId: currentUser
            })
        });
        
        if (result.success) {
            showSuccess(result.message || `좌석 ${selectedSeat}이 예약되었습니다.`);
            
            // 예약 성공 후 즉시 업데이트 (폴링 모드) 또는 페이지 새로고침
            setTimeout(() => {
                if (window.forceRefresh) {
                    window.forceRefresh();
                } else {
                    window.location.reload();
                }
            }, 1500); // 1.5초 후 업데이트
        }
        
        debugLog(`좌석 ${selectedSeat} 예약 요청을 보냈습니다.`);
    } catch (error) {
        handleError(error, '예약에 실패했습니다.');
    }
}

// 예약 취소
async function cancelReservation() {
    if (!currentUser || !selectedSeat) {
        showNotification('학번을 입력하고 좌석을 선택해주세요.', 'error');
        return;
    }
    
    // 서버에서 학번 확인을 하므로 클라이언트에서는 간단한 확인만
    if (!reservations[selectedSeat]) {
        showNotification('예약이 없는 좌석입니다.', 'error');
        return;
    }
    
    try {
        const result = await apiCall(`/reservations/${selectedSeat}`, {
            method: 'DELETE',
            body: JSON.stringify({
                studentId: currentUser
            })
        });
        
        if (result.success) {
            showSuccess(`${selectedSeat}번 좌석 예약이 취소되었습니다.`);
            
            // 취소 성공 후 즉시 업데이트 (폴링 모드) 또는 페이지 새로고침
            setTimeout(() => {
                if (window.forceRefresh) {
                    window.forceRefresh();
                } else {
                    window.location.reload();
                }
            }, 1500); // 1.5초 후 업데이트
        }
        
        debugLog(`좌석 ${selectedSeat} 예약 취소 요청을 보냈습니다.`);
    } catch (error) {
        handleError(error, '예약 취소에 실패했습니다.');
    }
}

// 좌석 표시 업데이트
function updateSeatDisplay() {
    document.querySelectorAll('.seat').forEach(seat => {
        const seatId = seat.dataset.seat;
        
        // 모든 상태 클래스 제거
        seat.classList.remove('available', 'occupied', 'my-seat', 'assigned');
        
        if (reservations[seatId]) {
            const reservation = reservations[seatId];
            
            // 새로운 데이터 구조 확인 (객체인지 문자열인지)
            if (typeof reservation === 'object') {
                if (reservation.isAssigned) {
                    seat.classList.add('assigned');
                    seat.setAttribute('aria-label', `${seatId}번 좌석 - ${reservation.name}님 지정석`);
                } else {
                    seat.classList.add('occupied');
                    seat.setAttribute('aria-label', `${seatId}번 좌석 - ${reservation.name}님이 예약`);
                }
            } else {
                // 이전 데이터 구조 호환성 (문자열)
                seat.classList.add('occupied');
                seat.setAttribute('aria-label', `${seatId}번 좌석 - ${reservation}님이 예약`);
            }
        } else {
            seat.classList.add('available');
            seat.setAttribute('aria-label', `${seatId}번 좌석 - 예약 가능`);
        }
    });
    
    updateButtons();
}

// 선택된 좌석 정보 업데이트
function updateSelectedSeatInfo() {
    const selectedSeatElement = document.getElementById('selected-seat');
    const seatOwnerElement = document.getElementById('seat-owner');
    
    if (selectedSeat) {
        selectedSeatElement.textContent = `${selectedSeat}번`;
        
        if (reservations[selectedSeat]) {
            const reservation = reservations[selectedSeat];
            if (typeof reservation === 'object') {
                seatOwnerElement.textContent = reservation.isAssigned ? 
                    `${reservation.name} (지정석)` : reservation.name;
            } else {
                seatOwnerElement.textContent = reservation;
            }
        } else {
            seatOwnerElement.textContent = '예약 가능';
        }
    } else {
        selectedSeatElement.textContent = '없음';
        seatOwnerElement.textContent = '-';
    }
}

// 버튼 상태 업데이트
function updateButtons() {
    const reserveBtn = document.getElementById('reserve-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    const hasUser = currentUser.length > 0;
    const hasSeat = selectedSeat !== null;
    const reservation = reservations[selectedSeat];
    
    let isOccupied = false;
    let isAssigned = false;
    
    if (reservation) {
        if (typeof reservation === 'object') {
            isOccupied = true;
            isAssigned = reservation.isAssigned;
        } else {
            isOccupied = true;
        }
    }
    
    // 예약 버튼 - 학번이 있고, 좌석이 선택되고, 좌석이 비어있고, 점검모드가 아닌 경우
    reserveBtn.disabled = !(hasUser && hasSeat && !isOccupied && !isMaintenanceMode);
    
    // 취소 버튼 - 학번이 있고, 좌석이 선택되고, 좌석이 예약되고, 지정석이 아닌 경우
    cancelBtn.disabled = !(hasUser && hasSeat && isOccupied && !isAssigned);
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
    
    // 자연스러운 시간 구분: 오전(0-12시), 오후(12-24시)
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
    if (document.getElementById('online-users')) {
        document.getElementById('online-users').textContent = onlineUsersCount;
    }
}

// 점검 모드 UI 업데이트
function updateMaintenanceMode() {
    const notice = document.getElementById('maintenance-notice');
    
    if (isMaintenanceMode) {
        if (notice) notice.classList.remove('hidden');
        
        // 예약 기능 비활성화
        document.querySelectorAll('.seat').forEach(seat => {
            seat.style.pointerEvents = 'none';
            seat.style.opacity = '0.6';
        });
        document.getElementById('reserve-btn').disabled = true;
        document.getElementById('cancel-btn').disabled = true;
        
        showNotification('점검 모드가 활성화되었습니다.', 'warning');
    } else {
        if (notice) notice.classList.add('hidden');
        
        // 예약 기능 재활성화
        document.querySelectorAll('.seat').forEach(seat => {
            seat.style.pointerEvents = '';
            seat.style.opacity = '';
        });
        updateButtons();
    }
}

// 유틸리티 함수들
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

function handleScreenResize() {
    const seats = document.querySelectorAll('.seat');
    const isMobile = isMobileDevice();
    
    seats.forEach(seat => {
        if (isMobile) {
            seat.style.fontSize = '12px';
        } else {
            seat.style.fontSize = '';
        }
    });
}

function handleOrientationChange() {
    setTimeout(() => {
        handleScreenResize();
        
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }, 100);
}

// 키보드 단축키 처리
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // 입력 필드에서 타이핑 중이면 단축키 무시
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }
        
        // 숫자 키로 좌석 선택 (1-9, 0은 10)
        if (e.key >= '1' && e.key <= '9') {
            const seatNumber = e.key;
            selectSeatById(seatNumber);
        } else if (e.key === '0') {
            selectSeatById('10');
        }
        
        // Enter: 예약하기 (좌석이 선택된 경우)
        if (e.key === 'Enter' && selectedSeat && currentUser) {
            e.preventDefault();
            reserveSeat();
        }
        
        // Delete/Backspace: 예약 취소 (내 좌석인 경우)
        if ((e.key === 'Delete' || e.key === 'Backspace') && 
            selectedSeat && reservations[selectedSeat]) {
            e.preventDefault();
            cancelReservation();
        }
    });
}

// 좌석 ID로 선택
function selectSeatById(seatId) {
    const seatElement = document.querySelector(`[data-seat="${seatId}"]`);
    if (seatElement) {
        selectSeat(seatId);
        seatElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// 브라우저 지원 체크
function checkBrowserSupport() {
    const features = {
        fetch: typeof fetch !== 'undefined',
        websocket: typeof WebSocket !== 'undefined',
        localStorage: typeof localStorage !== 'undefined',
        flexbox: CSS.supports('display', 'flex'),
        grid: CSS.supports('display', 'grid')
    };
    
    const unsupported = Object.entries(features)
        .filter(([feature, supported]) => !supported)
        .map(([feature]) => feature);
    
    if (unsupported.length > 0) {
        showNotification(
            `이 브라우저는 일부 기능을 지원하지 않습니다: ${unsupported.join(', ')}`,
            'error',
            10000
        );
    }
    
    return unsupported.length === 0;
}

// 연결 복구 시도
async function attemptReconnection() {
    let attempts = 0;
    const maxAttempts = 5;
    const baseDelay = 1000;
    
    while (attempts < maxAttempts && !socket.connected) {
        attempts++;
        const delay = baseDelay * Math.pow(2, attempts - 1); // 지수 백오프
        
        debugLog(`Reconnection attempt ${attempts}/${maxAttempts} in ${delay}ms`);
        showNotification(`재연결 시도 중... (${attempts}/${maxAttempts})`, 'info', 2000);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
            socket.connect();
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
                socket.once('connect', () => {
                    clearTimeout(timeout);
                    resolve();
                });
                socket.once('connect_error', () => {
                    clearTimeout(timeout);
                    reject(new Error('Connection failed'));
                });
            });
            
            showNotification('서버에 다시 연결되었습니다!', 'success');
            return true;
        } catch (error) {
            debugLog(`Reconnection attempt ${attempts} failed:`, error);
        }
    }
    
    showNotification('서버 연결에 실패했습니다. 페이지를 새로고침해주세요.', 'error', 10000);
    return false;
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
}

// 성공 메시지 표시
function showSuccess(message) {
    showNotification(message, 'success');
}

// 디버그 로그 함수
function debugLog(...args) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[DEBUG]', ...args);
    }
}
