// 취소 위험도 배지. DB의 risk_level(LOW/MEDIUM/HIGH/CRITICAL)을 기획 문서 기준
// 3단계(낮음/보통/높음) 표시로 매핑한다. HIGH와 CRITICAL은 같은 "높음" 라벨이지만
// 색으로만 구분(주황/빨강).
const RISK_STYLE = {
  LOW: { label: "낮음", className: "bg-green-100 text-green-800" },
  MEDIUM: { label: "보통", className: "bg-yellow-100 text-yellow-800" },
  HIGH: { label: "높음", className: "bg-orange-100 text-orange-800" },
  CRITICAL: { label: "높음", className: "bg-red-100 text-red-800" },
};

function RiskBadge({ riskLevel }) {
  const style = RISK_STYLE[riskLevel] ?? {
    label: "예측 없음",
    className: "bg-gray-100 text-gray-500",
  };

  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${style.className}`}
    >
      {style.label}
    </span>
  );
}

export default RiskBadge;
export { RISK_STYLE };
