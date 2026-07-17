// 취소 위험도 배지.
const RISK_STYLE = {
  LOW: { label: "낮음", className: "bg-green-50 text-green-700 ring-green-600/20", dot: "bg-green-500" },
  MEDIUM: {
    label: "보통",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
    dot: "bg-yellow-500",
  },
  HIGH: {
    label: "높음",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
    dot: "bg-orange-500",
  },
  CRITICAL: { label: "높음", className: "bg-red-50 text-red-700 ring-red-600/20", dot: "bg-red-500" },
};

function RiskBadge({ riskLevel }) {
  const style = RISK_STYLE[riskLevel] ?? {
    label: "예측 없음",
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
