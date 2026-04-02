import { useRef } from 'react'
import { ModuleRegistryProvider, useModuleRegistry } from './hooks/useModuleRegistry.jsx'
import { PatchRoutingProvider, usePatchRouting } from './hooks/usePatchRouting.jsx'
import { useRenderLoop } from './hooks/useRenderLoop'
import Case, { RackRow, HP } from './modules/utility/Case.jsx'
import PatchCableOverlay from './modules/utility/PatchCableOverlay.jsx'
import PatchModule from './modules/utility/PatchModule.jsx'

// Control
import ClockModule from './modules/control/ClockModule.jsx'
import LFOModule from './modules/control/LFOModule.jsx'
import EnvelopeModule from './modules/control/EnvelopeModule.jsx'
import SequencerModule from './modules/control/SequencerModule.jsx'
import ConstantModule from './modules/control/ConstantModule.jsx'
import LogicModule from './modules/control/LogicModule.jsx'
import ComparatorModule from './modules/control/ComparatorModule.jsx'
import ClockDividerModule from './modules/control/ClockDividerModule.jsx'
import SampleHoldModule from './modules/control/SampleHoldModule.jsx'
import PenModule from './modules/control/PenModule.jsx'

// Math
import MultModule from './modules/math/MultModule.jsx'
import AttenuatorModule from './modules/math/AttenuatorModule.jsx'
import VCAModule from './modules/math/VCAModule.jsx'
import SwitchModule from './modules/math/SwitchModule.jsx'
import QuantizerModule from './modules/math/QuantizerModule.jsx'
import ScaleOffsetModule from './modules/math/ScaleOffsetModule.jsx'
import RingModModule from './modules/math/RingModModule.jsx'
import WaveshaperModule from './modules/math/WaveshaperModule.jsx'
import DelayModule from './modules/math/DelayModule.jsx'
import ReverbModule from './modules/math/ReverbModule.jsx'
import MixerModule from './modules/math/MixerModule.jsx'
import MathsModule from './modules/math/MathsModule.jsx'

// Generators
import RGBOscillatorModule from './modules/generators/RGBOscillatorModule.jsx'
import WaveformModule from './modules/generators/WaveformModule.jsx'
import WireframeModule from './modules/generators/WireframeModule.jsx'
import NoiseModule from './modules/generators/NoiseModule.jsx'
import RampModule from './modules/generators/RampModule.jsx'
import SMX3Module from './modules/generators/SMX3Module.jsx'

// Display
import MonitorModule from './modules/display/MonitorModule.jsx'
import OutputModule from './modules/display/OutputModule.jsx'

import { patches } from './patches.js'

function VideoModuloInner() {
  const { modulesRef } = useModuleRegistry()
  const { connectionsRef } = usePatchRouting()
  const rackRef = useRef(null)

  useRenderLoop(modulesRef, connectionsRef)

  return (
    <div ref={rackRef} className="min-h-screen bg-surface-primary flex items-center justify-center relative">
      <PatchCableOverlay containerRef={rackRef} />
      <Case>
        {/* Row 1 (1U): Utility */}
        <RackRow height="1u">
          <div style={HP(8)}><MultModule id="mult1" /></div>
          <div style={HP(8)}><NoiseModule id="noise1" /></div>
          <div style={HP(8)}><AttenuatorModule id="atten1" /></div>
          <div style={HP(8)}><VCAModule id="vca1" /></div>
        </RackRow>

        {/* Row 2 (3U): Control + Processing */}
        <RackRow height="3u">
          <div style={HP(6)}><PatchModule id="patch1" /></div>
          <div style={HP(4)}><ClockModule id="clk1" /></div>
          <div style={HP(4)}><ClockDividerModule id="div1" /></div>
          <div style={HP(6)}><LFOModule id="lfo1" /></div>
          <div style={HP(6)}><EnvelopeModule id="env1" /></div>
          <div style={HP(12)}><SequencerModule id="seq1" /></div>
          <div style={HP(6)}><SampleHoldModule id="sh1" /></div>
          <div style={HP(4)}><LogicModule id="logic1" /></div>
          <div style={HP(4)}><ComparatorModule id="comp1" /></div>
          <div style={HP(4)}><ConstantModule id="const1" /></div>
          <div style={HP(6)}><PenModule id="pen1" /></div>
          <div style={HP(4)}><SwitchModule id="sw1" /></div>
          <div style={HP(4)}><QuantizerModule id="quant1" /></div>
          <div style={HP(4)}><ScaleOffsetModule id="scl1" /></div>
          <div style={HP(8)}><MathsModule id="maths1" /></div>
          <div style={HP(8)}><MixerModule id="mix1" /></div>
        </RackRow>

        {/* Row 3 (3U): Generators + Effects + Display */}
        <RackRow height="3u">
          <div style={HP(8)}><RGBOscillatorModule id="rgb1" /></div>
          <div style={HP(6)}><WaveformModule id="wave1" /></div>
          <div style={HP(8)}><WireframeModule id="wire1" /></div>
          <div style={HP(6)}><RampModule id="ramp1" /></div>
          <div style={HP(12)}><SMX3Module id="smx1" /></div>
          <div style={HP(6)}><RingModModule id="ring1" /></div>
          <div style={HP(6)}><WaveshaperModule id="wshp1" /></div>
          <div style={HP(6)}><DelayModule id="delay1" /></div>
          <div style={HP(6)}><ReverbModule id="verb1" /></div>
          <div style={HP(12)}><MonitorModule id="mon1" /></div>
          <div style={HP(16)}><OutputModule id="out1" /></div>
        </RackRow>
      </Case>
    </div>
  )
}

export default function VideoModulo() {
  return (
    <ModuleRegistryProvider>
      <PatchRoutingProvider initialConnections={patches.ref}>
        <VideoModuloInner />
      </PatchRoutingProvider>
    </ModuleRegistryProvider>
  )
}
