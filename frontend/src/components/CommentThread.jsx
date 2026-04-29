import { Bug, Code2, Shield, Star, Zap } from "lucide-react";
import { useMemo, useState } from "react";

import SeverityBadge from "./SeverityBadge";

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const iconMap = {
  bug: Bug,
  security: Shield,
  performance: Zap,
  style: Code2,
  best_practice: Star,
};

/**
 * Scrollable review comments list with severity filtering.
 */
export default function CommentThread({ comments }) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredComments = useMemo(() => {
    return [...comments]
      .filter((comment) => activeFilter === "all" || comment.severity === activeFilter)
      .sort((left, right) => severityOrder[left.severity] - severityOrder[right.severity]);
  }, [activeFilter, comments]);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">Review Comments</h3>
          <p className="text-sm text-slate-400">Sorted by severity and scoped to affected files.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "critical", "high", "medium", "low", "info"].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.2em] ${
                activeFilter === filter ? "bg-white text-slate-950" : "bg-white/5 text-slate-300"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 max-h-[32rem] space-y-4 overflow-y-auto pr-2">
        {filteredComments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-6 text-sm text-slate-400">
            No comments match the selected filter.
          </div>
        ) : (
          filteredComments.map((comment) => {
            const Icon = iconMap[comment.category] || Star;
            const lineRange = comment.line_start ? `${comment.line_start}${comment.line_end ? `-${comment.line_end}` : ""}` : "N/A";
            return (
              <article
                id={`comment-${comment.id}`}
                key={comment.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white/5 p-3 text-orange-300">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{comment.file_path}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Line {lineRange}</p>
                    </div>
                  </div>
                  <SeverityBadge severity={comment.severity} />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-200">{comment.message}</p>
                {comment.suggestion ? (
                  <div className="mt-4 rounded-2xl bg-slate-800 p-4 font-mono text-xs leading-6 text-slate-200">
                    {comment.suggestion}
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
