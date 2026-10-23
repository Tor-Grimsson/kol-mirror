import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { hideLoaderApp } from '@kolkrabbi/kol-framework/src/loaderApp.js'

// Theme boot is kol-framework's THEME_BOOT_SCRIPT, and the dev tab's favicon is its
// devFavicon — both written into index.html by vite.config.js, so nothing runs here.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/* The app loader (kol-framework's loaderApp, written into index.html by vite.config.js) leaves once React has painted. */
hideLoaderApp()
