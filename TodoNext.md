# 마비노기 일일 숙제 체크리스트 - 배포 진행 상황

**작성일:** 2025년 11월 21일  
**프로젝트:** Mabinogi Daily Checklist  
**GitHub:** https://github.com/JungoLee/mabinogi-daily

---

## ✅ 완료된 작업

### 1. MongoDB Atlas 설정 완료
- [x] 클러스터 생성 완료
- [x] 데이터베이스 사용자 생성
  - Username: `tough123181_db_user`
  - Password: `JEnRidDUIhGm0RHd`
- [x] Connection String 설정 완료
  ```
  mongodb+srv://tough123181_db_user:JEnRidDUIhGm0RHd@cluster0.jqfg0go.mongodb.net/mabinogi-daily?retryWrites=true&w=majority&appName=Cluster0
  ```

### 2. 로컬 환경 설정 완료
- [x] `backend/.env` 파일 생성
- [x] `frontend/.env` 파일 생성
- [x] MongoDB URI 설정
- [x] Session Secret, JWT Secret 생성

### 3. GitHub 저장소 설정 완료
- [x] 초기 커밋 완료 (60832c0)
- [x] TypeScript 빌드 에러 수정 (e67129c)
- [x] CORS 설정 수정 (7885945)
- [x] 저장소: https://github.com/JungoLee/mabinogi-daily

### 4. Render Backend 배포 진행 중
- [x] Render 계정 생성
- [x] Backend Web Service 생성
- [x] GitHub 저장소 연결
- [x] 빌드 명령어 설정
  - Root Directory: `backend`
  - Build Command: `npm ci && npm run build`
  - Start Command: `npm start`
- [x] 환경 변수 설정 완료
- [x] TypeScript 빌드 성공 확인
- [x] CORS 에러 수정 완료
- [ ] **배포 완료 확인 대기 중** (마지막 재배포 확인 필요)

---

## 🚀 다음에 할 작업

### 1단계: Render Backend 배포 완료 확인

**Render Dashboard에서 확인:**
1. https://render.com → mabinogi-daily-backend 서비스 선택
2. **"Logs" 탭**에서 다음 메시지 확인:
   ```
   ==> Build succeeded 🎉
   ==> Running 'npm start'
   Server running on port 5000
   MongoDB connected successfully
   ==> Your service is live 🎉
   ```

3. **Backend URL 확인:**
   - 서비스 상단에 URL 표시됨
   - 예: `https://mabinogi-daily-backend.onrender.com`

4. **Health Check 테스트:**
   ```
   브라우저에서 접속: https://your-backend-url.onrender.com/health
   
   응답 예상:
   {
     "status": "ok",
     "timestamp": "2025-11-21T..."
   }
   ```

5. **Backend URL 복사 (중요!)** → 다음 단계에서 사용

---

### 2단계: MongoDB Network Access 확인

**MongoDB Atlas에서 확인:**
1. https://cloud.mongodb.com 로그인
2. **Security → Network Access**
3. **확인사항:**
   - [ ] `0.0.0.0/0` (Allow access from anywhere) 존재 확인
   - [ ] Status: **Active** 확인
   
4. **없다면 추가:**
   - "+ ADD IP ADDRESS" 클릭
   - "ALLOW ACCESS FROM ANYWHERE" 선택
   - 5분 대기 (Active로 변경될 때까지)

---

### 3단계: Render Frontend 배포

#### 3-1. Frontend Static Site 생성

**Render Dashboard:**
1. **"New +" → "Static Site" 클릭**
2. **GitHub 저장소 연결**
   - 저장소: `JungoLee/mabinogi-daily`
   - "Connect" 클릭

#### 3-2. 서비스 설정

```
Name: mabinogi-daily-frontend
Branch: main
Root Directory: frontend

Build Command: npm ci && npm run build
Publish Directory: dist

Instance Type: Free
```

#### 3-3. 환경 변수 추가

"Environment Variables" 섹션:

```
VITE_API_URL
[Backend URL 입력 - 1단계에서 복사한 URL]
예: https://mabinogi-daily-backend.onrender.com
```

```
VITE_SOCKET_URL
[Backend URL 입력 - 동일한 URL]
예: https://mabinogi-daily-backend.onrender.com
```

#### 3-4. 배포 시작

1. **"Create Static Site" 클릭**
2. **배포 완료 대기** (5-10분)
3. **Frontend URL 복사**
   - 예: `https://mabinogi-daily-frontend.onrender.com`

---

### 4단계: Backend 환경 변수 업데이트

**Render Dashboard → mabinogi-daily-backend:**
1. **"Environment" 탭 클릭**
2. **CLIENT_URL 수정:**
   ```
   CLIENT_URL
   [Frontend URL 입력 - 3단계에서 복사한 URL]
   예: https://mabinogi-daily-frontend.onrender.com
   ```
3. **"Save Changes" 클릭**
4. **자동 재배포 시작 (1-2분 대기)**

---

### 5단계: Google OAuth 설정

#### 5-1. Google Cloud Console 설정

1. **https://console.cloud.google.com 접속**
2. **프로젝트 생성**
   ```
   프로젝트 이름: mabinogi-daily
   "만들기" 클릭
   ```

3. **OAuth 동의 화면 설정**
   ```
   왼쪽 메뉴: API 및 서비스 → OAuth 동의 화면
   
   User Type: 외부 선택
   
   앱 이름: 마비노기 숙제 체크리스트
   사용자 지원 이메일: (본인 이메일)
   개발자 연락처 정보: (본인 이메일)
   
   "저장 후 계속" 클릭
   ```

4. **OAuth 클라이언트 ID 생성**
   ```
   왼쪽 메뉴: API 및 서비스 → 사용자 인증 정보
   
   "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"
   
   애플리케이션 유형: 웹 애플리케이션
   이름: mabinogi-daily-client
   
   승인된 리디렉션 URI (중요!):
   - http://localhost:5000/auth/google/callback (로컬 테스트용)
   - https://[Backend URL]/auth/google/callback (Render용)
   
   예: https://mabinogi-daily-backend.onrender.com/auth/google/callback
   
   "만들기" 클릭
   ```

5. **클라이언트 ID와 비밀번호 복사**
   ```
   클라이언트 ID: 123456789-xxxxxxxx.apps.googleusercontent.com
   클라이언트 보안 비밀: GOCSPX-xxxxxxxxxxxxxx
   
   📝 메모장에 저장!
   ```

#### 5-2. Render Backend 환경 변수 업데이트

**Render Dashboard → mabinogi-daily-backend → Environment:**

```
GOOGLE_CLIENT_ID
[Google에서 복사한 클라이언트 ID]
```

```
GOOGLE_CLIENT_SECRET
[Google에서 복사한 클라이언트 보안 비밀]
```

```
GOOGLE_CALLBACK_URL
https://[Backend URL]/auth/google/callback
예: https://mabinogi-daily-backend.onrender.com/auth/google/callback
```

**"Save Changes" 클릭** → 자동 재배포

---

### 6단계: 로컬 환경 업데이트 (선택)

로컬에서도 테스트하려면:

**`backend/.env` 파일 수정:**
```env
GOOGLE_CLIENT_ID=[Google에서 받은 클라이언트 ID]
GOOGLE_CLIENT_SECRET=[Google에서 받은 클라이언트 보안 비밀]
```

**로컬 실행:**
```bash
# 터미널 1 - Backend
cd backend
npm install
npm run dev

# 터미널 2 - Frontend
cd frontend
npm install
npm run dev
```

브라우저: http://localhost:5173

---

### 7단계: 최종 테스트

#### Production 테스트 (Render)
1. **Frontend URL 접속**
   - `https://mabinogi-daily-frontend.onrender.com`

2. **Google 로그인 테스트**
   - "Sign in with Google" 클릭
   - Google 계정으로 로그인
   - 정상적으로 로그인되는지 확인

3. **체크리스트 기능 테스트**
   - 체크리스트 생성
   - 항목 추가/수정/삭제
   - 항목 체크/언체크
   - 다른 브라우저나 시크릿 모드에서 실시간 업데이트 확인

#### Local 테스트 (선택)
1. http://localhost:5173 접속
2. 동일한 기능 테스트

---

## 📋 환경 변수 요약

### Backend (Render)
```
MONGODB_URI=mongodb+srv://tough123181_db_user:JEnRidDUIhGm0RHd@cluster0.jqfg0go.mongodb.net/mabinogi-daily?retryWrites=true&w=majority&appName=Cluster0
GOOGLE_CLIENT_ID=[Google에서 받을 예정]
GOOGLE_CLIENT_SECRET=[Google에서 받을 예정]
GOOGLE_CALLBACK_URL=https://mabinogi-daily-backend.onrender.com/auth/google/callback
SESSION_SECRET=mabinogi-daily-session-secret-key-a8f3d9c2b5e1f7a4d6c8b9e2f1a3d5c7
JWT_SECRET=mabinogi-daily-jwt-secret-key-b9d4e6f8a2c5d7e9f1a3b5c7d9e1f3a5
NODE_ENV=production
PORT=5000
CLIENT_URL=[Frontend URL - 3단계 후 입력]
```

### Frontend (Render)
```
VITE_API_URL=[Backend URL - 1단계 후 입력]
VITE_SOCKET_URL=[Backend URL - 동일]
```

---

## ⚠️ 주의사항

### Render Free Tier 제한
- **15분 비활동 시 Sleep 모드**
  - 다음 방문자가 오면 자동으로 깨어남 (30초~1분 소요)
  - 첫 로딩이 느릴 수 있음
- **월 750시간 무료** (매달 리셋)
- **데이터베이스는 MongoDB Atlas 사용** (별도 무료 플랜)

### MongoDB Atlas Free Tier
- **512MB 저장공간**
- **무제한 연결** (하지만 동시 연결 제한 있음)
- **자동 백업 없음** (유료 플랜 필요)

### Google OAuth
- **외부 사용자 모드** (100명까지 무료)
- **인증 화면에 "확인되지 않은 앱" 경고 표시됨**
- **본인과 지정한 테스트 사용자만 로그인 가능**

---

## 🐛 문제 해결

### Backend 배포 실패
- **Build 실패:** Logs 탭에서 에러 확인
- **Start 실패:** 환경 변수 누락 확인
- **MongoDB 연결 안됨:** Network Access 확인 (0.0.0.0/0)

### Frontend 배포 실패
- **Build 실패:** `VITE_API_URL`, `VITE_SOCKET_URL` 확인
- **빈 화면:** 브라우저 콘솔에서 에러 확인

### Google 로그인 안됨
- **redirect_uri_mismatch:** Google Cloud Console에서 리디렉션 URI 확인
- **400 Error:** `GOOGLE_CALLBACK_URL` 환경 변수 확인
- **500 Error:** `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` 확인

### CORS 에러
- **Access-Control-Allow-Origin:** Backend의 `CLIENT_URL` 확인
- Frontend URL과 정확히 일치해야 함 (끝에 `/` 없이)

---

## 📚 참고 문서

- **프로젝트 README:** `README.md`
- **상세 설정 가이드:** `SETUP_GUIDE.md`
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Google Cloud Console:** https://console.cloud.google.com
- **Render Dashboard:** https://render.com/dashboard
- **GitHub 저장소:** https://github.com/JungoLee/mabinogi-daily

---

## 🎯 현재 상태

**마지막 업데이트:** Backend CORS 수정 완료 (커밋 7885945)

**다음 작업:** 
1. Backend 배포 완료 확인
2. Frontend 배포
3. Google OAuth 설정

**예상 소요 시간:** 30분~1시간

---

**수고하셨습니다! 다음에 이 파일을 열어서 이어서 진행하세요! 🚀**
