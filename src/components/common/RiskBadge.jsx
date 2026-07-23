// Cancellation risk-level badge.
const RISK_STYLE = {
  LOW: { label: "Low", className: "bg-green-50 text-green-700 ring-green-600/20", dot: "bg-green-500" },
  MEDIUM: {
    label: "Medium",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    dot: "bg-yellow-500",
  },
  HIGH: {
    label: "High",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    dot: "bg-orange-500",
  },
  CRITICAL: { label: "High", className: "bg-red-50 text-red-700 ring-red-600/20", dot: "bg-red-500" },
};

function RiskBadge({ riskLevel }) {
  const style = RISK_STYLE[riskLevel] ?? {
    label: "No prediction",
    className: "bg-gray-50 text-gray-500 ring-gray-500/20",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export default RiskBadge;
export { RISK_STYLE };
