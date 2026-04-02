// MultModule — 1:4 passive signal splitter
// 4HP 1U, passes any signal type through unchanged

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function MultModule({ id = 'mult1' }) {
  const [enabled, setEnabled] = useState(true)
  const enabledRef = useRef(true)
  const routing = usePatchRouting()
  enabledRef.current = enabled

  const outARef = useRef(null)
  const outBRef = useRef(null)
  const outCRef = useRef(null)
  const outDRef = useRef(null)
  const inRef = useRef(null)

  const conns = routing?.connections || []
  const inConnected = conns.some(c => c.toModuleId === id && c.toPort === 'in')

  useModule({
    id,
    inputs: { in: { type: 'scalar' } },
    outputs: { a: { type: 'scalar' }, b: { type: 'scalar' }, c: { type: 'scalar' }, d: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) {
        outARef.current = null; outBRef.current = null
        outCRef.current = null; outDRef.current = null
        return { a: null, b: null, c: null, d: null }
      }
      inRef.current = inputs.in
      const sig = inputs.in || null
      outARef.current = sig; outBRef.current = sig
      outCRef.current = sig; outDRef.current = sig
      return { a: sig, b: sig, c: sig, d: sig }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Mult" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <JackSocket type="in" port="in" moduleId={id} active={inConnected} signalRef={inRef} label="in" />
          </div>
          <div style={{ width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
            <JackSocket type="out" port="a" moduleId={id} signalRef={outARef} label="a" />
            <JackSocket type="out" port="b" moduleId={id} signalRef={outBRef} label="b" />
            <JackSocket type="out" port="c" moduleId={id} signalRef={outCRef} label="c" />
            <JackSocket type="out" port="d" moduleId={id} signalRef={outDRef} label="d" />
          </div>
        </div>
      </div>
    </Module>
  )
}
