/**
 * Severity pill for review comments.
 */
export default function SeverityBadge({ severity }) {
  const config = {
    critical: "bg-red-500/20 text-red-200 ring-red-400/30",
    high: "bg-orange-500/20 text-orange-200 ring-orange-400/30",
    medium: "bg-yellow-500/20 text-yellow-200 ring-yellow-400/30",
    low: "bg-blue-500/20 text-blue-200 ring-blue-400/30",
    info: "bg-slate-500/20 text-slate-200 ring-slate-400/30",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase ring-1 ${config[severity]}`}>
      {severity}
    </span>
  );
}
