import { useRef, useCallback, useEffect } from 'react'

export default function useFrameBuffer(channelCount) {
  const buffersRef = useRef(new Map())
  const canvasRegistryRef = useRef(new Map())
  const sizeRef = useRef({ width: 640, height: 480 })

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
    return buffersRef.current.get(index) || null
  }, [])

  useEffect(() => {
    return () => {
      buffersRef.current.clear()
      canvasRegistryRef.current.clear()
    }
  }, [])

  return { registerCanvas, unregisterCanvas, getChannelFrame, captureAll, sizeRef }
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
    if (from != null && from >= 0 && from < count && from !== i) {
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
