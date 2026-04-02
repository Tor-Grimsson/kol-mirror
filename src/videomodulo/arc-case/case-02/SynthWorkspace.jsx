import { useState, useCallback, useRef } from 'react'
import useSignalBus from './hooks/useSignalBus'
import { PatchRoutingProvider } from './hooks/usePatchRouting.jsx'
import PatchCableOverlay from './modules/PatchCableOverlay'
import RackRow from './RackRow'

import ClockModule from './modules/ClockModule'
import GateModule from './modules/GateModule'
import LogicModule from './modules/LogicModule'
import MultiplesModule from './modules/MultiplesModule'
import RandomSHModule from './modules/RandomSHModule'
import MixerModule from './modules/MixerModule'
import LFOModule from './modules/LFOModule'
import SequencerModule from './modules/SequencerModule'
import EnvelopeModule from './modules/EnvelopeModule'
import MathsModule from './modules/MathsModule'
import GeneratorModule from './modules/GeneratorModule'
import DitherModule from './modules/DitherModule'
import Geometry3DModule from './modules/Geometry3DModule'

const HP = (hp) => ({ width: `${(hp / 104) * 100}%`, flexShrink: 0, height: '100%', overflow: 'hidden' })

const INITIAL_GENERATORS = {
  clk1: { bpm: 120, swing: 0, pulseWidth: 10, division: 1, enabled: true },
  gate1: { triggerExpr: 'clk1', delay: 0, length: 0.2, repeat: 1, enabled: false },
  lfo1: { waveform: 'sine', rate: 1, depth: 100, offset: 0, enabled: true },
  lfo2: { waveform: 'sine', rate: 0.5, depth: 100, offset: 0, enabled: false },
  seq1: { steps: [100, 75, 50, 25, 0, 25, 50, 75], direction: 'forward', clockExpr: 'clk1', resetExpr: '', enabled: false },
  logic1: { type: 'AND', inputAExpr: '', inputBExpr: '', enabled: false },
  env1: { attack: 0.1, decay: 0.3, sustain: 0.7, release: 0.5, triggerExpr: '', gateExpr: '', retrigger: false, enabled: false },
  sh1: { rate: 2, min: 0, max: 100, smooth: 0, enabled: false },
  mult1: { input: 'lfo1', outputs: [{ scale: 1, offset: 0 }, { scale: 0.5, offset: 50 }, { scale: -1, offset: 100 }], enabled: false },
  math1: { ch1Rise: 0.5, ch1Fall: 0.5, ch1SignalExpr: '', ch1TriggerExpr: '', ch2Rise: 0.5, ch2Fall: 0.5, ch2SignalExpr: '', ch2TriggerExpr: '', enabled: false },
  mix1: { in1Expr: '', in2Expr: '', in3Expr: '', in4Expr: '', level1: 100, level2: 100, level3: 100, level4: 100, master: 100, mode: 'ADD', enabled: false },
  gen1: { algorithm: 'noise', subType: 'linear', p1: 20, p2: 1, p3: 3, p4: 0.5, h: 0, s: 100, l: 50, enabled: false },
  gen2: { algorithm: 'wave', subType: 'sin', p1: 10, p2: 1, p3: 0, p4: 0.5, h: 0, s: 100, l: 50, enabled: false },
  dither1: { mode: 'halftone', shape: 'circle', cellSize: 10, baseScale: 0.9, gap: 1, contrast: 0, intensity: 1.0, useColor: true, monoColor: '#ffffff', bgColor: '#111111', modeGroup: 'halftone', enabled: false },
  geo1: { geometry: 'ico', renderMode: 'wire', detail: 1, rotateX: 1, rotateY: 0.5, rotateZ: 0, scale: 50, color: '#ffffff', bgColor: '#111111', enabled: false },
}

export default function SynthWorkspace() {
  const { busRef } = useSignalBus()
  const [gs, setGs] = useState(INITIAL_GENERATORS)
  const rackRef = useRef(null)

  const upd = useCallback((key, val) => {
    setGs(prev => ({ ...prev, [key]: val }))
  }, [])

  const m = (key) => ({ config: gs[key], onChange: (v) => upd(key, v), busRef })

  return (
    <PatchRoutingProvider>
      <div className="min-h-screen bg-surface-primary text-fg-96" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
        <div ref={rackRef} className="relative" style={{ maxWidth: '100vw' }}>
          <PatchCableOverlay containerRef={rackRef} />

          {/* 1U — utilities */}
          <RackRow height="1u">
            <div style={HP(6)}><ClockModule id="clk1" label="CLK" {...m('clk1')} /></div>
            <div style={HP(4)}><GateModule id="gate1" label="GATE" {...m('gate1')} /></div>
            <div style={HP(4)}><LogicModule id="logic1" label="LOGIC" {...m('logic1')} /></div>
            <div style={HP(4)}><MultiplesModule id="mult1" label="MULT" {...m('mult1')} /></div>
            <div style={HP(4)}><RandomSHModule id="sh1" label="S&H" {...m('sh1')} /></div>
            <div style={HP(6)}><MixerModule id="mix1" label="MIX" {...m('mix1')} /></div>
          </RackRow>

          {/* 3U-A — signal generators */}
          <RackRow height="3u">
            <div style={HP(10)}><LFOModule id="lfo1" label="LFO" {...m('lfo1')} /></div>
            <div style={HP(10)}><LFOModule id="lfo2" label="LFO" {...m('lfo2')} /></div>
            <div style={HP(16)}><SequencerModule id="seq1" label="SEQ" {...m('seq1')} /></div>
            <div style={HP(10)}><EnvelopeModule id="env1" label="ENV" {...m('env1')} /></div>
            <div style={HP(14)}><MathsModule id="math1" label="MATHS" {...m('math1')} /></div>
          </RackRow>

          {/* 3U-B — video generators */}
          <RackRow height="3u">
            <div style={HP(26)}><GeneratorModule id="gen1" label="GEN" {...m('gen1')} /></div>
            <div style={HP(26)}><GeneratorModule id="gen2" label="GEN" {...m('gen2')} /></div>
            <div style={HP(26)}><DitherModule id="dither1" label="DITHER" {...m('dither1')} /></div>
            <div style={HP(26)}><Geometry3DModule id="geo1" label="GEO" {...m('geo1')} /></div>
          </RackRow>
        </div>
      </div>
    </PatchRoutingProvider>
  )
}
