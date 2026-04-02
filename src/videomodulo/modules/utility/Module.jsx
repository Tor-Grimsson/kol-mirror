// Module wrapper — front panel with screw holes and safe content area
// Handles: panel background, rail dead zone, screw holes
// Children render inside the safe zone between the screw rows

import { MODULE_PADDING } from './eurorack'

export default function Module({ children, className = 'bg-surface-secondary' }) {
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
      <div style={{ flex: 1, overflow: 'hidden', padding: '0 4px' }}>
        {children}
      </div>
    </div>
  )
}
