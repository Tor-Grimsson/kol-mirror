// ClockModule — master tempo, gate pulse + clock division
// 4HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'

const GATE_DURATION = 0.03 // 30ms pulse width

export default function ClockModule({ id = 'clk1' }) {
  const [bpm, setBpm] = useState(120)
  const [division, setDivision] = useState(4)
  const [enabled, setEnabled] = useState(true)
  const enabledRef = useRef(true)
  const bpmRef = useRef(120)
  const divRef = useRef(4)
  const phaseRef = useRef(0)
  const gateTimerRef = useRef(0)
  const divCountRef = useRef(0)
  const divGateTimerRef = useRef(0)
  const gateOutRef = useRef(null)
  const divOutRef = useRef(null)

  bpmRef.current = bpm
  divRef.current = division
  enabledRef.current = enabled

  useModule({
    id,
    inputs: {},
    outputs: {
      out: { type: 'scalar' },
      div: { type: 'scalar' },
    },
    process: (inputs, dt) => {
      if (!enabledRef.current) { gateOutRef.current = null; divOutRef.current = null; return { out: null, div: null } }
      phaseRef.current += dt * (bpmRef.current / 60)
      gateTimerRef.current = Math.max(0, gateTimerRef.current - dt)
      divGateTimerRef.current = Math.max(0, divGateTimerRef.current - dt)

      if (phaseRef.current >= 1) {
        phaseRef.current -= 1
        gateTimerRef.current = GATE_DURATION
        divCountRef.current++
        if (divCountRef.current >= divRef.current) {
          divCountRef.current = 0
          divGateTimerRef.current = GATE_DURATION
        }
      }

      const out = scalar(gateTimerRef.current > 0 ? 100 : 0)
      const div = scalar(divGateTimerRef.current > 0 ? 100 : 0)
      gateOutRef.current = out
      divOutRef.current = div
      return { out, div }
    },
  })

  return (
    <Module>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'space-between', height: '100%', padding: '4px 0',
      }}>
        <ModuleHeader label="Clock" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <Knob value={bpm} onChange={setBpm} min={20} max={300} label="BPM" />
        <Knob value={division} onChange={setDivision} min={1} max={16} label="DIV" />
        <div style={{ display: 'flex', gap: 8 }}>
          <JackSocket type="out" port="out" moduleId={id} signalRef={gateOutRef} label="out" />
          <JackSocket type="out" port="div" moduleId={id} signalRef={divOutRef} label="div" />
        </div>
      </div>
    </Module>
  )
}
