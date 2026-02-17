import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Use relative paths for Electron, absolute for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/StreamBox/' : './',
}))
