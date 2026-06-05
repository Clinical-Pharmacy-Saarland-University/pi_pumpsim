import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Dev: Vite serves the UI on :5173 and proxies API + WebSocket to the FastAPI
// backend on :8000, so the frontend code can use same-origin relative URLs.
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
})
