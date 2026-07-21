// overbooking API 호출 모음
import instance from "./axios";

export const getOverbookingSummary = (dateFrom, dateTo) =>
  instance.get("/api/overbooking/summary", {
    params: { date_from: dateFrom, date_to: dateTo },
  });
