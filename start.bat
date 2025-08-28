@echo off
echo 🚀 연구실 자리 예약 시스템 설치 및 실행
echo.

REM Node.js 설치 확인
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js가 설치되지 않았습니다.
    echo 📥 https://nodejs.org/ 에서 Node.js를 다운로드하여 설치하세요.
    pause
    exit /b 1
)

echo ✅ Node.js 설치 확인됨
node --version

REM npm 설치 확인
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm이 설치되지 않았습니다.
    pause
    exit /b 1
)

echo ✅ npm 설치 확인됨
npm --version
echo.

echo 📦 필요한 패키지를 설치합니다...
npm install

if %errorlevel% neq 0 (
    echo ❌ 패키지 설치에 실패했습니다.
    pause
    exit /b 1
)

echo.
echo ✅ 설치가 완료되었습니다!
echo.
echo 🚀 서버를 시작합니다...
echo 📱 웹사이트: http://localhost:3000
echo 🔧 관리자 비밀번호: admin123
echo.
echo 종료하려면 Ctrl+C를 누르세요.
echo.

npm start
