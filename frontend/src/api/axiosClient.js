import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const apiClient = axios.create({ baseURL });

let isRefreshing = false;
let pendingRequests = [];

function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}

function processQueue(token) {
  pendingRequests.forEach((resolve) => resolve(token));
  pendingRequests = [];
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          clearAuth();
          return Promise.reject(error);
        }
        const refreshResponse = await axios.post(`${baseURL}/api/auth/refresh/`, {
          refresh: refreshToken,
        });
        const nextAccessToken = refreshResponse.data.access;
        localStorage.setItem("accessToken", nextAccessToken);
        processQueue(nextAccessToken);
        originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAuth();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
