export const AUTH_ENDPOINTS = {
  login: "/api/v1/auth/login",
  signup: "/api/v1/auth/signup",
  me: "/api/v1/auth/me",
  existsLoginId: "/api/v1/auth/exists/login-id",
  existsMobile: "/api/v1/auth/exists/mobile",
  existsNickname: "/api/v1/auth/exists/nickname",
  ownerSignup: "/api/v1/store-owner/auth/signup",
  ownerExistsEmail: "/api/v1/store-owner/auth/exists/email",
  ownerExistsMobile: "/api/v1/store-owner/auth/exists/mobile",
  ownerExistsBusinessNumber:
    "/api/v1/store-owner/auth/exists/business-registration-number",
  riderSignup: "/api/v1/deliverer/auth/signup",
  riderExistsEmail: "/api/v1/deliverer/auth/exists/email",
};
