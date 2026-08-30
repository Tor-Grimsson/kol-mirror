import { useEffect, useRef, useState } from 'react'
import { internalSize, EDGED_MAX } from './size'
import { transport } from '../../../hooks/transport'

/**
 * LiveInputGenerator — camera or video file as a channel source.
 *
 * The point of this repo is raster: pixel data through raster FX at frame rate.
 * A camera is the purest form of that — the frames arrive as pixels already, so
 * unlike a vector there is nothing to rasterise, no `svgRasterScale`, no texture
 * re-bake on colour change. It plugs straight into slitscan, trails and the rest.
 *
 * Registers itself through the same `onCanvasReady` seam as the procedural
 * generators, so everything downstream — capture, buses, FX, recording — treats
 * it as an ordinary channel source with no special case.
 *
 * `deviceId` covers a phone as well as a built-in webcam: an iPhone on
 * Continuity Camera, or any capture device, simply appears in the list.
 *
 * The draw is `drawImage(video)`, which the browser keeps on the GPU — the
 * expensive thing in this app is reading pixels BACK (measured: ~2.7 ms per
 * channel for a canvas-FX readback), never drawing them forward.
 */
export default function LiveInputGenerator({
  width,
  height,
  source = 'camera',
  deviceId = '',
  fileUrl = null,
  mirrored = 1,
  fit = 'cover',
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const videoRef = useRef(null)
  const rafRef = useRef(null)
  const streamRef = useRef(null)
  const readyFired = useRef(false)
  const [error, setError] = useState(null)

  const onReadyRef = useRef(onCanvasReady)
  useEffect(() => { onReadyRef.current = onCanvasReady })

  // ── the media element (one, reused; never mounted in the DOM)
  useEffect(() => {
    const video = document.createElement('video')
    // Same CORS rule as images: a video drawn into a canvas taints it unless the
    // request opts in, and a cached non-CORS response will taint even after the
    // bucket policy lands (kol-r2b2, 2026-08-27).
    video.crossOrigin = 'anonymous'
    video.muted = true
    video.playsInline = true
    video.loop = true
    videoRef.current = video
    return () => {
      video.pause()
      video.srcObject = null
      videoRef.current = null
    }
  }, [])

  // ── the source: a camera stream or a file
  useEffect(() => {
    let cancelled = false
    const video = videoRef.current
    if (!video) return

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }

    if (source === 'file') {
      stopStream()
      setError(fileUrl ? null : 'No video loaded')
      video.srcObject = null
      if (fileUrl) { video.src = fileUrl; video.play().catch(() => {}) }
      return () => { cancelled = true }
    }

    // Camera. getUserMedia must be called from a secure context (localhost
    // counts) and will reject outright if the user declines — surface that
    // rather than leaving a silent black channel.
    setError(null)
    navigator.mediaDevices?.getUserMedia({
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
      audio: false,
    }).then(async (stream) => {
      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return }
      stopStream()
      streamRef.current = stream
      video.src = ''
      video.srcObject = stream
      await video.play().catch(() => {})
      // Labels are only populated once permission is granted, so enumerate after.
      try { setDevices((await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === 'videoinput')) } catch { /* ignore */ }
    }).catch((e) => {
      if (!cancelled) setError(e?.name === 'NotAllowedError' ? 'Camera permission denied' : (e?.message || 'No camera'))
    })

    return () => { cancelled = true; stopStream() }
  }, [source, deviceId, fileUrl])

  // ── the draw loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const [iw, ih] = internalSize(width, height, EDGED_MAX)
    canvas.width = iw
    canvas.height = ih
    const ctx = canvas.getContext('2d')

    if (!readyFired.current && onReadyRef.current) {
      readyFired.current = true
      onReadyRef.current(canvas)
    }

    /* Paused FREEZES the picture; it does not withhold it. The gate used to
       return before the first draw ever ran, so a camera patched correctly on a
       paused desk was BLACK — the one source in the instrument that shows
       nothing at rest, while every still shows immediately. One frame lands,
       then the clock governs; that is what "frozen on the last frame" meant. */
    let drawnOnce = false
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      const video = videoRef.current
      if (drawnOnce && (!animate || !transport.playing)) return
      if (!video || video.readyState < 2 || !video.videoWidth) return

      const vw = video.videoWidth
      const vh = video.videoHeight
      let sx = 0, sy = 0, sw = vw, sh = vh
      if (fit === 'cover') {
        // Crop the source to the canvas aspect rather than letterboxing.
        const target = iw / ih
        const srcAspect = vw / vh
        if (srcAspect > target) { sw = vh * target; sx = (vw - sw) / 2 }
        else { sh = vw / target; sy = (vh - sh) / 2 }
      }
      ctx.save()
      if (mirrored) { ctx.translate(iw, 0); ctx.scale(-1, 1) }
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, iw, ih)
      ctx.restore()
      drawnOnce = true
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [width, height, fit, mirrored, animate])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" style={{ objectFit: 'cover', display: 'block' }} />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center kol-helper-12 text-fg-48" style={{ pointerEvents: 'none' }}>
          {error}
        </div>
      )}
    </div>
  )
}
