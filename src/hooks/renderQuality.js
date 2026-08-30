import { useSyncExternalStore } from 'react'

/**
 * renderQuality — the app's performance budget, in one place.
 *
 * The mixer is FILL-RATE bound: every stage (capture, canvas FX, feedback, bus
 * compositing, paint) costs in proportion to pixels, so halving the linear
 * scale quarters the work across all of them at once. That makes `scale` the
 * single highest-leverage control the app has, worth more than any per-stage
 * micro-optimisation.
 *
 * Own store rather than `useMirrorState` because Settings and the studio are
 * different routes — threading it through the router would mean lifting the
 * whole instrument state above the shell. Persisted, so a machine that needs
 * half-res keeps it across reloads.
 */
const KEY = 'mirror-render-quality'

export const SCALE_OPTIONS = [
  { value: 1, label: 'Full', detail: '1:1 — best quality' },
  { value: 0.75, label: '3/4', detail: '56% of the pixels' },
  { value: 0.5, label: 'Half', detail: '25% of the pixels' },
  { value: 0.25, label: 'Quarter', detail: '6% — rescue mode' },
]

export const PIXEL_RATIO_OPTIONS = [
  { value: 1, label: '1x', detail: 'logical pixels — recommended' },
  { value: 2, label: '2x', detail: 'retina — 4x the fill cost' },
]

export const FRAME_DIVISOR_OPTIONS = [
  { value: 1, label: 'Every frame', detail: '60fps target' },
  { value: 2, label: 'Every 2nd', detail: '30fps, full resolution' },
  { value: 3, label: 'Every 3rd', detail: '20fps' },
]

export const PIXEL_CAP_OPTIONS = [
  { value: 8294400, label: '4K', detail: '3840×2160' },
  { value: 2073600, label: '1080p', detail: '1920×1080' },
  { value: 921600, label: '720p', detail: '1280×720' },
  { value: 409920, label: '480p', detail: '854×480' },
]

const DEFAULTS = {
  scale: 1,
  maxPixels: 2073600,
  /* Uploaded SVGs were rasterised at a flat 4× natural size — a 1024px vector
     became a 4096² texture, ~67 MB in GPU memory, per channel. 2× is still
     crisp on a retina display at any sane canvas size. */
  svgRasterScale: 2,
  /* Cap a channel's own render surface. Independent of `scale`, which governs
     the offscreen pipeline; this one bounds what each backend draws at source. */
  maxChannelPixels: 2073600,
  /* WebGL device pixel ratio. On a retina display DPR=2 silently doubles every
     dimension and QUADRUPLES fill cost across every Pixi channel, for detail
     that is invisible on moving imagery. 1 is the right default for a video
     instrument (the same call imweb makes, and for the same reason). */
  pixelRatio: 1,
  /* Render every Nth frame. Unlike dropping quality this keeps full resolution
     and simply runs the instrument slower — and because the frame loop's clock
     advances in lockstep, feedback trails stay coherent instead of tearing. */
  frameDivisor: 1,
  /* Closed loop: let measured fps drive the scale down (and back up) on its
     own. `scale` stays the user's CEILING; `autoScale` is what the controller
     picked below it, and null when it has nothing to say. */
  adaptive: false,
  targetFps: 55,
  autoScale: null,
}

/* What the render path actually uses: the controller's pick when adaptive is
   on, otherwise the user's setting. Kept as a derived field so every consumer
   reads one number and none of them has to know the loop exists. */
const withEffective = (q) => ({ ...q, effectiveScale: q.adaptive && q.autoScale ? Math.min(q.autoScale, q.scale) : q.scale })

function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...DEFAULTS, ...(raw && typeof raw === 'object' ? raw : {}) }
  } catch { return { ...DEFAULTS } }
}

let quality = withEffective(read())
const listeners = new Set()

/* A ref-shaped view for the render loop — read every frame, never a subscriber. */
export const qualityRef = { current: quality }

export function setQuality(patch) {
  quality = withEffective({ ...quality, ...patch })
  qualityRef.current = quality
  try {
    const { autoScale: _a, effectiveScale: _e, ...persist } = quality
    localStorage.setItem(KEY, JSON.stringify(persist))
  } catch { /* private mode */ }
  listeners.forEach((l) => l())
}

export const resetQuality = () => setQuality(DEFAULTS)
export const getQuality = () => quality

export const useRenderQuality = () =>
  useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => quality)
