// 취소예상 vs 미취소예상 비율을 보여주는 단순 SVG 도넛 차트.
function DonutChart({ cancelCount, keepCount, size = 140, stroke = 18 }) {
  const total = cancelCount + keepCount;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const cancelRatio = total === 0 ? 0 : cancelCount / total;
  const cancelLength = circumference * cancelRatio;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="취소예상 비율 도넛 차트">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#dcfce7"
        strokeWidth={stroke}
      />
      {total > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ef4444"
          strokeWidth={stroke}
          strokeDasharray={`${cancelLength} ${circumference - cancelLength}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      )}
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        className="fill-slate-900 text-2xl font-bold"
        style={{ fontSize: size * 0.16 }}
      >
        {total === 0 ? "0%" : `${Math.round(cancelRatio * 100)}%`}
      </text>
      <text
        x="50%"
        y="64%"
        textAnchor="middle"
        className="fill-slate-400"
        style={{ fontSize: size * 0.08 }}
      >
        취소 예상
      </text>
    </svg>
  );
}

export default DonutChart;
