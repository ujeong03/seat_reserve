// 서버리스용 클라이언트 (Socket.IO 없이)

let reservations = {};
let currentSession = 'morning';
let lastUpdateTime = 0;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadReservations();
    updateTimeDisplay();
    
    // 정기적으로 데이터 새로고침 (Socket.IO 대신)
    setInterval(loadReservations, 5000); // 5초마다
    setInterval(updateTimeDisplay, 1000);
    setInterval(updateCurrentSession, 60000);
    
    // 좌석 클릭 이벤트
    document.querySelectorAll('.seat').forEach(seat => {
        seat.addEventListener('click', handleSeatClick);
    });
    
    // 예약 폼 이벤트
    document.getElementById('reserve-btn').addEventListener('click', makeReservation);
    document.getElementById('cancel-btn').addEventListener('click', cancelReservation);
    document.getElementById('student-id').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (document.getElementById('selected-seat').value) {
                makeReservation();
            }
        }
    });
}

// 예약 데이터 로드
async function loadReservations() {
    try {
        const response = await fetch('/reservations');
        const data = await response.json();
        
        if (data.success) {
            reservations = data.reservations || {};
            currentSession = data.session;
            updateSeatDisplay();
            updateSessionInfo();
            updateReservationStats();
        }
    } catch (error) {
        console.error('예약 데이터 로드 실패:', error);
        showError('서버 연결에 실패했습니다.');
    }
}

// 좌석 표시 업데이트
function updateSeatDisplay() {
    document.querySelectorAll('.seat').forEach(seat => {
        const seatId = seat.dataset.seat;
        
        seat.classList.remove('available', 'occupied', 'selected');
        
        if (reservations[seatId]) {
            seat.classList.add('occupied');
            seat.title = `${seatId}번 - ${reservations[seatId]}님이 예약`;
            seat.innerHTML = `<span class="seat-number">${seatId}</span><span class="occupant">${reservations[seatId]}</span>`;
        } else {
            seat.classList.add('available');
            seat.title = `${seatId}번 - 예약 가능`;
            seat.innerHTML = `<span class="seat-number">${seatId}</span>`;
        }
    });
}

// 좌석 클릭 처리
function handleSeatClick(e) {
    const seat = e.currentTarget;
    const seatId = seat.dataset.seat;
    
    if (seat.classList.contains('occupied')) {
        showInfo(`${seatId}번 자리는 이미 예약되어 있습니다.`);
        return;
    }
    
    // 기존 선택 해제
    document.querySelectorAll('.seat.selected').forEach(s => {
        s.classList.remove('selected');
    });
    
    // 새로운 선택
    seat.classList.add('selected');
    document.getElementById('selected-seat').value = seatId;
    document.getElementById('seat-info').textContent = `선택된 자리: ${seatId}번`;
    
    // 학번 입력 필드에 포커스
    document.getElementById('student-id').focus();
}

// 예약하기
async function makeReservation() {
    const seatId = document.getElementById('selected-seat').value;
    const studentId = document.getElementById('student-id').value.trim();
    
    if (!seatId) {
        showError('자리를 선택해주세요.');
        return;
    }
    
    if (!studentId) {
        showError('학번을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch('/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ seatId, studentId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            reservations = data.reservations || {};
            updateSeatDisplay();
            updateReservationStats();
            clearForm();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('예약 실패:', error);
        showError('예약 중 오류가 발생했습니다.');
    }
}

// 예약 취소
async function cancelReservation() {
    const seatId = document.getElementById('selected-seat').value;
    const studentId = document.getElementById('student-id').value.trim();
    
    if (!seatId) {
        showError('취소할 자리를 선택해주세요.');
        return;
    }
    
    if (!studentId) {
        showError('학번을 입력해주세요.');
        return;
    }
    
    try {
        const response = await fetch(`/reservations/${seatId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSuccess(data.message);
            reservations = data.reservations || {};
            updateSeatDisplay();
            updateReservationStats();
            clearForm();
        } else {
            showError(data.message);
        }
    } catch (error) {
        console.error('취소 실패:', error);
        showError('취소 중 오류가 발생했습니다.');
    }
}

// 폼 초기화
function clearForm() {
    document.getElementById('selected-seat').value = '';
    document.getElementById('student-id').value = '';
    document.getElementById('seat-info').textContent = '자리를 선택하세요';
    
    document.querySelectorAll('.seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });
}

// 현재 세션 업데이트
function updateCurrentSession() {
    const now = new Date();
    const hour = now.getHours();
    
    currentSession = hour >= 0 && hour < 12 ? 'morning' : 'afternoon';
}

// 세션 정보 업데이트
function updateSessionInfo() {
    const sessionText = currentSession === 'morning' ? '오전 (00:00-11:59)' : '오후 (12:00-23:59)';
    document.getElementById('current-session').textContent = sessionText;
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

// 다음 리셋 시간 계산
function getNextResetTime(now) {
    const nextReset = new Date(now);
    const hour = now.getHours();
    
    if (hour >= 0 && hour < 12) {
        nextReset.setHours(12, 0, 0, 0);
    } else {
        nextReset.setDate(nextReset.getDate() + 1);
        nextReset.setHours(0, 0, 0, 0);
    }
    
    return nextReset;
}

// 예약 통계 업데이트
function updateReservationStats() {
    const totalSeats = 13;
    const occupiedSeats = Object.keys(reservations).length;
    const occupancyRate = Math.round((occupiedSeats / totalSeats) * 100);
    
    document.getElementById('occupancy-rate').textContent = `${occupancyRate}%`;
    document.getElementById('occupied-seats').textContent = occupiedSeats;
}

// 알림 함수들
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showInfo(message) {
    showNotification(message, 'info');
}

function showNotification(message, type) {
    // 기존 알림 제거
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 3초 후 자동 제거
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
