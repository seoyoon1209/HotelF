// Collection of reservation_action API calls. Records of "Apply" clicked in the simulator.
import instance from "./axios";

export const createReservationAction = (reservationId, payload) =>
  instance.post(`/api/reservations/${reservationId}/actions/`, payload);

export const getReservationActions = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/actions/`);

// Reverts an action ("mark as not taken"): removes the reservation's action records.
export const deleteReservationActions = (reservationId) =>
  instance.delete(`/api/reservations/${reservationId}/actions/`);

export const getActionReport = (weeks = 4) =>
  instance.get("/api/actions/report/", { params: { weeks } });

// Detailed per-reservation export for CSV (one row per reservation, latest action attached).
export const getActionExport = () => instance.get("/api/actions/export/");
