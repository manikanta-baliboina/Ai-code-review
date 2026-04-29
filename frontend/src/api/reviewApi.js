import apiClient from "./axiosClient";

const reviewApi = {
  getReview: async (prId) => {
    const response = await apiClient.get(`/api/reviews/${prId}/`);
    return response.data;
  },
  triggerReview: async (prId) => {
    const response = await apiClient.post(`/api/reviews/${prId}/trigger/`);
    return response.data;
  },
  getStats: async () => {
    const response = await apiClient.get("/api/reviews/stats/");
    return response.data;
  },
};

export default reviewApi;
