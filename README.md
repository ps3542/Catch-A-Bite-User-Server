# Catch-a-Bite Frontend

React + Vite 기반의 로그인/회원가입 화면입니다. `/select`, `/user/login`, `/owner/login`, `/rider/login` 라우트를 제공합니다.

## 실행 방법
1. `npm install`
2. `.env.example`을 복사해 `.env`로 생성한 뒤 `VITE_API_BASE_URL`을 설정합니다.
3. `npm install react-icons`
4. `npm install react-hook-form` 
5. `npm install swiper`
6. `npm run dev`

## 환경 변수
- `VITE_API_BASE_URL`: API 서버 주소 (`http://localhost:80`)

## API 연결
- 로그인: `POST /api/v1/auth/login`
- 로그인 payload: `loginKey`, `password`, `accountType(USER/OWNER/RIDER)`
- 회원가입: `POST /api/v1/auth/signup`
- 내 정보 조회: `GET /api/v1/auth/me`
- 아이디 중복확인: `GET /api/v1/auth/exists/login-id?loginId=...`
- 사장님 회원가입: `POST /api/v1/store-owner/auth/signup`
- 사장님 이메일 중복확인: `GET /api/v1/store-owner/auth/exists/email?email=...`
- 사장님 사업자번호 중복확인: `GET /api/v1/store-owner/auth/exists/business-registration-number?businessRegistrationNumber=...`
- 라이더 회원가입: `POST /api/v1/deliverer/auth/signup`
- 라이더 이메일 중복확인: `GET /api/v1/deliverer/auth/exists/email?email=...`

## 테스트 시나리오
1. `/user/login`에서 로그인 성공 후 `GET /api/v1/auth/me`가 200인지 확인합니다.
2. 새로고침 후에도 `GET /api/v1/auth/me`가 200이면 세션 유지 성공입니다.
3. `/select`에서 역할 선택 후 `/user/signup`, `/owner/signup`, `/rider/signup` 각각 회원가입 흐름을 확인합니다.
