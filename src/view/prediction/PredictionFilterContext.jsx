// Reservation data shared between the dashboard and reservation list, plus global filter bar state (period, hotel branch, segment).
// The reservation list is loaded from the real backend (GET /api/reservations/).
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getReservations } from "src/api/reservationApi";
import { transformReservation } from "src/data/transformReservation";

const FilterContext = createContext(null);

export const PERIOD_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "7", label: "Check-in within 7 days" },
  { value: "14", label: "Check-in within 14 days" },
  { value: "30", label: "Check-in within 30 days" },
];

export function PredictionFilterProvider({ children }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState("all");
  const [hotelBranch, setHotelBranch] = useState("all");
  const [segment, setSegment] = useState("all");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReservations()
      .then((res) => {
        if (cancelled) return;
        const rows = res.data.map(transformReservation).sort((a, b) => a.lead_time - b.lead_time);
        setReservations(rows);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markActionDone = (reservationId) => {
    setReservations((prev) =>
      prev.map((r) => (r.reservation_id === reservationId ? { ...r, action_status: "DONE" } : r))
    );
  };

  const applyPrediction = (reservationId, probability) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.reservation_id === reservationId
          ? { ...r, base_probability: probability, risk_label: probability >= 0.5 ? "CANCEL" : "KEEP" }
          : r
      )
    );
  };

  const getReservationByCode = (code) => reservations.find((r) => r.reservation_code === code);

  const hotelBranchOptions = useMemo(
    () => [...new Set(reservations.map((r) => r.hotel_branch).filter(Boolean))].sort(),
    [reservations]
  );
  const segmentOptions = useMemo(
    () => [...new Set(reservations.map((r) => r.market_segment).filter(Boolean))].sort(),
    [reservations]
  );

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (period !== "all" && r.lead_time > Number(period)) return false;
      if (hotelBranch !== "all" && r.hotel_branch !== hotelBranch) return false;
      if (segment !== "all" && r.market_segment !== segment) return false;
      return true;
    });
  }, [reservations, period, hotelBranch, segment]);

  const value = {
    loading,
    error,
    reservations,
    markActionDone,
    applyPrediction,
    getReservationByCode,
    period,
    setPeriod,
    hotelBranch,
    setHotelBranch,
    segment,
    setSegment,
    filteredReservations,
    hotelBranchOptions,
    segmentOptions,
  };

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function usePredictionFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("usePredictionFilters must be used within a PredictionFilterProvider");
  }
  return ctx;
}
