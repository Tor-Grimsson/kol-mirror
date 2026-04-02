// RampModule — ramp/triangle generator with sync
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const SHAPES = ['up', 'down', 'tri']

export default function RampModule({ id = 'ramp1' }) {
  const [rate, setRate] = useState(20)
  const [shape, setShape] = useState('up')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const rateRef = useRef(20)
  const shapeRef = useRef('up')
  const enabledRef = useRef(true)
  const phaseRef = useRef(0)
  const prevSyncRef = useRef(false)
  const outRef = useRef(null)
  const syncRef = useRef(null)

  rateRef.current = rate
  shapeRef.current = shape
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const syncConnected = conns.some(c => c.toModuleId === id && c.toPort === 'sync')

  useModule({
    id,
    inputs: { sync: { type: 'scalar' } },
    outputs: { out: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      syncRef.current = inputs.sync

      // Rising edge detection on sync
      const syncVal = readScalar(inputs.sync)
      const syncHigh = syncVal > 50
      if (syncHigh && !prevSyncRef.current) phaseRef.current = 0
      prevSyncRef.current = syncHigh

      // Hz: map knob 0-100 to 0.1-10
      const hz = 0.1 + (rateRef.current / 100) * 9.9
      phaseRef.current = (phaseRef.current + dt * hz) % 1

      const p = phaseRef.current
      let val
      switch (shapeRef.current) {
        case 'down': val = (1 - p) * 100; break
        case 'tri':  val = p < 0.5 ? p * 200 : (1 - p) * 200; break
        default:     val = p * 100; break
      }

      const out = scalar(val)
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
        <ModuleHeader label="Ramp" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Selector value={shape} options={SHAPES} onChange={setShape} />
        <Knob value={rate} onChange={setRate} label="rate" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="sync" moduleId={id} active={syncConnected} signalRef={syncRef} label="sync" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
