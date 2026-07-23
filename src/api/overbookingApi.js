// Collection of overbooking API calls
import instance from "./axios";

export const getOverbookingSummary = (dateFrom, dateTo) =>
  instance.get("/api/overbooking/summary", {
    params: { date_from: dateFrom, date_to: dateTo },
  });
