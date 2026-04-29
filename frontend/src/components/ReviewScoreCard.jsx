import { useEffect, useState } from "react";

function getScoreColor(value) {
  if (value >= 8) {
    return "#22c55e";
  }
  if (value >= 6) {
    return "#eab308";
  }
  return "#ef4444";
}

function ScoreCircle({ label, score }) {
  const [visibleScore, setVisibleScore] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.max(0, Math.min(score, 10)) / 10;

  useEffect(() => {
    const timer = window.setTimeout(() => setVisibleScore(score), 120);
    return () => window.clearTimeout(timer);
  }, [score]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-center">
      <div className="mx-auto h-28 w-28">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} className="fill-none stroke-white/10" strokeWidth="10" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="fill-none transition-all duration-700"
            stroke={getScoreColor(score)}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - visibleScore / 10 * circumference}
          />
        </svg>
        <div className="-mt-20 text-center">
          <p className="font-display text-3xl font-semibold text-white">{score.toFixed(1)}</p>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">/ 10</p>
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-200">{label}</p>
    </div>
  );
}

/**
 * Score summary for a review.
 */
export default function ReviewScoreCard({ overallScore, securityScore, qualityScore }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <ScoreCircle label="Overall Score" score={overallScore} />
      <ScoreCircle label="Security Score" score={securityScore} />
      <ScoreCircle label="Quality Score" score={qualityScore} />
    </div>
  );
}
