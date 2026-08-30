// Canvas FX Modules — pixel-level post-processing on OffscreenCanvas buffers
import { GPU_FX, CPU_ONLY } from './gpuFxShaders'

export const CANVAS_FX_DEFS = [
  { id: 'chromatic', label: 'RGB Split', params: { offsetX: { default: 5, min: 0, max: 50, step: 1 }, offsetY: { default: 0, min: 0, max: 50, step: 1 } } },
  { id: 'edge-detect', label: 'Edge Detect', params: { threshold: { default: 30, min: 0, max: 100, step: 1 }, invert: { default: 0, min: 0, max: 1, step: 1 } } },
  { id: 'posterize', label: 'Posterize', params: { levels: { default: 4, min: 2, max: 32, step: 1 } } },
  { id: 'pixel-sort', label: 'Pixel Sort', params: { threshold: { default: 50, min: 0, max: 100, step: 1 }, direction: { default: 0, min: 0, max: 1, step: 1 } } },
  { id: 'mirror', label: 'Mirror', params: { axis: { default: 0, min: 0, max: 1, step: 1 } } },
  { id: 'threshold', label: 'Threshold', params: { level: { default: 50, min: 0, max: 100, step: 1 } } },
  { id: 'dither', label: 'Dither', params: { cell: { default: 2, min: 1, max: 16, step: 1 }, bias: { default: 50, min: 0, max: 100, step: 1 }, mask: { default: 0, min: 0, max: 1, step: 1 }, color: { default: 0, min: 0, max: 1, step: 1 } } },
  { id: 'ascii', label: 'ASCII', params: { cell: { default: 8, min: 4, max: 32, step: 1 }, gain: { default: 100, min: 20, max: 300, step: 5 }, color: { default: 0, min: 0, max: 1, step: 1 } } },
  /* The analog chain — one unit, many knobs, because in the original these all
     run at once on the same signal rather than stacking as reorderable passes. */
  { id: 'analog', label: 'Analog TV', params: { split: { default: 25, min: 0, max: 100, step: 1 }, skew: { default: 20, min: 0, max: 100, step: 1 }, roll: { default: 0, min: 0, max: 100, step: 1 }, vhs: { default: 0, min: 0, max: 100, step: 1 }, crt: { default: 0, min: 0, max: 100, step: 1 } } },
  { id: 'slitscan', label: 'Slitscan', params: { depth: { default: 60, min: 0, max: 100, step: 1 }, bands: { default: 24, min: 2, max: 64, step: 1 }, axis: { default: 0, min: 0, max: 1, step: 1 }, trail: { default: 0, min: 0, max: 100, step: 1 }, echo: { default: 0, min: 0, max: 100, step: 1 }, space: { default: 30, min: 0, max: 100, step: 1 }, fade: { default: 60, min: 0, max: 100, step: 1 } } },
]

export const MAX_CANVAS_FX = 8

/**
 * Which execution path will this unit take?
 *
 *   'slit'  its own single-unit GPU run — the frame ring cannot be a stateless pass
 *   'gpu'   a pass in a `runChain` batch
 *   'cpu'   `applyCanvasFx`
 *
 * Lifted here 2026-08-28 because `processChannelFx` and `/dev/capture` were
 * about to answer it separately, and a duplicated path decision is precisely
 * the defect the segmentation rewrite existed to fix — Analog TV was dead for
 * months because two places disagreed about where it could run.
 */
export function fxPath(type, { gpu = true } = {}) {
  if (!gpu) return 'cpu'
  if (type === 'slitscan') return 'slit'
  return GPU_FX[type] && !CPU_ONLY.has(type) ? 'gpu' : 'cpu'
}

/**
 * Can this unit actually run here, and are any of its knobs dead?
 *
 * Not every unit exists on both paths, and until 2026-08-28 a unit that did not
 * exist on the path the chain took was DROPPED — it sat in the rack, took knob
 * turns and produced nothing, with no error. The chain is segmented now, so on
 * a WebGL2 machine everything runs; without WebGL2 the two shader-only units
 * (Dither, Analog TV) still cannot. The rack says so rather than lying.
 *
 * `deadParams` is the narrower version of the same honesty: Slitscan runs on
 * either path, but echo/space/fade only exist in its shader.
 *
 * @returns {{runs: boolean, reason: string|null, deadParams: string[]}}
 */
export function fxCapability(type, { gpu = true } = {}) {
  const onCpu = !!FX_PROCESSORS[type]
  const gpuOnly = { dither: 'Dither', analog: 'Analog TV' }
  if (!onCpu && !gpu) {
    return { runs: false, reason: `${gpuOnly[type] || type} needs WebGL2 — no CPU version`, deadParams: [] }
  }
  if (type === 'slitscan' && !gpu) {
    return { runs: true, reason: null, deadParams: ['echo', 'space', 'fade'] }
  }
  return { runs: true, reason: null, deadParams: [] }
}

export function getDefaultCanvasFxParams(fxId) {
  const def = CANVAS_FX_DEFS.find(d => d.id === fxId)
  if (!def) return {}
  const params = {}
  for (const [key, spec] of Object.entries(def.params)) {
    params[key] = spec.default
  }
  return params
}

// --- FX Processors ---
// Each takes (srcData, outData, width, height, params)
// srcData is the input ImageData.data, outData is the output ImageData.data

function fxChromatic(srcData, outData, w, h, params) {
  const ox = params.offsetX | 0
  const oy = params.offsetY | 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) << 2
      // R from (x - ox, y - oy)
      const rx = Math.max(0, Math.min(w - 1, x - ox))
      const ry = Math.max(0, Math.min(h - 1, y - oy))
      const ri = (ry * w + rx) << 2
      // G from (x, y) — center
      // B from (x + ox, y + oy)
      const bx = Math.max(0, Math.min(w - 1, x + ox))
      const by = Math.max(0, Math.min(h - 1, y + oy))
      const bi = (by * w + bx) << 2
      outData[i] = srcData[ri]         // R
      outData[i + 1] = srcData[i + 1]  // G
      outData[i + 2] = srcData[bi + 2] // B
      outData[i + 3] = srcData[i + 3]  // A
    }
  }
}

function fxEdgeDetect(srcData, outData, w, h, params) {
  const thresh = (params.threshold / 100) * 255
  const inv = params.invert | 0
  // Sobel kernels
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      // Luminance samples around 3x3 neighborhood
      let gx = 0, gy = 0
      // Unrolled 3x3 Sobel
      const tl = srcData[((y - 1) * w + (x - 1)) << 2] * 0.299 + srcData[(((y - 1) * w + (x - 1)) << 2) + 1] * 0.587 + srcData[(((y - 1) * w + (x - 1)) << 2) + 2] * 0.114
      const tc = srcData[((y - 1) * w + x) << 2] * 0.299 + srcData[(((y - 1) * w + x) << 2) + 1] * 0.587 + srcData[(((y - 1) * w + x) << 2) + 2] * 0.114
      const tr = srcData[((y - 1) * w + (x + 1)) << 2] * 0.299 + srcData[(((y - 1) * w + (x + 1)) << 2) + 1] * 0.587 + srcData[(((y - 1) * w + (x + 1)) << 2) + 2] * 0.114
      const ml = srcData[(y * w + (x - 1)) << 2] * 0.299 + srcData[((y * w + (x - 1)) << 2) + 1] * 0.587 + srcData[((y * w + (x - 1)) << 2) + 2] * 0.114
      const mr = srcData[(y * w + (x + 1)) << 2] * 0.299 + srcData[((y * w + (x + 1)) << 2) + 1] * 0.587 + srcData[((y * w + (x + 1)) << 2) + 2] * 0.114
      const bl = srcData[((y + 1) * w + (x - 1)) << 2] * 0.299 + srcData[(((y + 1) * w + (x - 1)) << 2) + 1] * 0.587 + srcData[(((y + 1) * w + (x - 1)) << 2) + 2] * 0.114
      const bc = srcData[((y + 1) * w + x) << 2] * 0.299 + srcData[(((y + 1) * w + x) << 2) + 1] * 0.587 + srcData[(((y + 1) * w + x) << 2) + 2] * 0.114
      const br = srcData[((y + 1) * w + (x + 1)) << 2] * 0.299 + srcData[(((y + 1) * w + (x + 1)) << 2) + 1] * 0.587 + srcData[(((y + 1) * w + (x + 1)) << 2) + 2] * 0.114
      // Sobel X: -1 0 1 / -2 0 2 / -1 0 1
      gx = -tl + tr - 2 * ml + 2 * mr - bl + br
      // Sobel Y: -1 -2 -1 / 0 0 0 / 1 2 1
      gy = -tl - 2 * tc - tr + bl + 2 * bc + br
      let mag = Math.sqrt(gx * gx + gy * gy)
      mag = mag > thresh ? 255 : 0
      if (inv) mag = 255 - mag
      const i = (y * w + x) << 2
      outData[i] = mag
      outData[i + 1] = mag
      outData[i + 2] = mag
      outData[i + 3] = srcData[i + 3]
    }
  }
  // Edge rows/columns: set to black (or white if inverted)
  const edgeVal = inv ? 255 : 0
  for (let x = 0; x < w; x++) {
    const t = x << 2
    const b = ((h - 1) * w + x) << 2
    outData[t] = edgeVal; outData[t + 1] = edgeVal; outData[t + 2] = edgeVal; outData[t + 3] = srcData[t + 3]
    outData[b] = edgeVal; outData[b + 1] = edgeVal; outData[b + 2] = edgeVal; outData[b + 3] = srcData[b + 3]
  }
  for (let y = 0; y < h; y++) {
    const l = (y * w) << 2
    const r = (y * w + w - 1) << 2
    outData[l] = edgeVal; outData[l + 1] = edgeVal; outData[l + 2] = edgeVal; outData[l + 3] = srcData[l + 3]
    outData[r] = edgeVal; outData[r + 1] = edgeVal; outData[r + 2] = edgeVal; outData[r + 3] = srcData[r + 3]
  }
}

function fxPosterize(srcData, outData, w, h, params) {
  const levels = Math.max(2, params.levels | 0)
  const n = levels - 1
  const len = srcData.length
  for (let i = 0; i < len; i += 4) {
    outData[i] = Math.round(srcData[i] / 255 * n) / n * 255
    outData[i + 1] = Math.round(srcData[i + 1] / 255 * n) / n * 255
    outData[i + 2] = Math.round(srcData[i + 2] / 255 * n) / n * 255
    outData[i + 3] = srcData[i + 3]
  }
}

function fxPixelSort(srcData, outData, w, h, params) {
  const thresh = (params.threshold / 100) * 255
  const vertical = (params.direction | 0) === 1
  // Copy source to output first
  outData.set(srcData)
  if (vertical) {
    // Sort columns
    for (let x = 0; x < w; x++) {
      let segStart = -1
      for (let y = 0; y <= h; y++) {
        const idx = y < h ? (y * w + x) << 2 : -1
        const brightness = idx >= 0 ? (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) : 0
        if (idx >= 0 && brightness > thresh) {
          if (segStart < 0) segStart = y
        } else {
          if (segStart >= 0) {
            sortSegmentVertical(outData, w, x, segStart, y - 1)
            segStart = -1
          }
        }
      }
    }
  } else {
    // Sort rows
    for (let y = 0; y < h; y++) {
      let segStart = -1
      for (let x = 0; x <= w; x++) {
        const idx = x < w ? (y * w + x) << 2 : -1
        const brightness = idx >= 0 ? (srcData[idx] * 0.299 + srcData[idx + 1] * 0.587 + srcData[idx + 2] * 0.114) : 0
        if (idx >= 0 && brightness > thresh) {
          if (segStart < 0) segStart = x
        } else {
          if (segStart >= 0) {
            sortSegmentHorizontal(outData, w, y, segStart, x - 1)
            segStart = -1
          }
        }
      }
    }
  }
}

function sortSegmentHorizontal(data, w, y, x0, x1) {
  const len = x1 - x0 + 1
  if (len < 2) return
  // Collect pixels with brightness
  const pixels = new Array(len)
  for (let i = 0; i < len; i++) {
    const idx = (y * w + x0 + i) << 2
    pixels[i] = {
      r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3],
      lum: data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114,
    }
  }
  pixels.sort((a, b) => a.lum - b.lum)
  for (let i = 0; i < len; i++) {
    const idx = (y * w + x0 + i) << 2
    data[idx] = pixels[i].r
    data[idx + 1] = pixels[i].g
    data[idx + 2] = pixels[i].b
    data[idx + 3] = pixels[i].a
  }
}

function sortSegmentVertical(data, w, x, y0, y1) {
  const len = y1 - y0 + 1
  if (len < 2) return
  const pixels = new Array(len)
  for (let i = 0; i < len; i++) {
    const idx = ((y0 + i) * w + x) << 2
    pixels[i] = {
      r: data[idx], g: data[idx + 1], b: data[idx + 2], a: data[idx + 3],
      lum: data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114,
    }
  }
  pixels.sort((a, b) => a.lum - b.lum)
  for (let i = 0; i < len; i++) {
    const idx = ((y0 + i) * w + x) << 2
    data[idx] = pixels[i].r
    data[idx + 1] = pixels[i].g
    data[idx + 2] = pixels[i].b
    data[idx + 3] = pixels[i].a
  }
}

function fxMirror(srcData, outData, w, h, params) {
  const vertical = (params.axis | 0) === 1
  // Copy all source first
  outData.set(srcData)
  if (vertical) {
    // Copy top half to bottom
    const halfH = (h >> 1)
    for (let y = 0; y < halfH; y++) {
      const mirrorY = h - 1 - y
      const srcRow = y * w << 2
      const dstRow = mirrorY * w << 2
      for (let x = 0; x < w; x++) {
        const si = srcRow + (x << 2)
        const di = dstRow + (x << 2)
        outData[di] = srcData[si]
        outData[di + 1] = srcData[si + 1]
        outData[di + 2] = srcData[si + 2]
        outData[di + 3] = srcData[si + 3]
      }
    }
  } else {
    // Copy left half to right
    const halfW = (w >> 1)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < halfW; x++) {
        const si = (y * w + x) << 2
        const di = (y * w + (w - 1 - x)) << 2
        outData[di] = srcData[si]
        outData[di + 1] = srcData[si + 1]
        outData[di + 2] = srcData[si + 2]
        outData[di + 3] = srcData[si + 3]
      }
    }
  }
}

function fxThreshold(srcData, outData, w, h, params) {
  const level = (params.level / 100) * 255
  const len = srcData.length
  for (let i = 0; i < len; i += 4) {
    const lum = srcData[i] * 0.299 + srcData[i + 1] * 0.587 + srcData[i + 2] * 0.114
    const val = lum >= level ? 255 : 0
    outData[i] = val
    outData[i + 1] = val
    outData[i + 2] = val
    outData[i + 3] = srcData[i + 3]
  }
}

/* ── ASCII ────────────────────────────────────────────────────────────────
 * Cell luminance → a glyph from a sparse-to-dense ramp. The glyphs are baked
 * ONCE into an alpha mask atlas and then blitted as plain memory; the obvious
 * implementation calls `fillText` per cell, which at a small cell size is
 * thousands of text draws per frame. Baking also keeps this inside the
 * `(srcData, outData, w, h, params)` contract — no canvas context required at
 * effect time. The atlas is cached per cell size and rebaked when it changes.
 */
const ASCII_RAMP = ' .:-=+*#%@'
const atlasCache = new Map()

function asciiAtlas(cell) {
  const hit = atlasCache.get(cell)
  if (hit) return hit
  const n = ASCII_RAMP.length
  const c = new OffscreenCanvas(cell * n, cell)
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#fff'
  ctx.font = `${cell}px monospace`
  ctx.textBaseline = 'top'
  for (let i = 0; i < n; i++) ctx.fillText(ASCII_RAMP[i], i * cell, 0)
  // Keep only the coverage channel — one byte per pixel instead of four.
  const px = ctx.getImageData(0, 0, c.width, c.height).data
  const mask = new Uint8Array(c.width * c.height)
  for (let i = 0, j = 0; i < px.length; i += 4, j++) mask[j] = px[i]
  const atlas = { mask, cell, stride: c.width, glyphs: n }
  // Bounded: a handful of sizes at most, and each is tiny.
  if (atlasCache.size > 12) atlasCache.clear()
  atlasCache.set(cell, atlas)
  return atlas
}

function fxAscii(srcData, outData, w, h, params) {
  const cell = Math.max(4, Math.min(32, params.cell | 0 || 8))
  const gain = (params.gain ?? 100) / 100
  const keepColor = (params.color | 0) === 1
  const { mask, stride, glyphs } = asciiAtlas(cell)
  outData.fill(0)
  for (let cy = 0; cy < h; cy += cell) {
    for (let cx = 0; cx < w; cx += cell) {
      // Average the cell — cheaper than it looks, and far less aliased than
      // sampling the centre pixel (which is what the CodePen ancestor does).
      let r = 0, g = 0, b = 0, count = 0
      const yEnd = Math.min(h, cy + cell)
      const xEnd = Math.min(w, cx + cell)
      for (let y = cy; y < yEnd; y++) {
        let i = (y * w + cx) << 2
        for (let x = cx; x < xEnd; x++, i += 4) { r += srcData[i]; g += srcData[i + 1]; b += srcData[i + 2]; count++ }
      }
      if (!count) continue
      r /= count; g /= count; b /= count
      const lum = Math.min(1, ((r * 0.299 + g * 0.587 + b * 0.114) / 255) * gain)
      const gi = Math.round(lum * (glyphs - 1))
      if (gi <= 0) continue
      const or = keepColor ? r : 255
      const og = keepColor ? g : 255
      const ob = keepColor ? b : 255
      for (let y = cy; y < yEnd; y++) {
        const my = y - cy
        let mi = my * stride + gi * cell
        let oi = (y * w + cx) << 2
        for (let x = cx; x < xEnd; x++, mi++, oi += 4) {
          const a = mask[mi]
          if (!a) continue
          const k = a / 255
          outData[oi] = or * k
          outData[oi + 1] = og * k
          outData[oi + 2] = ob * k
          outData[oi + 3] = 255
        }
      }
    }
  }
}

/* ── SLITSCAN ─────────────────────────────────────────────────────────────
 * Per-band time displacement: band 0 shows now, the last band shows `depth`
 * frames ago, linearly between. Needs frame HISTORY, which the pure
 * `(src, out, w, h, params)` contract has nowhere to put — so the ring lives
 * in a WeakMap keyed by the canvas being processed (one per channel, stable
 * for the channel's life) plus the effect's slot, and resets on resize.
 *
 * The read is a contiguous run of rows per band, so it is a memcpy per band
 * rather than per-pixel work. Memory is the real cost, so the ring is bounded
 * by total bytes, not by frame count: 24 frames at 320x180 is ~5 MB, but the
 * same 24 at 1280x720 would be 85 MB, which is not acceptable for one effect.
 */
const RING_BUDGET = 24 * 1024 * 1024   // 24 MB per slitscan instance
const MAX_RING = 48
const ringStore = new WeakMap()

function slitRing(canvas, slot, w, h) {
  let perCanvas = ringStore.get(canvas)
  if (!perCanvas) { perCanvas = new Map(); ringStore.set(canvas, perCanvas) }
  let r = perCanvas.get(slot)
  const frameBytes = w * h * 4
  const depth = Math.max(2, Math.min(MAX_RING, Math.floor(RING_BUDGET / frameBytes)))
  if (!r || r.w !== w || r.h !== h || r.frames.length !== depth) {
    r = { w, h, idx: 0, count: 0, frames: Array.from({ length: depth }, () => new Uint8ClampedArray(frameBytes)) }
    perCanvas.set(slot, r)
  }
  return r
}

export function fxSlitscan(srcData, outData, w, h, params, ctxState) {
  const r = slitRing(ctxState.canvas, ctxState.slot, w, h)
  const N = r.frames.length
  r.idx = (r.idx + 1) % N
  r.frames[r.idx].set(srcData)
  if (r.count < N) r.count++

  const bands = Math.max(2, Math.min(64, params.bands | 0 || 24))
  const depth = ((params.depth ?? 60) / 100) * (Math.min(r.count, N) - 1)
  const vertical = (params.axis | 0) === 1
  const at = (back) => r.frames[(r.idx - Math.max(0, Math.min(N - 1, back)) + N * 2) % N]

  if (vertical) {
    // Columns: each band is a vertical stripe, so the copy is per-row.
    const bw = w / bands
    for (let b = 0; b < bands; b++) {
      const src = at(Math.round((b / Math.max(1, bands - 1)) * depth))
      const x0 = Math.floor(b * bw)
      const x1 = Math.min(w, Math.ceil((b + 1) * bw))
      const runBytes = (x1 - x0) * 4
      if (runBytes <= 0) continue
      for (let y = 0; y < h; y++) {
        const o = (y * w + x0) << 2
        outData.set(src.subarray(o, o + runBytes), o)
      }
    }
  } else {
    // Rows: a whole band is one contiguous run — one memcpy per band.
    const bh = h / bands
    for (let b = 0; b < bands; b++) {
      const src = at(Math.round((b / Math.max(1, bands - 1)) * depth))
      const y0 = Math.floor(b * bh)
      const y1 = Math.min(h, Math.ceil((b + 1) * bh))
      if (y1 <= y0) continue
      const o = y0 * w * 4
      outData.set(src.subarray(o, y1 * w * 4), o)
    }
  }

  // Trail: blend the previous OUTPUT back over the result. Cheap persistence,
  // and unlike channel feedback it lives inside the effect chain, so it can
  // sit before or after other units.
  const trail = (params.trail ?? 0) / 100
  if (trail > 0.01) {
    if (!r.prev || r.prev.length !== outData.length) r.prev = new Uint8ClampedArray(outData.length)
    const k = trail * 0.97
    for (let i = 0; i < outData.length; i += 4) {
      outData[i] = outData[i] * (1 - k) + r.prev[i] * k
      outData[i + 1] = outData[i + 1] * (1 - k) + r.prev[i + 1] * k
      outData[i + 2] = outData[i + 2] * (1 - k) + r.prev[i + 2] * k
    }
    r.prev.set(outData)
  }
}

const FX_PROCESSORS = {
  'chromatic': fxChromatic,
  'ascii': fxAscii,
  'slitscan': fxSlitscan,
  'edge-detect': fxEdgeDetect,
  'posterize': fxPosterize,
  'pixel-sort': fxPixelSort,
  'mirror': fxMirror,
  'threshold': fxThreshold,
}

/**
 * POINT OPERATIONS — output pixel depends only on the SAME input pixel (plus
 * its coordinates). These are the ones that can be FUSED: a run of them reads
 * and writes each pixel once between them, instead of one whole pass and one
 * whole buffer per effect. Three point effects on a 1080p buffer was three
 * passes over 2 million pixels; fused it is one.
 *
 * Signature `(px, i, x, y, params)` mutating `px` in place — `px` is a 4-slot
 * scratch array reused for every pixel, so fusion allocates nothing.
 * Spatial effects (chromatic, edge-detect, pixel-sort, mirror) read their
 * neighbours and cannot fuse; they keep the whole-buffer form.
 */
/* Bayer 4x4, /16 — the ordered-dither threshold matrix. */
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

/* Interleaved Gradient Noise (Jimenez). Blue-noise-grade thresholds with no
   table and no tiling — three ops per pixel. */
const ign = (x, y) => {
  const v = x * 0.06711056 + y * 0.00583715
  return (52.9829189 * (v % 1)) % 1
}

export const POINT_FX = {
  posterize: (px, i, x, y, params) => {
    const n = Math.max(2, params.levels | 0) - 1
    px[0] = Math.round(px[0] / 255 * n) / n * 255
    px[1] = Math.round(px[1] / 255 * n) / n * 255
    px[2] = Math.round(px[2] / 255 * n) / n * 255
  },
  /* DITHER — ordered threshold, so it is a POINT op and fuses into the same
     pass as posterize/threshold. Two masks:
       0  Bayer 4x4 (kol-monitor's RasterModule) — the classic crosshatch
       1  Interleaved Gradient Noise (Jimenez) — blue-noise quality from three
          multiplies, no lookup table and no visible 4px tiling
     `cell` quantises the threshold grid so the pattern reads at a chosen size
     rather than always at pixel scale. `color` keeps the source hue and
     dithers each channel; off gives the hard 1-bit look. */
  dither: (px, i, x, y, params) => {
    const cell = Math.max(1, params.cell | 0)
    const gx = (x / cell) | 0
    const gy = (y / cell) | 0
    const t = (params.mask | 0) === 1
      ? ign(gx, gy)
      : (BAYER4[gy & 3][gx & 3] + 0.5) / 16
    const bias = ((params.bias ?? 50) / 100 - 0.5) * 0.6
    if ((params.color | 0) === 1) {
      px[0] = px[0] / 255 + bias > t ? 255 : 0
      px[1] = px[1] / 255 + bias > t ? 255 : 0
      px[2] = px[2] / 255 + bias > t ? 255 : 0
      return
    }
    const lum = (px[0] * 0.299 + px[1] * 0.587 + px[2] * 0.114) / 255
    const v = lum + bias > t ? 255 : 0
    px[0] = v; px[1] = v; px[2] = v
  },
  threshold: (px, i, x, y, params) => {
    const level = (params.level / 100) * 255
    const lum = px[0] * 0.299 + px[1] * 0.587 + px[2] * 0.114
    const v = lum >= level ? 255 : 0
    px[0] = v; px[1] = v; px[2] = v
  },
}

/**
 * Is this effect a no-op at its current settings? A neutral effect used to cost
 * a full per-pixel pass plus a fresh frame-sized allocation, every frame, to
 * produce the input unchanged (the pattern imweb early-outs on everywhere).
 * Unlisted types are assumed to always do something.
 */
function isNeutral(fx) {
  const p = fx.params || {}
  switch (fx.type) {
    case 'chromatic': return !(p.offsetX > 0) && !(p.offsetY > 0)   // no split
    case 'posterize': return p.levels >= 32                          // no visible banding
    case 'threshold': return p.level <= 0 || p.level >= 100          // all black / all white is intent, 0 is not
    case 'pixel-sort': return p.threshold >= 100                     // nothing passes the gate
    case 'slitscan': return !(p.depth > 0) && !(p.trail > 0)         // no displacement and no trail is a passthrough
    case 'analog': return !(p.split > 0) && !(p.skew > 0) && !(p.roll > 0) && !(p.vhs > 0) && !(p.crt > 0)
    default: return false                                            // edge-detect and mirror always transform
  }
}

/* Scratch buffers, ping-ponged. `createImageData` per effect per frame meant a
   fresh w*h*4 allocation on the hot path — at 1080p a three-effect chain threw
   away 25 MB every frame, which is GC pressure, not work. Keyed by size so a
   resize reallocates once. */
const scratch = new WeakMap()
function buffers(canvas, ctx, w, h) {
  let s = scratch.get(canvas)
  if (!s || s.w !== w || s.h !== h) {
    s = { w, h, a: ctx.createImageData(w, h), b: ctx.createImageData(w, h) }
    scratch.set(canvas, s)
  }
  return s
}

export function applyCanvasFx(canvas, fxChain) {
  if (!fxChain || fxChain.length === 0) return
  const enabledFx = fxChain.filter(fx => fx.enabled && FX_PROCESSORS[fx.type] && !isNeutral(fx))
  // Every effect neutral → skip the getImageData/putImageData readback entirely.
  if (enabledFx.length === 0) return

  // Same options as useFrameBuffer's cache — a getContext call with different
  // options returns the existing context, but if THIS ran first the buffer
  // would be created GPU-side and every readback below would stall.
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  const w = canvas.width
  const h = canvas.height
  if (w <= 0 || h <= 0) return

  const s = buffers(canvas, ctx, w, h)
  const first = ctx.getImageData(0, 0, w, h)
  let srcData = first.data
  let out = s.a
  let other = s.b
  let wrote = false

  /* Walk the chain, fusing each RUN of consecutive point effects into a single
     pass. [chromatic, posterize, threshold] is 2 passes, not 3. */
  for (let i = 0; i < enabledFx.length;) {
    const run = []
    while (i < enabledFx.length && POINT_FX[enabledFx[i].type]) run.push(enabledFx[i++])

    if (run.length) {
      const dst = out.data
      const px = [0, 0, 0, 0]
      const fns = run.map(fx => [POINT_FX[fx.type], fx.params])
      for (let p = 0, n = srcData.length; p < n; p += 4) {
        px[0] = srcData[p]; px[1] = srcData[p + 1]; px[2] = srcData[p + 2]; px[3] = srcData[p + 3]
        const pixel = p >> 2
        const x = pixel % w
        const y = (pixel / w) | 0
        for (let f = 0; f < fns.length; f++) fns[f][0](px, p, x, y, fns[f][1])
        dst[p] = px[0]; dst[p + 1] = px[1]; dst[p + 2] = px[2]; dst[p + 3] = px[3]
      }
      srcData = dst
      const swap = out; out = other; other = swap
      wrote = true
    }

    if (i < enabledFx.length) {
      const slot = i
      const fx = enabledFx[i++]
      /* Spatial processors get a state handle: some (slitscan) need frame
         history, which a pure (src, out, w, h, params) call has nowhere to
         keep. Keyed by canvas + slot, so two slitscans on one channel keep
         separate rings and a channel's ring dies with its canvas. */
      FX_PROCESSORS[fx.type](srcData, out.data, w, h, fx.params, { canvas, slot })
      srcData = out.data
      const swap = out; out = other; other = swap
      wrote = true
    }
  }

  if (wrote) ctx.putImageData(other, 0, 0)
}
