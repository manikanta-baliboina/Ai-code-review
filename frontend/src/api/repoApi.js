import apiClient from "./axiosClient";

const repoApi = {
  listRepositories: async () => {
    const response = await apiClient.get("/api/projects/repos/");
    return response.data;
  },
  connectRepository: async (payload) => {
    const response = await apiClient.post("/api/projects/repos/", payload);
    return response.data;
  },
  syncPullRequests: async (repoId) => {
    const response = await apiClient.post(`/api/projects/repos/${repoId}/sync_prs/`);
    return response.data;
  },
  listPullRequests: async ({ repoId, status }) => {
    const response = await apiClient.get("/api/projects/prs/", {
      params: { repo: repoId, status: status || undefined },
    });
    return response.data;
  },
  getPullRequest: async (prId) => {
    const response = await apiClient.get(`/api/projects/prs/${prId}/`);
    return response.data;
  },
  deleteRepository: async (repoId) => {
    const response = await apiClient.delete(`/api/projects/repos/${repoId}/`);
    return response.data;
  },
};

export default repoApi;
