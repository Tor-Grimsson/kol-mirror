import { useState } from 'react'
import { WIRE_COLORS } from './hall-of-mirrors/wireColors'
import { slugFor } from '../data/moduleRegistry'

/* A patch reads as its signal path: one bar per live channel, in wire colour,
   with the master strip at the end. Cheap, and it distinguishes patches at a
   glance without rendering the actual mixer. */
export function PatchThumb({ patch }) {
  /* A save since 2026-10-15 carries its own frame — that IS the patch. A shipped
     patch (or a starter copied from one) shows its output captured at build time,
     `pnpm generate-patch-thumbs` → /previews/patches/. The wiring drawing is the
     last resort, for an old save with neither. */
  const [missing, setMissing] = useState(false)
  if (patch.thumb) return <img src={patch.thumb} alt={patch.name || ''} className="size-full object-cover" />
  const shipped = (patch.seedOf || (patch.preset ? patch.id : '')).split(':').pop()
  if (shipped && !missing) return <img src={`/previews/patches/${shipped}.jpg`} alt={patch.name || ''} className="size-full object-cover" onError={() => setMissing(true)} />
  return <PatchWiring patch={patch} />
}

function PatchWiring({ patch }) {
  const chans = (patch.data?.channels || []).filter((c) => c.variantId)
  const inputs = patch.data?.master?.inputs || []
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
      {chans.map((c, i) => {
        const y = 8 + i * 10
        const patched = inputs.includes(i)
        return (
          <g key={i} opacity={patched ? 1 : 0.3}>
            <line x1="6" y1={y} x2="70" y2={y} stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <circle cx="6" cy={y} r="2.5" fill={WIRE_COLORS[i % WIRE_COLORS.length]} />
            {patched && <line x1="70" y1={y} x2="86" y2="20" stroke={WIRE_COLORS[i % WIRE_COLORS.length]} strokeWidth="1" opacity="0.6" vectorEffect="non-scaling-stroke" />}
          </g>
        )
      })}
      <rect x="86" y="12" width="8" height="16" fill="none" stroke="currentColor" strokeWidth="1" className="text-fg-32" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* A REGISTRY patch's cover — its captured OUTPUT (`pnpm generate-previews --kind patches`), the honest blank while
   the file is missing. Never the module glyph: that is the UI of the tool, not what the patch makes. */
export function PatchOutput({ entry }) {
  const [missing, setMissing] = useState(false)
  if (missing) return <div className="size-full bg-surface-secondary" />
  return <img src={`/previews/patches/${slugFor(entry)}.jpg`} alt={entry.name} className="size-full object-cover" onError={() => setMissing(true)} />
}
