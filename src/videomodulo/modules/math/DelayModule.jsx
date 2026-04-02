// DelayModule — frame-based delay line with feedback
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function DelayModule({ id = 'dly1' }) {
  const [time, setTime] = useState(50)
  const [feedback, setFeedback] = useState(30)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const timeRef = useRef(50)
  const feedbackRef = useRef(30)
  const enabledRef = useRef(true)
  const bufferRef = useRef(new Float32Array(256))
  const writeHeadRef = useRef(0)
  const outRef = useRef(null)
  const inRef = useRef(null)

  timeRef.current = time
  feedbackRef.current = feedback
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
      // Map time knob 0-100 to 1-256 frames
      const delayFrames = Math.max(1, Math.round(1 + (timeRef.current / 100) * 255))
      const fb = feedbackRef.current / 100

      // Read from past position
      const readPos = ((writeHeadRef.current - delayFrames) % len + len) % len
      const delayed = buf[readPos]

      // Write: input + delayed * feedback
      const input = readScalar(inputs.in)
      buf[writeHeadRef.current] = input + delayed * fb
      writeHeadRef.current = (writeHeadRef.current + 1) % len

      const out = scalar(delayed)
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
        <ModuleHeader label="Delay" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Knob value={time} onChange={setTime} label="time" />
        <Knob value={feedback} onChange={setFeedback} label="fb" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
