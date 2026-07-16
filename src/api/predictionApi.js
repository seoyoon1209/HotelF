// prediction API 호출 모음. 백엔드 router/PredictionRouter.py와 1:1 대응.
import instance from "./axios";

export const getPredictionsByReservation = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/predictions/`);
