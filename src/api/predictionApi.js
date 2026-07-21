// prediction API 호출 모음
import instance from "./axios";

export const getPredictionsByReservation = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/predictions/`);

export const getModelInfo = () => instance.get("/api/model-info/");
