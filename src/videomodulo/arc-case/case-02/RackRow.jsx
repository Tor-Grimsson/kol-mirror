/**
 * RackRow — a horizontal rack rail that modules snap into.
 * height: '1u' or '3u'
 */
const ROW_HEIGHTS = {
  '1u': 120,
  '3u': 380,
}

export default function RackRow({ height = '3u', children }) {
  const h = ROW_HEIGHTS[height] || ROW_HEIGHTS['3u']

  return (
    <div
      className="relative flex flex-row border-b border-fg-08"
      style={{
        height: `${h}px`,
        overflow: 'hidden',
      }}
    >
      {/* Rail edges */}
      <div className="absolute top-0 left-0 right-0 h-px bg-fg-08" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-fg-08" />

      {/* Modules */}
      {children}
    </div>
  )
}
