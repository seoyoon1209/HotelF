// Reservation detail page: reservation info + cancellation prediction history
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaLightbulb } from "react-icons/fa6";
import { getReservationById } from "src/api/reservationApi";
import { getPredictionsByReservation, getModelInfo } from "src/api/predictionApi";
import RiskBadge from "src/components/common/RiskBadge";
import StatusBadge from "src/components/common/StatusBadge";
import LoadingState from "src/components/common/LoadingState";
import { formatUSD } from "src/data/currency";

const SUGGESTED_ACTIONS = [
  { key: "recheck", label: "Follow-up call to confirm" },
  { key: "reschedule", label: "Suggest a date change" },
  { key: "upgrade", label: "Offer an upgrade" },
];

function ReservationDetail() {
  const { reservationId } = useParams();
  const [reservation, setReservation] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [doneActions, setDoneActions] = useState({});
  const [modelInfo, setModelInfo] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getReservationById(reservationId)
      .then((res) => setReservation(res.data))
      .catch(() => setNotFound(true));
    getPredictionsByReservation(reservationId).then((res) => setPredictions(res.data));
    getModelInfo()
      .then((res) => setModelInfo(res.data))
      .catch(() => setModelInfo(null));
  }, [reservationId]);

  if (notFound) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
        Reservation not found.
        <div className="mt-3">
          <Link to="/reservations" className="text-sm font-medium text-brand hover:underline">
            Back to Reservation List
          </Link>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return <LoadingState />;
  }

  const isHighRisk = ["HIGH", "CRITICAL"].includes(reservation.risk_level);
  const guestSummary = [
    `${reservation.adult_count} adults`,
    reservation.child_count ? `${reservation.child_count} children` : null,
    reservation.baby_count ? `${reservation.baby_count} infants` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-w-3xl">
      <Link
        to="/reservations"
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <FaArrowLeft className="h-3 w-3" />
        Reservation List
      </Link>

      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">{reservation.reservation_code}</div>
            <h1 className="mt-0.5 text-xl font-bold text-slate-900">
              {reservation.customer_name ?? "No customer info"}
            </h1>
            <div className="mt-1 text-sm text-slate-500">{reservation.hotel_name}</div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={reservation.reservation_status} />
            <RiskBadge riskLevel={reservation.risk_level} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-4">
          <Field label="Check-in" value={reservation.check_in_date} />
          <Field label="Check-out" value={reservation.check_out_date} />
          <Field label="Guests" value={guestSummary || "-"} />
          <Field
            label="Cancellation Probability"
            value={
              reservation.cancellation_probability != null
                ? `${(Number(reservation.cancellation_probability) * 100).toFixed(1)}%`
                : "-"
            }
          />
          <Field
            label="ADR"
            value={formatUSD(reservation.adr)}
          />
          <Field
            label="Total Amount"
            value={formatUSD(reservation.total_price)}
          />
          <Field label="Meal Plan" value={reservation.meal_name ?? "-"} />
          <Field label="Deposit Type" value={reservation.deposit_name ?? "-"} />
          <Field label="Market Segment" value={reservation.segment_name ?? "-"} />
          <Field label="Channel" value={reservation.channel_name ?? "-"} />
        </div>

        {modelInfo?.accuracy != null && (
          <p className="mt-4 text-xs text-slate-400">
            Cancellation risk is a reference prediction only (model accuracy roughly {Math.round(modelInfo.accuracy * 100)}%).
          </p>
        )}
      </div>

      {isHighRisk && (
        <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <div className="flex items-center gap-2 text-orange-900">
            <FaLightbulb className="h-4 w-4" />
            <h2 className="font-semibold">Proactive Guest Care Suggestions</h2>
          </div>
          <p className="mt-1 text-sm text-orange-800">
            This reservation has a high cancellation risk. Check off any actions you've taken below.
          </p>
          <ul className="mt-3 space-y-2">
            {SUGGESTED_ACTIONS.map((action) => (
              <li key={action.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={action.key}
                  className="h-4 w-4 rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                  checked={!!doneActions[action.key]}
                  onChange={(e) =>
                    setDoneActions((prev) => ({ ...prev, [action.key]: e.target.checked }))
                  }
                />
                <label
                  htmlFor={action.key}
                  className={doneActions[action.key] ? "text-slate-400 line-through" : "text-orange-900"}
                >
                  {action.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <div className="flex items-center gap-2 text-slate-900">
          <FaClock className="h-4 w-4 text-slate-400" />
          <h2 className="font-semibold">Cancellation Prediction History</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm">
          {predictions.map((prediction) => (
            <li
              key={prediction.prediction_id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              <span className="text-slate-500">
                {new Date(prediction.predicted_at).toLocaleString()}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium text-slate-900">
                  {(Number(prediction.cancellation_probability) * 100).toFixed(1)}%
                </span>
                <RiskBadge riskLevel={prediction.risk_level} />
              </span>
            </li>
          ))}
          {predictions.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
              No prediction history.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-slate-400">{label}</div>
      <div className="mt-0.5 font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default ReservationDetail;
