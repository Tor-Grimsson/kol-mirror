/**
 * RackRow — pair of aluminum rails with module space between.
 * height: '1u' or '3u'
 */
const ROW_HEIGHTS = {
  '1u': 120,
  '3u': 380,
}

const RAIL_H = 8

function Rail() {
  return (
    <div style={{
      height: `${RAIL_H}px`,
      background: 'linear-gradient(180deg, #8a8680 0%, #a09a94 30%, #b0aaa4 50%, #a09a94 70%, #8a8680 100%)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
    }} />
  )
}

export default function RackRow({ height = '3u', children }) {
  const h = ROW_HEIGHTS[height] || ROW_HEIGHTS['3u']

  return (
    <div>
      <Rail />
      <div
        className="relative flex flex-row"
        style={{ height: `${h}px` }}
      >
        {children}
      </div>
      <Rail />
    </div>
  )
}
