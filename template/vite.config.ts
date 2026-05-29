import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` defaults to "/" for local dev and the scaffolded skill app.
// The GitHub Pages deploy sets VITE_BASE=/wcag-explainer/ so assets resolve
// under the repo subpath.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
})
