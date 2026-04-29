import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function GitHubCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGitHub } = useAuth();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      toast.error("Missing GitHub authorization code.");
      navigate("/login", { replace: true });
      return;
    }

    loginWithGitHub(code)
      .then(() => {
        toast.success("GitHub account connected.");
        navigate("/", { replace: true });
      })
      .catch((error) => {
        toast.error(error.response?.data?.detail?.detail || "GitHub login failed.");
        navigate("/login", { replace: true });
      });
  }, [loginWithGitHub, navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-slate-900/80 px-8 py-6 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-400/20 border-t-orange-400" />
        <p className="mt-4 text-sm text-slate-300">Exchanging your GitHub authorization code...</p>
      </div>
    </div>
  );
}
