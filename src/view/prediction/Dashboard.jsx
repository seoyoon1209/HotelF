// 1. 대시보드(홈): KPI 요약 + 취소예상 비율 도넛 + 세그먼트별 취소예상 비율 순위.
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import FilterBar from "src/components/prediction/FilterBar";
import DonutChart from "src/components/prediction/DonutChart";
import SegmentRankList from "src/components/prediction/SegmentRankList";
import { usePredictionFilters } from "src/view/prediction/PredictionFilterContext";
import LoadingState from "src/components/common/LoadingState";

// 원본 코드값 → 화면에 보여줄 한글 라벨.
const DEPOSIT_LABEL = {
  "No Deposit": "보증금 없음",
  "Non Refund": "환불 불가",
  Refundable: "환불 가능",
};
const SEGMENT_LABEL = {
  OTA: "온라인 여행사(OTA)",
  "Online TA": "온라인 여행사(OTA)",
  "Offline TA/TO": "오프라인 여행사",
  Groups: "단체",
  Direct: "직접 예약",
  Corporate: "기업",
  Other: "기타",
};

function computeSegmentRanking(reservations) {
  const groups = {};
  reservations.forEach((r) => {
    const keys = [
      { key: `deposit:${r.deposit_type}`, group: "보증금", label: DEPOSIT_LABEL[r.deposit_type] ?? r.deposit_type },
      { key: `segment:${r.market_segment}`, group: "세그먼트", label: SEGMENT_LABEL[r.market_segment] ?? r.market_segment },
    ];
    keys.forEach(({ key, group, label }) => {
      if (!groups[key]) groups[key] = { cancel: 0, total: 0, group, label };
      groups[key].total += 1;
      if (r.risk_label === "CANCEL") groups[key].cancel += 1;
    });
  });
  return Object.values(groups)
    .map(({ cancel, total, group, label }) => ({
      group,
      label,
      ratio: total ? cancel / total : 0,
      total,
    }))
    .filter((row) => row.total >= 3)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 5);
}

function Dashboard() {
  const navigate = useNavigate();
  const { filteredReservations, loading, error } = usePredictionFilters();

  const stats = useMemo(() => {
    const total = filteredReservations.length;
    const cancel = filteredReservations.filter((r) => r.risk_label === "CANCEL").length;
    const keep = total - cancel;
    const ratio = total === 0 ? 0 : cancel / total;
    return { total, cancel, keep, ratio };
  }, [filteredReservations]);

  const segmentRanking = useMemo(() => computeSegmentRanking(filteredReservations), [filteredReservations]);

  return (
    <div>
      <FilterBar />

      {error && (
        <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          예약 데이터를 불러오지 못했습니다. 백엔드 서버가 켜져 있는지 확인해주세요.
        </div>
      )}
      {loading && <LoadingState className="mt-3" />}

      {!loading && !error && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="총 예약 수" value={`${stats.total.toLocaleString()}건`} />
            <KpiCard label="취소예상" value={`${stats.cancel.toLocaleString()}건`} accent="text-red-600" />
            <KpiCard label="미취소예상" value={`${stats.keep.toLocaleString()}건`} accent="text-green-600" />
            <KpiCard label="예상취소 비율" value={`${(stats.ratio * 100).toFixed(1)}%`} accent="text-red-600" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">취소예상 vs 미취소예상 비율</h2>
              <div className="mt-4 flex items-center gap-8">
                <DonutChart cancelCount={stats.cancel} keepCount={stats.keep} />
                <div className="space-y-3 text-sm">
                  <LegendRow color="#ef4444" label="취소 예상" count={stats.cancel} />
                  <LegendRow color="#dcfce7" borderColor="#16a34a" label="미취소 예상" count={stats.keep} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">세그먼트별 취소예상 비율 순위</h2>
              <p className="mt-0.5 text-xs text-slate-400">보증금 유형 · 시장 세그먼트 기준 (표본 3건 이상)</p>
              <div className="mt-4">
                <SegmentRankList rows={segmentRanking} />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/prediction/reservations?status=CANCEL")}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              조치가 필요한 예약 보기
              <FaArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function LegendRow({ color, borderColor, label, count }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-3 w-3 rounded-sm"
        style={{ backgroundColor: color, border: borderColor ? `2px solid ${borderColor}` : "none" }}
      />
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-900">{count}건</span>
    </div>
  );
}

export default Dashboard;
