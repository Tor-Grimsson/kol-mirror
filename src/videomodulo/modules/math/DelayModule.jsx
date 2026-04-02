// DelayModule — frame-based delay with dry/wet, copies, feedback
// 6HP — works with any signal type
// For points: copies layer past frames as trailing echoes
// For scalars: feedback creates decaying repeats

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar, points } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const BUF_SIZE = 256

export default function DelayModule({ id = 'dly1', init }) {
  const [time, setTime] = useState(init?.time ?? 50)
  const [mix, setMix] = useState(init?.mix ?? 50)
  const [copies, setCopies] = useState(init?.copies ?? 30)
  const [fb, setFb] = useState(init?.fb ?? 50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const timeRef = useRef(50)
  const mixRef = useRef(50)
  const copiesRef = useRef(30)
  const fbRef = useRef(50)
  const enabledRef = useRef(true)
  const bufferRef = useRef(new Array(BUF_SIZE).fill(null))
  const writeHeadRef = useRef(0)
  const outRef = useRef(null)
  const inRef = useRef(null)

  timeRef.current = time
  mixRef.current = mix
  copiesRef.current = copies
  fbRef.current = fb
  enabledRef.current = enabled

  const timeInRef = useRef(null)
  const mixInRef = useRef(null)
  const copyInRef = useRef(null)
  const fbInRef = useRef(null)

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')
  const timeConn = conns.some(c => c.toModuleId === id && c.toPort === 'tCV')
  const mixConn = conns.some(c => c.toModuleId === id && c.toPort === 'mCV')
  const copyConn = conns.some(c => c.toModuleId === id && c.toPort === 'cCV')
  const fbConn = conns.some(c => c.toModuleId === id && c.toPort === 'fCV')

  useModule({
    id,
    inputs: {
      in: { type: 'any' },
      tCV: { type: 'scalar' },
      mCV: { type: 'scalar' },
      cCV: { type: 'scalar' },
      fCV: { type: 'scalar' },
    },
    outputs: { out: { type: 'any' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      inRef.current = inputs.in
      timeInRef.current = inputs.tCV
      mixInRef.current = inputs.mCV
      copyInRef.current = inputs.cCV
      fbInRef.current = inputs.fCV

      const buf = bufferRef.current
      const t = inputs.tCV ? readScalar(inputs.tCV) : timeRef.current
      const m = inputs.mCV ? readScalar(inputs.mCV) : mixRef.current
      const c = inputs.cCV ? readScalar(inputs.cCV) : copiesRef.current
      const f = inputs.fCV ? readScalar(inputs.fCV) : fbRef.current
      const delayFrames = Math.max(1, Math.round(1 + (t / 100) * (BUF_SIZE - 1)))
      const wet = m / 100
      const numCopies = Math.max(1, Math.round(1 + (c / 100) * 5))
      const feedback = f / 100
      const input = inputs.in

      // Write current signal
      buf[writeHeadRef.current] = input || null
      writeHeadRef.current = (writeHeadRef.current + 1) % BUF_SIZE

      if (!input) { outRef.current = null; return { out: null } }

      // Points: merge copies as trailing echoes
      if (input.type === 'points') {
        const allPts = []
        const allEdges = []
        // Dry: current frame
        if (wet < 1) {
          const offset = allPts.length
          for (const pt of input.value) allPts.push(pt)
          if (input.edges) for (const [a, b] of input.edges) allEdges.push([a + offset, b + offset])
        }
        // Wet: delayed copies
        for (let c = 0; c < numCopies; c++) {
          const tapDelay = delayFrames * (c + 1)
          const readPos = ((writeHeadRef.current - 1 - tapDelay) % BUF_SIZE + BUF_SIZE) % BUF_SIZE
          const tap = buf[readPos]
          if (!tap || tap.type !== 'points') continue
          const offset = allPts.length
          for (const pt of tap.value) allPts.push(pt)
          if (tap.edges) for (const [a, b] of tap.edges) allEdges.push([a + offset, b + offset])
        }
        const out = points(allPts, allEdges.length > 0 ? allEdges : null)
        outRef.current = out
        return { out }
      }

      // Scalar: feedback delay with dry/wet mix
      if (input.type === 'scalar') {
        const dry = readScalar(input)
        let wetSum = 0
        for (let c = 0; c < numCopies; c++) {
          const tapDelay = delayFrames * (c + 1)
          const readPos = ((writeHeadRef.current - 1 - tapDelay) % BUF_SIZE + BUF_SIZE) % BUF_SIZE
          const tap = buf[readPos]
          if (tap && tap.type === 'scalar') {
            wetSum += tap.value * Math.pow(feedback, c + 1)
          }
        }
        const mixed = dry * (1 - wet) + (wetSum / Math.max(1, numCopies)) * wet
        const out = scalar(mixed)
        outRef.current = out
        return { out }
      }

      // Other types: simple delay
      const readPos = ((writeHeadRef.current - 1 - delayFrames) % BUF_SIZE + BUF_SIZE) % BUF_SIZE
      const delayed = buf[readPos]
      outRef.current = delayed
      return { out: delayed }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Delay" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '0 2px' }}>
          <JackSocket type="in" port="tCV" moduleId={id} active={timeConn} signalRef={timeInRef} label="cv" size="sm" />
          <Knob value={time} onChange={setTime} label="time" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '0 2px' }}>
          <JackSocket type="in" port="mCV" moduleId={id} active={mixConn} signalRef={mixInRef} label="cv" size="sm" />
          <Knob value={mix} onChange={setMix} label="mix" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '0 2px' }}>
          <JackSocket type="in" port="cCV" moduleId={id} active={copyConn} signalRef={copyInRef} label="cv" size="sm" />
          <Knob value={copies} onChange={setCopies} label="copy" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '0 2px' }}>
          <JackSocket type="in" port="fCV" moduleId={id} active={fbConn} signalRef={fbInRef} label="cv" size="sm" />
          <Knob value={fb} onChange={setFb} label="fb" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          <div style={{ width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
