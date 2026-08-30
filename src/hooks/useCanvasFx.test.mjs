/**
 * Run: node src/hooks/useCanvasFx.test.mjs
 *
 * The fused point-effect path must produce EXACTLY what the old one-pass-per-
 * effect chain produced. Fusion is a performance change, never a visual one —
 * and a silent colour shift is the kind of regression nobody files a bug for.
 */
import assert from 'node:assert/strict'
import { POINT_FX, fxSlitscan } from './useCanvasFx.js'

// The pre-fusion behaviour, transcribed from the original whole-buffer loops.
const sequential = {
  posterize: (d, w, h, p) => {
    const n = Math.max(2, p.levels | 0) - 1
    for (let i = 0; i < d.length; i += 4) {
      d[i] = Math.round(d[i] / 255 * n) / n * 255
      d[i + 1] = Math.round(d[i + 1] / 255 * n) / n * 255
      d[i + 2] = Math.round(d[i + 2] / 255 * n) / n * 255
    }
  },
  threshold: (d, w, h, p) => {
    const level = (p.level / 100) * 255
    for (let i = 0; i < d.length; i += 4) {
      const lum = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114
      const v = lum >= level ? 255 : 0
      d[i] = v; d[i + 1] = v; d[i + 2] = v
    }
  },
}

const W = 7, H = 5
const source = () => {
  const d = new Uint8ClampedArray(W * H * 4)
  for (let i = 0; i < d.length; i += 4) {
    d[i] = (i * 7) % 256; d[i + 1] = (i * 13) % 256; d[i + 2] = (i * 29) % 256; d[i + 3] = 255
  }
  return d
}

const runSequential = (chain) => {
  const d = source()
  for (const { type, params } of chain) sequential[type](d, W, H, params)
  return d
}

const runFused = (chain) => {
  const src = source()
  const dst = new Uint8ClampedArray(src.length)
  const px = [0, 0, 0, 0]
  const fns = chain.map(({ type, params }) => [POINT_FX[type], params])
  for (let p = 0; p < src.length; p += 4) {
    px[0] = src[p]; px[1] = src[p + 1]; px[2] = src[p + 2]; px[3] = src[p + 3]
    const pixel = p >> 2
    for (let f = 0; f < fns.length; f++) fns[f][0](px, p, pixel % W, (pixel / W) | 0, fns[f][1])
    dst[p] = px[0]; dst[p + 1] = px[1]; dst[p + 2] = px[2]; dst[p + 3] = px[3]
  }
  return dst
}

const chains = [
  [{ type: 'posterize', params: { levels: 4 } }],
  [{ type: 'threshold', params: { level: 50 } }],
  [{ type: 'posterize', params: { levels: 3 } }, { type: 'threshold', params: { level: 40 } }],
  [{ type: 'threshold', params: { level: 60 } }, { type: 'posterize', params: { levels: 8 } }],
  [{ type: 'posterize', params: { levels: 2 } }, { type: 'posterize', params: { levels: 5 } }, { type: 'threshold', params: { level: 70 } }],
]

for (const chain of chains) {
  const name = chain.map(c => c.type).join(' → ')
  assert.deepEqual([...runFused(chain)], [...runSequential(chain)], `fused matches sequential: ${name}`)
}

// Order must still matter — otherwise the test above would pass on a no-op.
const a = runFused([{ type: 'posterize', params: { levels: 3 } }, { type: 'threshold', params: { level: 40 } }])
const b = runFused([{ type: 'threshold', params: { level: 40 } }, { type: 'posterize', params: { levels: 3 } }])
assert.notDeepEqual([...a], [...b], 'chain order still changes the result')

// Alpha is never touched by a point effect.
const out = runFused([{ type: 'threshold', params: { level: 50 } }])
for (let i = 3; i < out.length; i += 4) assert.equal(out[i], 255, 'alpha preserved')

console.log('useCanvasFx: fusion is pixel-identical')

// ── Dither: a point op, so it must fuse like the others and stay deterministic.
{
  const px = [128, 128, 128, 255]
  const p = { cell: 1, bias: 50, mask: 0, color: 0 }
  const seen = new Set()
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const q = [...px]; POINT_FX.dither(q, 0, x, y, p); seen.add(q[0])
  }
  assert.deepEqual([...seen].sort(), [0, 255], 'a flat mid grey dithers to both black and white across the 4x4 matrix')
}
{
  // Bayer must actually vary with position — a constant threshold would give a flat result.
  const p = { cell: 1, bias: 50, mask: 0, color: 0 }
  const at = (x, y) => { const q = [120, 120, 120, 255]; POINT_FX.dither(q, 0, x, y, p); return q[0] }
  assert.notEqual(at(0, 0), at(1, 0), 'neighbouring pixels take different thresholds')
  assert.equal(at(0, 0), at(4, 0), 'the 4x4 matrix tiles')
}
{
  // `cell` quantises the pattern: within one cell every pixel shares a threshold.
  const p = { cell: 4, bias: 50, mask: 0, color: 0 }
  const at = (x, y) => { const q = [120, 120, 120, 255]; POINT_FX.dither(q, 0, x, y, p); return q[0] }
  assert.equal(at(0, 0), at(3, 3), 'one cell, one threshold')
}
{
  // Extremes must not dither — black stays black, white stays white.
  for (const mask of [0, 1]) {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const black = [0, 0, 0, 255]; POINT_FX.dither(black, 0, x, y, { cell: 1, bias: 50, mask, color: 0 })
      const white = [255, 255, 255, 255]; POINT_FX.dither(white, 0, x, y, { cell: 1, bias: 50, mask, color: 0 })
      assert.equal(black[0], 0, `black stays black (mask ${mask})`)
      assert.equal(white[0], 255, `white stays white (mask ${mask})`)
    }
  }
}
{
  // IGN must stay in range and not tile on the Bayer period.
  const p = { cell: 1, bias: 50, mask: 1, color: 0 }
  const at = (x, y) => { const q = [128, 128, 128, 255]; POINT_FX.dither(q, 0, x, y, p); return q[0] }
  let differs = false
  for (let x = 0; x < 32 && !differs; x++) if (at(x, 0) !== at(x + 4, 0)) differs = true
  assert.ok(differs, 'IGN does not repeat on the 4px Bayer period')
}
{
  // Colour mode keeps channels independent; mono collapses them.
  const c = [200, 40, 90, 255]; POINT_FX.dither(c, 0, 1, 1, { cell: 1, bias: 50, mask: 0, color: 1 })
  assert.ok(c[0] === 0 || c[0] === 255)
  const m = [200, 40, 90, 255]; POINT_FX.dither(m, 0, 1, 1, { cell: 1, bias: 50, mask: 0, color: 0 })
  assert.equal(m[0], m[1], 'mono mode collapses to grey')
  assert.equal(m[1], m[2])
}
{
  // Bias is the exposure control: full bias floods white, none floods black.
  const hi = [128, 128, 128, 255]; POINT_FX.dither(hi, 0, 2, 2, { cell: 1, bias: 100, mask: 0, color: 0 })
  const lo = [128, 128, 128, 255]; POINT_FX.dither(lo, 0, 2, 2, { cell: 1, bias: 0, mask: 0, color: 0 })
  assert.ok(hi[0] >= lo[0], 'more bias is never darker')
}

console.log('useCanvasFx: dither checks passed')

// ── Slitscan: the ring index is the classic off-by-one, and it is stateful,
// so it gets exercised across frames rather than in a single call.
{
  const W = 4, H = 8
  const canvas = {}                     // WeakMap key only — no DOM needed
  const frame = (v) => { const d = new Uint8ClampedArray(W * H * 4); d.fill(v); return d }
  const out = new Uint8ClampedArray(W * H * 4)
  const rowValue = (buf, y) => buf[(y * W) * 4]

  // depth 0 → every band reads the newest frame: a passthrough.
  fxSlitscan(frame(10), out, W, H, { depth: 0, bands: 4, axis: 0, trail: 0 }, { canvas, slot: 0 })
  assert.equal(rowValue(out, 0), 10)
  assert.equal(rowValue(out, 7), 10, 'depth 0 shows the current frame everywhere')

  // Feed distinct frames, then displace: the last band must show older content.
  for (const v of [20, 30, 40, 50]) {
    fxSlitscan(frame(v), out, W, H, { depth: 100, bands: 4, axis: 0, trail: 0 }, { canvas, slot: 0 })
  }
  assert.equal(rowValue(out, 0), 50, 'band 0 is always the newest frame')
  assert.ok(rowValue(out, 7) < 50, 'the last band shows an older frame')
  assert.ok(rowValue(out, 7) >= 10, 'and never reads outside the history it has')

  // A second slot on the SAME canvas keeps its own ring.
  const out2 = new Uint8ClampedArray(W * H * 4)
  fxSlitscan(frame(99), out2, W, H, { depth: 100, bands: 4, axis: 0, trail: 0 }, { canvas, slot: 1 })
  assert.equal(rowValue(out2, 7), 99, 'a fresh slot has no history of its own — not the other slot\'s')
}
{
  // Vertical axis displaces across columns instead of rows.
  const W = 8, H = 4
  const canvas = {}
  const out = new Uint8ClampedArray(W * H * 4)
  const grad = (v) => { const d = new Uint8ClampedArray(W * H * 4); d.fill(v); return d }
  for (const v of [10, 90]) fxSlitscan(grad(v), out, W, H, { depth: 100, bands: 4, axis: 1, trail: 0 }, { canvas, slot: 0 })
  const col = (x) => out[x * 4]
  assert.equal(col(0), 90, 'first column is the newest frame')
  assert.ok(col(7) <= 90, 'the far column reaches back in time')
}
{
  // A resize must rebuild the ring rather than read a stale, wrongly-sized frame.
  const canvas = {}
  const out8 = new Uint8ClampedArray(4 * 8 * 4)
  fxSlitscan(new Uint8ClampedArray(4 * 8 * 4).fill(10), out8, 4, 8, { depth: 100, bands: 2, axis: 0, trail: 0 }, { canvas, slot: 0 })
  const out16 = new Uint8ClampedArray(4 * 16 * 4)
  assert.doesNotThrow(() =>
    fxSlitscan(new Uint8ClampedArray(4 * 16 * 4).fill(20), out16, 4, 16, { depth: 100, bands: 2, axis: 0, trail: 0 }, { canvas, slot: 0 }),
    'resizing does not read the old ring')
  assert.equal(out16[0], 20, 'after a resize the newest frame still shows')
}

console.log('useCanvasFx: slitscan checks passed')
