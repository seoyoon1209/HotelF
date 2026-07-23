// Collection of reservation_action API calls. Records of "Apply" clicked in the simulator.
import instance from "./axios";

export const createReservationAction = (reservationId, payload) =>
  instance.post(`/api/reservations/${reservationId}/actions/`, payload);

export const getReservationActions = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/actions/`);

export const getActionReport = (weeks = 4) =>
  instance.get("/api/actions/report/", { params: { weeks } });
