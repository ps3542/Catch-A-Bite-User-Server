export const unwrap = (res) => {
  // backend uses ApiResponse<T> { success, data, message }
  const body = res?.data;
  if (body && typeof body === "object" && "data" in body) {
    return body.data;
  }
  return body;
};

export const unwrapMessage = (res) => {
  const body = res?.data;
  if (body && typeof body === "object" && "message" in body) {
    return body.message;
  }
  return null;
};
