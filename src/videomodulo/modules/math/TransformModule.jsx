// TransformModule — 2D/3D transform on points signals
// 8HP — translate, scale, rotate XYZ with CV inputs
// X/Y rotation simulates 3D via projection

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { points, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function TransformModule({ id = 'xfm1', init }) {
  const [posX, setPosX] = useState(init?.posX ?? 50)
  const [posY, setPosY] = useState(init?.posY ?? 50)
  const [scale, setScale] = useState(init?.scale ?? 50)
  const [rotX, setRotX] = useState(init?.rotX ?? 0)
  const [rotY, setRotY] = useState(init?.rotY ?? 0)
  const [rotZ, setRotZ] = useState(init?.rotZ ?? 0)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const posXRef = useRef(50)
  const posYRef = useRef(50)
  const scaleRef = useRef(50)
  const rotXRef = useRef(0)
  const rotYRef = useRef(0)
  const rotZRef = useRef(0)
  const outRef = useRef(null)
  const inRef = useRef(null)
  const xInRef = useRef(null)
  const yInRef = useRef(null)
  const sInRef = useRef(null)
  const rxInRef = useRef(null)
  const ryInRef = useRef(null)
  const rzInRef = useRef(null)

  enabledRef.current = enabled
  posXRef.current = posX
  posYRef.current = posY
  scaleRef.current = scale
  rotXRef.current = rotX
  rotYRef.current = rotY
  rotZRef.current = rotZ

  const conns = routing?.connections || []
  const inConn = conns.some(c => c.toModuleId === id && c.toPort === 'in')
  const xConn = conns.some(c => c.toModuleId === id && c.toPort === 'x')
  const yConn = conns.some(c => c.toModuleId === id && c.toPort === 'y')
  const sConn = conns.some(c => c.toModuleId === id && c.toPort === 's')
  const rxConn = conns.some(c => c.toModuleId === id && c.toPort === 'rx')
  const ryConn = conns.some(c => c.toModuleId === id && c.toPort === 'ry')
  const rzConn = conns.some(c => c.toModuleId === id && c.toPort === 'rz')

  useModule({
    id,
    inputs: {
      in: { type: 'points' },
      x: { type: 'scalar' },
      y: { type: 'scalar' },
      s: { type: 'scalar' },
      rx: { type: 'scalar' },
      ry: { type: 'scalar' },
      rz: { type: 'scalar' },
    },
    outputs: { out: { type: 'points' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      inRef.current = inputs.in
      xInRef.current = inputs.x
      yInRef.current = inputs.y
      sInRef.current = inputs.s
      rxInRef.current = inputs.rx
      ryInRef.current = inputs.ry
      rzInRef.current = inputs.rz

      if (!inputs.in || inputs.in.type !== 'points') {
        outRef.current = null
        return { out: null }
      }

      const tx = ((inputs.x ? readScalar(inputs.x) : posXRef.current) - 50) / 50
      const ty = ((inputs.y ? readScalar(inputs.y) : posYRef.current) - 50) / 50
      const s = (inputs.s ? readScalar(inputs.s) : scaleRef.current) / 50
      const ax = (inputs.rx ? readScalar(inputs.rx) : rotXRef.current) / 100 * Math.PI * 2
      const ay = (inputs.ry ? readScalar(inputs.ry) : rotYRef.current) / 100 * Math.PI * 2
      const az = (inputs.rz ? readScalar(inputs.rz) : rotZRef.current) / 100 * Math.PI * 2

      const cosX = Math.cos(ax), sinX = Math.sin(ax)
      const cosY = Math.cos(ay), sinY = Math.sin(ay)
      const cosZ = Math.cos(az), sinZ = Math.sin(az)

      const srcPts = inputs.in.value
      const transformed = srcPts.map(pt => {
        let cx = pt.x - 0.5
        let cy = pt.y - 0.5
        let cz = 0

        // Rotate X axis (tilts forward/back)
        let y1 = cy * cosX - cz * sinX
        let z1 = cy * sinX + cz * cosX

        // Rotate Y axis (turns left/right)
        let x2 = cx * cosY + z1 * sinY
        let z2 = -cx * sinY + z1 * cosY

        // Rotate Z axis (spins flat)
        let x3 = x2 * cosZ - y1 * sinZ
        let y3 = x2 * sinZ + y1 * cosZ

        // Perspective projection (simple, fov=3)
        const pScale = 3 / (3 + z2)

        return {
          x: x3 * pScale * s + 0.5 + tx * 0.5,
          y: y3 * pScale * s + 0.5 + ty * 0.5,
        }
      })

      const out = points(transformed, inputs.in.edges)
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
        <ModuleHeader label="Xform" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={{ display: 'flex', gap: 4, width: '100%', padding: '0 2px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={rowStyle}>
              <JackSocket type="in" port="x" moduleId={id} active={xConn} signalRef={xInRef} label="cv" size="sm" />
              <Knob value={posX} onChange={setPosX} label="x" />
            </div>
            <div style={rowStyle}>
              <JackSocket type="in" port="y" moduleId={id} active={yConn} signalRef={yInRef} label="cv" size="sm" />
              <Knob value={posY} onChange={setPosY} label="y" />
            </div>
            <div style={rowStyle}>
              <JackSocket type="in" port="s" moduleId={id} active={sConn} signalRef={sInRef} label="cv" size="sm" />
              <Knob value={scale} onChange={setScale} label="scl" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
            <div style={rowStyle}>
              <JackSocket type="in" port="rx" moduleId={id} active={rxConn} signalRef={rxInRef} label="cv" size="sm" />
              <Knob value={rotX} onChange={setRotX} label="rX" />
            </div>
            <div style={rowStyle}>
              <JackSocket type="in" port="ry" moduleId={id} active={ryConn} signalRef={ryInRef} label="cv" size="sm" />
              <Knob value={rotY} onChange={setRotY} label="rY" />
            </div>
            <div style={rowStyle}>
              <JackSocket type="in" port="rz" moduleId={id} active={rzConn} signalRef={rzInRef} label="cv" size="sm" />
              <Knob value={rotZ} onChange={setRotZ} label="rZ" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConn} signalRef={inRef} label="in" />
          <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
