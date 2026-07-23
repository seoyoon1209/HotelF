// AI 데모: 연관 요인 분석 / 추천 마케팅 시나리오 (실제 LLM 호출) API
import instance from "./axios";

export const getAiInsight = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}/ai-insight/`);
