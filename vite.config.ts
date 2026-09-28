import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The built site is published from the separate public Pages repository.
  base: '/BlackJackGame-Pages/',
})
