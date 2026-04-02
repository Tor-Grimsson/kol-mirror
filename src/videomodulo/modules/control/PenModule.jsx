// PenModule — visual style control for drawn signals
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { pen, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const CAPS = ['round', 'square', 'butt']

export default function PenModule({ id = 'pen1' }) {
  const [thickness, setThickness] = useState(15)  // 0-100 maps to 0.5-10
  const [dash, setDash] = useState(0)
  const [gap, setGap] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const [cap, setCap] = useState('round')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const thkRef = useRef(15)
  const dshRef = useRef(0)
  const gapRef = useRef(0)
  const opRef = useRef(100)
  const capRef = useRef('round')
  const outRef = useRef(null)
  const thkInRef = useRef(null)
  const dshInRef = useRef(null)
  const gapInRef = useRef(null)
  const opInRef = useRef(null)

  enabledRef.current = enabled
  thkRef.current = thickness
  dshRef.current = dash
  gapRef.current = gap
  opRef.current = opacity
  capRef.current = cap

  const conns = routing?.connections || []
  const thkConn = conns.some(c => c.toModuleId === id && c.toPort === 'tk')
  const dshConn = conns.some(c => c.toModuleId === id && c.toPort === 'ds')
  const gapConn = conns.some(c => c.toModuleId === id && c.toPort === 'gp')
  const opConn = conns.some(c => c.toModuleId === id && c.toPort === 'op')

  useModule({
    id,
    inputs: {
      tk: { type: 'scalar' },
      ds: { type: 'scalar' },
      gp: { type: 'scalar' },
      op: { type: 'scalar' },
    },
    outputs: { out: { type: 'pen' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      thkInRef.current = inputs.tk
      dshInRef.current = inputs.ds
      gapInRef.current = inputs.gp
      opInRef.current = inputs.op

      const t = inputs.tk ? readScalar(inputs.tk) : thkRef.current
      const d = inputs.ds ? readScalar(inputs.ds) : dshRef.current
      const g = inputs.gp ? readScalar(inputs.gp) : gapRef.current
      const o = inputs.op ? readScalar(inputs.op) : opRef.current

      const out = pen({
        thickness: 0.5 + (t / 100) * 9.5,
        dash: (d / 100) * 20,
        gap: (g / 100) * 20,
        opacity: o,
        cap: capRef.current,
      })
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
        <ModuleHeader label="Pen" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <div style={rowStyle}>
          <JackSocket type="in" port="tk" moduleId={id} active={thkConn} signalRef={thkInRef} label="in" size="sm" />
          <Knob value={thickness} onChange={setThickness} label="thk" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="ds" moduleId={id} active={dshConn} signalRef={dshInRef} label="in" size="sm" />
          <Knob value={dash} onChange={setDash} label="dsh" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="gp" moduleId={id} active={gapConn} signalRef={gapInRef} label="in" size="sm" />
          <Knob value={gap} onChange={setGap} label="gap" />
        </div>
        <div style={rowStyle}>
          <JackSocket type="in" port="op" moduleId={id} active={opConn} signalRef={opInRef} label="in" size="sm" />
          <Knob value={opacity} onChange={setOpacity} label="op" />
        </div>

        <Selector value={cap} options={CAPS} onChange={setCap} />

        <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
      </div>
    </Module>
  )
}
