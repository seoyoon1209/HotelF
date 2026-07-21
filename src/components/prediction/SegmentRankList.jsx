// 세그먼트별(deposit_type · market_segment) 취소예상 비율 상위 랭킹 리스트.
function SegmentRankList({ rows }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">표시할 세그먼트 데이터가 없습니다.</p>;
  }

  const max = Math.max(...rows.map((r) => r.ratio));

  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{row.label}</span>
            <span className="font-semibold text-slate-900">{Math.round(row.ratio * 100)}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-red-400"
              style={{ width: `${max === 0 ? 0 : (row.ratio / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default SegmentRankList;
