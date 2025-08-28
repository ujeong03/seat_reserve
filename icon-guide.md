# 반응형 연구실 자리 예약 시스템 - 아이콘 생성 가이드

## PWA 아이콘 생성하기

실제 운영을 위해서는 다음 크기의 아이콘들이 필요합니다:

### 필요한 아이콘 파일들
```
icon-192x192.png    # 안드로이드 홈 화면
icon-512x512.png    # 안드로이드 앱 서랍
favicon-32x32.png   # 브라우저 탭
favicon-16x16.png   # 브라우저 탭 (작은 크기)
```

### 아이콘 디자인 가이드라인

#### 디자인 요소
- 배경색: #667eea (시스템 메인 컬러)
- 아이콘: 의자 또는 책상 모양
- 텍스트: "자리" 또는 "S" (SCLab의 S)
- 스타일: 미니멀, 깔끔한 디자인

#### 온라인 아이콘 생성 도구
1. **Favicon.io** (https://favicon.io/)
   - 텍스트에서 파비콘 생성
   - 배경색: #667eea
   - 텍스트: "S" 또는 "자"
   - 폰트: Bold

2. **RealFaviconGenerator** (https://realfavicongenerator.net/)
   - 다양한 플랫폼용 아이콘 일괄 생성
   - PWA 매니페스트 자동 생성

3. **Canva** (https://www.canva.com/)
   - 192x192, 512x512 크기로 디자인
   - 의자 아이콘 + 텍스트 조합

### 임시 아이콘 (개발용)

개발 중에는 브라우저 콘솔에서 다음 코드로 임시 아이콘 생성 가능:

```javascript
// 임시 파비콘 생성 (개발용)
function generateTempFavicon() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // 배경
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, 32, 32);
    
    // 텍스트
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('S', 16, 22);
    
    // 파비콘 적용
    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    document.getElementsByTagName('head')[0].appendChild(link);
}

generateTempFavicon();
```

### 아이콘 파일 위치
생성된 아이콘 파일들은 프로젝트 루트 폴더에 저장:
```
sclab_seatmap/
├── icon-192x192.png
├── icon-512x512.png
├── favicon-32x32.png
└── favicon-16x16.png
```

### 테스트 방법
1. PWA 설치: 브라우저에서 "홈 화면에 추가"
2. 파비콘 확인: 브라우저 탭에서 아이콘 표시 확인
3. 다양한 기기에서 테스트
