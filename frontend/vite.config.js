import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/auth": "http://localhost:3000",
      "/purchases": "http://localhost:3000",
      "/tickets": "http://localhost:3000",
      "/user": "http://localhost:3000",
      "/uploads": "http://localhost:3000",
      "/geofence": "http://localhost:3000",
      "/ambassadors": "http://localhost:3000",
      "/admin": "http://localhost:3000",
    },
  },
  build: {
    outDir: "dist",
  },
});
