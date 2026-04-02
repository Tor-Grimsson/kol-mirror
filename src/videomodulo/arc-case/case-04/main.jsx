import React from 'react'
import ReactDOM from 'react-dom/client'
import '../../../index.css'

function Case03() {
  return (
    <div style={{ background: '#0a0a0a', color: '#e5e5e5', fontFamily: "'SF Mono', 'Fira Code', monospace", minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#525252', fontSize: 13 }}>Case 03 — awaiting patch</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Case03 />)
