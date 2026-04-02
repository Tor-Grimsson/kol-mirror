// LFOModule — wave shape oscillator with sync input
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import WaveSelect from '../controls/WaveSelect'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const SHAPES = ['sin', 'saw', 'tri', 'sqr']

function waveFn(phase, shape) {
  const p = phase % 1
  switch (shape) {
    case 'sin': return (Math.sin(p * Math.PI * 2) + 1) / 2
    case 'saw': return p
    case 'tri': return p < 0.5 ? p * 2 : 2 - p * 2
    case 'sqr': return p < 0.5 ? 1 : 0
    default: return 0
  }
}

export default function LFOModule({ id = 'lfo1' }) {
  const [rate, setRate] = useState(10)     // maps to 0.1-20 Hz
  const [depth, setDepth] = useState(100)
  const [offset, setOffset] = useState(50)
  const [shape, setShape] = useState('sin')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const rateRef = useRef(10)
  const depthRef = useRef(100)
  const offsetRef = useRef(50)
  const shapeRef = useRef('sin')
  const enabledRef = useRef(true)
  const phaseRef = useRef(0)
  const prevSyncRef = useRef(false)
  const outRef = useRef(null)
  const syncInRef = useRef(null)

  rateRef.current = rate
  depthRef.current = depth
  offsetRef.current = offset
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
      syncInRef.current = inputs.sync

      // Rising edge detection on sync
      const syncVal = readScalar(inputs.sync)
      const syncHigh = syncVal > 50
      if (syncHigh && !prevSyncRef.current) phaseRef.current = 0
      prevSyncRef.current = syncHigh

      // Hz: map knob 0-100 to 0.1-20
      const hz = 0.1 + (rateRef.current / 100) * 19.9
      phaseRef.current += dt * hz

      const raw = waveFn(phaseRef.current, shapeRef.current)
      const val = raw * depthRef.current + (100 - depthRef.current) * (offsetRef.current / 100)
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
        <ModuleHeader label="LFO" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <WaveSelect value={shape} onChange={setShape} />
        <Knob value={rate} onChange={setRate} label="rate" />
        <Knob value={depth} onChange={setDepth} label="dep" />
        <Knob value={offset} onChange={setOffset} label="ofs" />
        <div style={{ display: 'flex', gap: 8 }}>
          <JackSocket type="in" port="sync" moduleId={id} active={syncConnected} signalRef={syncInRef} label="sync" />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
