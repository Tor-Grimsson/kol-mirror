// Module registry — type → component, default HP, category, label
// Used by sidebar catalog and rack renderer

import ClockModule from './modules/control/ClockModule.jsx'
import ClockDividerModule from './modules/control/ClockDividerModule.jsx'
import LFOModule from './modules/control/LFOModule.jsx'
import EnvelopeModule from './modules/control/EnvelopeModule.jsx'
import SequencerModule from './modules/control/SequencerModule.jsx'
import ConstantModule from './modules/control/ConstantModule.jsx'
import LogicModule from './modules/control/LogicModule.jsx'
import ComparatorModule from './modules/control/ComparatorModule.jsx'
import SampleHoldModule from './modules/control/SampleHoldModule.jsx'
import PenModule from './modules/control/PenModule.jsx'

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
import TransformModule from './modules/math/TransformModule.jsx'

import RGBOscillatorModule from './modules/generators/RGBOscillatorModule.jsx'
import WaveformModule from './modules/generators/WaveformModule.jsx'
import WireframeModule from './modules/generators/WireframeModule.jsx'
import NoiseModule from './modules/generators/NoiseModule.jsx'
import RampModule from './modules/generators/RampModule.jsx'
import SMX3Module from './modules/generators/SMX3Module.jsx'
import LineGenModule from './modules/generators/LineGenModule.jsx'

import MonitorModule from './modules/display/MonitorModule.jsx'
import OutputModule from './modules/display/OutputModule.jsx'
import ConsoleModule from './modules/display/ConsoleModule.jsx'

import PatchModule from './modules/utility/PatchModule.jsx'

export const MODULE_DEFS = {
  // Control
  clock:     { component: ClockModule,        hp: 4,  u: 3, category: 'control',    label: 'Clock' },
  clockDiv:  { component: ClockDividerModule, hp: 4,  u: 3, category: 'control',    label: 'Clk Div' },
  lfo:       { component: LFOModule,          hp: 6,  u: 3, category: 'control',    label: 'LFO' },
  envelope:  { component: EnvelopeModule,     hp: 6,  u: 3, category: 'control',    label: 'Envelope' },
  sequencer: { component: SequencerModule,    hp: 12, u: 3, category: 'control',    label: 'Sequencer' },
  constant:  { component: ConstantModule,     hp: 4,  u: 3, category: 'control',    label: 'Constant' },
  logic:     { component: LogicModule,        hp: 4,  u: 3, category: 'control',    label: 'Logic' },
  comparator:{ component: ComparatorModule,   hp: 4,  u: 3, category: 'control',    label: 'Comparator' },
  sampleHold:{ component: SampleHoldModule,   hp: 6,  u: 3, category: 'control',    label: 'S&H' },
  pen:       { component: PenModule,          hp: 6,  u: 3, category: 'control',    label: 'Pen' },

  // Math
  mult:      { component: MultModule,         hp: 8,  u: 1, category: 'math',       label: 'Mult' },
  attenuator:{ component: AttenuatorModule,   hp: 8,  u: 1, category: 'math',       label: 'Atten' },
  vca:       { component: VCAModule,          hp: 8,  u: 1, category: 'math',       label: 'VCA' },
  switch:    { component: SwitchModule,       hp: 4,  u: 3, category: 'math',       label: 'Switch' },
  quantizer: { component: QuantizerModule,    hp: 4,  u: 3, category: 'math',       label: 'Quantizer' },
  scaleOfs:  { component: ScaleOffsetModule,  hp: 4,  u: 3, category: 'math',       label: 'Scale/Ofs' },
  ringMod:   { component: RingModModule,      hp: 6,  u: 3, category: 'math',       label: 'Ring Mod' },
  waveshaper:{ component: WaveshaperModule,   hp: 6,  u: 3, category: 'math',       label: 'Waveshaper' },
  delay:     { component: DelayModule,        hp: 6,  u: 3, category: 'math',       label: 'Delay' },
  reverb:    { component: ReverbModule,       hp: 6,  u: 3, category: 'math',       label: 'Reverb' },
  mixer:     { component: MixerModule,        hp: 8,  u: 3, category: 'math',       label: 'Mixer' },
  maths:     { component: MathsModule,        hp: 8,  u: 3, category: 'math',       label: 'Maths' },
  transform: { component: TransformModule,   hp: 12, u: 3, category: 'math',       label: 'Xform' },

  // Generators
  rgb:       { component: RGBOscillatorModule,hp: 8,  u: 3, category: 'generators', label: 'RGB Osc' },
  waveform:  { component: WaveformModule,     hp: 6,  u: 3, category: 'generators', label: 'Waveform' },
  wireframe: { component: WireframeModule,    hp: 8,  u: 3, category: 'generators', label: 'Wireframe' },
  noise:     { component: NoiseModule,        hp: 8,  u: 1, category: 'generators', label: 'Noise' },
  ramp:      { component: RampModule,         hp: 6,  u: 3, category: 'generators', label: 'Ramp' },
  smx3:      { component: SMX3Module,         hp: 12, u: 3, category: 'generators', label: 'SMX3' },
  lineGen:   { component: LineGenModule,      hp: 8,  u: 3, category: 'generators', label: 'LineGen' },

  // Display
  monitor:   { component: MonitorModule,      hp: 12, u: 3, category: 'display',    label: 'Monitor' },
  output:    { component: OutputModule,       hp: 16, u: 3, category: 'display',    label: 'Output' },
  console:   { component: ConsoleModule,     hp: 48, u: 3, category: 'display',    label: 'Console' },

  // Utility
  patch:     { component: PatchModule,        hp: 6,  u: 3, category: 'utility',    label: 'Patch' },
}

export const CATEGORIES = ['control', 'math', 'generators', 'display', 'utility']

export function getModulesByCategory(category) {
  return Object.entries(MODULE_DEFS)
    .filter(([, def]) => def.category === category)
    .map(([type, def]) => ({ type, ...def }))
}
