// overbooking API 호출 모음. 백엔드 router/OverbookingRouter.py와 1:1 대응.
import instance from "./axios";

export const getOverbookingSummary = (dateFrom, dateTo) =>
  instance.get("/api/overbooking/summary", {
    params: { date_from: dateFrom, date_to: dateTo },
  });
