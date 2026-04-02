// MixerModule — 4-channel signal mixer
// 8HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function MixerModule({ id = 'mix1' }) {
  const [la, setLa] = useState(100)
  const [lb, setLb] = useState(100)
  const [lc, setLc] = useState(100)
  const [ld, setLd] = useState(100)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const laRef = useRef(100)
  const lbRef = useRef(100)
  const lcRef = useRef(100)
  const ldRef = useRef(100)
  const enabledRef = useRef(true)
  const outRef = useRef(null)
  const aRef = useRef(null)
  const bRef = useRef(null)
  const cRef = useRef(null)
  const dRef = useRef(null)

  laRef.current = la
  lbRef.current = lb
  lcRef.current = lc
  ldRef.current = ld
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')
  const cConnected = conns.some(c => c.toModuleId === id && c.toPort === 'c')
  const dConnected = conns.some(c => c.toModuleId === id && c.toPort === 'd')

  useModule({
    id,
    inputs: {
      a: { type: 'scalar' }, b: { type: 'scalar' },
      c: { type: 'scalar' }, d: { type: 'scalar' },
    },
    outputs: { out: { type: 'scalar' } },
    process: (inputs) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      aRef.current = inputs.a
      bRef.current = inputs.b
      cRef.current = inputs.c
      dRef.current = inputs.d

      const sum =
        readScalar(inputs.a) * (laRef.current / 100) +
        readScalar(inputs.b) * (lbRef.current / 100) +
        readScalar(inputs.c) * (lcRef.current / 100) +
        readScalar(inputs.d) * (ldRef.current / 100)

      const out = scalar(sum)
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
        <ModuleHeader label="Mixer" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        {/* 4 rows: input jack + level knob */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aRef} label="a" />
          <Knob value={la} onChange={setLa} label="a" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bRef} label="b" />
          <Knob value={lb} onChange={setLb} label="b" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="c" moduleId={id} active={cConnected} signalRef={cRef} label="c" />
          <Knob value={lc} onChange={setLc} label="c" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="in" port="d" moduleId={id} active={dConnected} signalRef={dRef} label="d" />
          <Knob value={ld} onChange={setLd} label="d" />
        </div>

        {/* Output */}
        <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
      </div>
    </Module>
  )
}
