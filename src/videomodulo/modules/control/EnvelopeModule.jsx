// EnvelopeModule — ADSR envelope generator
// 6HP

import { useState, useRef } from 'react'
import { useModule } from '../../hooks/useModuleRegistry.jsx'
import { scalar, readScalar } from '../../hooks/signals'
import Module from '../utility/Module'
import JackSocket from '../utility/JackSocket'
import Knob from '../controls/Knob'
import ModuleHeader from '../controls/ModuleHeader'
import Toggle from '../controls/Toggle'
import { usePatchRouting } from '../../hooks/usePatchRouting.jsx'

const STAGES = { IDLE: 0, ATTACK: 1, DECAY: 2, SUSTAIN: 3, RELEASE: 4 }

export default function EnvelopeModule({ id = 'env1' }) {
  const [attack, setAttack] = useState(10)    // 0-100 maps to 0-2s
  const [decay, setDecay] = useState(30)
  const [sustain, setSustain] = useState(70)
  const [release, setRelease] = useState(50)
  const [cycle, setCycle] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const routing = usePatchRouting()

  const aRef = useRef(10)
  const dRef = useRef(30)
  const sRef = useRef(70)
  const rRef = useRef(50)
  const enabledRef = useRef(true)
  const cycleRef = useRef(false)
  const stageRef = useRef(STAGES.IDLE)
  const levelRef = useRef(0)
  const prevGateRef = useRef(false)
  const prevClkRef = useRef(false)
  const outRef = useRef(null)
  const gateInRef = useRef(null)
  const clkInRef = useRef(null)

  aRef.current = attack
  dRef.current = decay
  sRef.current = sustain
  rRef.current = release
  enabledRef.current = enabled
  cycleRef.current = cycle

  const conns = routing?.connections || []
  const gateConnected = conns.some(c => c.toModuleId === id && c.toPort === 'gate')
  const clkConnected = conns.some(c => c.toModuleId === id && c.toPort === 'clk')

  useModule({
    id,
    inputs: {
      gate: { type: 'scalar' },
      clk: { type: 'scalar' },
    },
    outputs: { out: { type: 'scalar' } },
    process: (inputs, dt) => {
      if (!enabledRef.current) { outRef.current = null; return { out: null } }
      gateInRef.current = inputs.gate
      clkInRef.current = inputs.clk

      const gateOn = readScalar(inputs.gate) > 50
      const wasOn = prevGateRef.current
      prevGateRef.current = gateOn

      // Clock: retrigger on rising edge
      const clkHigh = readScalar(inputs.clk) > 50
      if (clkHigh && !prevClkRef.current) stageRef.current = STAGES.ATTACK
      prevClkRef.current = clkHigh

      // Gate transitions
      if (gateOn && !wasOn) stageRef.current = STAGES.ATTACK
      if (!gateOn && wasOn && stageRef.current !== STAGES.IDLE) stageRef.current = STAGES.RELEASE

      // Time mapping: knob 0-100 → 0.005-2s
      const aTime = 0.005 + (aRef.current / 100) * 1.995
      const dTime = 0.005 + (dRef.current / 100) * 1.995
      const sLevel = sRef.current
      const rTime = 0.005 + (rRef.current / 100) * 1.995

      const stage = stageRef.current
      let level = levelRef.current

      if (stage === STAGES.ATTACK) {
        level += (dt / aTime) * 100
        if (level >= 100) { level = 100; stageRef.current = STAGES.DECAY }
      } else if (stage === STAGES.DECAY) {
        level -= (dt / dTime) * (100 - sLevel)
        if (level <= sLevel) { level = sLevel; stageRef.current = STAGES.SUSTAIN }
      } else if (stage === STAGES.SUSTAIN) {
        level = sLevel
      } else if (stage === STAGES.RELEASE) {
        level -= (dt / rTime) * level
        if (level <= 0.5) { level = 0; stageRef.current = cycleRef.current ? STAGES.ATTACK : STAGES.IDLE }
      }

      levelRef.current = level
      const out = scalar(level)
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
        <ModuleHeader label="Env" enabled={enabled} onToggle={() => setEnabled(!enabled)} />
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <Knob value={attack} onChange={setAttack} label="A" />
          <div style={{ position: 'absolute', left: '50%', marginLeft: -28, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Toggle value={cycle} onChange={setCycle} label="cyc" />
            <JackSocket type="in" port="clk" moduleId={id} active={clkConnected} signalRef={clkInRef} label="clk" size="sm" />
          </div>
        </div>
        <Knob value={decay} onChange={setDecay} label="D" />
        <Knob value={sustain} onChange={setSustain} label="S" />
        <Knob value={release} onChange={setRelease} label="R" />
        <div style={{ display: 'flex', gap: 8 }}>
          <JackSocket type="in" port="gate" moduleId={id} active={gateConnected} signalRef={gateInRef} label="gate" />
          <JackSocket type="out" port="out" moduleId={id} signalRef={outRef} label="out" />
        </div>
      </div>
    </Module>
  )
}
