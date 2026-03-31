import { useRef, useCallback, useEffect } from 'react'
import { applyCanvasFx } from './useCanvasFx'

export default function useFrameBuffer(channelCount) {
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
    const ctx = fbBuf.getContext('2d')
    // Decay: lower alpha = faster fade of accumulated content
    ctx.globalAlpha = feedback.decay / 100
    // Draw existing feedback onto itself (persistence)
    // Then composite new frame on top
    try {
      // New frame drawn with reduced alpha creates the trail effect
      ctx.drawImage(frame, 0, 0, w, h)
    } catch { /* frame not ready */ }
    ctx.globalAlpha = 1
  }, [ensureFeedbackBuffer])

  const getFeedbackFrame = useCallback((index) => {
    return feedbackBuffersRef.current.get(index) || null
  }, [])

  const clearFeedbackBuffer = useCallback((index) => {
    feedbackBuffersRef.current.delete(index)
  }, [])

  const captureAll = useCallback(() => {
    canvasRegistryRef.current.forEach((canvas, index) => {
      const w = canvas.width || canvas.offsetWidth || sizeRef.current.width
      const h = canvas.height || canvas.offsetHeight || sizeRef.current.height
      if (w <= 0 || h <= 0) return
      sizeRef.current = { width: w, height: h }
      const buf = ensureBuffer(index, w, h)
      const ctx = buf.getContext('2d')
      ctx.clearRect(0, 0, w, h)
      try {
        ctx.drawImage(canvas, 0, 0, w, h)
      } catch { /* cross-origin or invalid canvas */ }
    })
  }, [ensureBuffer])

  const getChannelFrame = useCallback((index) => {
    // String key = bus source (e.g. 'rtn1', 'aux1') — delegate to bus buffers
    if (typeof index === 'string') return busBuffersRef.current.get(index) || null
    return buffersRef.current.get(index) || null
  }, [])

  const BUS_KEYS = ['aux1', 'aux2', 'rtn1', 'rtn2', 'fx1', 'fx2']

  const compositeBuses = useCallback((channels, buses) => {
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
      const ctx = buf.getContext('2d')
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
  }, [ensureBusBuffer])

  const getBusFrame = useCallback((key) => {
    return busBuffersRef.current.get(key) || null
  }, [])

  const processChannelFx = useCallback((index, canvasFxChain) => {
    if (!canvasFxChain || canvasFxChain.length === 0) return
    const buf = buffersRef.current.get(index)
    if (!buf || buf.width <= 0 || buf.height <= 0) return
    applyCanvasFx(buf, canvasFxChain)
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
