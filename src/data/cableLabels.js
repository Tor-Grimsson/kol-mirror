import { CANVAS_FX_DEFS } from '../hooks/useCanvasFx'
import { isFxKey } from '../hooks/patchGraph'

export const BUS_LABEL = { aux1: 'AUX 1', aux2: 'AUX 2', rtn1: 'RTN 1', rtn2: 'RTN 2', fx1: 'FX 1', fx2: 'FX 2' }
export const chLabel = (c, i) => (c?.name ? c.name.split(':').slice(1).join(':').trim() || `Channel ${i + 1}` : `Channel ${i + 1}`)

/** The words for a cable's two ends — the patch table's and the routing bay's list. */
export function cableLabels({ channels = [], fxModules = [] }) {
  const fxLabel = (id) => CANVAS_FX_DEFS.find((d) => d.id === fxModules.find((m) => m.id === id)?.type)?.label || 'FX'
  const fromLabel = (src) => (typeof src === 'number' ? chLabel(channels[src], src) : isFxKey(src) ? `${fxLabel(src.slice(4))} OUT` : BUS_LABEL[src] ?? String(src))
  const toLabel = (to) => {
    const [kind, arg] = [to.split(':')[0], to.split(':').slice(1).join(':')]
    if (kind === 'mst-in') return `Master IN ${+arg + 1}`
    if (kind === 'mon') return 'MON IN · Screen 2'
    if (kind === 'ch-in') return `${chLabel(channels[+arg], +arg)} IN`
    if (kind === 'bus') return BUS_LABEL[arg]
    if (kind === 'ch-x') return `${chLabel(channels[+arg], +arg)} cross-send`
    if (kind === 'fb') return 'feedback'
    if (kind === 'fxm-in') return `${fxLabel(arg)} IN`
    return to
  }
  return { fromLabel, toLabel }
}

