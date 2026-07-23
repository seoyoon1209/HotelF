// Part-to-whole chart showing the risk-level breakdown of reservations.
const SEGMENTS = [
  { key: "LOW", label: "Low", color: "#0ca30c" },
  { key: "MEDIUM", label: "Medium", color: "#fab219" },
  { key: "HIGH", label: "High", color: "#d03b3b" },
  { key: "none", label: "No prediction", color: "#c3c2b7" },
];

function RiskDistributionBar({ counts }) {
  const values = {
    LOW: counts.LOW ?? 0,
    MEDIUM: counts.MEDIUM ?? 0,
    HIGH: (counts.HIGH ?? 0) + (counts.CRITICAL ?? 0),
    none: counts.none ?? 0,
  };
  const total = Object.values(values).reduce((sum, n) => sum + n, 0);
  const segments = SEGMENTS.map((seg) => ({ ...seg, count: values[seg.key] })).filter(
    (seg) => seg.count > 0
  );

  if (total === 0) {
    return <p className="text-sm text-slate-500">No reservations to display.</p>;
  }

  return (
    <div>
      <div className="flex h-6 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {segments.map((seg) => (
          <div
            key={seg.key}
            style={{ width: `${(seg.count / total) * 100}%`, backgroundColor: seg.color }}
            title={`${seg.label} ${seg.count} reservations`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
        {segments.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5 text-sm text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: seg.color }}
              aria-hidden="true"
            />
            {seg.label} {seg.count} ({Math.round((seg.count / total) * 100)}%)
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskDistributionBar;
