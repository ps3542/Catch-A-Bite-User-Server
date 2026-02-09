# Catch-a-Bite (Client)

**공정과 상생을 위한 실시간 음식 주문 및 배달 통합 플랫폼 (Web/App Client)**

## 프로젝트 소개

**Catch-a-Bite Client**는 배달 시장의 불공정한 수수료 문제를 해결하기 위해 기획된 **Catch-a-Bite** 플랫폼의 프론트엔드 프로젝트입니다.
React와 Vite를 기반으로 구축되었으며, 단일 웹 애플리케이션(SPA) 내에서 **고객(User), 가맹점주(Store Owner), 라이더(Deliverer)** 세 가지 사용자 유형에 맞춘 독립적인 인터페이스와 기능을 제공합니다.

- **Backend Repository:** [Catch-A-Bite](https://github.com/Junghokim1031/catch-a-bite)

## **프로젝트 개요**

- **프로젝트명:** Catch-A-Bite
- **개발 기간:** 2025.12.17 ~ 2026.02.02
- **서비스 대상:** 일반 사용자(고객), 가맹점주, 배달 라이더

## 기술 스택

| 구분 | 기술 | 버전 | 설명 |
| --- | --- | --- | --- |
| **Framework** | **React** | v18.2.0 | 사용자 인터페이스 구축 |
| **Build Tool** | **Vite** | v5.0.12 | 초고속 개발 서버 및 번들링 |
| **Routing** | **React Router DOM** | v6.22.3 | SPA 라우팅 및 중첩 라우트 관리 |
| **HTTP Client** | **Axios** | v1.6.7 | REST API 통신 및 인터셉터 설정 |
| **UI Library** | **Swiper** | v12.0.3 | 매장 및 메뉴 이미지 캐러셀 구현 |
| **Icons** | **React Icons** | v5.5.0 | 벡터 아이콘 통합 관리 |

## 프로젝트 구조

```
src/
├── api/             # Axios 인스턴스 및 도메인별 API 호출 함수 (user, owner, auth 등)
├── assets/          # 로고, 아이콘 등 정적 이미지 파일
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── appuser/     # 고객용 컴포넌트 (MenuCard, StoreCard 등)
│   ├── common/      # 공통 컴포넌트 (Modal, Input, Button 등)
│   └── owner/       # 점주용 컴포넌트 (DashboardChart, Maps 등)
├── constants/       # 전역 상수 (User Role, 배달 상태, 결제 상태 매핑)
├── hooks/           # 커스텀 훅 (useRoleGuard - 권한 체크 등)
├── layout/          # 페이지 레이아웃 (Sidebar, Header, Footer)
├── pages/           # 라우트별 페이지 컴포넌트
│   ├── owner/       # 가맹점주: 대시보드, 메뉴 관리, 주문 접수, 정산 페이지
│   ├── rider/       # 라이더: 배달 콜 대기, 배차 수락, 배달 완료 페이지
│   └── user/        # 고객: 맛집 탐색, 장바구니, 주문/결제, 마이페이지
├── routes/          # 라우터 설정 (AppRouter, ProtectedRoute - 권한별 접근 제어)
├── styles/          # 전역 스타일 및 CSS Modules (Global, Reset)
└── utils/           # 유틸리티 함수 (날짜 포맷팅, 숫자 콤마, 유효성 검사)
```

## 주요 기능

### 1. 고객 (App User)

- **맛집 탐색:** 카테고리별 매장 리스트 조회 및 키워드 검색 (Swiper 라이브러리를 활용한 배너 및 이미지 슬라이드)
- **주문 시스템:** 장바구니 담기, 메뉴 상세 옵션 선택, 포트원(PortOne) API 연동을 통한 결제 처리
- **마이페이지:** 과거 주문 내역 조회, 리뷰 작성 및 수정, 배송지 주소 관리

### 2. 가맹점주 (Store Owner)

- **매장 관리:** 영업 상태(Open/Close) 실시간 제어 및 가게 정보 수정
- **메뉴 관리:** 메뉴 카테고리, 메뉴 아이템, 옵션 그룹 등록/수정/삭제 및 품절 처리
- **주문 접수:** 들어온 주문의 상세 내역 확인, 주문 수락/거절 및 조리 예상 시간 설정
- **매출 정산:** 일별 매출 내역 조회 및 정산 현황 모니터링

### 3. 라이더 (Deliverer)

- **배차 시스템:** 대기 중인 배달 요청 목록(콜) 실시간 조회 및 수락
- **배달 수행:** 픽업 완료, 배달 완료 등 단계별 배달 상태 업데이트
- **수익 관리:** 배달 완료 건에 대한 운임 및 정산 내역 확인

## 팀원 (Team)

- **[김정호](https://junghokim1031.github.io/portfolio/):** PM, 서기, GitHub, 및 사용자 관련 프론트엔드
- **[박성철](https://ps3542.github.io/portfolio/):** PL 및 가맹주점 관련 프론트엔드
- **[이주희](https://juhee121.github.io/portfolio/):** 사용자 메인페이지, 검색 및 마이페이지
- **[이주호](https://jhlee002.github.io/portfolio/):** Rider 관련 프론트엔드
- **[김진덕](https://cave8026.github.io/portfolio/):** 인증(Auth), 회원가입, 및 로그인

## 설치 및 실행 방법

이 프로젝트를 로컬 환경에서 실행하기 위해서는 Node.js (v18 이상 권장)가 설치되어 있어야 합니다.

### 1. 레포지토리 클론

`git clone https://github.com/junghokim1031/catch-a-bite-user-server`
`cd catch-a-bite-user-server`

### 2. 패키지 설치

`npm install swiper`

`npm install react-icons`

### 3. 환경 변수 설정

프로젝트 루트 경로에 .env 파일을 생성하고, 카카오 API를 포함합니다.

`VITE_KAKAO_MAP_API_KEY= ...`

### 4. 개발 서버 실행

`npm run dev`

실행 후 터미널에 표시되는 로컬 주소(http://localhost:5173)로 접속합니다.
