import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración mínima: React + servidor de desarrollo en el puerto 5173.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    // En desarrollo, las llamadas a /api viajan al servidor del puerto
    // 3001 (el mismo que en producción). Hay que tenerlo encendido con
    // "npm run servidor" en otra terminal.
    proxy: {
      "/api": { target: "http://127.0.0.1:3001", changeOrigin: true },
    },
  },
});
