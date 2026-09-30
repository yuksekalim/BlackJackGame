import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Remotion's staticFile() defaults to the domain root. Keep public dealer
// sprites under Vite's configured base path when the game is hosted as a
// GitHub Project Page.
window.remotion_staticBase = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
