import { useEffect, useRef } from 'react'
import { internalSize, SMOOTH_MAX } from './size'
import { transport } from '../../../hooks/transport'

/**
 * WaveGenerator — a directional waveform field: sine, saw, pulse, square, random.
 *
 * Ported 2026-08-28 from the April videomodulo rack's GEN module
 * (`_tmp/2026-08-28-raster-generator/GeneratorModule-april-bdc1fbe.jsx`, commit
 * bdc1fbe "video modular library"), which the user identified from a screenshot
 * of that rack — gen2 running WAVE with FREQ · SPEED · ANGLE · PWM.
 *
 * It is the one algorithm family that never crossed into mirror. gen1's NOISE
 * lives on as `NoiseGenerator`, and GRAD / PTRN / CLR became Gradient, Pattern
 * and Color Field; WAVE was left behind in the extraction.
 *
 * The maths is the original's, unchanged: project each pixel onto a direction
 * vector, take that as phase, and shape it. What is new is the housekeeping the
 * rest of mirror's generators already do — an internal buffer instead of drawing
 * at canvas size, `transport`-gated motion, and delta-accumulated time so a
 * parameter change mid-play does not snap the phase back to zero.
 */

const SHAPES = { sin: 1, saw: 1, pls: 1, sqr: 1, rnd: 1 }

function hexToRgb(hex) {
  const h = (hex || '#ffffff').replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) || 0,
    parseInt(h.substring(2, 4), 16) || 0,
    parseInt(h.substring(4, 6), 16) || 0,
  ]
}

export default function WaveGenerator({
  width,
  height,
  shape = 'sin',
  freq = 8,
  speed = 1,
  angle = 0,
  pwm = 50,
  contrast = 100,
  motion = false,
  fgColor = '#ffffff',
  bgColor = '#000000',
  animate = true,
  onCanvasReady,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const readyFired = useRef(false)
  /* Time is ACCUMULATED, not read from the clock: a parameter change must not
     jump the phase, and pausing must hold the exact frame. Same rule the other
     generators follow. */
  const tRef = useRef(0)
  const lastRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const [iw, ih] = internalSize(width, height, SMOOTH_MAX)
    canvas.width = iw
    canvas.height = ih
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    if (!readyFired.current && onCanvasReady) {
      readyFired.current = true
      onCanvasReady(canvas)
    }

    const sub = SHAPES[shape] ? shape : 'sin'
    const [fr, fg, fb] = hexToRgb(fgColor)
    const [br, bg, bb] = hexToRgb(bgColor)
    const k = Math.max(0.01, contrast / 100)
    const duty = Math.max(0.05, Math.min(0.95, pwm / 100))
    const rad = (angle * Math.PI) / 180
    const cosA = Math.cos(rad)
    const sinA = Math.sin(rad)
    const f = Math.max(1, freq)

    const img = ctx.createImageData(iw, ih)
    const d = img.data

    const draw = (now) => {
      rafRef.current = requestAnimationFrame(draw)
      const dt = lastRef.current ? Math.min(0.1, (now - lastRef.current) / 1000) : 0
      lastRef.current = now
      const running = animate && motion && transport.playing
      if (running) tRef.current += dt * speed
      /* Paused still DRAWS — every source in the instrument shows its current
         frame at rest. Only the phase stops. */
      const phase = tRef.current

      for (let y = 0; y < ih; y++) {
        for (let x = 0; x < iw; x++) {
          const u = ((x * cosA + y * sinA) / iw) * f + phase
          const p = ((u % 1) + 1) % 1
          let v
          if (sub === 'sin') v = Math.sin(u * Math.PI * 2) * 0.5 + 0.5
          else if (sub === 'saw') v = p
          else if (sub === 'pls') v = p < duty ? 1 : 0
          else if (sub === 'sqr') v = p < 0.5 ? 1 : 0
          else v = Math.random()

          /* Contrast around the midpoint, then a two-stop ramp — the same
             colouring every other mirror generator uses, so a wave sits in a
             patch beside them without looking like a different instrument. */
          v = Math.max(0, Math.min(1, (v - 0.5) * k + 0.5))
          const i = (y * iw + x) << 2
          d[i] = br + (fr - br) * v
          d[i + 1] = bg + (fg - bg) * v
          d[i + 2] = bb + (fb - bb) * v
          d[i + 3] = 255
        }
      }
      ctx.putImageData(img, 0, 0)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [width, height, shape, freq, speed, angle, pwm, contrast, motion, fgColor, bgColor, animate, onCanvasReady])

  return (
    <div className="absolute inset-0">
      <canvas ref={canvasRef} className="w-full h-full" style={{ objectFit: 'cover', display: 'block' }} />
    </div>
  )
}
