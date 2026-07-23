// AI demo: correlated factor analysis / recommended marketing scenario (real LLM call) API
import instance from "./axios";

export const getAiInsight = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/ai-insight/`);
