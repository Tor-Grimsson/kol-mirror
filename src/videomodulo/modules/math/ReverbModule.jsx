// ReverbModule — multi-tap delay reverb
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const TAP_PRIMES = [23, 37, 53, 71]

export default function ReverbModule({ id = 'verb1' }) {
  const [size, setSize] = useState(50)
  const [decay, setDecay] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const sizeRef = useRef(50)
  const decayRef = useRef(50)
  const enabledRef = useRef(true)
  const bufferRef = useRef(new Float32Array(256))
  const writeHeadRef = useRef(0)
  const outRef = useRef(null)
  const inRef = useRef(null)

  sizeRef.current = size
  decayRef.current = decay
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

      const buf = bufferRef.current
      const len = buf.length
      const input = readScalar(inputs.in)
      const sizeScale = sizeRef.current / 100
      const decayAmt = decayRef.current / 100

      // Read from 4 taps at prime-spaced positions
      let wet = 0
      for (let i = 0; i < TAP_PRIMES.length; i++) {
        const tapLen = Math.max(1, Math.round(TAP_PRIMES[i] * sizeScale))
        const readPos = ((writeHeadRef.current - tapLen) % len + len) % len
        wet += buf[readPos] * Math.pow(decayAmt, i)
      }
      wet /= TAP_PRIMES.length

      // Write input + feedback into buffer
      buf[writeHeadRef.current] = input + wet * decayAmt
      writeHeadRef.current = (writeHeadRef.current + 1) % len

      // Mix: 50% dry + 50% wet
      const mixed = input * 0.5 + wet * 0.5
      const out = scalar(mixed)
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
        <ModuleHeader label="Reverb" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Knob value={size} onChange={setSize} label="size" />
        <Knob value={decay} onChange={setDecay} label="decay" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
