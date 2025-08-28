# Railway 직접 배포 가이드 (GitHub 없이)

## 방법 1: Railway CLI로 직접 배포

### 1. Railway CLI 설치
```bash
npm install -g @railway/cli
```

### 2. Railway 로그인
```bash
railway login
```

### 3. 프로젝트 생성 및 배포
```bash
# 새 프로젝트 생성
railway new

# 또는 기존 프로젝트에 연결
railway link

# 직접 배포 (GitHub 없이)
railway up
```

### 4. 환경 변수 설정
```bash
# Railway 대시보드에서 또는 CLI로
railway variables set NODE_ENV=production
railway variables set PORT=3000
```

## 방법 2: Railway 대시보드에서 파일 업로드

1. Railway.app 웹사이트 접속
2. "New Project" → "Deploy from local files"
3. 프로젝트 폴더를 압축해서 업로드
4. 자동 배포 실행

## 방법 3: Private Git Repository

### GitHub Private Repository 사용
1. GitHub에서 Private Repository 생성
2. 코드 업로드 (외부에서 접근 불가)
3. Railway에서 Private Repository 연결

### GitLab/Bitbucket Private Repository
- GitHub 대신 GitLab이나 Bitbucket 사용
- Private Repository로 생성
- Railway에서 연결

## 보안 강화 팁

### 1. 환경 변수 사용
```env
# .env 파일 (절대 GitHub에 올리지 않음)
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
DATABASE_URL=sqlite:./data/students.db
```

### 2. 데이터베이스 분리
- 로컬: SQLite 파일
- 프로덕션: Railway PostgreSQL 사용

### 3. 보안 설정
```javascript
// 프로덕션 환경에서만 특정 도메인 허용
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://your-railway-domain.railway.app'] 
  : ['http://localhost:3000'];
```

## 추천 방법

**Railway CLI 직접 배포**가 가장 안전합니다:
- GitHub 없이 직접 배포
- 소스코드가 외부에 노출되지 않음
- Railway에서만 관리
- 지속적 배포 가능
