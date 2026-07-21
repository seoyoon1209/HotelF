// 예약 목록 페이지.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReservations } from "src/api/reservationApi";
import RiskBadge from "src/components/common/RiskBadge";

const PAGE_SIZE = 10;

function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getReservations().then((res) => setReservations(res.data));
  }, []);

  const totalPages = Math.max(1, Math.ceil(reservations.length / PAGE_SIZE));
  const pageRows = reservations.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">예약 목록</h1>
        <span className="text-sm text-slate-400">총 {reservations.length}건</span>
      </div>

      <div className="mt-5 space-y-2 sm:hidden">
        {pageRows.map((reservation) => (
          <Link
            key={reservation.reservation_id}
            to={`/reservations/${reservation.reservation_id}`}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-400"
          >
            <div>
              <div className="font-medium text-slate-900">{reservation.reservation_code}</div>
              <div className="text-sm text-slate-500">{reservation.check_in_date}</div>
            </div>
            <RiskBadge riskLevel={reservation.risk_level} />
          </Link>
        ))}
        {reservations.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            예약이 없습니다.
          </div>
        )}
      </div>

      <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <th className="px-4 py-3 font-medium">예약번호</th>
              <th className="px-4 py-3 font-medium">체크인</th>
              <th className="px-4 py-3 font-medium">체크아웃</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">취소 위험도</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.map((reservation) => (
              <tr key={reservation.reservation_id} className="transition hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    to={`/reservations/${reservation.reservation_id}`}
                    className="font-medium text-blue-700 hover:text-blue-900 hover:underline"
                  >
                    {reservation.reservation_code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{reservation.check_in_date}</td>
                <td className="px-4 py-3 text-slate-600">{reservation.check_out_date}</td>
                <td className="px-4 py-3 text-slate-600">{reservation.reservation_status}</td>
                <td className="px-4 py-3">
                  <RiskBadge riskLevel={reservation.risk_level} />
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  예약이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {reservations.length > 0 && (
        <div className="mt-3 flex items-center justify-between px-1 text-sm text-slate-500">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageRows.length}건 / 총 {reservations.length}건
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
            >
              이전
            </button>
            <span className="px-2 text-slate-700">{page} / {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg px-2.5 py-1 font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationList;
