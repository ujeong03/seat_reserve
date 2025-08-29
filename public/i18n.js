// 다국어 지원을 위한 언어 데이터
const i18n = {
    ko: {
        // 페이지 제목 및 메타
        title: "SCLAB SEAT BOOKING",
        description: "연구실 자리를 효율적으로 관리하는 실시간 예약 시스템",
        
        // 네비게이션
        home: "🏠 홈",
        admin: "⚙️ 관리자",
        menuToggle: "메뉴 열기/닫기",
        
        // 헤더
        currentTime: "현재 시간:",
        currentSession: "현재 세션:",
        nextReset: "다음 리셋:",
        serverConnecting: "서버 연결 중...",
        serverConnected: "서버 연결됨",
        serverDisconnected: "서버 연결 끊김",
        onlineUsers: "온라인 사용자:",
        usersCount: "명",
        
        // 범례
        available: "이용 가능",
        occupied: "사용 중",
        selected: "선택됨",
        
        // 점검 모드
        maintenanceNotice: "⚠️ 현재 점검 모드입니다. 예약 기능이 제한됩니다.",
        
        // 방 레이아웃
        window: "창문",
        door: "출입구",
        
        // 좌석 관련
        seatLabel: "번 좌석",
        
        // 컨트롤
        studentId: "학번:",
        studentIdPlaceholder: "학번을 입력하세요",
        selectedSeat: "선택된 좌석:",
        reservedBy: "예약자:",
        none: "없음",
        reserve: "예약하기",
        cancelReservation: "예약 취소",
        
        // 푸터
        versionInfo: "SCLab 좌석 예약 시스템 v2.0 (2025.08)",
        
        // 메시지
        selectSeatFirst: "먼저 좌석을 선택해주세요.",
        enterStudentId: "학번을 입력해주세요.",
        reservationSuccess: "예약이 완료되었습니다!",
        cancellationSuccess: "예약이 취소되었습니다!",
        alreadyReserved: "이미 예약된 좌석입니다.",
        reservationFailed: "예약에 실패했습니다. 다시 시도해주세요.",
        notYourReservation: "본인이 예약한 좌석이 아닙니다.",
        networkError: "네트워크 오류가 발생했습니다.",
        sessionExpired: "세션이 만료되었습니다. 새로고침 후 다시 시도해주세요.",
        
        // 관리자 페이지
        adminTitle: "관리자 페이지 - 연구실 자리 예약 시스템",
        userPage: "🏠 홈",
        adminMode: "관리자 모드",
        logout: "로그아웃",
        login: "로그인",
        adminAuth: "관리자 인증",
        adminPassword: "비밀번호:",
        passwordPlaceholder: "관리자 비밀번호 입력",
        
        // 대시보드
        dashboardTitle: "관리자 대시보드",
        occupancyRate: "점유율",
        reservedSeats: "예약된 좌석",
        onlineUsersCount: "온라인 사용자",
        serverStatus: "서버 상태",
        normalStatus: "정상",
        
        // 좌석 현황
        seatOverview: "좌석 현황",
        currentReservations: "현재 예약자 목록",
        noReservations: "현재 예약이 없습니다.",
        
        // 관리 작업
        adminActions: "관리 작업",
        clearAllReservations: "🗑️ 전체 예약 초기화",
        forceSessionChange: "🔄 세션 강제 변경",
        maintenanceMode: "🔧 점검 모드",
        seatAssignment: "🎯 좌석 지정하기",
        
        // 좌석 지정 모달
        seatAssignmentModal: "좌석 지정하기",
        seatNumber: "좌석 번호:",
        selectSeat: "좌석을 선택하세요",
        studentName: "학생 이름:",
        studentNamePlaceholder: "학생 이름을 입력하세요",
        studentIdPlaceholder2: "학번을 입력하세요",
        startDate: "시작일:",
        endDate: "종료일:",
        permanentAssign: "영구 지정 (세션 만료 무시)",
        assign: "지정하기",
        cancel: "취소",
        
        // 학생 관리
        studentManagement: "학생 관리",
        addNewStudent: "새 학생 추가",
        studentIdExample: "예: 2023001",
        studentNameExample: "예: 홍길동",
        addStudent: "➕ 학생 추가",
        registeredStudents: "등록된 학생 목록",
        refreshList: "🔄 목록 새로고침",
        searchPlaceholder: "학번 또는 이름으로 검색...",
        loadingStudents: "학생 목록을 불러오는 중...",
        
        // 시스템 로그
        systemLogs: "시스템 로그",
        systemStarted: "시스템이 시작되었습니다.",
        clearLogs: "로그 지우기"
    },
    
    en: {
        // 페이지 제목 및 메타
        title: "SCLAB SEAT BOOKING",
        description: "Real-time reservation system for efficient lab seat management",
        
        // 네비게이션
        home: "🏠 Home",
        admin: "⚙️ Admin",
        menuToggle: "Toggle menu",
        
        // 헤더
        currentTime: "Current Time:",
        currentSession: "Current Session:",
        nextReset: "Next Reset:",
        serverConnecting: "Connecting to server...",
        serverConnected: "Connected to server",
        serverDisconnected: "Disconnected from server",
        onlineUsers: "Online Users:",
        usersCount: "",
        
        // 범례
        available: "Available",
        occupied: "Occupied",
        selected: "Selected",
        
        // 점검 모드
        maintenanceNotice: "⚠️ Currently in maintenance mode. Reservation features are limited.",
        
        // 방 레이아웃
        window: "Window",
        door: "Door",
        
        // 좌석 관련
        seatLabel: "",
        
        // 컨트롤
        studentId: "Student ID:",
        studentIdPlaceholder: "Enter your student ID",
        selectedSeat: "Selected Seat:",
        reservedBy: "Reserved By:",
        none: "None",
        reserve: "Reserve",
        cancelReservation: "Cancel Reservation",
        
        // 푸터
        versionInfo: "SCLab Seat Reservation System v2.0 (2025.08)",
        
        // 메시지
        selectSeatFirst: "Please select a seat first.",
        enterStudentId: "Please enter your student ID.",
        reservationSuccess: "Reservation completed successfully!",
        cancellationSuccess: "Reservation cancelled successfully!",
        alreadyReserved: "This seat is already reserved.",
        reservationFailed: "Reservation failed. Please try again.",
        notYourReservation: "This is not your reservation.",
        networkError: "A network error occurred.",
        sessionExpired: "Session expired. Please refresh and try again.",
        
        // 관리자 페이지
        adminTitle: "Admin Page - Lab Seat Reservation System",
        userPage: "🏠 home",
        admin: "Admin",
        logout: "Logout",
        login: "Login",
        adminAuth: "Admin Authentication",
        adminPassword: "Password:",
        passwordPlaceholder: "Enter admin password",
        
        // 대시보드
        dashboardTitle: "Admin Dashboard",
        occupancyRate: "Occupancy Rate",
        reservedSeats: "Reserved Seats",
        onlineUsersCount: "Online Users",
        serverStatus: "Server Status",
        normalStatus: "Normal",
        
        // 좌석 현황
        seatOverview: "Seat Overview",
        currentReservations: "Current Reservations",
        noReservations: "No current reservations.",
        
        // 관리 작업
        adminActions: "Admin Actions",
        clearAllReservations: "🗑️ Clear All Reservations",
        forceSessionChange: "🔄 Force Session Change",
        maintenanceMode: "🔧 Maintenance Mode",
        seatAssignment: "🎯 Seat Assignment",
        
        // 좌석 지정 모달
        seatAssignmentModal: "Seat Assignment",
        seatNumber: "Seat Number:",
        selectSeat: "Please select a seat",
        studentName: "Student Name:",
        studentNamePlaceholder: "Enter student name",
        studentIdPlaceholder2: "Enter student ID",
        startDate: "Start Date:",
        endDate: "End Date:",
        permanentAssign: "Permanent Assignment (Ignore session expiry)",
        assign: "Assign",
        cancel: "Cancel",
        
        // 학생 관리
        studentManagement: "Student Management",
        addNewStudent: "Add New Student",
        studentIdExample: "e.g., 2023001",
        studentNameExample: "e.g., John Doe",
        addStudent: "➕ Add Student",
        registeredStudents: "Registered Students",
        refreshList: "🔄 Refresh List",
        searchPlaceholder: "Search by ID or name...",
        loadingStudents: "Loading student list...",
        
        // 시스템 로그
        systemLogs: "System Logs",
        systemStarted: "System started.",
        clearLogs: "Clear Logs"
    }
};

// 현재 언어 (기본값: 한국어)
let currentLanguage = localStorage.getItem('language') || 'ko';

// 언어 변경 함수
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // HTML lang 속성 업데이트
    document.documentElement.lang = lang;
    
    // 즉시 페이지 새로고침하여 언어 적용
    window.location.reload();
}

// 번역 텍스트 가져오기 함수
function t(key) {
    return i18n[currentLanguage][key] || i18n['ko'][key] || key;
}

// 페이지 언어 업데이트 함수
function updatePageLanguage() {
    // 문서 제목
    document.title = t('title');
    
    // 관리자 페이지인 경우 제목 변경
    if (document.body.classList.contains('admin-page')) {
        document.title = t('adminTitle');
    }
    
    // 메타 태그
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.content = t('description');
    }
    
    // 네비게이션
    const homeLink = document.getElementById('home-link');
    if (homeLink) homeLink.textContent = t('home');
    
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) adminLink.textContent = t('admin');
    
    // 관리자 페이지의 사용자 페이지 링크
    const userPageLink = document.querySelector('a[href="index.html"]');
    if (userPageLink) userPageLink.textContent = t('userPage');
    
    const hamburger = document.getElementById('hamburger-menu');
    if (hamburger) hamburger.setAttribute('aria-label', t('menuToggle'));
    
    // 관리자 페이지 특별 처리
    if (document.body.classList.contains('admin-page')) {
        updateAdminPageLanguage();
    } else {
        updateUserPageLanguage();
    }
    
    // 언어 선택 버튼 업데이트
    updateLanguageButtons();
}

// 사용자 페이지 언어 업데이트
function updateUserPageLanguage() {
    // 헤더
    const timeLabels = document.querySelectorAll('.time-info > div');
    if (timeLabels[0]) timeLabels[0].childNodes[0].textContent = t('currentTime') + ' ';
    if (timeLabels[1]) timeLabels[1].childNodes[0].textContent = t('currentSession') + ' ';
    if (timeLabels[2]) timeLabels[2].childNodes[0].textContent = t('nextReset') + ' ';
    
    const connectionText = document.getElementById('connection-text');
    if (connectionText && connectionText.textContent.includes('연결')) {
        connectionText.textContent = t('serverConnecting');
    }
    
    const onlineCount = document.querySelector('.online-count');
    if (onlineCount) {
        const count = onlineCount.querySelector('#online-users').textContent;
        onlineCount.innerHTML = `${t('onlineUsers')} <span id="online-users">${count}</span>${t('usersCount')}`;
    }
    
    // 범례
    const legendItems = document.querySelectorAll('.legend-item span');
    if (legendItems[0]) legendItems[0].textContent = t('available');
    if (legendItems[1]) legendItems[1].textContent = t('occupied');
    if (legendItems[2]) legendItems[2].textContent = t('selected');
    
    // 점검 모드 알림
    const maintenanceNotice = document.getElementById('maintenance-notice');
    if (maintenanceNotice) {
        maintenanceNotice.textContent = t('maintenanceNotice');
    }
    
    // 창문과 출입구
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.textContent = t('window');
    });
    
    const door = document.querySelector('.door');
    if (door) door.textContent = t('door');
    
    // 좌석 aria-label 업데이트
    const seats = document.querySelectorAll('.seat');
    seats.forEach(seat => {
        const seatNumber = seat.dataset.seat;
        seat.setAttribute('aria-label', `${seatNumber}${t('seatLabel')}`);
    });
    
    // 컨트롤
    const studentIdLabel = document.querySelector('label[for="student-id"]');
    if (studentIdLabel) studentIdLabel.textContent = t('studentId');
    
    const studentIdInput = document.getElementById('student-id');
    if (studentIdInput) studentIdInput.placeholder = t('studentIdPlaceholder');
    
    const selectedSeatLabel = document.querySelector('.selected-seat');
    if (selectedSeatLabel) {
        const seatValue = selectedSeatLabel.querySelector('#selected-seat').textContent;
        selectedSeatLabel.innerHTML = `${t('selectedSeat')} <span id="selected-seat">${seatValue === 'None' ? t('none') : seatValue}</span>`;
    }
    
    const seatOwnerLabel = document.querySelector('.seat-owner');
    if (seatOwnerLabel) {
        const ownerValue = seatOwnerLabel.querySelector('#seat-owner').textContent;
        seatOwnerLabel.innerHTML = `${t('reservedBy')} <span id="seat-owner">${ownerValue === '-' ? '-' : ownerValue}</span>`;
    }
    
    const reserveBtn = document.getElementById('reserve-btn');
    if (reserveBtn) reserveBtn.textContent = t('reserve');
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) cancelBtn.textContent = t('cancelReservation');
    
    // 푸터
    const versionInfo = document.querySelector('.version-info p');
    if (versionInfo) versionInfo.textContent = t('versionInfo');
}

// 관리자 페이지 언어 업데이트
function updateAdminPageLanguage() {
    // 관리자 네비게이션
    const adminGreeting = document.getElementById('admin-greeting');
    if (adminGreeting) adminGreeting.textContent = t('adminMode');
    
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.textContent = t('logout');
    
    // 로그인 폼
    const loginTitle = document.getElementById('login-title');
    if (loginTitle) loginTitle.textContent = t('adminAuth');
    
    const passwordLabel = document.getElementById('password-label');
    if (passwordLabel) passwordLabel.textContent = t('adminPassword');
    
    const passwordInput = document.getElementById('admin-password');
    if (passwordInput) passwordInput.placeholder = t('passwordPlaceholder');
    
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.textContent = t('login');
    
    // 시간 정보
    const adminCurrentTime = document.getElementById('admin-current-time');
    if (adminCurrentTime) {
        const timeValue = adminCurrentTime.querySelector('#current-time').textContent;
        adminCurrentTime.innerHTML = `${t('currentTime')} <span id="current-time">${timeValue}</span>`;
    }
    
    const adminSessionInfo = document.getElementById('admin-session-info');
    if (adminSessionInfo) {
        const sessionValue = adminSessionInfo.querySelector('#current-session').textContent;
        adminSessionInfo.innerHTML = `${t('currentSession')} <span id="current-session">${sessionValue}</span>`;
    }
    
    const adminNextReset = document.getElementById('admin-next-reset');
    if (adminNextReset) {
        const resetValue = adminNextReset.querySelector('#next-reset').textContent;
        adminNextReset.innerHTML = `${t('nextReset')} <span id="next-reset">${resetValue}</span>`;
    }
    
    // 점검 모드 알림
    const maintenanceNotice = document.getElementById('maintenance-notice');
    if (maintenanceNotice) {
        maintenanceNotice.textContent = t('maintenanceNotice');
    }
    
    // 통계 대시보드
    const occupancyTitle = document.getElementById('occupancy-title');
    if (occupancyTitle) occupancyTitle.textContent = t('occupancyRate');
    
    const reservedSeatsTitle = document.getElementById('reserved-seats-title');
    if (reservedSeatsTitle) reservedSeatsTitle.textContent = t('reservedSeats');
    
    const onlineUsersTitle = document.getElementById('online-users-title');
    if (onlineUsersTitle) onlineUsersTitle.textContent = t('onlineUsersCount');
    
    const serverStatusTitle = document.getElementById('server-status-title');
    if (serverStatusTitle) serverStatusTitle.textContent = t('serverStatus');
    
    const serverStatusText = document.getElementById('server-status-text');
    if (serverStatusText && serverStatusText.textContent === '정상') {
        serverStatusText.textContent = t('normalStatus');
    }
    
    // 좌석 현황
    const seatOverviewTitle = document.getElementById('seat-overview-title');
    if (seatOverviewTitle) seatOverviewTitle.textContent = t('seatOverview');
    
    // 현재 예약자 목록
    const reservationsTitle = document.getElementById('reservations-title');
    if (reservationsTitle) reservationsTitle.textContent = t('currentReservations');
    
    const noReservationsText = document.getElementById('no-reservations-text');
    if (noReservationsText) noReservationsText.textContent = t('noReservations');
    
    // 관리자 액션
    const adminActionsTitle = document.getElementById('admin-actions-title');
    if (adminActionsTitle) adminActionsTitle.textContent = t('adminActions');
    
    const clearAllBtn = document.getElementById('clear-all-btn');
    if (clearAllBtn) clearAllBtn.innerHTML = t('clearAllReservations');
    
    const forceSessionBtn = document.getElementById('force-session-btn');
    if (forceSessionBtn) forceSessionBtn.innerHTML = t('forceSessionChange');
    
    const maintenanceBtn = document.getElementById('maintenance-btn');
    if (maintenanceBtn) maintenanceBtn.innerHTML = t('maintenanceMode');
    
    const seatAssignBtn = document.getElementById('seat-assign-btn');
    if (seatAssignBtn) seatAssignBtn.innerHTML = t('seatAssignment');
    
    // 좌석 지정 모달
    const seatAssignModalTitle = document.getElementById('seat-assign-modal-title');
    if (seatAssignModalTitle) seatAssignModalTitle.textContent = t('seatAssignmentModal');
    
    const seatNumberLabel = document.getElementById('seat-number-label');
    if (seatNumberLabel) seatNumberLabel.textContent = t('seatNumber');
    
    const selectSeatOption = document.getElementById('select-seat-option');
    if (selectSeatOption) selectSeatOption.textContent = t('selectSeat');
    
    const studentNameLabel = document.getElementById('student-name-label');
    if (studentNameLabel) studentNameLabel.textContent = t('studentName');
    
    const assignStudentName = document.getElementById('assign-student-name');
    if (assignStudentName) assignStudentName.placeholder = t('studentNamePlaceholder');
    
    const studentIdLabel = document.getElementById('student-id-label');
    if (studentIdLabel) studentIdLabel.textContent = t('studentId');
    
    const assignStudentId = document.getElementById('assign-student-id');
    if (assignStudentId) assignStudentId.placeholder = t('studentIdPlaceholder2');
    
    const startDateLabel = document.getElementById('start-date-label');
    if (startDateLabel) startDateLabel.textContent = t('startDate');
    
    const endDateLabel = document.getElementById('end-date-label');
    if (endDateLabel) endDateLabel.textContent = t('endDate');
    
    const permanentAssignLabel = document.getElementById('permanent-assign-label');
    if (permanentAssignLabel) permanentAssignLabel.textContent = t('permanentAssign');
    
    const assignConfirmBtn = document.getElementById('assign-confirm-btn');
    if (assignConfirmBtn) assignConfirmBtn.textContent = t('assign');
    
    const assignCancelBtn = document.getElementById('assign-cancel-btn');
    if (assignCancelBtn) assignCancelBtn.textContent = t('cancel');
    
    // 학생 관리
    const studentManagementTitle = document.getElementById('student-management-title');
    if (studentManagementTitle) studentManagementTitle.textContent = t('studentManagement');
    
    const addStudentTitle = document.getElementById('add-student-title');
    if (addStudentTitle) addStudentTitle.textContent = t('addNewStudent');
    
    const newStudentIdLabel = document.getElementById('new-student-id-label');
    if (newStudentIdLabel) newStudentIdLabel.textContent = t('studentId');
    
    const newStudentId = document.getElementById('new-student-id');
    if (newStudentId) newStudentId.placeholder = t('studentIdExample');
    
    const newStudentNameLabel = document.getElementById('new-student-name-label');
    if (newStudentNameLabel) newStudentNameLabel.textContent = t('studentName');
    
    const newStudentName = document.getElementById('new-student-name');
    if (newStudentName) newStudentName.placeholder = t('studentNameExample');
    
    const addStudentBtn = document.getElementById('add-student-btn');
    if (addStudentBtn) addStudentBtn.innerHTML = t('addStudent');
    
    const studentsListTitle = document.getElementById('students-list-title');
    if (studentsListTitle) studentsListTitle.textContent = t('registeredStudents');
    
    const refreshStudentsBtn = document.getElementById('refresh-students-btn');
    if (refreshStudentsBtn) refreshStudentsBtn.innerHTML = t('refreshList');
    
    const studentSearch = document.getElementById('student-search');
    if (studentSearch) studentSearch.placeholder = t('searchPlaceholder');
    
    const studentsLoading = document.getElementById('students-loading');
    if (studentsLoading) studentsLoading.textContent = t('loadingStudents');
    
    // 시스템 로그
    const systemLogsTitle = document.getElementById('system-logs-title');
    if (systemLogsTitle) systemLogsTitle.textContent = t('systemLogs');
    
    const systemStartLog = document.getElementById('system-start-log');
    if (systemStartLog) systemStartLog.textContent = t('systemStarted');
    
    const clearLogsBtn = document.getElementById('clear-logs-btn');
    if (clearLogsBtn) clearLogsBtn.textContent = t('clearLogs');
}

// 언어 선택 버튼 업데이트
function updateLanguageButtons() {
    const koreanBtn = document.getElementById('lang-ko');
    const englishBtn = document.getElementById('lang-en');
    
    if (koreanBtn && englishBtn) {
        koreanBtn.classList.toggle('active', currentLanguage === 'ko');
        englishBtn.classList.toggle('active', currentLanguage === 'en');
    }
}

// 페이지 로드 시 언어 설정
document.addEventListener('DOMContentLoaded', function() {
    // HTML lang 속성 설정
    document.documentElement.lang = currentLanguage;
    
    // 페이지 언어 업데이트
    updatePageLanguage();
});

// 언어별 알림 메시지 함수들
window.showMessage = function(key, ...args) {
    alert(t(key));
};

// 전역으로 번역 함수 노출
window.t = t;
window.changeLanguage = changeLanguage;
