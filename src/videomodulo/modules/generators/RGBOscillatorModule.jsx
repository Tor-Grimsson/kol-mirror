// RGBOscillatorModule — 3-channel color vector output
// 8HP — per-channel osc toggle: on = rate oscillator, off = constant brightness

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { color, scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import Toggle from '../controls/Toggle'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

export default function RGBOscillatorModule({ id = 'rgb1' }) {
  const [rRate, setRRate] = useState(30)
  const [gRate, setGRate] = useState(50)
  const [bRate, setBRate] = useState(70)
  const [rOsc, setROsc] = useState(true)
  const [gOsc, setGOsc] = useState(true)
  const [bOsc, setBOsc] = useState(true)
  const [rClr, setRClr] = useState(false)
  const [gClr, setGClr] = useState(false)
  const [bClr, setBClr] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const enabledRef = useRef(true)
  const rOscRef = useRef(true)
  const gOscRef = useRef(true)
  const bOscRef = useRef(true)
  const rClrRef = useRef(false)
  const gClrRef = useRef(false)
  const bClrRef = useRef(false)
  const rRateRef = useRef(30)
  const gRateRef = useRef(50)
  const bRateRef = useRef(70)
  const outRef = useRef(null)
  const rOutRef = useRef(null)
  const gOutRef = useRef(null)
  const bOutRef = useRef(null)
  const rInRef = useRef(null)
  const gInRef = useRef(null)
  const bInRef = useRef(null)

  enabledRef.current = enabled
  rOscRef.current = rOsc
  gOscRef.current = gOsc
  bOscRef.current = bOsc
  rClrRef.current = rClr
  gClrRef.current = gClr
  bClrRef.current = bClr
  rRateRef.current = rRate
  gRateRef.current = gRate
  bRateRef.current = bRate

  const conns = routing?.connections || []
  const rConn = conns.some(c => c.toModuleId === id && c.toPort === 'r')
  const gConn = conns.some(c => c.toModuleId === id && c.toPort === 'g')
  const bConn = conns.some(c => c.toModuleId === id && c.toPort === 'b')

  useModule({
    id,
    inputs: {
      r: { type: 'scalar' },
      g: { type: 'scalar' },
      b: { type: 'scalar' },
    },
    outputs: {
      r: { type: 'scalar' },
      g: { type: 'scalar' },
      b: { type: 'scalar' },
      out: { type: 'color' },
    },
    process: (inputs, dt, t) => {
      if (!enabledRef.current) { outRef.current = null; rOutRef.current = null; gOutRef.current = null; bOutRef.current = null; return { r: null, g: null, b: null, out: null } }
      rInRef.current = inputs.r
      gInRef.current = inputs.g
      bInRef.current = inputs.b

      function ch(input, knob, oscOn) {
        if (input) return readScalar(input) / 100
        if (!oscOn) return knob / 100
        return (Math.sin(t * (0.1 + (knob / 100) * 9.9) * Math.PI * 2) + 1) / 2
      }

      const r = ch(inputs.r, rRateRef.current, rOscRef.current)
      const g = ch(inputs.g, gRateRef.current, gOscRef.current)
      const b = ch(inputs.b, bRateRef.current, bOscRef.current)

      const rOut = rClrRef.current ? color(r, 0, 0) : scalar(r * 100)
      const gOut = gClrRef.current ? color(0, g, 0) : scalar(g * 100)
      const bOut = bClrRef.current ? color(0, 0, b) : scalar(b * 100)
      const out = color(r, g, b)

      rOutRef.current = rOut
      gOutRef.current = gOut
      bOutRef.current = bOut
      outRef.current = out
      return { r: rOut, g: gOut, b: bOut, out }
    },
  })

  const rowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 2px' }

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="RGB" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={rowStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Toggle size="sm" value={rOsc} onChange={setROsc} label="osc" />
            <Toggle size="sm" value={rClr} onChange={setRClr} label="clr" />
          </div>
          <JackSocket type="in" port="r" moduleId={id} active={rConn} signalRef={rInRef} label="in" size="sm" />
          <Knob value={rRate} onChange={setRRate} label="R" />
          <JackSocket type="out" port="r" moduleId={id} signalRef={rOutRef} label="out" size="sm" />
        </div>
        <div style={rowStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Toggle size="sm" value={gOsc} onChange={setGOsc} label="osc" />
            <Toggle size="sm" value={gClr} onChange={setGClr} label="clr" />
          </div>
          <JackSocket type="in" port="g" moduleId={id} active={gConn} signalRef={gInRef} label="in" size="sm" />
          <Knob value={gRate} onChange={setGRate} label="G" />
          <JackSocket type="out" port="g" moduleId={id} signalRef={gOutRef} label="out" size="sm" />
        </div>
        <div style={rowStyle}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Toggle size="sm" value={bOsc} onChange={setBOsc} label="osc" />
            <Toggle size="sm" value={bClr} onChange={setBClr} label="clr" />
          </div>
          <JackSocket type="in" port="b" moduleId={id} active={bConn} signalRef={bInRef} label="in" size="sm" />
          <Knob value={bRate} onChange={setBRate} label="B" />
          <JackSocket type="out" port="b" moduleId={id} signalRef={bOutRef} label="out" size="sm" />
        </div>
        <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="color" />
      </div>
    </Module>
  )
}
