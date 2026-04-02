// SwitchModule — CV-controlled A/B signal switch
// 4HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function SwitchModule({ id = 'sw1' }) {
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const outputRef = useRef(null)
  const aInRef = useRef(null)
  const bInRef = useRef(null)
  const cvInRef = useRef(null)

  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')
  const cvConnected = conns.some(c => c.toModuleId === id && c.toPort === 'cv')

  useModule({
    id,
    inputs: {
      a: { type: 'any' },
      b: { type: 'any' },
      cv: { type: 'scalar' },
    },
    outputs: { out: { type: 'any' } },
    process: (inputs) => {
      if (!enabledRef.current) { outputRef.current = null; return { out: null } }
      aInRef.current = inputs.a
      bInRef.current = inputs.b
      cvInRef.current = inputs.cv

      const out = readScalar(inputs.cv) > 50 ? inputs.b : inputs.a
      outputRef.current = out
      return { out: out || null }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Switch" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aInRef} label="a" />
            <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bInRef} label="b" />
          </div>
          <JackSocket type="in" port="cv" moduleId={id} active={cvConnected} signalRef={cvInRef} label="cv" />
          <div style={{ width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outputRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
