// hotel API 호출 모음. 백엔드 router/HotelRouter.py와 1:1 대응.
// 등록/수정
import instance from "./axios";

export const getHotels = () => instance.get("/api/hotels/");