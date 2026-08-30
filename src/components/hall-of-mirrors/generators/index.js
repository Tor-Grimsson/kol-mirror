import NoiseGenerator from './NoiseGenerator'
import GradientGenerator from './GradientGenerator'
import PatternGenerator from './PatternGenerator'
import ColorFieldGenerator from './ColorFieldGenerator'
import LiveInputGenerator from './LiveInputGenerator'
import FieldGenerator from './FieldGenerator'
import WaveGenerator from './WaveGenerator'

export const GENERATOR_TYPES = [
  { id: 'noise', label: 'Noise', component: NoiseGenerator, params: { scale: 20, speed: 1, octaves: 3 } },
  { id: 'gradient', label: 'Gradient', component: GradientGenerator, params: { type: 'linear', angle: 0, speed: 1 } },
  { id: 'pattern', label: 'Pattern', component: PatternGenerator, params: { pattern: 'stripes', spacing: 20, angle: 0, duty: 0.5, speed: 1 } },
  { id: 'color-field', label: 'Color Field', component: ColorFieldGenerator, params: { color: '#ff0000' } },
  { id: 'live', label: 'Live Input', component: LiveInputGenerator, params: { source: 'camera', mirrored: 1, fit: 'cover' } },
  { id: 'wave', label: 'Wave', component: WaveGenerator, params: { shape: 'sin', freq: 8, speed: 1, angle: 0, pwm: 50 } },
  { id: 'field', label: 'Field', component: FieldGenerator, params: { mode: 'clouds', scale: 4, detail: 4, warp: 0.4, speed: 1, contrast: 100 } },
]

export const GENERATOR_COMPONENTS = Object.fromEntries(
  GENERATOR_TYPES.map(g => [g.id, g.component])
)

export { NoiseGenerator, GradientGenerator, PatternGenerator, ColorFieldGenerator, LiveInputGenerator, FieldGenerator, WaveGenerator }
