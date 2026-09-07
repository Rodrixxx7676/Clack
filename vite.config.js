import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración mínima: React + servidor de desarrollo en el puerto 5173.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: false },
});
