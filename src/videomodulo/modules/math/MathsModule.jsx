// MathsModule — dual-function math + slew limiter with EOC gate
// 8HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import Selector from '../controls/Selector'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const MODES = ['add', 'sub', 'min', 'max', 'avg']
const EOC_DURATION = 0.03 // 30ms gate

function applyMode(mode, a, b) {
  switch (mode) {
    case 'add': return Math.min(100, a + b)
    case 'sub': return Math.max(0, a - b)
    case 'min': return Math.min(a, b)
    case 'max': return Math.max(a, b)
    case 'avg': return (a + b) / 2
    default: return a
  }
}

export default function MathsModule({ id = 'maths1' }) {
  const [rise, setRise] = useState(50)
  const [fall, setFall] = useState(50)
  const [mode, setMode] = useState('add')
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const riseRef = useRef(50)
  const fallRef = useRef(50)
  const modeRef = useRef('add')
  const enabledRef = useRef(true)
  const currentRef = useRef(0)
  const targetRef = useRef(0)
  const prevTrigRef = useRef(false)
  const eocTimerRef = useRef(0)
  const outRef = useRef(null)
  const eocRef = useRef(null)
  const aRef = useRef(null)
  const bRef = useRef(null)
  const trigRef = useRef(null)

  riseRef.current = rise
  fallRef.current = fall
  modeRef.current = mode
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')
  const trigConnected = conns.some(c => c.toModuleId === id && c.toPort === 'trig')

  useModule({
    id,
    inputs: {
      a: { type: 'scalar' }, b: { type: 'scalar' },
      trig: { type: 'scalar' },
    },
    outputs: { out: { type: 'scalar' }, eoc: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) {
        outRef.current = null; eocRef.current = null
        return { out: null, eoc: null }
      }
      aRef.current = inputs.a
      bRef.current = inputs.b
      trigRef.current = inputs.trig

      // Trig rising edge resets current to 0
      const trigVal = readScalar(inputs.trig)
      const trigHigh = trigVal > 50
      if (trigHigh && !prevTrigRef.current) currentRef.current = 0
      prevTrigRef.current = trigHigh

      // Compute target from mode
      const aVal = readScalar(inputs.a)
      const bVal = readScalar(inputs.b)
      targetRef.current = applyMode(modeRef.current, aVal, bVal)

      // Slew toward target
      const target = targetRef.current
      const current = currentRef.current
      const diff = target - current

      if (Math.abs(diff) < 0.01) {
        // Reached target — fire EOC if not already firing
        if (eocTimerRef.current <= 0 && Math.abs(diff) < 0.01) {
          eocTimerRef.current = EOC_DURATION
        }
        currentRef.current = target
      } else if (diff > 0) {
        // Rising — rate mapped from knob: 0.001 to 1.0
        const rate = 0.001 + (riseRef.current / 100) * 0.999
        currentRef.current = Math.min(target, current + rate * dt * 1000)
      } else {
        // Falling
        const rate = 0.001 + (fallRef.current / 100) * 0.999
        currentRef.current = Math.max(target, current - rate * dt * 1000)
      }

      // EOC gate countdown
      let eocVal = 0
      if (eocTimerRef.current > 0) {
        eocVal = 100
        eocTimerRef.current -= dt
      }

      const out = scalar(currentRef.current)
      const eoc = scalar(eocVal)
      outRef.current = out
      eocRef.current = eoc
      return { out, eoc }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Maths" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Selector value={mode} options={MODES} onChange={setMode} />
        <Knob value={rise} onChange={setRise} label="rise" />
        <Knob value={fall} onChange={setFall} label="fall" />

        {/* Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aRef} label="a" />
          <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bRef} label="b" />
          <JackSocket type="in" port="trig" moduleId={id} active={trigConnected} signalRef={trigRef} label="trig" />
        </div>

        {/* Outputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
          <JackSocket type="out" port="eoc" moduleId={id} signalRef={eocRef} label="eoc" />
        </div>
      </div>
    </Module>
  )
}
