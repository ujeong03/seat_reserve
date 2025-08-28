# 🚂 Railway 배포 가이드 (단계별 상세 설명)

## 🎯 Railway가 최적인 이유
- ✅ Socket.IO 실시간 통신 완벽 지원
- ✅ SQLite 파일 저장소 유지
- ✅ Node.js 앱 배포 특화
- ✅ GitHub 자동 동기화
- ✅ 무료 플랜 제공

## 📋 **1단계: Railway 계정 생성**

### 1-1. Railway 웹사이트 접속
- **URL**: https://railway.app
- **"Login"** 버튼 클릭

### 1-2. GitHub 계정으로 로그인
- **"Login with GitHub"** 선택
- GitHub 계정 권한 승인

## 🚀 **2단계: 프로젝트 배포**

### 2-1. 새 프로젝트 생성
1. 로그인 후 **"New Project"** 클릭
2. **"Deploy from GitHub repo"** 선택
3. **저장소 검색**: `seat_reserve` 입력
4. 나타나는 `ujeong03/seat_reserve` 저장소 선택
5. **"Deploy Now"** 클릭

### 2-2. 자동 배포 시작
- Railway가 자동으로 코드를 분석합니다
- `package.json`의 `"start": "node src/server.js"` 스크립트를 감지
- 필요한 의존성들을 자동 설치

## ⚙️ **3단계: 환경변수 설정**

### 3-1. Variables 탭 이동
1. 프로젝트 대시보드에서 **"Variables"** 탭 클릭
2. **"New Variable"** 버튼 클릭

### 3-2. 필수 환경변수 추가
각각을 개별적으로 추가하세요:

**첫 번째 변수:**
```
Name: NODE_ENV
Value: production
```

**두 번째 변수:**
```
Name: ADMIN_PASSWORD
Value: 강력한_비밀번호_여기에_입력  (예: MyAdmin2024!@#)
```

**세 번째 변수:**
```
Name: PORT
Value: $PORT
```
⚠️ **중요**: PORT는 정확히 `$PORT`로 입력하세요 (Railway 자동 할당)

### 3-3. 변수 저장
- 각 변수 추가 후 **"Add"** 클릭
- 모든 변수가 추가되면 자동으로 재배포 시작

## 📊 **4단계: 배포 상태 확인**

### 4-1. Deployments 탭 확인
1. **"Deployments"** 탭 클릭
2. 배포 진행 상황 실시간 확인
3. 로그에서 다음 메시지 확인:
   ```
   🚀 서버가 포트 XXXX에서 실행 중입니다.
   ✅ SQLite 데이터베이스 연결됨
   ✅ students 테이블 생성 완료
   ✅ 샘플 학생 데이터 추가 완료
   ```

### 4-2. 성공 확인
- ✅ **녹색 체크마크** 표시시 배포 완료
- ❌ **빨간 X** 표시시 오류 발생 (로그 확인)

## 🌐 **5단계: 도메인 및 접속**

### 5-1. 도메인 확인
1. **"Settings"** 탭 클릭
2. **"Domains"** 섹션에서 URL 확인
3. 자동 생성 URL 예: `https://seat-reserve-production-xxxx.up.railway.app`

### 5-2. 웹사이트 테스트
**사용자 페이지:**
- `https://your-app.up.railway.app`

**관리자 페이지:**
- `https://your-app.up.railway.app/admin.html`
- 비밀번호: 설정한 ADMIN_PASSWORD

## ✅ **6단계: 기능 테스트**

### 6-1. 기본 기능 확인
- [ ] 메인 페이지 로딩
- [ ] 좌석 선택 및 예약 (학번: 20241001-20241005)
- [ ] 실시간 동기화 확인 (다른 탭에서 변경사항 즉시 반영)
- [ ] 관리자 페이지 접속 및 로그인

### 6-2. 모바일 테스트
- [ ] 모바일 브라우저에서 접속
- [ ] 반응형 레이아웃 확인

## 🔧 **문제 해결**

### 배포 실패시
1. **"Deployments" > "View Logs"**에서 오류 확인
2. 환경변수 설정 재확인
3. GitHub 저장소 동기화 상태 확인

### 일반적인 오류들
- **PORT 에러**: `PORT` 변수가 `$PORT`인지 확인
- **권한 에러**: GitHub 저장소 접근 권한 확인
- **빌드 에러**: `package.json` 의존성 확인

## 💰 **무료 플랜 제한**
- **월 500시간** 사용 가능
- **$5 크레딧** 매월 제공
- 대부분의 개인/학교 프로젝트에 충분

## 🎉 **완료!**

이제 전 세계 어디서나 접속 가능한 실시간 좌석 예약 시스템이 완성되었습니다!

**다음 단계:**
- URL 공유하여 사용자들에게 알리기
- 필요시 커스텀 도메인 연결
- GitHub에 코드 변경시 자동 재배포
