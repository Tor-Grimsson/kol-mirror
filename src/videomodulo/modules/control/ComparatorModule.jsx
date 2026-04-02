// ComparatorModule — threshold comparator, outputs gate
// 4HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function ComparatorModule({ id = 'cmp1' }) {
  const [threshold, setThreshold] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const threshRef = useRef(50)
  const enabledRef = useRef(true)
  const outputRef = useRef(null)
  const inRef = useRef(null)

  threshRef.current = threshold
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')

  useModule({
    id,
    inputs: { in: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outputRef.current = null; return { out: null } }
      inRef.current = inputs.in

      const out = scalar(readScalar(inputs.in) > threshRef.current ? 100 : 0)
      outputRef.current = out
      return { out }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Cmp" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <Knob value={threshold} onChange={setThreshold} label="thr" />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          </div>
          <div style={{ width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="out" port="out" moduleId={id} signalRef={outputRef} label="out" />
          </div>
        </div>
      </div>
    </Module>
  )
}
