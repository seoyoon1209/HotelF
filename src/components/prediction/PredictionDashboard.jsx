// 홈("/") 화면. 예약별 최신 취소 예측 결과를 한눈에 보여주는 대시보드.
// 예약 건수가 많아지면 예약당 개별 요청(N+1) 대신 백엔드에 집계용 API를 따로 만드는 게 낫다.
import { useEffect, useState } from "react";
import { getReservations } from "src/api/reservationApi";
import { getPredictionsByReservation } from "src/api/predictionApi";

function PredictionDashboard() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    getReservations().then(async (res) => {
      const reservations = res.data;
      const withPredictions = await Promise.all(
        reservations.map(async (reservation) => {
          const predictionRes = await getPredictionsByReservation(reservation.reservation_id);
          return { reservation, latestPrediction: predictionRes.data[0] ?? null };
        })
      );
      setRows(withPredictions);
    });
  }, []);

  return (
    <div>
      <h1>취소 예측 대시보드</h1>
      <ul>
        {rows.map(({ reservation, latestPrediction }) => (
          <li key={reservation.reservation_id}>
            {reservation.reservation_code} —{" "}
            {latestPrediction ? latestPrediction.risk_level : "예측 없음"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PredictionDashboard;
