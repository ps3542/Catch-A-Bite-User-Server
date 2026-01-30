import axiosInstance from "../axios";

const base = "/api/v1/owner/stores";

const pickData = (res) => res?.data?.data ?? res?.data ?? null;

export const ownerStoreService = {
  // 내 매장 목록(요약)
  list: async () => axiosInstance.get(`${base}`),

  // 매장 상세
  get: async (storeId) => axiosInstance.get(`${base}/${storeId}`),

  // 매장 등록
  create: async (payload) => axiosInstance.post(`${base}`, payload),

  // 매장 기본정보 전체 수정(운영시간 포함 가능)
  update: async (storeId, payload) => axiosInstance.put(`${base}/${storeId}`, payload),

  // 매장 기본정보 부분 수정
  patch: async (storeId, payload) => axiosInstance.patch(`${base}/${storeId}`, payload),

  // 배달조건 부분 수정
  patchDeliveryCondition: async (storeId, payload) =>
    axiosInstance.patch(`${base}/${storeId}/delivery-condition`, payload),

  // 영업 상태 변경
  changeStatus: async (storeId, payload) =>
    axiosInstance.patch(`${base}/${storeId}/status`, payload),

  // 피그마: 사업자 정보
getBusinessInfo: async (storeId) => axiosInstance.get(`${base}/${storeId}/business-info`),
patchBusinessInfo: async (storeId, payload) =>
  axiosInstance.patch(`${base}/${storeId}/business-info`, payload),

// 피그마: 원산지 표기
getOriginLabel: async (storeId) => axiosInstance.get(`${base}/${storeId}/origin-label`),
patchOriginLabel: async (storeId, payload) =>
  axiosInstance.patch(`${base}/${storeId}/origin-label`, payload),

  // 응답 파싱 유틸(페이지에서 쓰고 싶으면)
  _pickData: pickData,
};
