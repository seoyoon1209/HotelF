// Reservation list page.
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaMagnifyingGlass, FaCircleExclamation } from "react-icons/fa6";
import { getReservations } from "src/api/reservationApi";
import RiskBadge from "src/components/common/RiskBadge";
import StatusBadge from "src/components/common/StatusBadge";
import LoadingState from "src/components/common/LoadingState";

const PAGE_SIZE = 10;

const STATUS_CHIPS = [
  { value: "all", label: "All" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getReservations()
      .then((res) => {
        setReservations(res.data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.reservation_code.toLowerCase().includes(q) ||
        (r.customer_name ?? "").toLowerCase().includes(q) ||
        (r.hotel_name ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || r.reservation_status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [reservations, query, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Reservation List</h1>
          <p className="mt-0.5 text-sm text-slate-500">See all reservations and their cancellation risk at a glance.</p>
        </div>
        <span className="text-sm text-slate-400">{reservations.length} total</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
        <div className="relative min-w-[200px] flex-1">
          <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reservation number, customer name, or hotel"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_CHIPS.map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setStatusFilter(chip.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === chip.value
                  ? "bg-brand text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: card list */}
      <div className="mt-4 space-y-2 sm:hidden">
        {pageRows.map((reservation) => (
          <Link
            key={reservation.reservation_id}
            to={`/reservations/${reservation.reservation_id}`}
            className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand/50 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-900">{reservation.reservation_code}</span>
              <RiskBadge riskLevel={reservation.risk_level} />
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {reservation.customer_name ?? "No customer info"} · {reservation.hotel_name}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>
                {reservation.check_in_date} → {reservation.check_out_date}
              </span>
              <StatusBadge status={reservation.reservation_status} />
            </div>
          </Link>
        ))}
        {!loading && !error && pageRows.length === 0 && (
          <EmptyState label="No reservations match the filters." />
        )}
      </div>

      {/* Desktop: table */}
      <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white sm:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-slate-500">
                <th className="px-4 py-3 font-medium">Reservation No.</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Hotel/Branch</th>
                <th className="px-4 py-3 font-medium">Check-in → Check-out</th>
                <th className="px-4 py-3 font-medium">ADR</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Cancellation Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageRows.map((reservation) => (
                <tr key={reservation.reservation_id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      to={`/reservations/${reservation.reservation_id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {reservation.reservation_code}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{reservation.customer_name ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{reservation.hotel_name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {reservation.check_in_date} → {reservation.check_out_date}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {reservation.adr != null ? `₩${Number(reservation.adr).toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reservation.reservation_status} />
                  </td>
                  <td className="px-4 py-3">
                    <RiskBadge riskLevel={reservation.risk_level} />
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12">
                    {loading ? (
                      <LoadingState inline className="justify-center" />
                    ) : error ? (
                      <ErrorState />
                    ) : (
                      <EmptyState label="No reservations match the filters." />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {rows.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageRows.length} of {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
              >
                Previous
              </button>
              <span className="px-2 text-slate-700">{page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <LoadingState className="mt-4 sm:hidden" />}
      {!loading && error && (
        <div className="mt-4 sm:hidden">
          <ErrorState />
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }) {
  return <div className="py-2 text-center text-slate-400">{label}</div>;
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-red-500">
      <FaCircleExclamation className="h-5 w-5" />
      <span>Failed to load reservation data. Please check that the backend server is running.</span>
    </div>
  );
}

export default ReservationList;
