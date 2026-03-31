import NoiseGenerator from './NoiseGenerator'
import GradientGenerator from './GradientGenerator'
import PatternGenerator from './PatternGenerator'
import ColorFieldGenerator from './ColorFieldGenerator'

export const GENERATOR_TYPES = [
  { id: 'noise', label: 'Noise', component: NoiseGenerator, params: { scale: 20, speed: 1, octaves: 3 } },
  { id: 'gradient', label: 'Gradient', component: GradientGenerator, params: { type: 'linear', angle: 0, speed: 1 } },
  { id: 'pattern', label: 'Pattern', component: PatternGenerator, params: { pattern: 'stripes', spacing: 20, angle: 0, duty: 0.5, speed: 1 } },
  { id: 'color-field', label: 'Color Field', component: ColorFieldGenerator, params: { color: '#ff0000' } },
]

export const GENERATOR_COMPONENTS = Object.fromEntries(
  GENERATOR_TYPES.map(g => [g.id, g.component])
)

export { NoiseGenerator, GradientGenerator, PatternGenerator, ColorFieldGenerator }
