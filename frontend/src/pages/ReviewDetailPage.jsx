import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import repoApi from "../api/repoApi";
import reviewApi from "../api/reviewApi";
import CommentThread from "../components/CommentThread";
import DiffViewer from "../components/DiffViewer";
import ReviewScoreCard from "../components/ReviewScoreCard";

function recommendationClasses(recommendation) {
  if (recommendation === "approve") return "bg-emerald-500/20 text-emerald-200";
  if (recommendation === "request_changes") return "bg-rose-500/20 text-rose-200";
  return "bg-yellow-500/20 text-yellow-200";
}

export default function ReviewDetailPage() {
  const { prId } = useParams();

  const pullRequestQuery = useQuery({
    queryKey: ["pull-request", prId],
    queryFn: () => repoApi.getPullRequest(prId),
  });

  const reviewQuery = useQuery({
    queryKey: ["review", prId],
    queryFn: () => reviewApi.getReview(prId),
  });

  if (pullRequestQuery.isLoading || reviewQuery.isLoading) {
    return <div className="text-slate-300">Loading review details...</div>;
  }

  const pullRequest = pullRequestQuery.data;
  const review = reviewQuery.data;
  const recommendation = review.raw_response?.review?.overall_recommendation || "comment";
  const positives = review.raw_response?.review?.positive_aspects || [];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr,0.95fr]">
      <div className="space-y-5">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Pull request review</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white">{pullRequest.title}</h1>
          <p className="mt-3 text-sm text-slate-400">{pullRequest.description || "No description provided."}</p>
        </div>
        <DiffViewer diffContent={pullRequest.diff_content} comments={review.comments} />
      </div>

      <div className="space-y-6">
        <ReviewScoreCard
          overallScore={review.overall_score}
          securityScore={review.security_score}
          qualityScore={review.quality_score}
        />

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-white">Summary</h2>
            <span className={`rounded-full px-3 py-1 text-xs uppercase ${recommendationClasses(recommendation)}`}>
              {recommendation.replace("_", " ")}
            </span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-300">{review.summary}</p>
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Positive aspects</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {positives.length === 0 ? (
                <li>No positive aspects were returned.</li>
              ) : (
                positives.map((aspect) => (
                  <li key={aspect} className="rounded-2xl bg-slate-900/70 px-4 py-3">
                    {aspect}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        <CommentThread comments={review.comments} />
      </div>
    </div>
  );
}
