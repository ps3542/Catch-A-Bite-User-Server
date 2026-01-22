import axiosInstance from "./axios";
import { AUTH_ENDPOINTS } from "./endpoints";

export const login = (payload) =>
  axiosInstance.post(AUTH_ENDPOINTS.login, payload);

export const signupUser = (payload) =>
  axiosInstance.post(AUTH_ENDPOINTS.signup, payload);

export const getMe = () => axiosInstance.get(AUTH_ENDPOINTS.me);

export const checkLoginIdExists = (loginId) =>
  axiosInstance.get(AUTH_ENDPOINTS.existsLoginId, {
    params: { loginId },
  });

export const checkMobileExists = (mobile) =>
  axiosInstance.get(AUTH_ENDPOINTS.existsMobile, {
    params: { mobile },
  });

export const checkNicknameExists = (nickname) =>
  axiosInstance.get(AUTH_ENDPOINTS.existsNickname, {
    params: { nickname },
  });

export const signupOwner = (payload) =>
  axiosInstance.post(AUTH_ENDPOINTS.ownerSignup, payload);

export const checkOwnerEmailExists = (email) =>
  axiosInstance.get(AUTH_ENDPOINTS.ownerExistsEmail, {
    params: { email },
  });

export const checkOwnerMobileExists = (mobile) =>
  axiosInstance.get(AUTH_ENDPOINTS.ownerExistsMobile, {
    params: { mobile },
  });

export const checkOwnerBusinessNumberExists = (businessRegistrationNumber) =>
  axiosInstance.get(AUTH_ENDPOINTS.ownerExistsBusinessNumber, {
    params: { businessRegistrationNumber },
  });

export const signupRider = (payload) =>
  axiosInstance.post(AUTH_ENDPOINTS.riderSignup, payload);

export const checkRiderEmailExists = (email) =>
  axiosInstance.get(AUTH_ENDPOINTS.riderExistsEmail, {
    params: { email },
  });
