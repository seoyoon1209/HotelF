// 예약 목록 페이지. 다른 목록 페이지(HotelList, CustomerList)도 이 패턴을 따름.
// GET /api/reservations/가 최신 예측(risk_level)까지 같이 내려주므로 위험도 배지를 붙인다.
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
      <h1 className="text-xl font-semibold">예약 목록</h1>

      {/* 모바일: 카드 목록, 데스크톱(sm 이상): 표 */}
      <div className="mt-4 space-y-2 sm:hidden">
        {reservations.map((reservation) => (
          <Link
            key={reservation.reservation_id}
            to={`/reservations/${reservation.reservation_id}`}
            className="flex items-center justify-between rounded-lg border bg-white p-3"
          >
            <div>
              <div className="font-medium">{reservation.reservation_code}</div>
              <div className="text-sm text-slate-500">{reservation.check_in_date}</div>
            </div>
            <RiskBadge riskLevel={reservation.risk_level} />
          </Link>
        ))}
      </div>

      <table className="mt-4 hidden w-full text-left text-sm sm:table">
        <thead>
          <tr className="border-b text-slate-500">
            <th className="py-2">예약번호</th>
            <th className="py-2">체크인</th>
            <th className="py-2">체크아웃</th>
            <th className="py-2">상태</th>
            <th className="py-2">취소 위험도</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((reservation) => (
            <tr key={reservation.reservation_id} className="border-b hover:bg-slate-50">
              <td className="py-2">
                <Link
                  to={`/reservations/${reservation.reservation_id}`}
                  className="text-blue-700 hover:underline"
                >
                  {reservation.reservation_code}
                </Link>
              </td>
              <td className="py-2">{reservation.check_in_date}</td>
              <td className="py-2">{reservation.check_out_date}</td>
              <td className="py-2">{reservation.reservation_status}</td>
              <td className="py-2">
                <RiskBadge riskLevel={reservation.risk_level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReservationList;
