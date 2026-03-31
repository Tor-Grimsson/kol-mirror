import LFOModule from './LFOModule'
import SequencerModule from './SequencerModule'
import LogicGateModule from './LogicGateModule'
import EnvelopeModule from './EnvelopeModule'
import RandomSHModule from './RandomSHModule'
import MultiplesModule from './MultiplesModule'
import VisualGeneratorModule from './VisualGeneratorModule'
import { GENERATOR_TYPES } from './index'
import Divider from '../../atoms/Divider'

export default function GeneratorTab({ generatorState, onGeneratorChange, busRef, onLoadGenerator }) {
  const update = (key, val) => onGeneratorChange({ [key]: val })

  return (
    <div className="flex flex-row gap-4" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowX: 'auto', scrollbarWidth: 'none', padding: '0 4px' }}>
      {GENERATOR_TYPES.map(gen => (
        <VisualGeneratorModule
          key={gen.id}
          id={gen.id}
          label={gen.label}
          GenComponent={gen.component}
          defaultParams={gen.params}
          onLoadToChannel={(variantId, params) => onLoadGenerator?.(variantId, params)}
        />
      ))}
      <Divider variant="vertical" />
      <LFOModule
        id="lfo1"
        label="LFO 1"
        config={generatorState.lfo1}
        onChange={(v) => update('lfo1', v)}
        busRef={busRef}
      />
      <LFOModule
        id="lfo2"
        label="LFO 2"
        config={generatorState.lfo2}
        onChange={(v) => update('lfo2', v)}
        busRef={busRef}
      />
      <SequencerModule
        id="seq1"
        label="SEQ 1"
        config={generatorState.seq1}
        onChange={(v) => update('seq1', v)}
        busRef={busRef}
      />
      <LogicGateModule
        id="gate1"
        label="GATE 1"
        config={generatorState.gate1}
        onChange={(v) => update('gate1', v)}
        busRef={busRef}
      />
      <EnvelopeModule
        id="env1"
        label="ENV 1"
        config={generatorState.env1}
        onChange={(v) => update('env1', v)}
        busRef={busRef}
      />
      <RandomSHModule
        id="sh1"
        label="S&H 1"
        config={generatorState.sh1}
        onChange={(v) => update('sh1', v)}
        busRef={busRef}
      />
      <Divider variant="vertical" />
      <MultiplesModule
        id="mult1"
        label="MULT 1"
        config={generatorState.mult1}
        onChange={(v) => update('mult1', v)}
        busRef={busRef}
      />
    </div>
  )
}
