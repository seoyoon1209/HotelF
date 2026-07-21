// reservation_action API 호출 모음. 시뮬레이터에서 "실제 적용"을 누른 기록.
import instance from "./axios";

export const createReservationAction = (reservationId, payload) =>
  instance.post(`/api/reservations/${reservationId}/actions/`, payload);

export const getReservationActions = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/actions/`);

export const getActionReport = (weeks = 4) =>
  instance.get("/api/actions/report/", { params: { weeks } });
