// Module wrapper — front panel with screw holes and safe content area
// Handles: panel background, rail dead zone, screw holes
// Children render inside the safe zone between the screw rows

import { MODULE_PADDING } from './eurorack'

function ScrewHole() {
  return (
    <div style={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      backgroundColor: '#1a1a1a',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8), 0 0 1px rgba(255,255,255,0.05)',
    }} />
  )
}

function ScrewRow() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 8px', flexShrink: 0 }}>
      <ScrewHole />
      <ScrewHole />
    </div>
  )
}

export default function Module({ children, className = 'bg-opacity-hex-64' }) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: `${MODULE_PADDING}px 0`,
      }}
    >
      <ScrewRow />
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 4px' }}>
        {children}
      </div>
      <ScrewRow />
    </div>
  )
}
