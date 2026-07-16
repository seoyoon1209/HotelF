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
