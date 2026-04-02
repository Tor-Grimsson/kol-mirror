// WaveshaperModule — nonlinear waveshaping with multiple modes
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

const MODES = ['clip', 'fold', 'wrap', 'sine']

function shape(x, mode) {
  switch (mode) {
    case 'clip':
      return Math.max(-1, Math.min(1, x))
    case 'fold': {
      let v = x
      for (let i = 0; i < 4; i++) {
        if (v > 1) v = 2 - v
        else if (v < -1) v = -2 - v
        else break
      }
      return v
    }
    case 'wrap': {
      let v = ((x + 1) % 2 + 2) % 2 - 1
      return v
    }
    case 'sine':
      return Math.sin(x * Math.PI)
    default:
      return x
  }
}

export default function WaveshaperModule({ id = 'wshp1' }) {
  const [mode, setMode] = useState('clip')
  const [drive, setDrive] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const modeRef = useRef('clip')
  const driveRef = useRef(50)
  const enabledRef = useRef(true)
  const outRef = useRef(null)
  const inRef = useRef(null)

  modeRef.current = mode
  driveRef.current = drive
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

      const val = readScalar(inputs.in)
      // Normalize to -1..1
      let x = val / 50 - 1
      // Apply drive
      x *= 1 + driveRef.current / 10
      // Shape
      x = shape(x, modeRef.current)
      // Convert back to 0-100
      const out = scalar((x + 1) * 50)
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
        <ModuleHeader label="Shaper" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Selector value={mode} options={MODES} onChange={setMode} />
        <Knob value={drive} onChange={setDrive} label="drive" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
