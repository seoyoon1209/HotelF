// 예약 목록 페이지. 백엔드-axios 연동이 실제로 동작하는 예시(useEffect + getReservations).
// 다른 목록 페이지(HotelList, CustomerList)를 구현할 때 이 파일 패턴을 그대로 따라 하면 됨.
// 예약코드 클릭 시 /reservations/:reservationId(ReservationDetail)로 이동하는 링크는 아직 없음.
import { useEffect, useState } from "react";
import { getReservations } from "src/api/reservationApi";

function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    getReservations().then((res) => setReservations(res.data));
  }, []);

  return (
    <div>
      <h1>예약 목록</h1>
      <ul>
        {reservations.map((reservation) => (
          <li key={reservation.reservation_id}>{reservation.reservation_code}</li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationList;
