import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../index.css'
import SynthWorkspace from './SynthWorkspace.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SynthWorkspace />
  </StrictMode>,
)
