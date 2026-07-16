// reservation API 호출 모음. 백엔드 router/ReservationRouter.py와 1:1 대응.
// 예약 생성/취소 등 백엔드에 엔드포인트가 추가되면 여기에도 함수 추가.
import instance from "./axios";

export const getReservations = () => instance.get("/api/reservations/");
export const getReservationById = (reservationId) =>
  instance.get(`/api/reservations/${reservationId}`);
