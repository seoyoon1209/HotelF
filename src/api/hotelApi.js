// hotel API 호출 모음. 백엔드 router/HotelRouter.py와 1:1 대응.
// 등록/수정 등 엔드포인트가 늘어나면 여기에 함수만 추가.
import instance from "./axios";

export const getHotels = () => instance.get("/api/hotels/");