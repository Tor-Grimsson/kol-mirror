// Signal type definitions — the data contract for patch cables

export const SIGNAL_TYPES = Object.freeze({
  SCALAR: 'scalar',
  COLOR: 'color',
  POINTS: 'points',
  PEN: 'pen',
})

function clamp(n, min, max) {
  return n < min ? min : n > max ? max : n
}

export function scalar(n) {
  return { type: 'scalar', value: clamp(n, 0, 100) }
}

export function color(r, g, b, a = 1) {
  return { type: 'color', value: { r, g, b, a } }
}

export function points(arr, edges = null) {
  return { type: 'points', value: arr, edges }
}

export const PEN_DEFAULTS = { thickness: 1.5, dash: 0, gap: 0, opacity: 100, cap: 'round', lofi: 0, color: null }

export function pen(props) {
  return { type: 'pen', value: { ...PEN_DEFAULTS, ...props } }
}

// Extract a number from any signal type
export function readScalar(signal) {
  if (!signal) return 0
  if (signal.type === 'scalar') return signal.value
  if (signal.type === 'color') {
    const { r, g, b } = signal.value
    return (r * 0.2126 + g * 0.7152 + b * 0.0722) * 100
  }
  if (signal.type === 'points') return signal.value.length
  return 0
}

export function isSignal(v) {
  return v != null && typeof v === 'object' && 'type' in v && 'value' in v
}
