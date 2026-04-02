// VCAModule — voltage-controlled amplifier, CV modulates signal level
// 4HP 1U, no knobs — the CV input IS the control

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function VCAModule({ id = 'vca1' }) {
  const [enabled, setEnabled] = useState(true)
  const enabledRef = useRef(true)
  const routing = usePatchRouting()
  enabledRef.current = enabled

  const outRef = useRef(null)
  const inRef = useRef(null)
  const cvRef = useRef(null)

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')
  const cvConnected = conns.some(c => c.toModuleId === id && c.toPort === 'cv')

  useModule({
    id,
    inputs: { in: { type: 'scalar' }, cv: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      inRef.current = inputs.in
      cvRef.current = inputs.cv
      const out = scalar(readScalar(inputs.in) * (readScalar(inputs.cv) / 100))
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
        <ModuleHeader label="VCA" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <JackSocket type="in" port="cv" moduleId={id} active={cvConnected} signalRef={cvRef} label="cv" />
          <div style={{ width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
