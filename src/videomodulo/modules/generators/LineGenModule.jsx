// LineGenModule — 2D pattern generator
// 8HP — lines, grid, circle, spiral, lissajous
// Pure math → points output, like Wireframe but flat

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { points, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const SHAPES = ['line', 'grid', 'circle', 'spiral', 'lissa']
const RESOLUTION = 64

function generate(shape, freq, density, phase, t) {
  const pts = []
  const edges = []
  const f = 0.5 + (freq / 100) * 9.5
  const d = Math.max(2, Math.round((density / 100) * 16))

  switch (shape) {
    case 'line': {
      // Parallel lines that shift over time
      const count = d
      for (let l = 0; l < count; l++) {
        const y = (l + 0.5) / count
        const offset = Math.sin(t * f + l * 0.5) * 0.05
        const i0 = pts.length
        pts.push({ x: 0.05, y: y + offset })
        pts.push({ x: 0.95, y: y + offset })
        edges.push([i0, i0 + 1])
      }
      break
    }
    case 'grid': {
      // Grid that warps over time
      const count = d
      for (let i = 0; i <= count; i++) {
        const t0 = (i / count)
        // Horizontal lines
        const hi0 = pts.length
        for (let j = 0; j <= RESOLUTION / 4; j++) {
          const x = j / (RESOLUTION / 4)
          const warp = Math.sin(x * Math.PI * f + t + i) * 0.02
          pts.push({ x: 0.05 + x * 0.9, y: 0.05 + t0 * 0.9 + warp })
        }
        for (let j = 0; j < RESOLUTION / 4; j++) edges.push([hi0 + j, hi0 + j + 1])
        // Vertical lines
        const vi0 = pts.length
        for (let j = 0; j <= RESOLUTION / 4; j++) {
          const y = j / (RESOLUTION / 4)
          const warp = Math.sin(y * Math.PI * f + t + i) * 0.02
          pts.push({ x: 0.05 + t0 * 0.9 + warp, y: 0.05 + y * 0.9 })
        }
        for (let j = 0; j < RESOLUTION / 4; j++) edges.push([vi0 + j, vi0 + j + 1])
      }
      break
    }
    case 'circle': {
      // Concentric circles that pulse
      const rings = d
      for (let r = 0; r < rings; r++) {
        const radius = (0.1 + (r / rings) * 0.35) * (1 + Math.sin(t * f + r) * 0.1)
        const i0 = pts.length
        const segs = Math.max(12, RESOLUTION / 2)
        for (let i = 0; i < segs; i++) {
          const a = (i / segs) * Math.PI * 2
          pts.push({ x: 0.5 + Math.cos(a) * radius, y: 0.5 + Math.sin(a) * radius })
        }
        for (let i = 0; i < segs; i++) edges.push([i0 + i, i0 + (i + 1) % segs])
      }
      break
    }
    case 'spiral': {
      // Expanding spiral
      const turns = 1 + (d / 4)
      const i0 = pts.length
      for (let i = 0; i < RESOLUTION; i++) {
        const n = i / RESOLUTION
        const a = n * turns * Math.PI * 2 + t * f
        const r = n * 0.4
        pts.push({ x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r })
      }
      for (let i = 0; i < RESOLUTION - 1; i++) edges.push([i0 + i, i0 + i + 1])
      break
    }
    case 'lissa': {
      // Lissajous figure — freq ratio creates the pattern
      const ratio = 1 + Math.floor(d / 4)
      const i0 = pts.length
      for (let i = 0; i < RESOLUTION; i++) {
        const n = (i / RESOLUTION) * Math.PI * 2
        const x = Math.sin(n * f + t) * 0.4
        const y = Math.cos(n * f * ratio + phase + t * 0.3) * 0.4
        pts.push({ x: 0.5 + x, y: 0.5 + y })
      }
      for (let i = 0; i < RESOLUTION - 1; i++) edges.push([i0 + i, i0 + i + 1])
      edges.push([i0 + RESOLUTION - 1, i0]) // close the loop
      break
    }
  }

  return { pts, edges }
}

export default function LineGenModule({ id = 'line1', init }) {
  const [shape, setShape] = useState(init?.shape ?? 'circle')
  const [freq, setFreq] = useState(init?.freq ?? 20)
  const [density, setDensity] = useState(init?.density ?? 50)
  const [speed, setSpeed] = useState(init?.speed ?? 50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const shapeRef = useRef('circle')
  const freqRef = useRef(20)
  const densityRef = useRef(50)
  const speedRef = useRef(50)
  const outRef = useRef(null)
  const freqInRef = useRef(null)
  const densInRef = useRef(null)
  const spdInRef = useRef(null)

  enabledRef.current = enabled
  shapeRef.current = shape
  freqRef.current = freq
  densityRef.current = density
  speedRef.current = speed

  const conns = routing?.connections || []
  const freqConn = conns.some(c => c.toModuleId === id && c.toPort === 'freq')
  const densConn = conns.some(c => c.toModuleId === id && c.toPort === 'dens')
  const spdConn = conns.some(c => c.toModuleId === id && c.toPort === 'spd')

  useModule({
    id,
    inputs: {
      freq: { type: 'scalar' },
      dens: { type: 'scalar' },
      spd: { type: 'scalar' },
    },
    outputs: { out: { type: 'points' } },
    process: (inputs, dt, t) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      freqInRef.current = inputs.freq
      densInRef.current = inputs.dens
      spdInRef.current = inputs.spd

      const f = inputs.freq ? readScalar(inputs.freq) : freqRef.current
      const d = inputs.dens ? readScalar(inputs.dens) : densityRef.current
      const s = inputs.spd ? readScalar(inputs.spd) / 50 : speedRef.current / 50

      const { pts, edges: edgeList } = generate(shapeRef.current, f, d, t * s, t * s)
      const out = points(pts, edgeList)
      outRef.current = out
      return { out }
    },
  })

  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '0 2px' }

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="LineGen" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Selector value={shape} options={SHAPES} onChange={setShape} />
        <div style={rowStyle}>
          <JackSocket type="in" port="freq" moduleId={id} active={freqConn} signalRef={freqInRef} label="in" size="sm" />
          <Knob value={freq} onChange={setFreq} label="frq" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="dens" moduleId={id} active={densConn} signalRef={densInRef} label="in" size="sm" />
          <Knob value={density} onChange={setDensity} label="den" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="spd" moduleId={id} active={spdConn} signalRef={spdInRef} label="in" size="sm" />
          <Knob value={speed} onChange={setSpeed} label="spd" />
        </div>
        <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
      </div>
    </Module>
  )
}
