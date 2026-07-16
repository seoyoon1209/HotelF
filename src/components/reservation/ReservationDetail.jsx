// 예약 상세 페이지 (/reservations/:reservationId).
// 예약 정보 + 해당 예약의 취소 예측 이력을 함께 보여준다.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReservationById } from "src/api/reservationApi";
import { getPredictionsByReservation } from "src/api/predictionApi";

function ReservationDetail() {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    getReservationById(reservationId).then((res) => setReservation(res.data));
    getPredictionsByReservation(reservationId).then((res) => setPredictions(res.data));
  }, [reservationId]);

  if (!reservation) {
    return <div>예약 상세</div>;
  }

  return (
    <div>
      <h1>예약 상세 - {reservation.reservation_code}</h1>
      <p>상태: {reservation.reservation_status}</p>
      <p>체크인: {reservation.check_in_date}</p>
      <p>체크아웃: {reservation.check_out_date}</p>

      <h2>취소 예측 이력</h2>
      <ul>
        {predictions.map((prediction) => (
          <li key={prediction.prediction_id}>
            {prediction.risk_level} ({prediction.cancellation_probability})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationDetail;
