import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Keep local dev rooted while publishing the build under its Pages path.
  base: command === 'build' ? '/BlackJackGame/' : '/',
}))
