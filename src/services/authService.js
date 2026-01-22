/**
 * authService
 * - axios 기반 인증(Service) 레이어
 * - 입력값 검증 + 공통 에러 로깅 + Error(response 유지) 담당
 */

import axiosInstance from "../api/axios";
import { AUTH_ENDPOINTS } from "../api/endpoints";

/** 콘솔 로그 가독성을 위한 구분선 */
const separator =
  "======================================================================";

/** 문자열 정규화: 문자열이면 trim, 아니면 빈 문자열 */
const normalizeStr = (value) => (typeof value === "string" ? value.trim() : "");

/** 필수값 누락 공통 처리: 구분선 로그 + throw */
const logMissingAndThrow = (label, missingFields, message) => {
  if (!missingFields || missingFields.length === 0) return;
  console.error(separator);
  console.error(`${label} missing required fields: ${missingFields.join(", ")}.`);
  console.error(separator);
  throw new Error(message);
};

/** 비밀번호 확인 공통 처리 */
const assertPasswordMatch = (label, password, confirmPassword) => {
  if (password && confirmPassword && password !== confirmPassword) {
    console.error(separator);
    console.error(`${label} password confirmation mismatch.`);
    console.error(separator);
    throw new Error("Password confirmation does not match.");
  }
};

/**
 * axios 에러를 UI에서 다룰 수 있게 변환
 * - message 우선순위: error.response.data.message > error.message > 기본
 * - error.response/status 보존 (RoleLoginPage 등의 status 분기 유지)
 */
const toAuthError = (label, error) => {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "요청 처리 중 오류가 발생했습니다.";

  console.error(separator);
  console.error(`${label} Error:`, error);
  console.error(separator);

  const authError = new Error(message);
  if (error?.response) {
    authError.response = error.response;
    authError.status = status;
  }
  return authError;
};

/**
 * 공통 axios 요청 래퍼
 * - 성공: axios response 그대로 return (기존 UI가 response.data를 쓰는 방식 유지)
 * - 실패: toAuthError로 변환해 throw
 */
const request = async ({ label, method, url, data, params }) => {
  try {
    if (method === "GET") {
      return await axiosInstance.get(url, params ? { params } : undefined);
    }
    if (method === "POST") {
      return await axiosInstance.post(url, data);
    }
    // 필요하면 PUT/DELETE도 여기에 추가 가능
    throw new Error(`Unsupported method: ${method}`);
  } catch (error) {
    throw toAuthError(label, error);
  }
};

/**
 * authService 객체
 * - 로그인 / 회원가입 / 중복체크 / 세션조회(getMe) API를 중앙에서 관리
 */
export const authService = {
  // ==========================================================
  // 1. Login (POST)
  // ==========================================================
  /**
   * 로그인 처리
   * - 필수값 검증 후 AUTH_ENDPOINTS.login 호출
   * - 실패 시 response 유지 Error throw
   */
  login: async (payload = {}) => {
    const data = payload && typeof payload === "object" ? payload : {};
    const loginKey = normalizeStr(data.loginKey);
    const password = data.password;
    const accountType = normalizeStr(data.accountType);

    const missing = [];
    if (!loginKey) missing.push("loginKey");
    if (!password) missing.push("password");
    if (!accountType) missing.push("accountType");

    logMissingAndThrow("Login", missing, "Missing required login fields.");

    return request({
      label: "Auth Login",
      method: "POST",
      url: AUTH_ENDPOINTS.login,
      data: { ...data, loginKey, accountType },
    });
  },

  // ==========================================================
  // 2. User signup (POST)
  // ==========================================================
  /**
   * 일반 사용자 회원가입
   * - loginId/loginKey 통합 + 필수값/비밀번호 확인
   */
  signupUser: async (payload = {}) => {
    const data = payload && typeof payload === "object" ? payload : {};
    const loginId = normalizeStr(data.loginId);
    const loginKey = normalizeStr(data.loginKey);
    const resolvedLoginId = loginId || loginKey;

    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const nickname = normalizeStr(data.nickname);
    const mobile = normalizeStr(data.mobile);
    const name = normalizeStr(data.name);

    const missing = [];
    if (!resolvedLoginId) missing.push("loginId");
    if (!password) missing.push("password");
    if (!confirmPassword) missing.push("confirmPassword");
    if (!nickname) missing.push("nickname");
    if (!mobile) missing.push("mobile");
    if (!name) missing.push("name");
    if (data.requiredTermsAccepted !== true) missing.push("requiredTermsAccepted");

    logMissingAndThrow(
      "Signup user",
      missing,
      "Missing required signup fields."
    );

    assertPasswordMatch("Signup user", password, confirmPassword);

    // loginId/loginKey 중복 키 제거 후 최종 loginId만 내려보냄
    const { loginKey: _lk, loginId: _li, ...rest } = data;

    return request({
      label: "Auth Signup User",
      method: "POST",
      url: AUTH_ENDPOINTS.signup,
      data: {
        ...rest,
        loginId: resolvedLoginId,
        nickname,
        mobile,
        name,
      },
    });
  },

  // ==========================================================
  // 3. Owner signup (POST)
  // ==========================================================
  /**
   * 사업자 회원가입
   * - email/loginId 통합 + 사업자/매장 필수값 검증
   */
  signupOwner: async (payload = {}) => {
    const data = payload && typeof payload === "object" ? payload : {};
    const email = normalizeStr(data.email);
    const loginId = normalizeStr(data.loginId);
    const resolvedEmail = email || loginId;

    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const name = normalizeStr(data.name);
    const mobile = normalizeStr(data.mobile);
    const businessRegistrationNumber = normalizeStr(data.businessRegistrationNumber);
    const storeName = normalizeStr(data.storeName);
    const storeAddress = normalizeStr(data.storeAddress);

    const missing = [];
    if (!resolvedEmail) missing.push("email");
    if (!password) missing.push("password");
    if (!confirmPassword) missing.push("confirmPassword");
    if (!name) missing.push("name");
    if (!mobile) missing.push("mobile");
    if (!businessRegistrationNumber) missing.push("businessRegistrationNumber");
    if (!storeName) missing.push("storeName");
    if (!storeAddress) missing.push("storeAddress");

    logMissingAndThrow(
      "Signup owner",
      missing,
      "Missing required signup fields."
    );

    assertPasswordMatch("Signup owner", password, confirmPassword);

    const { loginId: _li, email: _em, ...rest } = data;

    return request({
      label: "Auth Signup Owner",
      method: "POST",
      url: AUTH_ENDPOINTS.ownerSignup,
      data: {
        ...rest,
        email: resolvedEmail,
        name,
        mobile,
        businessRegistrationNumber,
        storeName,
        storeAddress,
      },
    });
  },

  // ==========================================================
  // 4. Rider signup (POST)
  // ==========================================================
  /**
   * 라이더 회원가입
   * - vehicleType에 따라 면허/차량정보 조건부 검증
   */
  signupRider: async (payload = {}) => {
    const data = payload && typeof payload === "object" ? payload : {};
    const email = normalizeStr(data.email);
    const loginId = normalizeStr(data.loginId);
    const resolvedEmail = email || loginId;

    const password = data.password;
    const confirmPassword = data.confirmPassword;
    const name = normalizeStr(data.name);
    const mobile = normalizeStr(data.mobile);
    const vehicleType = normalizeStr(data.vehicleType);

    const needsVehicleInfo = vehicleType === "MOTORBIKE" || vehicleType === "CAR";
    const licenseNumber = normalizeStr(data.licenseNumber);
    const vehicleNumber = normalizeStr(data.vehicleNumber);

    const missing = [];
    if (!resolvedEmail) missing.push("email");
    if (!password) missing.push("password");
    if (!confirmPassword) missing.push("confirmPassword");
    if (!name) missing.push("name");
    if (!mobile) missing.push("mobile");
    if (!vehicleType) missing.push("vehicleType");
    if (needsVehicleInfo && !licenseNumber) missing.push("licenseNumber");
    if (needsVehicleInfo && !vehicleNumber) missing.push("vehicleNumber");

    logMissingAndThrow(
      "Signup rider",
      missing,
      "Missing required signup fields."
    );

    assertPasswordMatch("Signup rider", password, confirmPassword);

    const { loginId: _li, email: _em, ...rest } = data;

    return request({
      label: "Auth Signup Rider",
      method: "POST",
      url: AUTH_ENDPOINTS.riderSignup,
      data: {
        ...rest,
        email: resolvedEmail,
        name,
        mobile,
        vehicleType,
        licenseNumber: needsVehicleInfo ? licenseNumber : null,
        vehicleNumber: needsVehicleInfo ? vehicleNumber : null,
      },
    });
  },

  // ==========================================================
  // 5. Me (GET)
  // ==========================================================
  /**
   * 현재 로그인 사용자 정보 조회 (세션 확인)
   */
  getMe: async () => {
    return request({
      label: "Auth Me",
      method: "GET",
      url: AUTH_ENDPOINTS.me,
    });
  },

  // ==========================================================
  // 6. User duplicate checks (GET)
  // ==========================================================
  /**
   * 사용자 로그인 ID 중복 체크
   */
  checkLoginIdExists: async (loginId) => {
    const normalized = normalizeStr(loginId);
    logMissingAndThrow(
      "checkLoginIdExists",
      normalized ? [] : ["loginId"],
      "loginId is required."
    );

    return request({
      label: "Auth Check LoginId",
      method: "GET",
      url: AUTH_ENDPOINTS.existsLoginId,
      params: { loginId: normalized },
    });
  },

  /**
   * 사용자 휴대폰 번호 중복 체크
   */
  checkMobileExists: async (mobile) => {
    const normalized = normalizeStr(mobile);
    logMissingAndThrow(
      "checkMobileExists",
      normalized ? [] : ["mobile"],
      "mobile is required."
    );

    return request({
      label: "Auth Check Mobile",
      method: "GET",
      url: AUTH_ENDPOINTS.existsMobile,
      params: { mobile: normalized },
    });
  },

  /**
   * 사용자 닉네임 중복 체크
   */
  checkNicknameExists: async (nickname) => {
    const normalized = normalizeStr(nickname);
    logMissingAndThrow(
      "checkNicknameExists",
      normalized ? [] : ["nickname"],
      "nickname is required."
    );

    return request({
      label: "Auth Check Nickname",
      method: "GET",
      url: AUTH_ENDPOINTS.existsNickname,
      params: { nickname: normalized },
    });
  },

  // ==========================================================
  // 7. Owner duplicate checks (GET)
  // ==========================================================
  /**
   * 사업자 이메일 중복 체크
   */
  checkOwnerEmailExists: async (email) => {
    const normalized = normalizeStr(email);
    logMissingAndThrow(
      "checkOwnerEmailExists",
      normalized ? [] : ["email"],
      "email is required."
    );

    return request({
      label: "Auth Check Owner Email",
      method: "GET",
      url: AUTH_ENDPOINTS.ownerExistsEmail,
      params: { email: normalized },
    });
  },

  /**
   * 사업자 휴대폰 번호 중복 체크
   */
  checkOwnerMobileExists: async (mobile) => {
    const normalized = normalizeStr(mobile);
    logMissingAndThrow(
      "checkOwnerMobileExists",
      normalized ? [] : ["mobile"],
      "mobile is required."
    );

    return request({
      label: "Auth Check Owner Mobile",
      method: "GET",
      url: AUTH_ENDPOINTS.ownerExistsMobile,
      params: { mobile: normalized },
    });
  },

  /**
   * 사업자 등록번호 중복 체크
   */
  checkOwnerBusinessNumberExists: async (businessRegistrationNumber) => {
    const normalized = normalizeStr(businessRegistrationNumber);
    logMissingAndThrow(
      "checkOwnerBusinessNumberExists",
      normalized ? [] : ["businessRegistrationNumber"],
      "businessRegistrationNumber is required."
    );

    return request({
      label: "Auth Check Owner Business",
      method: "GET",
      url: AUTH_ENDPOINTS.ownerExistsBusinessNumber,
      params: { businessRegistrationNumber: normalized },
    });
  },

  // ==========================================================
  // 8. Rider duplicate checks (GET)
  // ==========================================================
  /**
   * 라이더 이메일 중복 체크
   */
  checkRiderEmailExists: async (email) => {
    const normalized = normalizeStr(email);
    logMissingAndThrow(
      "checkRiderEmailExists",
      normalized ? [] : ["email"],
      "email is required."
    );

    return request({
      label: "Auth Check Rider Email",
      method: "GET",
      url: AUTH_ENDPOINTS.riderExistsEmail,
      params: { email: normalized },
    });
  },
};

/**
 * 개별 함수 export
 * - import { login, signupUser } 형태로도 사용 가능
 */
export const {
  login,
  signupUser,
  signupOwner,
  signupRider,
  getMe,
  checkLoginIdExists,
  checkMobileExists,
  checkNicknameExists,
  checkOwnerEmailExists,
  checkOwnerMobileExists,
  checkOwnerBusinessNumberExists,
  checkRiderEmailExists,
} = authService;
