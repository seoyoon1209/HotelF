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
