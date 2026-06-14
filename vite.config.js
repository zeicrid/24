import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ganti base sesuai nama repo GitHub kamu untuk deploy ke GitHub Pages.
// Contoh: jika repo bernama "24", maka base: '/24/'
export default defineConfig({
  plugins: [react()],
  base: './',
})
