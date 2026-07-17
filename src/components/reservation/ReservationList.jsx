// 예약 목록 페이지.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReservations } from "src/api/reservationApi";
import RiskBadge from "src/components/common/RiskBadge";

function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    getReservations().then((res) => setReservations(res.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">예약 목록</h1>

      <div className="mt-5 space-y-2 sm:hidden">
        {reservations.map((reservation) => (
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
            {reservations.map((reservation) => (
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
    </div>
  );
}

export default ReservationList;
