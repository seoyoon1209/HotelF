// Collection of prediction API calls
import instance from "./axios";

export const getPredictionsByReservation = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/predictions/`);

export const createPrediction = (reservationId) =>
  instance.post(`/api/reservations/${reservationId}/predictions/`);

export const getModelInfo = () => instance.get("/api/model-info/");
