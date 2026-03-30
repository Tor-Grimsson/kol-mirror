import { useRef, useEffect, useCallback } from 'react'

/**
 * Creates a hidden canvas that mirrors DOM-rendered variant output each frame.
 * The canvas can be passed to captureStream() for recording.
 *
 * @param {object} options
 * @param {boolean} options.active - Start/stop the rAF capture loop
 * @param {string} options.sourceImage - Image URL to draw
 * @param {number} options.width - Canvas width
 * @param {number} options.height - Canvas height
 * @param {'displacement'|'movement'} options.variantType
 * @param {string} [options.filterId] - SVG filter ID (displacement only)
 * @param {RefObject} [options.imgElementRef] - Ref to live <img> element (movement only)
 * @returns {{ canvasRef: RefObject<HTMLCanvasElement> }}
 */
export default function useDomCaptureCanvas({
  active = false,
  sourceImage,
  width,
  height,
  variantType,
  filterId,
  imgElementRef,
}) {
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)
  const rafRef = useRef(null)
  const sourceImgRef = useRef(null)
  const sourceReadyRef = useRef(false)
  const mountedRef = useRef(null) // DOM-mounted canvas element for displacement

  // Create canvas once
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvasRef.current = canvas
    ctxRef.current = canvas.getContext('2d')

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (mountedRef.current?.parentNode) mountedRef.current.parentNode.removeChild(mountedRef.current)
      canvasRef.current = null
      ctxRef.current = null
    }
  }, [])

  // Load source image
  useEffect(() => {
    if (!sourceImage) { sourceReadyRef.current = false; return }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { sourceImgRef.current = img; sourceReadyRef.current = true }
    img.src = sourceImage
    return () => { sourceReadyRef.current = false }
  }, [sourceImage])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !width || !height) return
    canvas.width = width
    canvas.height = height
  }, [width, height])

  // Mount/unmount canvas in DOM for displacement (SVG filter URL resolution)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (active && variantType === 'displacement') {
      canvas.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;z-index:-9999;'
      document.body.appendChild(canvas)
      mountedRef.current = canvas
    }

    return () => {
      if (mountedRef.current?.parentNode) {
        mountedRef.current.parentNode.removeChild(mountedRef.current)
        mountedRef.current = null
      }
    }
  }, [active, variantType])

  // Object-cover draw helper: fills canvas while preserving aspect ratio
  const drawCover = useCallback((ctx, img, w, h) => {
    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    if (!iw || !ih) return
    const scale = Math.max(w / iw, h / ih)
    const sw = iw * scale
    const sh = ih * scale
    ctx.drawImage(img, (w - sw) / 2, (h - sh) / 2, sw, sh)
  }, [])

  // rAF capture loop
  useEffect(() => {
    if (!active) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
      return
    }

    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const loop = () => {
      if (!sourceReadyRef.current || !canvas.width || !canvas.height) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      if (variantType === 'displacement' && filterId) {
        ctx.save()
        ctx.filter = `url(#${filterId})`
        ctx.translate(w / 2, h / 2)
        ctx.scale(1.3, 1.3)
        ctx.translate(-w / 2, -h / 2)
        drawCover(ctx, sourceImgRef.current, w, h)
        ctx.restore()
      } else if (variantType === 'movement' && imgElementRef?.current) {
        const style = window.getComputedStyle(imgElementRef.current)
        const matrix = new DOMMatrix(style.transform || 'none')
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, 0, 0)
        ctx.translate(-w / 2, -h / 2)
        drawCover(ctx, sourceImgRef.current, w, h)
        ctx.restore()
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    }
  }, [active, variantType, filterId, imgElementRef, drawCover])

  return { canvasRef }
}
