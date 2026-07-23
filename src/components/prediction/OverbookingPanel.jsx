// Overbooking support page (for staff decision-making)
import { useEffect, useMemo, useState } from "react";
import { FaLayerGroup, FaCircleExclamation } from "react-icons/fa6";
import { getOverbookingSummary } from "src/api/overbookingApi";
import LoadingState from "src/components/common/LoadingState";

function OverbookingPanel() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    getOverbookingSummary()
      .then((res) => {
        setSummary(res.data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalReservations = summary.reduce((sum, d) => sum + d.total_reservations, 0);
    const expectedCancellations = summary.reduce((sum, d) => sum + Number(d.expected_cancellations), 0);
    const recommendedBookings = summary.reduce((sum, d) => sum + d.recommended_additional_bookings, 0);
    return { totalReservations, expectedCancellations, recommendedBookings };
  }, [summary]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <FaLayerGroup className="h-5 w-5 text-brand" />
        <h1 className="text-2xl font-semibold text-slate-900">Overbooking Support</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Recommends an allowable range for additional bookings based on the expected cancellation
        count for each date. These figures are for reference only — final decisions are made by staff.
      </p>

      {!loading && !error && summary.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Reservations, Next 30 Days" value={stats.totalReservations.toLocaleString()} />
          <StatCard
            label="Expected Cancellations, Next 30 Days"
            value={stats.expectedCancellations.toFixed(1)}
            accent="text-orange-600"
          />
          <StatCard
            label="Total Recommended Additional Bookings"
            value={stats.recommendedBookings.toLocaleString()}
            accent="text-blue-700"
          />
        </div>
      )}

      {loading && <LoadingState className="mt-6" />}

      {!loading && error && (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600">
          <FaCircleExclamation className="h-5 w-5" />
          <span className="text-sm">
            Failed to load overbooking data. Please check that the backend server is running.
          </span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Mobile: card list */}
          <div className="mt-5 space-y-3 sm:hidden">
            {summary.map((day) => (
              <DayCard key={day.check_in_date} day={day} />
            ))}
            {summary.length === 0 && <EmptyState />}
          </div>

          {/* Desktop: table */}
          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 font-medium">Check-in Date</th>
                  <th className="px-4 py-3 font-medium">Reservations</th>
                  <th className="px-4 py-3 font-medium">Expected Cancellations</th>
                  <th className="px-4 py-3 font-medium">High Risk</th>
                  <th className="px-4 py-3 font-medium">Recommended Additional Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.map((day) => (
                  <tr key={day.check_in_date} className="transition hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{day.check_in_date}</td>
                    <td className="px-4 py-3 text-slate-600">{day.total_reservations}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {Number(day.expected_cancellations).toFixed(1)}
                    </td>
                    <td className="px-4 py-3">
                      {day.high_risk_count > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                          {day.high_risk_count}
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                        +{day.recommended_additional_bookings}
                      </span>
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      No data to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, accent = "text-slate-900" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1.5 text-2xl font-bold ${accent}`}>{value}</div>
    </div>
  );
}

function DayCard({ day }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-900">{day.check_in_date}</span>
        <span className="text-sm text-slate-500">Reservations {day.total_reservations}</span>
      </div>
      <div className="mt-1.5 text-sm text-slate-600">
        Expected cancellations {Number(day.expected_cancellations).toFixed(1)} (high risk {day.high_risk_count})
      </div>
      <div className="mt-2 inline-block rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700">
        Recommended additional bookings +{day.recommended_additional_bookings}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
      No data to display.
    </div>
  );
}

export default OverbookingPanel;
