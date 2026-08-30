import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Theme boot is kol-framework's THEME_BOOT_SCRIPT, inlined into index.html by
// vite.config.js — it stamps data-theme pre-paint and owns the legacy-key
// reset, so nothing runs here.

// Dev-only favicon — big MR so the dev tab is unmistakable. Dead-code-eliminated
// from production builds; prod keeps /svg/favicon.svg from index.html.
if (import.meta.env.DEV) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#49A0A2"/><text x="16" y="28" font-family="Arial Black, Arial, sans-serif" font-size="30" font-weight="900" text-anchor="middle" textLength="31" lengthAdjust="spacingAndGlyphs" fill="#000">W</text></svg>`
  const link = document.querySelector('link[rel="icon"]')
  if (link) {
    link.type = 'image/svg+xml'
    link.href = 'data:image/svg+xml,' + encodeURIComponent(svg)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
