import instance from "./axios";

export const getPredictionsByReservation = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/predictions/`);
