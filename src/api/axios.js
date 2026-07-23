// Shared axios instance
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
