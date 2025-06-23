import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request that starts with /api will be forwarded:
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  hmr: {
    overlay: false,  // Disable the full-screen red error overlay
  },
});

