import { getQuality } from '../../../hooks/renderQuality'

/**
 * A generator's INTERNAL resolution, decoupled from the canvas it fills.
 *
 * A procedural source does not need to be canvas-sized: it is drawn into its
 * own buffer and scaled up on composite, and for smooth output that upscale is
 * invisible. Noise already did this at 384; the other three drew at full canvas
 * size, so on a large display they paid several times the per-pixel cost for
 * detail the upscale would have supplied for free. (imweb does the same thing
 * per source — noise 512², raymarch at 0.5× — for the same reason.)
 *
 * The cap is per-generator because it depends on the CONTENT, not the machine:
 * gradients and colour fields are smooth and cap hard; patterns have hard edges
 * that soften if you cap them too far. The channel pixel budget applies on top.
 *
 * @param {number} width · height  the canvas being filled
 * @param {number} max             longest internal edge for this generator
 * @returns {[number, number]} internal buffer size, never below 64
 */
export function internalSize(width, height, max) {
  const longest = Math.max(width, height, 1)
  let ratio = Math.min(1, max / longest)
  let w = Math.max(64, Math.round(width * ratio))
  let h = Math.max(64, Math.round(height * ratio))
  const cap = getQuality().maxChannelPixels || 0
  if (cap > 0 && w * h > cap) {
    const k = Math.sqrt(cap / (w * h))
    w = Math.max(64, Math.round(w * k))
    h = Math.max(64, Math.round(h * k))
  }
  return [w, h]
}

/* Smooth output upscales for free; hard edges do not. */
export const SMOOTH_MAX = 384
export const EDGED_MAX = 1024
