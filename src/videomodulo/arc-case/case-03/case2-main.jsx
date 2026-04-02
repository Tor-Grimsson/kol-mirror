import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../../index.css'
import Case2Workspace from './Case2Workspace.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Case2Workspace />
  </StrictMode>,
)
