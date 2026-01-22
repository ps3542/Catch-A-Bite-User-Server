import axiosInstance from "../api/axios";

export const userService = {
  updateMyProfile: async (nickname) => {
    const trimmed = typeof nickname === "string" ? nickname.trim() : "";
    if (!trimmed) {
      throw new Error("닉네임을 입력해주세요.");
    }

    try {
      // API: PATCH /api/v1/users/me/profile
      const response = await axiosInstance.patch("/api/v1/users/me/profile", {
        nickname: trimmed,
      });
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },
};

export const { updateMyProfile } = userService;
