import { useMutation } from "@tanstack/react-query";
import { Github, Lock, Mail } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formState, setFormState] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: () => {
      toast.success("Signed in successfully.");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail?.detail || "Unable to sign in.");
    },
  });

  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=repo,read:user`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 shadow-2xl lg:grid-cols-[1.1fr,0.9fr]">
        <div className="relative hidden min-h-[36rem] overflow-hidden bg-gradient-to-br from-orange-500 via-rose-500 to-emerald-500 p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_40%)]" />
          <div className="relative">
            <p className="text-sm uppercase tracking-[0.32em] text-white/70">AI Review Operations</p>
            <h1 className="mt-6 max-w-md font-display text-5xl font-semibold leading-tight text-white">
              Ship pull requests with faster, sharper feedback.
            </h1>
            <p className="mt-6 max-w-md text-lg text-white/80">
              Connect GitHub, sync repositories, and let the platform surface risk, quality gaps, and standout improvements.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Welcome back</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-white">Sign in to Review Forge</h2>
          <p className="mt-3 text-sm text-slate-400">Use your workspace credentials or continue with GitHub.</p>

          <form
            className="mt-8 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              loginMutation.mutate(formState);
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={formState.email}
                  onChange={(event) => setFormState((current) => ({ ...current, email: event.target.value.trim() }))}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="you@company.com"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={formState.password}
                  onChange={(event) => setFormState((current) => ({ ...current, password: event.target.value }))}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-slate-500">
            <div className="h-px flex-1 bg-white/10" />
            Or continue with
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <a
            href={githubUrl}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10"
          >
            <Github className="h-4 w-4" />
            Login with GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
