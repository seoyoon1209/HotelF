import instance from "./axios";

export const getReservations = () => instance.get("/api/reservations/");
export const getReservationById = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}`);
