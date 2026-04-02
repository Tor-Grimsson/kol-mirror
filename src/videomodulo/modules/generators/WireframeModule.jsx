// WireframeModule — parametric 3D geometry → projected 2D points
// 8HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { points, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const SHAPES = ['cube', 'tetra', 'octa', 'sphere']

function generateGeometry(shape, res) {
  switch (shape) {
    case 'cube': return {
      vertices: [
        [-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],
        [-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1],
      ],
      edges: [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]],
    }
    case 'tetra': return {
      vertices: [[1,1,1],[-1,-1,1],[-1,1,-1],[1,-1,-1]],
      edges: [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]],
    }
    case 'octa': return {
      vertices: [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],
      edges: [[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,4],[2,5],[3,4],[3,5]],
    }
    case 'sphere': {
      const pts = []
      const n = Math.max(8, res)
      for (let i = 0; i < n; i++) {
        const phi = (i / n) * Math.PI * 2
        const theta = Math.acos(2 * (i / n) - 1)
        pts.push([
          Math.sin(theta) * Math.cos(phi),
          Math.sin(theta) * Math.sin(phi),
          Math.cos(theta),
        ])
      }
      const edges = []
      for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n])
      return { vertices: pts, edges }
    }
    default: return { vertices: [], edges: [] }
  }
}

function rotateX(v, a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0], v[1] * c - v[2] * s, v[1] * s + v[2] * c]
}

function rotateY(v, a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c]
}

function rotateZ(v, a) {
  const c = Math.cos(a), s = Math.sin(a)
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]]
}

function project(v, fov) {
  const d = fov
  const scale = d / (d + v[2])
  return { x: 0.5 + v[0] * scale * 0.3, y: 0.5 + v[1] * scale * 0.3 }
}

export default function WireframeModule({ id = 'wire1' }) {
  const [shape, setShape] = useState('cube')
  const [speed, setSpeed] = useState(50)
  const [scale, setScale] = useState(50)
  const [resolution, setResolution] = useState(50)
  const [fov, setFov] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const shapeRef = useRef('cube')
  const speedRef = useRef(50)
  const scaleRef = useRef(50)
  const resRef = useRef(50)
  const fovRef = useRef(50)
  const prevClkRef = useRef(false)
  const rotRef = useRef({ x: 0, y: 0, z: 0 })
  const outRef = useRef(null)
  const rxInRef = useRef(null)
  const ryInRef = useRef(null)
  const rzInRef = useRef(null)
  const scaleInRef = useRef(null)
  const fovInRef = useRef(null)
  const clkInRef = useRef(null)

  enabledRef.current = enabled
  shapeRef.current = shape
  speedRef.current = speed
  scaleRef.current = scale
  resRef.current = resolution
  fovRef.current = fov

  const conns = routing?.connections || []
  const rxConn = conns.some(c => c.toModuleId === id && c.toPort === 'rx')
  const ryConn = conns.some(c => c.toModuleId === id && c.toPort === 'ry')
  const rzConn = conns.some(c => c.toModuleId === id && c.toPort === 'rz')
  const scaleConn = conns.some(c => c.toModuleId === id && c.toPort === 'scale')
  const clkConn = conns.some(c => c.toModuleId === id && c.toPort === 'clk')
  const fovConn = conns.some(c => c.toModuleId === id && c.toPort === 'fov')

  useModule({
    id,
    inputs: {
      rx: { type: 'scalar' },
      ry: { type: 'scalar' },
      rz: { type: 'scalar' },
      scale: { type: 'scalar' },
      fov: { type: 'scalar' },
      clk: { type: 'scalar' },
    },
    outputs: { out: { type: 'points' } },
    process: (inputs, dt, t) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      rxInRef.current = inputs.rx
      ryInRef.current = inputs.ry
      rzInRef.current = inputs.rz
      scaleInRef.current = inputs.scale
      fovInRef.current = inputs.fov
      clkInRef.current = inputs.clk

      // Clock: reset rotation on rising edge
      const clkHigh = readScalar(inputs.clk) > 50
      if (clkHigh && !prevClkRef.current) rotRef.current = { x: 0, y: 0, z: 0 }
      prevClkRef.current = clkHigh

      const rate = speedRef.current / 50
      rotRef.current.x += dt * rate * 0.7
      rotRef.current.y += dt * rate
      rotRef.current.z += dt * rate * 0.3

      const rx = inputs.rx ? readScalar(inputs.rx) / 100 * Math.PI * 2 : rotRef.current.x
      const ry = inputs.ry ? readScalar(inputs.ry) / 100 * Math.PI * 2 : rotRef.current.y
      const rz = inputs.rz ? readScalar(inputs.rz) / 100 * Math.PI * 2 : rotRef.current.z

      const s = inputs.scale ? readScalar(inputs.scale) / 50 : scaleRef.current / 50
      const res = Math.round(8 + (resRef.current / 100) * 56)
      const f = inputs.fov ? 1 + (readScalar(inputs.fov) / 100) * 5 : 1 + (fovRef.current / 100) * 5

      const geom = generateGeometry(shapeRef.current, res)
      const projected = geom.vertices.map(v => {
        const scaled = [v[0] * s, v[1] * s, v[2] * s]
        let r = rotateX(scaled, rx)
        r = rotateY(r, ry)
        r = rotateZ(r, rz)
        return project(r, f)
      })

      const out = points(projected, geom.edges)
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
        <ModuleHeader label="Wire" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Selector value={shape} options={SHAPES} onChange={setShape} />
        <div style={rowStyle}>
          <JackSocket type="in" port="rx" moduleId={id} active={rxConn} signalRef={rxInRef} label="in" size="sm" />
          <Knob value={speed} onChange={setSpeed} label="spd" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="ry" moduleId={id} active={ryConn} signalRef={ryInRef} label="in" size="sm" />
          <Knob value={scale} onChange={setScale} label="scl" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="rz" moduleId={id} active={rzConn} signalRef={rzInRef} label="in" size="sm" />
          <Knob value={resolution} onChange={setResolution} label="res" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="fov" moduleId={id} active={fovConn} signalRef={fovInRef} label="in" size="sm" />
          <Knob value={fov} onChange={setFov} label="fov" />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <JackSocket type="in" port="scale" moduleId={id} active={scaleConn} signalRef={scaleInRef} label="scl" />
          <JackSocket type="in" port="clk" moduleId={id} active={clkConn} signalRef={clkInRef} label="clk" />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
