import { TOTAL_HP, ASPECT, RAIL_HEIGHT, hpToPercent } from './eurorack'

export function HP(hp) {
  return { width: `${hpToPercent(hp)}%`, flexShrink: 0, height: '100%', overflow: 'hidden' }
}

const SLOTS = Array.from({ length: TOTAL_HP }, (_, i) => i)

const FRAME_COLOR = 'linear-gradient(180deg, #8a8680 0%, #7a7670 50%, #6a6660 100%)'
const SIDE_COLOR = 'linear-gradient(90deg, #7a7670 0%, #8a8680 50%, #7a7670 100%)'

function Rail() {
  return (
    <div style={{
      height: RAIL_HEIGHT,
      background: FRAME_COLOR,
      display: 'flex',
      alignItems: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.2)',
    }}>
      {SLOTS.map(i => (
        <div key={i} style={{
          width: `${100 / TOTAL_HP}%`,
          display: 'flex',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            backgroundColor: '#555',
            boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.6)',
          }} />
        </div>
      ))}
    </div>
  )
}

export function RackRow({ height = '3u', children }) {
  return (
    <div className="relative" style={{ width: '100%', aspectRatio: ASPECT[height] || ASPECT['3u'] }}>
      {/* Layer 0: case background */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: '#141414', zIndex: 0 }} />
      {/* Layer 1: rails — visible in empty HP space */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}><Rail /></div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }}><Rail /></div>
      {/* Layer 2: modules/panels — cover rails where they exist */}
      <div className="relative flex flex-row" style={{ width: '100%', height: '100%', zIndex: 2 }}>
        {children}
      </div>
    </div>
  )
}

export default function Case({ children }) {
  return (
    <div style={{ width: '100%', maxWidth: 1400, padding: '0 24px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', padding: '3px 0' }}>
        <div className="bg-opacity-hex-12" style={{ width: 24, flexShrink: 0, borderRadius: 4, margin: '-3px 0' }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 2px' }}>
          {children}
        </div>
        <div className="bg-opacity-hex-12" style={{ width: 24, flexShrink: 0, borderRadius: 4, margin: '-3px 0' }} />
      </div>
    </div>
  )
}
