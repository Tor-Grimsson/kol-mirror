// SampleHoldModule — sample & hold with slew
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function SampleHoldModule({ id = 'sh1' }) {
  const [smooth, setSmooth] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const smoothRef = useRef(0)
  const enabledRef = useRef(true)
  const prevTrigRef = useRef(false)
  const heldRef = useRef(0)
  const currentRef = useRef(0)
  const outRef = useRef(null)
  const inRef = useRef(null)
  const trigRef = useRef(null)

  smoothRef.current = smooth
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')
  const trigConnected = conns.some(c => c.toModuleId === id && c.toPort === 'trig')

  useModule({
    id,
    inputs: { in: { type: 'scalar' }, trig: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      inRef.current = inputs.in
      trigRef.current = inputs.trig

      // Rising edge detection on trig
      const trigVal = readScalar(inputs.trig)
      const trigHigh = trigVal > 50
      if (trigHigh && !prevTrigRef.current) {
        heldRef.current = readScalar(inputs.in)
      }
      prevTrigRef.current = trigHigh

      // Slew toward held value
      const target = heldRef.current
      const sm = smoothRef.current
      if (sm === 0) {
        currentRef.current = target
      } else {
        const rate = dt * (10 - sm / 10)
        const diff = target - currentRef.current
        currentRef.current += diff * Math.min(1, rate)
      }

      const out = scalar(currentRef.current)
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
        <ModuleHeader label="S&H" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Knob value={smooth} onChange={setSmooth} label="slew" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <JackSocket type="in" port="trig" moduleId={id} active={trigConnected} signalRef={trigRef} label="trig" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
