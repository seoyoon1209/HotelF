// 공용 axios 인스턴스
import axios from "axios";

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
