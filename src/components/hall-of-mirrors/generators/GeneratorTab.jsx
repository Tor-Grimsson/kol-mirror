import { useRef } from 'react'
import { PatchRoutingProvider } from '../../../hooks/usePatchRouting.jsx'
import PatchCableOverlay from './PatchCableOverlay'
import ClockModule from './ClockModule'
import LFOModule from './LFOModule'
import SequencerModule from './SequencerModule'
import GateModule from './GateModule'
import LogicModule from './LogicModule'
import EnvelopeModule from './EnvelopeModule'
import RandomSHModule from './RandomSHModule'
import MultiplesModule from './MultiplesModule'
import MathsModule from './MathsModule'
import MixerModule from './MixerModule'
import DitherModule from './DitherModule'
import GeneratorModule from './GeneratorModule'
import Geometry3DModule from './Geometry3DModule'
import Divider from '../../atoms/Divider'

export default function GeneratorTab({ generatorState, onGeneratorChange, busRef, onLoadGenerator }) {
  const update = (key, val) => onGeneratorChange({ [key]: val })
  const scrollRef = useRef(null)

  return (
    <PatchRoutingProvider>
      <div
        ref={scrollRef}
        className="flex flex-row gap-4"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 4px' }}
      >
        <PatchCableOverlay containerRef={scrollRef} />

        {/* Timing */}
        <ClockModule id="clk1" label="CLOCK" config={generatorState.clk1} onChange={(v) => update('clk1', v)} busRef={busRef} />
        <GateModule id="gate1" label="GATE 1" config={generatorState.gate1} onChange={(v) => update('gate1', v)} busRef={busRef} />
        <SequencerModule id="seq1" label="SEQ 1" config={generatorState.seq1} onChange={(v) => update('seq1', v)} busRef={busRef} />
        <Divider variant="vertical" />

        {/* Generators */}
        <LFOModule id="lfo1" label="LFO 1" config={generatorState.lfo1} onChange={(v) => update('lfo1', v)} busRef={busRef} />
        <LFOModule id="lfo2" label="LFO 2" config={generatorState.lfo2} onChange={(v) => update('lfo2', v)} busRef={busRef} />
        <EnvelopeModule id="env1" label="ENV 1" config={generatorState.env1} onChange={(v) => update('env1', v)} busRef={busRef} />
        <RandomSHModule id="sh1" label="S&H 1" config={generatorState.sh1} onChange={(v) => update('sh1', v)} busRef={busRef} />
        <MathsModule id="math1" label="MATHS" config={generatorState.math1} onChange={(v) => update('math1', v)} busRef={busRef} />
        <Divider variant="vertical" />

        {/* Processing */}
        <LogicModule id="logic1" label="LOGIC 1" config={generatorState.logic1} onChange={(v) => update('logic1', v)} busRef={busRef} />
        <MultiplesModule id="mult1" label="MULT 1" config={generatorState.mult1} onChange={(v) => update('mult1', v)} busRef={busRef} />
        <MixerModule id="mix1" label="MIXER" config={generatorState.mix1} onChange={(v) => update('mix1', v)} busRef={busRef} />
        <Divider variant="vertical" />

        {/* Visual */}
        <GeneratorModule id="gen1" label="GEN 1" config={generatorState.gen1} onChange={(v) => update('gen1', v)} busRef={busRef} />
        <GeneratorModule id="gen2" label="GEN 2" config={generatorState.gen2} onChange={(v) => update('gen2', v)} busRef={busRef} />
        <DitherModule id="dither1" label="DITHER" config={generatorState.dither1} onChange={(v) => update('dither1', v)} busRef={busRef} />
        <Geometry3DModule id="geo1" label="GEO 3D" config={generatorState.geo1} onChange={(v) => update('geo1', v)} busRef={busRef} />
      </div>
    </PatchRoutingProvider>
  )
}
