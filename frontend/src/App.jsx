import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import GitHubCallbackPage from "./pages/GitHubCallbackPage";
import LoginPage from "./pages/LoginPage";
import PullRequestsPage from "./pages/PullRequestsPage";
import RepositoriesPage from "./pages/RepositoriesPage";
import ReviewDetailPage from "./pages/ReviewDetailPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/github" element={<GitHubCallbackPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen">
              <Navbar />
              <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="/repositories" element={<RepositoriesPage />} />
                  <Route path="/repositories/:id/prs" element={<PullRequestsPage />} />
                  <Route path="/reviews/:prId" element={<ReviewDetailPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
