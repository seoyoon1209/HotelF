// Vite 설정. src 절대경로 alias + 개발 서버에서 /api 요청을 로컬 FastAPI(8000)로 프록시.
// 배포 환경에서는 이 프록시가 없으니 src/api/axios.js의 VITE_API_BASE로 백엔드 주소를 지정해야 함.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000", // 로컬 FastAPI
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
