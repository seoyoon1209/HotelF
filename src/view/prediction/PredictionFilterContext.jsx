// 대시보드/예약 리스트에서 공유하는 전역 필터바 상태 (기간, 호텔/지점, 세그먼트).
import { createContext, useContext, useMemo, useState } from "react";
import { RESERVATIONS, HOTEL_BRANCHES, MARKET_SEGMENTS } from "src/data/predictionDemoData";

const FilterContext = createContext(null);

export const PERIOD_OPTIONS = [
  { value: "all", label: "전체 기간" },
  { value: "7", label: "체크인 7일 이내" },
  { value: "14", label: "체크인 14일 이내" },
  { value: "30", label: "체크인 30일 이내" },
];

export function PredictionFilterProvider({ children }) {
  const [period, setPeriod] = useState("all");
  const [hotelBranch, setHotelBranch] = useState("all");
  const [segment, setSegment] = useState("all");

  const filteredReservations = useMemo(() => {
    return RESERVATIONS.filter((r) => {
      if (period !== "all" && r.lead_time > Number(period)) return false;
      if (hotelBranch !== "all" && r.hotel_branch !== hotelBranch) return false;
      if (segment !== "all" && r.market_segment !== segment) return false;
      return true;
    });
  }, [period, hotelBranch, segment]);

  const value = {
    period,
    setPeriod,
    hotelBranch,
    setHotelBranch,
    segment,
    setSegment,
    filteredReservations,
    hotelBranchOptions: HOTEL_BRANCHES,
    segmentOptions: MARKET_SEGMENTS,
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
