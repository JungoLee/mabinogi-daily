# 마비노기 일일 숙제 체크리스트 - 설정 가이드

> 마비노기 일일/주간 숙제를 체크하는 웹앱 배포 가이드입니다.

---

## 목차

1. [MongoDB Atlas 설정](#1-mongodb-atlas-설정)
2. [Google OAuth 설정](#2-google-oauth-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [GitHub에 코드 올리기](#4-github에-코드-올리기)
5. [Render 배포](#5-render-배포)
6. [문제 해결](#6-문제-해결)

---

## 1. MongoDB Atlas 설정

### 1-1. 회원가입 및 클러스터 생성

1. **https://www.mongodb.com/cloud/atlas/register** 접속 및 회원가입
2. 로그인 후 첫 설정:
   - 설문조사가 나오면 아무거나 선택하고 "Finish" 클릭

3. **클러스터 생성**
   ```
   1. "+ Create" 버튼 클릭
   2. "M0 FREE" 선택 (무료)
   3. 지역 선택:
      - Tokyo (ap-northeast-1) - 추천!
      - Singapore (ap-southeast-1)
      - 자동 선택되면 그냥 진행
   4. Cluster Name: "Cluster0" (기본값)
   5. "Create Deployment" 클릭
   ```

### 1-2. 데이터베이스 사용자 생성

1. **Security Quickstart 팝업이 나타나면:**
   ```
   Username: mabinogi_admin
   Password: (강력한 비밀번호 입력)

   📝 메모장에 저장하세요!
      mabinogi_admin / 여기에비밀번호

   "Create Database User" 클릭
   ```

2. **팝업을 닫았다면 수동으로 생성:**
   ```
   왼쪽 메뉴: Security → Database Access
   → "+ ADD NEW DATABASE USER" 클릭

   Authentication Method: Password
   Username: mabinogi_admin
   Password: (강력한 비밀번호)

   Database User Privileges:
   ☑ Atlas admin (또는 Read and write to any database)

   "Add User" 클릭
   ```

### 1-3. IP 주소 허용 설정

1. **왼쪽 메뉴: Security → Network Access**
2. **"+ ADD IP ADDRESS" 클릭**
3. **모든 곳에서 접속 허용 (간편):**
   ```
   "ALLOW ACCESS FROM ANYWHERE" 버튼 클릭

   Access List Entry: 0.0.0.0/0 (자동 입력됨)
   Comment: Allow from anywhere

   "Confirm" 클릭
   ```

4. **⏱️ 5분 대기** - Status가 "Active"로 변경될 때까지

### 1-4. Connection String 가져오기

1. **왼쪽 메뉴: Database 클릭**
2. **Cluster0 카드에서 "Connect" 버튼 클릭**
3. **"Drivers" 선택**
   ```
   Driver: Node.js
   Version: 6.7 or later
   ```
4. **Connection String 복사**
   ```
   복사된 문자열:
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

   ↓ 수정 (1-2에서 만든 사용자 정보로)

   mongodb+srv://mabinogi_admin:여기에비밀번호@cluster0.xxxxx.mongodb.net/mabinogi-daily?retryWrites=true&w=majority

   변경 사항:
   - <username> → mabinogi_admin
   - <password> → 여기에비밀번호
   - /? 사이에 /mabinogi-daily 추가 (데이터베이스 이름)
   ```

⚠️ **비밀번호에 특수문자가 있다면 URL 인코딩 필요:**
```
@ → %40
: → %3A
/ → %2F
? → %3F
```

📝 **이 Connection String을 메모장에 저장하세요!** (3단계에서 사용)

---

## 2. Google OAuth 설정

### 2-1. Google Cloud Console 설정

1. **https://console.cloud.google.com/** 접속
2. **프로젝트 생성**
   ```
   상단 프로젝트 선택 → "새 프로젝트"
   프로젝트 이름: mabinogi-daily
   "만들기" 클릭
   ```

3. **OAuth 동의 화면 설정**
   ```
   왼쪽 메뉴: API 및 서비스 → OAuth 동의 화면

   User Type: 외부 선택
   "만들기" 클릭

   앱 이름: 마비노기 숙제 체크리스트
   사용자 지원 이메일: (본인 이메일)
   개발자 연락처 정보: (본인 이메일)

   "저장 후 계속" 클릭

   범위: "저장 후 계속" (기본값 그대로)
   테스트 사용자: (선택사항) "저장 후 계속"
   ```

4. **OAuth 클라이언트 ID 생성**
   ```
   왼쪽 메뉴: API 및 서비스 → 사용자 인증 정보

   "+ 사용자 인증 정보 만들기" → "OAuth 클라이언트 ID"

   애플리케이션 유형: 웹 애플리케이션
   이름: mabinogi-daily-client

   승인된 리디렉션 URI:
   - http://localhost:5000/auth/google/callback (로컬 테스트용)
   - (나중에 Render URL 추가 예정)

   "만들기" 클릭
   ```

5. **클라이언트 ID와 비밀번호 복사**
   ```
   팝업이 나타나면:

   클라이언트 ID: 123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
   클라이언트 보안 비밀: GOCSPX-xxxxxxxxxxxxxx

   📝 메모장에 저장하세요! (3단계에서 사용)
   ```

---

## 3. 환경 변수 설정

### 3-1. Backend 환경 변수

1. **`backend/.env` 파일 열기** (이미 존재함)
2. **아래 내용으로 수정:**

```env
# MongoDB (1-4에서 복사한 Connection String)
MONGODB_URI=mongodb+srv://mabinogi_admin:여기에비밀번호@cluster0.xxxxx.mongodb.net/mabinogi-daily?retryWrites=true&w=majority

# Google OAuth (2-1에서 복사한 정보)
GOOGLE_CLIENT_ID=123456789-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Session (랜덤 문자열 생성)
SESSION_SECRET=랜덤문자열아무거나길게입력하세요123456789

# JWT (랜덤 문자열 생성)
JWT_SECRET=또다른랜덤문자열아무거나길게입력하세요987654321

# Environment
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

⚠️ **중요:**
- `MONGODB_URI`는 1-4에서 만든 Connection String
- `GOOGLE_CLIENT_ID`와 `GOOGLE_CLIENT_SECRET`는 2-1에서 복사한 값
- `SESSION_SECRET`과 `JWT_SECRET`은 랜덤 문자열 (30자 이상 권장)

### 3-2. Frontend 환경 변수

**`frontend/.env` 파일 확인** (이미 설정되어 있음)
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

---

## 4. GitHub에 코드 올리기

### 4-1. GitHub 저장소 만들기

1. **https://github.com** 접속 및 로그인
2. **오른쪽 상단 "+" → "New repository"**
   ```
   Repository name: mabinogi-daily
   Description: 마비노기 일일 숙제 체크리스트

   ● Public (무료 배포하려면 Public!)

   ☐ Add a README file (체크 안 함!)

   "Create repository" 클릭
   ```

3. **저장소 URL 복사**
   ```
   https://github.com/사용자명/mabinogi-daily.git

   📝 메모장에 저장!
   ```

### 4-2. Git 설정 (처음 한 번만)

```bash
# Git 사용자 정보 설정
git config --global user.name "내이름"
git config --global user.email "내이메일@example.com"
```

### 4-3. 코드 업로드

프로젝트 폴더 (`C:\workspace\mabinogi-daily`)에서:

```bash
# 1. 현재 상태 확인
git status

# 2. 변경사항 추가
git add .

# 3. 커밋
git commit -m "Initial commit: 마비노기 숙제 체크리스트"

# 4. GitHub 저장소 연결 (4-1에서 복사한 URL 사용)
git remote add origin https://github.com/사용자명/mabinogi-daily.git

# 5. 푸시
git push -u origin main
```

⚠️ **만약 main이 아니라 master라면:**
```bash
git branch -M main
git push -u origin main
```

🔐 **GitHub 로그인 요청이 나오면:**
- Personal Access Token 필요 (비밀번호 안됨!)
- [토큰 생성 방법 보기](https://docs.github.com/ko/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

---

## 5. Render 배포

### 5-1. Render 계정 만들기

1. **https://render.com** 접속
2. **"Get Started for Free" 클릭**
3. **GitHub로 로그인** (추천)
   - GitHub 계정 연결 승인

### 5-2. Backend 배포

1. **"New +" → "Web Service" 클릭**
2. **GitHub 저장소 연결**
   ```
   저장소 검색: mabinogi-daily
   "Connect" 클릭
   ```

3. **서비스 설정**
   ```
   Name: mabinogi-daily-backend
   Region: Oregon (US West) 또는 Singapore
   Branch: main

   ⭐ Root Directory: backend

   Runtime: Node
   Build Command: npm install && npm run build
   Start Command: npm start

   Instance Type: Free
   ```

4. **환경 변수 추가**
   ```
   "Add Environment Variable" 클릭

   MONGODB_URI = (1-4에서 만든 Connection String)
   GOOGLE_CLIENT_ID = (2-1에서 복사한 값)
   GOOGLE_CLIENT_SECRET = (2-1에서 복사한 값)
   GOOGLE_CALLBACK_URL = https://mabinogi-daily-backend.onrender.com/auth/google/callback
   SESSION_SECRET = (3-1에서 사용한 값)
   JWT_SECRET = (3-1에서 사용한 값)
   NODE_ENV = production
   PORT = 5000
   CLIENT_URL = (나중에 Frontend URL 입력 예정)
   ```

5. **"Create Web Service" 클릭**
6. **배포 완료 대기** (5-10분 소요)
   ```
   상태가 "Live"로 변경되면 성공!

   Backend URL:
   https://mabinogi-daily-backend.onrender.com

   📝 이 URL을 복사하세요! (5-3에서 사용)
   ```

### 5-3. Frontend 배포

1. **"New +" → "Static Site" 클릭**
2. **같은 GitHub 저장소 연결**

3. **서비스 설정**
   ```
   Name: mabinogi-daily-frontend
   Branch: main

   ⭐ Root Directory: frontend

   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **환경 변수 추가**
   ```
   "Add Environment Variable" 클릭

   VITE_API_URL = https://mabinogi-daily-backend.onrender.com
   VITE_SOCKET_URL = https://mabinogi-daily-backend.onrender.com
   ```

5. **"Create Static Site" 클릭**
6. **배포 완료 대기**
   ```
   Frontend URL:
   https://mabinogi-daily-frontend.onrender.com

   📝 이 URL을 복사하세요!
   ```

### 5-4. Backend 환경 변수 업데이트

1. **Backend 서비스로 돌아가기**
2. **Environment → "Edit" 클릭**
3. **CLIENT_URL 수정**
   ```
   CLIENT_URL = https://mabinogi-daily-frontend.onrender.com
   ```
4. **"Save Changes" 클릭** (자동으로 재배포됨)

### 5-5. Google OAuth 리디렉션 URI 추가

1. **Google Cloud Console로 돌아가기**
2. **API 및 서비스 → 사용자 인증 정보**
3. **만든 OAuth 클라이언트 ID 클릭**
4. **승인된 리디렉션 URI 추가**
   ```
   추가할 URI:
   https://mabinogi-daily-backend.onrender.com/auth/google/callback

   "저장" 클릭
   ```

---

## 6. 문제 해결

### MongoDB 연결 안 됨 (MongoNetworkError)

**원인:** Network Access에 IP가 없음

**해결:**
1. MongoDB Atlas → Network Access
2. 0.0.0.0/0 추가 확인
3. Status가 "Active"인지 확인 (5분 대기)
4. Render에서 "Manual Deploy" → "Deploy latest commit"

### Render 배포 실패 ("Application failed to respond")

**원인:** Root Directory 또는 명령어 설정 오류

**해결:**
1. Render → Settings 확인:
   - **Root Directory: backend** (정확히 입력!)
   - Build Command: npm install && npm run build
   - Start Command: npm start

2. `backend/package.json` 확인:
   ```json
   {
     "scripts": {
       "start": "node dist/index.js"
     }
   }
   ```

### Google 로그인 안 됨 (redirect_uri_mismatch)

**원인:** Google Cloud Console에 리디렉션 URI가 없음

**해결:**
1. Google Cloud Console → OAuth 클라이언트 ID
2. 승인된 리디렉션 URI에 Render URL 추가 확인:
   ```
   https://mabinogi-daily-backend.onrender.com/auth/google/callback
   ```

### Free 티어 Sleep 문제

**특징:**
- 15분 동안 요청이 없으면 자동으로 Sleep
- 다음 방문자가 오면 자동으로 깨어남 (30초~1분 소요)

**해결:**
- 무료라서 어쩔 수 없음
- 유료 플랜 ($7/month)으로 업그레이드하면 Sleep 없음

---

## ✅ 최종 체크리스트

### MongoDB Atlas
- [ ] 회원가입 완료
- [ ] 클러스터 생성 완료 (M0 FREE)
- [ ] 데이터베이스 사용자 생성 (username/password 저장!)
- [ ] Network Access에 0.0.0.0/0 추가 완료
- [ ] Status가 "Active"로 변경됨
- [ ] Connection String 복사 및 수정 완료

### Google OAuth
- [ ] Google Cloud Console 프로젝트 생성
- [ ] OAuth 동의 화면 설정 완료
- [ ] OAuth 클라이언트 ID 생성
- [ ] 클라이언트 ID와 비밀번호 저장
- [ ] 리디렉션 URI 설정 완료 (로컬 + Render)

### 환경 변수
- [ ] `backend/.env` 파일 설정 완료
- [ ] `frontend/.env` 파일 확인
- [ ] MongoDB URI 설정
- [ ] Google OAuth 정보 설정
- [ ] SESSION_SECRET, JWT_SECRET 설정

### GitHub
- [ ] 저장소 생성 완료 (Public)
- [ ] 코드 푸시 완료
- [ ] `.gitignore` 확인 (.env가 Git에 없는지!)

### Render
- [ ] 회원가입 완료 (GitHub 연결)
- [ ] Backend Web Service 생성
  - [ ] Root Directory: backend
  - [ ] Build/Start 명령어 설정
  - [ ] 환경 변수 설정
  - [ ] 상태: Live
- [ ] Frontend Static Site 생성
  - [ ] Root Directory: frontend
  - [ ] 환경 변수 설정 (VITE_API_URL, VITE_SOCKET_URL)
  - [ ] 상태: Live
- [ ] Backend CLIENT_URL 업데이트
- [ ] Frontend URL 접속 확인

---

## 🎉 완료!

모든 설정이 완료되었습니다!

**Frontend URL로 접속하여 테스트:**
- Google 로그인 동작 확인
- 체크리스트 생성/수정/삭제 테스트
- 실시간 업데이트 테스트 (여러 브라우저에서)

**다음 단계:**
- 마비노기 일일/주간 숙제 항목 추가
- UI 커스터마이징
- 추가 기능 개발

---

**작성일:** 2025년 11월 21일
**프로젝트:** 마비노기 일일 숙제 체크리스트
**기술 스택:** React + TypeScript + MongoDB + Socket.IO
