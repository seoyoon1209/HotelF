// 예약 목록 페이지. 다른 목록 페이지(HotelList, CustomerList)도 이 패턴을 따름.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
          <li key={reservation.reservation_id}>
            <Link to={`/reservations/${reservation.reservation_id}`}>
              {reservation.reservation_code}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationList;
