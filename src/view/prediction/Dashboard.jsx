// 1. Dashboard (home): KPI summary + predicted-cancellation ratio donut + per-segment predicted-cancellation ranking.
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import FilterBar from "src/components/prediction/FilterBar";
import DonutChart from "src/components/prediction/DonutChart";
import SegmentRankList from "src/components/prediction/SegmentRankList";
import { usePredictionFilters } from "src/view/prediction/PredictionFilterContext";
import { DEPOSIT_LABEL, SEGMENT_LABEL } from "src/data/labels";
import LoadingState from "src/components/common/LoadingState";

function computeSegmentRanking(reservations) {
  const groups = {};
  reservations.forEach((r) => {
    const keys = [
      { key: `deposit:${r.deposit_type}`, group: "Deposit", label: DEPOSIT_LABEL[r.deposit_type] ?? r.deposit_type },
      { key: `segment:${r.market_segment}`, group: "Segment", label: SEGMENT_LABEL[r.market_segment] ?? r.market_segment },
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
          Failed to load reservation data. Please check that the backend server is running.
        </div>
      )}
      {loading && <LoadingState className="mt-3" />}

      {!loading && !error && (
        <>
          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Total Reservations" value={stats.total.toLocaleString()} />
            <KpiCard label="Predicted Cancellations" value={stats.cancel.toLocaleString()} accent="text-red-600" />
            <KpiCard label="Predicted Keeps" value={stats.keep.toLocaleString()} accent="text-green-600" />
            <KpiCard label="Predicted Cancellation Rate" value={`${(stats.ratio * 100).toFixed(1)}%`} accent="text-red-600" />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">Predicted Cancellation vs. Keep Ratio</h2>
              <div className="mt-4 flex items-center gap-8">
                <DonutChart cancelCount={stats.cancel} keepCount={stats.keep} />
                <div className="space-y-3 text-sm">
                  <LegendRow color="#ef4444" label="Predicted Cancellation" count={stats.cancel} />
                  <LegendRow color="#dcfce7" borderColor="#16a34a" label="Predicted Keep" count={stats.keep} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">Predicted Cancellation Rate by Segment</h2>
              <p className="mt-0.5 text-xs text-slate-400">By deposit type and market segment (sample size of 3+)</p>
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
              View Reservations Needing Action
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
      <span className="font-semibold text-slate-900">{count}</span>
    </div>
  );
}

export default Dashboard;
