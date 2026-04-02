// RingModModule — ring modulator
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function RingModModule({ id = 'ring1' }) {
  const [depth, setDepth] = useState(100)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const depthRef = useRef(100)
  const enabledRef = useRef(true)
  const outRef = useRef(null)
  const aRef = useRef(null)
  const bRef = useRef(null)

  depthRef.current = depth
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')

  useModule({
    id,
    inputs: { a: { type: 'scalar' }, b: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      aRef.current = inputs.a
      bRef.current = inputs.b

      const aVal = readScalar(inputs.a)
      const bVal = readScalar(inputs.b)
      const d = depthRef.current / 100
      const wet = aVal * bVal / 100
      const out = scalar(aVal * (1 - d) + wet * d)
      outRef.current = out
      return { out }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Ring" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Knob value={depth} onChange={setDepth} label="depth" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aRef} label="a" />
          <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bRef} label="b" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
