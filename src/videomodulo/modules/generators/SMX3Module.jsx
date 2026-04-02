// SMX3Module — 3x3 signal matrix mixer to RGB color
// 12HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar, color } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

function clamp01(n) { return n < 0 ? 0 : n > 100 ? 100 : n }

export default function SMX3Module({ id = 'smx1' }) {
  const [k11, setK11] = useState(50)
  const [k12, setK12] = useState(50)
  const [k13, setK13] = useState(50)
  const [k21, setK21] = useState(50)
  const [k22, setK22] = useState(50)
  const [k23, setK23] = useState(50)
  const [k31, setK31] = useState(50)
  const [k32, setK32] = useState(50)
  const [k33, setK33] = useState(50)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const k11Ref = useRef(50); const k12Ref = useRef(50); const k13Ref = useRef(50)
  const k21Ref = useRef(50); const k22Ref = useRef(50); const k23Ref = useRef(50)
  const k31Ref = useRef(50); const k32Ref = useRef(50); const k33Ref = useRef(50)
  const enabledRef = useRef(true)
  const rOutRef = useRef(null)
  const gOutRef = useRef(null)
  const bOutRef = useRef(null)
  const colorOutRef = useRef(null)
  const aRef = useRef(null)
  const bRef = useRef(null)
  const cRef = useRef(null)

  k11Ref.current = k11; k12Ref.current = k12; k13Ref.current = k13
  k21Ref.current = k21; k22Ref.current = k22; k23Ref.current = k23
  k31Ref.current = k31; k32Ref.current = k32; k33Ref.current = k33
  enabledRef.current = enabled

  const conns = routing?.connections || []
  const aConnected = conns.some(c => c.toModuleId === id && c.toPort === 'a')
  const bConnected = conns.some(c => c.toModuleId === id && c.toPort === 'b')
  const cConnected = conns.some(c => c.toModuleId === id && c.toPort === 'c')

  useModule({
    id,
    inputs: { a: { type: 'scalar' }, b: { type: 'scalar' }, c: { type: 'scalar' } },
    outputs: {
      r: { type: 'scalar' }, g: { type: 'scalar' }, b: { type: 'scalar' },
      out: { type: 'color' },
    },
    process: (inputs) => {
      if (!enabledRef.current) {
        rOutRef.current = null; gOutRef.current = null
        bOutRef.current = null; colorOutRef.current = null
        return { r: null, g: null, b: null, out: null }
      }
      aRef.current = inputs.a
      bRef.current = inputs.b
      cRef.current = inputs.c

      const aVal = readScalar(inputs.a)
      const bVal = readScalar(inputs.b)
      const cVal = readScalar(inputs.c)

      // Bipolar matrix: knob 50 = 0, 0 = -1, 100 = +1
      const rVal = clamp01(
        aVal * (k11Ref.current - 50) / 50 +
        bVal * (k12Ref.current - 50) / 50 +
        cVal * (k13Ref.current - 50) / 50
      )
      const gVal = clamp01(
        aVal * (k21Ref.current - 50) / 50 +
        bVal * (k22Ref.current - 50) / 50 +
        cVal * (k23Ref.current - 50) / 50
      )
      const bVal2 = clamp01(
        aVal * (k31Ref.current - 50) / 50 +
        bVal * (k32Ref.current - 50) / 50 +
        cVal * (k33Ref.current - 50) / 50
      )

      const rOut = scalar(rVal)
      const gOut = scalar(gVal)
      const bOut = scalar(bVal2)
      const colorOut = color(rVal / 100, gVal / 100, bVal2 / 100)

      rOutRef.current = rOut
      gOutRef.current = gOut
      bOutRef.current = bOut
      colorOutRef.current = colorOut
      return { r: rOut, g: gOut, b: bOut, out: colorOut }
    },
  })

  const knobStyle = { display: 'flex', justifyContent: 'center', gap: 2 }

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="SMX-3" enabled={enabled} onToggle={() => setEnabled(!enabled)} />

        {/* Inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <JackSocket type="in" port="a" moduleId={id} active={aConnected} signalRef={aRef} label="a" />
          <JackSocket type="in" port="b" moduleId={id} active={bConnected} signalRef={bRef} label="b" />
          <JackSocket type="in" port="c" moduleId={id} active={cConnected} signalRef={cRef} label="c" />
        </div>

        {/* 3x3 knob matrix */}
        <div style={knobStyle}>
          <Knob value={k11} onChange={setK11} label="Ra" />
          <Knob value={k12} onChange={setK12} label="Rb" />
          <Knob value={k13} onChange={setK13} label="Rc" />
        </div>
        <div style={knobStyle}>
          <Knob value={k21} onChange={setK21} label="Ga" />
          <Knob value={k22} onChange={setK22} label="Gb" />
          <Knob value={k23} onChange={setK23} label="Gc" />
        </div>
        <div style={knobStyle}>
          <Knob value={k31} onChange={setK31} label="Ba" />
          <Knob value={k32} onChange={setK32} label="Bb" />
          <Knob value={k33} onChange={setK33} label="Bc" />
        </div>

        {/* Outputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <JackSocket type="out" port="r" moduleId={id} signalRef={rOutRef} label="r" />
          <JackSocket type="out" port="g" moduleId={id} signalRef={gOutRef} label="g" />
          <JackSocket type="out" port="b" moduleId={id} signalRef={bOutRef} label="b" />
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <JackSocket type="out" port="out" moduleId={id} signalRef={colorOutRef} label="clr" />
        </div>
      </div>
    </Module>
  )
}
