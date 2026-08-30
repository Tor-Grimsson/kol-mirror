import { useRef, useCallback, useEffect } from 'react'
import { applyCanvasFx, fxPath } from './useCanvasFx'
import { begin, end } from './renderStats'
import { runChain, gpuAvailable } from './gpuFx'
import { buildPasses } from './gpuFxShaders'
import { runSlitscan } from './gpuSlitscan'

/* Every offscreen buffer is sized through here, so ONE knob shrinks the whole
   pipeline — capture, canvas FX, feedback and bus compositing all read it.
   `scale` is the linear divisor (0.5 = quarter the pixels); `maxPixels` is a
   hard ceiling for the case a 5K display hands us a 14 MP canvas. Fill rate is
   what this app is bound by, so this is the highest-leverage control it has. */
const DEFAULT_QUALITY = { scale: 1, maxPixels: 2_073_600 } // 1920×1080

function scaled(w, h, q) {
  const scale = q?.effectiveScale ?? q?.scale ?? 1
  const maxPixels = q?.maxPixels ?? DEFAULT_QUALITY.maxPixels
  let tw = Math.max(1, Math.round(w * scale))
  let th = Math.max(1, Math.round(h * scale))
  const px = tw * th
  if (maxPixels > 0 && px > maxPixels) {
    const k = Math.sqrt(maxPixels / px)
    tw = Math.max(1, Math.round(tw * k))
    th = Math.max(1, Math.round(th * k))
  }
  return [tw, th]
}

/* getContext('2d') on the same canvas returns the same object, but it is still
   a call on the hot path — one per buffer per stage per frame. Cached.
 *
 * `willReadFrequently` is the load-bearing part. These buffers are read back by
 * the canvas-FX stage every frame, and without the hint Chrome keeps them
 * GPU-resident so every getImageData forces a pipeline sync. Measured on a
 * Radeon Pro 570X: a 0.01 MP buffer with two effects cost 4.20 ms per frame —
 * ~420 ns per pixel, which is nonsense for the arithmetic and was entirely the
 * stall. The flag must be set on the FIRST getContext call for the canvas, so
 * it lives here where the context is created. */
const ctxCache = new WeakMap()
const ctx2d = (canvas) => {
  let c = ctxCache.get(canvas)
  if (!c) { c = canvas.getContext('2d', { willReadFrequently: true }); ctxCache.set(canvas, c) }
  return c
}

/**
 * @param {number} channelCount
 * @param {{current: {scale:number, maxPixels:number}}} [qualityRef]  live render-quality knob
 */
export default function useFrameBuffer(channelCount, qualityRef) {
  const buffersRef = useRef(new Map())
  const canvasRegistryRef = useRef(new Map())
  const sizeRef = useRef({ width: 640, height: 480 })
  const busBuffersRef = useRef(new Map())
  const feedbackBuffersRef = useRef(new Map())

  const registerCanvas = useCallback((index, canvasEl) => {
    if (canvasEl) {
      canvasRegistryRef.current.set(index, canvasEl)
    } else {
      canvasRegistryRef.current.delete(index)
    }
  }, [])

  const unregisterCanvas = useCallback((index) => {
    canvasRegistryRef.current.delete(index)
    buffersRef.current.delete(index)
  }, [])

  const ensureBuffer = useCallback((index, w, h) => {
    let buf = buffersRef.current.get(index)
    if (!buf || buf.width !== w || buf.height !== h) {
      buf = new OffscreenCanvas(w, h)
      buffersRef.current.set(index, buf)
    }
    return buf
  }, [])

  const ensureBusBuffer = useCallback((key, w, h) => {
    let buf = busBuffersRef.current.get(key)
    if (!buf || buf.width !== w || buf.height !== h) {
      buf = new OffscreenCanvas(w, h)
      busBuffersRef.current.set(key, buf)
    }
    return buf
  }, [])

  const ensureFeedbackBuffer = useCallback((index, w, h) => {
    let buf = feedbackBuffersRef.current.get(index)
    if (!buf || buf.width !== w || buf.height !== h) {
      buf = new OffscreenCanvas(w, h)
      feedbackBuffersRef.current.set(index, buf)
    }
    return buf
  }, [])

  const applyFeedback = useCallback((index, feedback) => {
    if (!feedback?.enabled) return
    const frame = buffersRef.current.get(index)
    if (!frame) return
    const w = frame.width
    const h = frame.height
    if (w <= 0 || h <= 0) return
    const fbBuf = ensureFeedbackBuffer(index, w, h)
    if (feedback.freeze) return // hold buffer, don't update
    const t = begin()
    const ctx = ctx2d(fbBuf)
    // Decay: lower alpha = faster fade of accumulated content
    ctx.globalAlpha = feedback.decay / 100
    // Draw existing feedback onto itself (persistence)
    // Then composite new frame on top
    try {
      // New frame drawn with reduced alpha creates the trail effect
      ctx.drawImage(frame, 0, 0, w, h)
    } catch { /* frame not ready */ }
    ctx.globalAlpha = 1
    end('feedback', t)
  }, [ensureFeedbackBuffer])

  const getFeedbackFrame = useCallback((index) => {
    return feedbackBuffersRef.current.get(index) || null
  }, [])

  const clearFeedbackBuffer = useCallback((index) => {
    feedbackBuffersRef.current.delete(index)
  }, [])

  /**
   * @param {Set<number>} [needed]  only capture channels whose frame is actually
   *   consumed this frame (routed from, sent to a bus, fed back, on Screen 2).
   *   Capturing all three when one is wired was pure waste — a full-canvas
   *   drawImage per channel per frame, thrown away.
   */
  const captureAll = useCallback((needed) => {
    const t = begin()
    const q = qualityRef?.current || DEFAULT_QUALITY
    canvasRegistryRef.current.forEach((canvas, index) => {
      if (needed && !needed.has(index)) return
      const sw = canvas.width || canvas.offsetWidth || sizeRef.current.width
      const sh = canvas.height || canvas.offsetHeight || sizeRef.current.height
      if (sw <= 0 || sh <= 0) return
      const [w, h] = scaled(sw, sh, q)
      sizeRef.current = { width: w, height: h }
      const buf = ensureBuffer(index, w, h)
      const ctx = ctx2d(buf)
      ctx.clearRect(0, 0, w, h)
      try {
        ctx.drawImage(canvas, 0, 0, w, h)
      } catch { /* cross-origin or invalid canvas */ }
    })
    end('capture', t)
  }, [ensureBuffer])

  const getChannelFrame = useCallback((index) => {
    // String key = bus source (e.g. 'rtn1', 'aux1') — delegate to bus buffers
    if (typeof index === 'string') return busBuffersRef.current.get(index) || null
    return buffersRef.current.get(index) || null
  }, [])

  const BUS_KEYS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']

  const compositeBuses = useCallback((channels, buses) => {
    const t = begin()
    const { width: w, height: h } = sizeRef.current
    if (w <= 0 || h <= 0) return
    for (const busKey of BUS_KEYS) {
      const bus = buses[busKey]
      if (!bus?.enabled) { busBuffersRef.current.delete(busKey); continue }
      let hasSends = false
      for (let i = 0; i < channels.length; i++) {
        if (channels[i]?.enabled && (channels[i].sends?.[busKey] || 0) > 0) { hasSends = true; break }
      }
      if (!hasSends) { busBuffersRef.current.delete(busKey); continue }
      const buf = ensureBusBuffer(busKey, w, h)
      const ctx = ctx2d(buf)
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < channels.length; i++) {
        const ch = channels[i]
        if (!ch?.enabled) continue
        const sendLevel = ch.sends?.[busKey] || 0
        if (sendLevel <= 0) continue
        const frame = buffersRef.current.get(i)
        if (!frame) continue
        ctx.globalAlpha = sendLevel / 100
        try { ctx.drawImage(frame, 0, 0, w, h) } catch { /* frame not ready */ }
      }
      ctx.globalAlpha = 1
    }
    end('buses', t)
  }, [ensureBusBuffer])

  const getBusFrame = useCallback((key) => {
    return busBuffersRef.current.get(key) || null
  }, [])

  /**
   * Run a channel's FX chain on its captured frame.
   *
   * SEGMENTED, not voted on (rewritten 2026-08-28). It used to pick ONE path
   * for the whole chain — every unit on the GPU or every unit on the CPU — and
   * the CPU path then silently DROPPED anything missing from `FX_PROCESSORS`.
   * Three units fell through that gap: Analog TV produced nothing in any chain
   * of two or more, Dither vanished whenever Pixel Sort or Slitscan dragged the
   * chain to the CPU, and Slitscan lost echo/space/fade for the same reason.
   * All three were controls that turned and did nothing, with no error.
   *
   * Now the chain is walked as RUNS: the longest possible run of GPU-capable
   * units goes to one `runChain`, the longest run of CPU units to one
   * `applyCanvasFx`, and the buffer crosses between them. Greedy on purpose —
   * each crossing is a readback (~2.7 ms per channel, measured), so two long
   * runs beat six short ones, and a chain that is entirely one path pays
   * exactly what it paid before: one call, no crossings.
   */
  const processChannelFx = useCallback((index, canvasFxChain) => {
    if (!canvasFxChain || canvasFxChain.length === 0) return
    const buf = buffersRef.current.get(index)
    if (!buf || buf.width <= 0 || buf.height <= 0) return
    const live = canvasFxChain.filter((fx) => fx.enabled)
    if (!live.length) return
    const t = begin()

    const gpu = gpuAvailable()
    /* Three paths, not two. Slitscan keeps a ring of past frames in a texture
       array, which `runChain`'s stateless pass form cannot hold — so it is its
       own single-unit GPU run rather than being shoved onto the CPU, where it
       loses echo, space and fade. It used to get the GPU only when it was the
       chain's ONLY unit; now it gets it anywhere in the chain. */
    /* Maximal same-path runs. A `slit` run is always one unit — two slitscans
       in a chain are two runs with two rings, not one shared one. */
    const runs = []
    live.forEach((fx, slot) => {
      const path = fxPath(fx.type, { gpu })
      const last = runs[runs.length - 1]
      if (last && last.path === path && path !== 'slit') last.units.push(fx)
      else runs.push({ path, units: [fx], slot })
    })

    const ctx = ctx2d(buf)
    for (const run of runs) {
      if (run.path === 'slit') {
        const out = runSlitscan(`ch-${index}-${run.slot}`, buf, buf.width, buf.height, run.units[0].params || {})
        if (out) {
          ctx.clearRect(0, 0, buf.width, buf.height)
          ctx.drawImage(out, 0, 0)
        } else {
          applyCanvasFx(buf, run.units)
        }
      } else if (run.path === 'gpu') {
        const out = runChain(buf, buf.width, buf.height, buildPasses(run.units, `ch-${index}`))
        /* A GPU run that fails to init falls through to the CPU rather than
           dropping the units — the same silent-drop this rewrite exists to end.
           Units with no CPU processor are still no-ops there, which the rack
           now says out loud rather than hiding. */
        if (out) {
          ctx.clearRect(0, 0, buf.width, buf.height)
          ctx.drawImage(out, 0, 0)
        } else {
          applyCanvasFx(buf, run.units)
        }
      } else {
        applyCanvasFx(buf, run.units)
      }
    }
    end('canvasFx', t)
  }, [])

  useEffect(() => {
    return () => {
      buffersRef.current.clear()
      busBuffersRef.current.clear()
      feedbackBuffersRef.current.clear()
      canvasRegistryRef.current.clear()
    }
  }, [])

  return { registerCanvas, unregisterCanvas, getChannelFrame, captureAll, compositeBuses, getBusFrame, applyFeedback, getFeedbackFrame, clearFeedbackBuffer, processChannelFx, sizeRef }
}

export function resolveRenderOrder(channels) {
  const count = channels.length
  const order = []
  const visited = new Set()
  const visiting = new Set()

  function visit(i) {
    if (visited.has(i)) return
    if (visiting.has(i)) {
      // Circular dep — use previous frame buffer, add now
      visited.add(i)
      order.push(i)
      return
    }
    visiting.add(i)
    const ch = channels[i]
    const from = ch?.routeFrom
    // String routeFrom = bus source — no channel dependency to resolve
    if (from != null && typeof from !== 'string' && from >= 0 && from < count && from !== i) {
      visit(from)
    }
    const sends = ch?.routeSendLevels
    if (sends) {
      for (const key of Object.keys(sends)) {
        const src = parseInt(key)
        if (!isNaN(src) && src >= 0 && src < count && src !== i && sends[key] > 0) {
          visit(src)
        }
      }
    }
    visiting.delete(i)
    if (!visited.has(i)) {
      visited.add(i)
      order.push(i)
    }
  }

  for (let i = 0; i < count; i++) visit(i)
  return order
}
