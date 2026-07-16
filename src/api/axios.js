// 공용 axios 인스턴스. 도메인별 api 파일(hotelApi.js 등)은 전부 이걸 통해 요청을 보낸다.
import axios from "axios";

// 로컬 개발(import.meta.env.DEV): baseURL "" → vite 프록시(/api → 백엔드)가 처리
// 배포(import.meta.env.PROD): 빌드 시 환경변수 VITE_API_BASE 로 백엔드 절대주소 지정
const baseURL =
  import.meta.env.VITE_API_BASE ?? (import.meta.env.PROD ? "" : "");

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
