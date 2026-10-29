import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// Dev: Vite serves the UI on :5173 and proxies API + WebSocket to the FastAPI
// backend on :8000, so the frontend code can use same-origin relative URLs.
//
// Web demo (`--mode web`, or VITE_TWIN=browser): the torso twin runs in the page
// (src/lib/twin.ts) instead of the backend, so the build is plain static files in
// dist-web/ — kept apart from dist/, which the Pi backend serves. A relative base
// lets that bundle run from any path (e.g. GitHub Pages under /pi_pumpsim/).
export default defineConfig(({ mode }) => {
  const web = mode === 'web' || loadEnv(mode, '.').VITE_TWIN === 'browser'
  return {
    plugins: [svelte()],
    base: web ? './' : '/',
    define: web ? { 'import.meta.env.VITE_TWIN': JSON.stringify('browser') } : {},
    build: web ? { outDir: 'dist-web' } : {},
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': 'http://localhost:8000',
        '/ws': { target: 'ws://localhost:8000', ws: true },
      },
    },
  }
})
