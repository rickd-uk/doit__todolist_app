import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // Important for Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Important for file changes in containers
    },
    proxy: {
      "/api": {
        target: "http://10.89.1.20:3000",
        changeOrigin: true,
      },
    },
  },
});
