import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderGit2, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import repoApi from "../api/repoApi";

export default function RepositoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  const repositoriesQuery = useQuery({
    queryKey: ["repositories"],
    queryFn: repoApi.listRepositories,
  });

  const connectMutation = useMutation({
    mutationFn: repoApi.connectRepository,
    onSuccess: () => {
      toast.success("Repository connected.");
      setIsModalOpen(false);
      setFullName("");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => toast.error(error.response?.data?.detail?.detail || "Unable to connect repository."),
  });

  const syncMutation = useMutation({
    mutationFn: repoApi.syncPullRequests,
    onSuccess: (data) => {
      toast.success(`Synced ${data.synced_count} pull requests.`);
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => toast.error(error.response?.data?.detail?.detail || "Sync failed."),
  });

  const deleteMutation = useMutation({
    mutationFn: repoApi.deleteRepository,
    onSuccess: () => {
      toast.success("Repository disconnected.");
      queryClient.invalidateQueries({ queryKey: ["repositories"] });
    },
    onError: (error) => toast.error(error.response?.data?.detail?.detail || "Unable to disconnect repository."),
  });

  const repositories = repositoriesQuery.data || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Source control</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-white">Connected repositories</h1>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Connect Repository
        </button>
      </div>

      {repositoriesQuery.isLoading ? (
        <div className="text-slate-300">Loading repositories...</div>
      ) : repositories.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">
          No repositories connected yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {repositories.map((repository) => (
            <article key={repository.id} className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex rounded-2xl bg-orange-500/15 p-3 text-orange-300">
                    <FolderGit2 className="h-5 w-5" />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-white">{repository.name}</h2>
                  <p className="text-sm text-slate-400">{repository.full_name}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs uppercase ${repository.is_active ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-600/20 text-slate-300"}`}>
                  {repository.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Open PRs</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{repository.pull_request_count}</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connected</p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {new Date(repository.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => syncMutation.mutate(repository.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
                >
                  <RefreshCcw className={`h-4 w-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
                  Sync PRs
                </button>
                <Link to={`/repositories/${repository.id}/prs`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                  View PRs
                </Link>
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(repository.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 px-4 py-2 text-sm text-rose-200"
                >
                  <Trash2 className="h-4 w-4" />
                  Disconnect
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-900 p-8">
            <h3 className="font-display text-2xl font-semibold text-white">Connect a GitHub repository</h3>
            <p className="mt-2 text-sm text-slate-400">Enter the full repository name in the format owner/repo.</p>
            <form
              className="mt-6 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                connectMutation.mutate({ full_name: fullName.trim() });
              }}
            >
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                placeholder="owner/repo"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950">
                  {connectMutation.isPending ? "Connecting..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
