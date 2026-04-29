import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, GitPullRequest, ShieldCheck } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Link } from "react-router-dom";

import reviewApi from "../api/reviewApi";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className={`inline-flex rounded-2xl p-3 ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["review-stats"],
    queryFn: reviewApi.getStats,
  });

  if (isLoading) {
    return <div className="text-slate-200">Loading dashboard...</div>;
  }

  const avgScoreColor =
    data.avg_score >= 7 ? "text-emerald-400" : data.avg_score >= 5 ? "text-yellow-400" : "text-rose-400";

  return (
    <div className="space-y-8">
      <section className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8">
        <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Operational overview</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-white">Review pipeline health</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
          Monitor review throughput, quality scores, and the riskiest issues being caught across connected repositories.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={GitPullRequest} label="Total PRs Reviewed" value={data.total_reviews} accent="bg-sky-500/15 text-sky-300" />
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="inline-flex rounded-2xl bg-emerald-500/15 p-3 text-emerald-300">
            <Activity className="h-5 w-5" />
          </div>
          <p className="mt-5 text-sm text-slate-400">Average Score</p>
          <p className={`mt-2 font-display text-4xl font-semibold ${avgScoreColor}`}>{data.avg_score}/10</p>
        </div>
        <StatCard icon={AlertTriangle} label="Critical Issues Found" value={data.critical_issues_count} accent="bg-rose-500/15 text-rose-300" />
        <StatCard icon={ShieldCheck} label="Reviews This Week" value={data.reviews_this_week} accent="bg-orange-500/15 text-orange-300" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-white">Last 7 Days</h2>
              <p className="text-sm text-slate-400">Review volume by day</p>
            </div>
          </div>
          <div className="mt-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.reviews_by_day}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#f97316" strokeWidth={3} dot={{ fill: "#22c55e" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <h2 className="font-display text-2xl font-semibold text-white">Recent Reviews</h2>
          <div className="mt-6 space-y-4">
            {data.recent_reviews.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-5 text-sm text-slate-400">
                No reviews have completed yet.
              </div>
            ) : (
              data.recent_reviews.map((review) => (
                <Link
                  key={review.id}
                  to={`/reviews/${review.id}`}
                  className="block rounded-3xl border border-white/10 bg-slate-900/80 p-5 transition hover:border-white/20"
                >
                  <p className="text-sm font-semibold text-white">{review.title}</p>
                  <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    <span>Score {review.score.toFixed(1)}</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
