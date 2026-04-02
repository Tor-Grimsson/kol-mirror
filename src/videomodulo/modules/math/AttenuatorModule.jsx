// AttenuatorModule — scale a signal by a fixed amount
// 4HP 1U, one knob, one input, one output

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function AttenuatorModule({ id = 'atten1' }) {
  const [level, setLevel] = useState(100)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const levelRef = useRef(100)
  const enabledRef = useRef(true)
  const outRef = useRef(null)
  const inRef = useRef(null)
  levelRef.current = level
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')

  useModule({
    id,
    inputs: { in: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      inRef.current = inputs.in
      const out = scalar(readScalar(inputs.in) * (levelRef.current / 100))
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
        <ModuleHeader label="Atten" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <Knob value={level} onChange={setLevel} label="lvl" />
          <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
