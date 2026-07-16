// 홈("/") 화면. 예약별 최신 취소 예측 결과(위험도 요약 + 고위험 예약 목록)를 보여준다.
// GET /api/reservations/가 이미 최신 예측(risk_level)을 같이 내려주므로 추가 요청 없이 계산한다.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReservations } from "src/api/reservationApi";
import RiskBadge from "src/components/common/RiskBadge";

function PredictionDashboard() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    getReservations().then((res) => setReservations(res.data));
  }, []);

  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0, none: 0 };
  reservations.forEach((r) => {
    counts[r.risk_level ?? "none"] = (counts[r.risk_level ?? "none"] ?? 0) + 1;
  });
  const highRiskReservations = reservations.filter((r) =>
    ["HIGH", "CRITICAL"].includes(r.risk_level)
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">취소 예측 대시보드</h1>
      <p className="mt-1 text-sm text-slate-500">
        아래 위험도는 참고용 예측치입니다 (모델 정확도 약 78% 수준).
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="낮음" count={counts.LOW} dot="bg-green-500" />
        <SummaryCard label="보통" count={counts.MEDIUM} dot="bg-yellow-500" />
        <SummaryCard
          label="높음"
          count={counts.HIGH + counts.CRITICAL}
          dot="bg-red-500"
          highlight
        />
        <SummaryCard label="예측 없음" count={counts.none} dot="bg-gray-400" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">
          고위험 예약 <span className="text-slate-400">({highRiskReservations.length}건)</span>
        </h2>
        <Link
          to="/overbooking"
          className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
        >
          오버부킹 지원 보기 →
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {highRiskReservations.map((reservation) => (
          <li key={reservation.reservation_id}>
            <Link
              to={`/reservations/${reservation.reservation_id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md"
            >
              <div>
                <div className="font-medium text-slate-900">{reservation.reservation_code}</div>
                <div className="text-sm text-slate-500">체크인 {reservation.check_in_date}</div>
              </div>
              <RiskBadge riskLevel={reservation.risk_level} />
            </Link>
          </li>
        ))}
        {highRiskReservations.length === 0 && (
          <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
            현재 고위험 예약이 없습니다.
          </li>
        )}
      </ul>
    </div>
  );
}

function SummaryCard({ label, count, dot, highlight = false }) {
  return (
    <div
      className={`rounded-xl border p-4 shadow-sm ${
        highlight ? "border-red-200 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-1.5 text-sm text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {label}
      </div>
      <div className="mt-1.5 text-3xl font-semibold text-slate-900">{count}</div>
    </div>
  );
}

export default PredictionDashboard;
