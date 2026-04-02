import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ModuleIO from './ModuleIO'

const COLORS = ['WHITE', 'PINK', 'BROWN']

export default function NoiseSourceModule({ id = 'nz1', label = 'NOISE', config, onChange, busRef }) {
  const { color = 'WHITE', level = 100, enabled = false } = config || {}
  const rafRef = useRef(null)
  const dotRef = useRef(null)
  const walkRef = useRef(50)
  const pinkStateRef = useRef({ b0: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, b6: 0 })

  useEffect(() => {
    if (!enabled) {
      if (busRef?.current) busRef.current[`${id}_out`] = 0
      walkRef.current = 50
      return
    }

    if (busRef?.current && !(`${id}_out` in busRef.current)) busRef.current[`${id}_out`] = 0

    const tick = () => {
      let output = 0

      if (color === 'WHITE') {
        output = Math.random() * 100
      } else if (color === 'PINK') {
        // Voss-McCartney pink noise approximation
        const ps = pinkStateRef.current
        const white = Math.random() * 2 - 1
        ps.b0 = 0.99886 * ps.b0 + white * 0.0555179
        ps.b1 = 0.99332 * ps.b1 + white * 0.0750759
        ps.b2 = 0.96900 * ps.b2 + white * 0.1538520
        ps.b3 = 0.86650 * ps.b3 + white * 0.3104856
        ps.b4 = 0.55000 * ps.b4 + white * 0.5329522
        ps.b5 = -0.7616 * ps.b5 - white * 0.0168980
        const pink = ps.b0 + ps.b1 + ps.b2 + ps.b3 + ps.b4 + ps.b5 + ps.b6 + white * 0.5362
        ps.b6 = white * 0.115926
        output = Math.max(0, Math.min(100, (pink / 6 + 0.5) * 100))
      } else if (color === 'BROWN') {
        // Brownian / random walk
        const step = (Math.random() - 0.5) * 10
        walkRef.current = Math.max(0, Math.min(100, walkRef.current + step))
        output = walkRef.current
      }

      output = Math.round(output * (level / 100))
      output = Math.max(0, Math.min(100, output))

      if (busRef?.current) busRef.current[`${id}_out`] = output

      if (dotRef.current) {
        dotRef.current.style.opacity = output > 5 ? 1 : (enabled ? 0.6 : 0.15)
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, color, level, id, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const colorIdx = COLORS.indexOf(color)
  const prevColor = () => update('color', COLORS[(colorIdx - 1 + COLORS.length) % COLORS.length])
  const nextColor = () => update('color', COLORS[(colorIdx + 1) % COLORS.length])

  return (
    <div className="flex flex-col h-full bg-surface-secondary border-r border-fg-08">
      {/* Header - 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span ref={dotRef} className="cursor-pointer select-none"
            onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e74c3c', outline: '6px solid transparent', outlineOffset: '0', opacity: 1, boxShadow: enabled ? '0 0 6px 2px #e74c3c' : 'none' }}
          />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
      </div>

      {/* Controls - flex-1, vertical stack */}
      <div className="flex flex-col items-center gap-1 flex-1 py-1 px-1" style={{ overflow: 'hidden' }}>
        {/* Color selector */}
        <div className="flex items-center gap-0.5 w-full justify-center" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={prevColor}>{'\u2039'}</span>
          <span className="text-fg-96" style={{ width: '36px', textAlign: 'center' }}>{color}</span>
          <span className="cursor-pointer text-fg-32 hover:text-fg-64 select-none" onClick={nextColor}>{'\u203a'}</span>
        </div>

        {/* Level knob */}
        <RotaryDial
          label="Level"
          value={level}
          onChange={(v) => update('level', v)}
          size={32}
          defaultValue={100}
          busRef={busRef}
          variant="dense"
        />
      </div>

      {/* I/O at bottom */}
      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[`${id}_out`]}
        inputs={[]}
      />
    </div>
  )
}
