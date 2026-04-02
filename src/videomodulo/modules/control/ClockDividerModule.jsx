// ClockDividerModule — divide incoming clock by N
// 4HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const DIVISIONS = ['2', '4', '8', '16']
const GATE_DURATION = 0.03 // 30ms pulse

export default function ClockDividerModule({ id = 'cdiv1' }) {
  const [division, setDivision] = useState('4')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const divRef = useRef('4')
  const enabledRef = useRef(true)
  const prevRef = useRef(false)
  const countRef = useRef(0)
  const gateTimerRef = useRef(0)
  const outputRef = useRef(null)
  const inRef = useRef(null)

  divRef.current = division
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')

  useModule({
    id,
    inputs: { in: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outputRef.current = null; return { out: null } }
      inRef.current = inputs.in

      gateTimerRef.current = Math.max(0, gateTimerRef.current - dt)

      // Rising edge detection
      const high = readScalar(inputs.in) > 50
      if (high && !prevRef.current) {
        countRef.current++
        const n = parseInt(divRef.current, 10)
        if (countRef.current >= n) {
          countRef.current = 0
          gateTimerRef.current = GATE_DURATION
        }
      }
      prevRef.current = high

      const out = scalar(gateTimerRef.current > 0 ? 100 : 0)
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
        <ModuleHeader label="Div" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <Selector value={division} options={DIVISIONS} onChange={setDivision} />

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
