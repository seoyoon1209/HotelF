// 예약 상세 페이지 (/reservations/:reservationId).
// 예약 정보 + 취소 예측 이력을 보여주고, 고위험(HIGH/CRITICAL) 예약이면
// "선제적 고객 관리" 제안(재확인 연락/일정 변경/업그레이드)을 노출한다.
// 버튼은 실제 연락/변경을 실행하지 않는다 — 직원이 눌러서 "처리 표시"만 하는 체크리스트다.
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getReservationById } from "src/api/reservationApi";
import { getPredictionsByReservation } from "src/api/predictionApi";
import RiskBadge from "src/components/common/RiskBadge";

const SUGGESTED_ACTIONS = [
  { key: "recheck", label: "재확인 연락" },
  { key: "reschedule", label: "일정 변경 제안" },
  { key: "upgrade", label: "업그레이드 제안" },
];

function ReservationDetail() {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [doneActions, setDoneActions] = useState({});

  useEffect(() => {
    getReservationById(reservationId).then((res) => setReservation(res.data));
    getPredictionsByReservation(reservationId).then((res) => setPredictions(res.data));
  }, [reservationId]);

  if (!reservation) {
    return <div>예약 상세</div>;
  }

  const isHighRisk = ["HIGH", "CRITICAL"].includes(reservation.risk_level);

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">예약 상세 - {reservation.reservation_code}</h1>
        <RiskBadge riskLevel={reservation.risk_level} />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        취소 위험도는 참고용 예측치입니다 (모델 정확도 약 78% 수준).
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border bg-white p-4 text-sm sm:grid-cols-4">
        <div>
          <div className="text-slate-500">상태</div>
          <div className="font-medium">{reservation.reservation_status}</div>
        </div>
        <div>
          <div className="text-slate-500">체크인</div>
          <div className="font-medium">{reservation.check_in_date}</div>
        </div>
        <div>
          <div className="text-slate-500">체크아웃</div>
          <div className="font-medium">{reservation.check_out_date}</div>
        </div>
        <div>
          <div className="text-slate-500">취소 확률</div>
          <div className="font-medium">
            {reservation.cancellation_probability != null
              ? `${(Number(reservation.cancellation_probability) * 100).toFixed(1)}%`
              : "-"}
          </div>
        </div>
      </div>

      {isHighRisk && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h2 className="font-medium text-orange-900">선제적 고객 관리 제안</h2>
          <p className="mt-1 text-sm text-orange-800">
            취소 위험도가 높은 예약입니다. 아래 조치 중 진행한 항목을 체크하세요.
          </p>
          <ul className="mt-3 space-y-2">
            {SUGGESTED_ACTIONS.map((action) => (
              <li key={action.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={action.key}
                  checked={!!doneActions[action.key]}
                  onChange={(e) =>
                    setDoneActions((prev) => ({ ...prev, [action.key]: e.target.checked }))
                  }
                />
                <label
                  htmlFor={action.key}
                  className={doneActions[action.key] ? "text-slate-400 line-through" : ""}
                >
                  {action.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="mt-6 font-medium">취소 예측 이력</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {predictions.map((prediction) => (
          <li
            key={prediction.prediction_id}
            className="flex items-center justify-between rounded border bg-white px-3 py-2"
          >
            <span>{new Date(prediction.predicted_at).toLocaleString()}</span>
            <span className="flex items-center gap-2">
              {(Number(prediction.cancellation_probability) * 100).toFixed(1)}%
              <RiskBadge riskLevel={prediction.risk_level} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReservationDetail;
