import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";

import repoApi from "../api/repoApi";
import reviewApi from "../api/reviewApi";

const filters = ["all", "pending", "completed", "failed"];

function getStatusClasses(status) {
  if (status === "completed") return "bg-emerald-500/20 text-emerald-200";
  if (status === "reviewing") return "bg-sky-500/20 text-sky-200 animate-pulse";
  if (status === "failed") return "bg-rose-500/20 text-rose-200";
  return "bg-slate-500/20 text-slate-200";
}

export default function PullRequestsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState("all");
  const [pollingPrId, setPollingPrId] = useState(null);

  const pullRequestsQuery = useQuery({
    queryKey: ["pull-requests", id, activeFilter],
    queryFn: () => repoApi.listPullRequests({ repoId: id, status: activeFilter === "all" ? "" : activeFilter }),
    refetchInterval: pollingPrId ? 3000 : false,
  });

  const triggerMutation = useMutation({
    mutationFn: reviewApi.triggerReview,
    onSuccess: (_, prId) => {
      toast.success("Review queued.");
      setPollingPrId(prId);
      queryClient.invalidateQueries({ queryKey: ["pull-requests", id] });
    },
    onError: (error) => toast.error(error.response?.data?.detail?.detail || "Unable to queue review."),
  });

  useEffect(() => {
    if (!pollingPrId || !pullRequestsQuery.data) {
      return;
    }
    const current = pullRequestsQuery.data.find((item) => item.id === pollingPrId);
    if (current?.status === "completed" || current?.status === "failed") {
      setPollingPrId(null);
      queryClient.invalidateQueries({ queryKey: ["pull-requests", id, activeFilter] });
    }
  }, [activeFilter, id, pollingPrId, pullRequestsQuery.data, queryClient]);

  const pullRequests = pullRequestsQuery.data || [];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Repository pipeline</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white">Pull requests</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-4 py-2 text-sm ${
              activeFilter === filter ? "bg-white text-slate-950" : "bg-white/5 text-slate-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
        {pullRequestsQuery.isLoading ? (
          <div className="p-6 text-slate-300">Loading pull requests...</div>
        ) : pullRequests.length === 0 ? (
          <div className="p-10 text-center text-slate-400">No pull requests found for this repository.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr className="text-left text-xs uppercase tracking-[0.24em] text-slate-400">
                  <th className="px-6 py-4">PR</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pullRequests.map((pr) => (
                  <tr key={pr.id} className="text-sm text-slate-200">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">#{pr.number} {pr.title}</p>
                    </td>
                    <td className="px-6 py-4">{pr.author}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs uppercase ${getStatusClasses(pr.status)}`}>
                        {pr.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{pr.score ? pr.score.toFixed(1) : "—"}</td>
                    <td className="px-6 py-4">{new Date(pr.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {pr.has_review ? (
                          <Link to={`/reviews/${pr.id}`} className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-950">
                            View Review
                          </Link>
                        ) : null}
                        {(pr.status === "pending" || pr.status === "failed") ? (
                          <button
                            type="button"
                            onClick={() => triggerMutation.mutate(pr.id)}
                            className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white"
                          >
                            Trigger Review
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
