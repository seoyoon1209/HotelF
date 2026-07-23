// Latest cancellation prediction results per reservation (risk summary + risk breakdown + high-risk reservation table)
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCircleCheck,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaCircleQuestion,
  FaMagnifyingGlass,
} from "react-icons/fa6";
import { getReservations } from "src/api/reservationApi";
import { getModelInfo } from "src/api/predictionApi";
import RiskBadge from "src/components/common/RiskBadge";
import RiskDistributionBar from "src/components/common/RiskDistributionBar";
import LoadingState from "src/components/common/LoadingState";
import { formatUSD } from "src/data/currency";

const RISK_CHIPS = [
  { value: "all", label: "All" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

function PredictionDashboard() {
  const [reservations, setReservations] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("probability");

  useEffect(() => {
    let cancelled = false;
    Promise.all([getReservations(), getModelInfo().catch(() => ({ data: null }))])
      .then(([resRes, modelRes]) => {
        if (cancelled) return;
        setReservations(resRes.data);
        setModelInfo(modelRes.data);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, none: 0 };
  reservations.forEach((r) => {
    counts[r.risk_level ?? "none"] = (counts[r.risk_level ?? "none"] ?? 0) + 1;
  });
  const highRiskReservations = useMemo(() => {
    let list = reservations.filter((r) => ["HIGH", "CRITICAL"].includes(r.risk_level));

    if (riskFilter !== "all") {
      list = list.filter((r) => r.risk_level === riskFilter);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.reservation_code.toLowerCase().includes(q) ||
          (r.customer_name ?? "").toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      if (sortBy === "check_in_date") return a.check_in_date.localeCompare(b.check_in_date);
      return Number(b.cancellation_probability) - Number(a.cancellation_probability);
    });

    return list;
  }, [reservations, riskFilter, query, sortBy]);

  const highRiskTotal = reservations.filter((r) => ["HIGH", "CRITICAL"].includes(r.risk_level)).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Cancellation Prediction Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        The risk levels below are reference predictions only
        {modelInfo?.accuracy != null && ` (model accuracy roughly ${Math.round(modelInfo.accuracy * 100)}%)`}.
      </p>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load data. Please check that the backend server is running.
        </div>
      )}

      {loading ? (
        <LoadingState className="mt-6" />
      ) : (
        !error && (
          <>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <RiskStatCard
                label="Low"
                count={counts.LOW}
                total={reservations.length}
                icon={FaCircleCheck}
                color="#0ca30c"
              />
              <RiskStatCard
                label="Medium"
                count={counts.MEDIUM}
                total={reservations.length}
                icon={FaCircleExclamation}
                color="#fab219"
              />
              <RiskStatCard
                label="High"
                count={counts.HIGH + counts.CRITICAL}
                total={reservations.length}
                icon={FaTriangleExclamation}
                color="#d03b3b"
              />
              <RiskStatCard
                label="No Prediction"
                count={counts.none}
                total={reservations.length}
                icon={FaCircleQuestion}
                color="#94a3b8"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-slate-900">Risk Breakdown</h2>
              <div className="mt-4">
                <RiskDistributionBar counts={counts} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">
                High-Risk Reservations <span className="font-normal text-slate-400">({highRiskTotal})</span>
              </h2>
              <Link
                to="/overbooking"
                className="text-sm font-medium text-brand hover:text-brand-dark hover:underline"
              >
                View Overbooking Support →
              </Link>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="relative flex-1 min-w-[200px]">
                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by reservation number or customer name"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RISK_CHIPS.map((chip) => (
                  <button
                    key={chip.value}
                    type="button"
                    onClick={() => setRiskFilter(chip.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      riskFilter === chip.value
                        ? "bg-brand text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              >
                <option value="probability">Highest Cancellation Probability</option>
                <option value="check_in_date">Soonest Check-in</option>
              </select>
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500">
                      <th className="px-5 py-3 font-medium">Reservation No.</th>
                      <th className="px-5 py-3 font-medium">Check-in</th>
                      <th className="px-5 py-3 font-medium">ADR</th>
                      <th className="px-5 py-3 font-medium">Cancellation Probability</th>
                      <th className="px-5 py-3 font-medium">Risk Level</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {highRiskReservations.map((r) => (
                      <tr key={r.reservation_id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-3 font-medium text-slate-900">{r.reservation_code}</td>
                        <td className="px-5 py-3 text-slate-600">{r.check_in_date}</td>
                        <td className="px-5 py-3 text-slate-600">
                          {formatUSD(r.adr)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-red-600">
                          {r.cancellation_probability != null
                            ? `${Math.round(Number(r.cancellation_probability) * 100)}%`
                            : "-"}
                        </td>
                        <td className="px-5 py-3">
                          <RiskBadge riskLevel={r.risk_level} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/reservations/${r.reservation_id}`}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {highRiskReservations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                          {highRiskTotal === 0 ? "There are no high-risk reservations." : "No reservations match the filters."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}

function RiskStatCard({ label, count, total = 0, icon: Icon, color }) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-slate-200 p-5"
      style={{
        background: `linear-gradient(160deg, ${color}17 0%, #ffffff 55%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-60"
        style={{ backgroundColor: color }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-600">{label}</div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900">{count}</span>
          </div>
        </div>
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}b3)`,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">out of {total} total</span>
          <span className="font-bold" style={{ color }}>
            {percent}%
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${percent}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      </div>
    </div>
  );
}

export default PredictionDashboard;
