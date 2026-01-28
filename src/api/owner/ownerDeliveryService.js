import axiosInstance from "../axios";

const base = "/api/v1/owner/deliveries";

// deliveries are scoped by authenticated owner (store_owner_id)
export const ownerDeliveryService = {
  list: async () => axiosInstance.get(`${base}`),
  byStatus: async (orderDeliveryStatus) =>
    axiosInstance.get(`${base}/status`, { params: { orderDeliveryStatus } }),
  detail: async (deliveryId) => axiosInstance.get(`${base}/${deliveryId}`),
};
