import apiClient from "./axiosClient";

const authApi = {
  register: async (payload) => {
    const response = await apiClient.post("/api/auth/register/", payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await apiClient.post("/api/auth/login/", payload);
    return response.data;
  },
  me: async () => {
    const response = await apiClient.get("/api/auth/me/");
    return response.data;
  },
  github: async (payload) => {
    const response = await apiClient.post("/api/auth/github/", payload);
    return response.data;
  },
};

export default authApi;
