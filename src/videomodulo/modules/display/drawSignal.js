// Shared Canvas2D drawing primitives for display modules
// All draw functions accept an optional pen object for style control

import { PEN_DEFAULTS } from '../../hooks/signals'

const SCOPE_COLOR = '#2ecc71'
const WIRE_COLOR = '#3498db'
const REF_COLOR = 'rgba(255,255,255,0.06)'

function applyPen(ctx, p) {
  ctx.lineWidth = p.thickness
  ctx.lineCap = p.cap
  ctx.globalAlpha = p.opacity / 100
  ctx.setLineDash(p.dash > 0.5 ? [p.dash, p.gap || p.dash] : [])
}

function resetPen(ctx) {
  ctx.globalAlpha = 1
  ctx.setLineDash([])
}

// Scalar: rolling oscilloscope trace from ring buffer
export function drawScalar(ctx, history, writeIdx, bufLen, x, y, w, h, p) {
  // Center reference line
  ctx.strokeStyle = REF_COLOR
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y + h / 2)
  ctx.lineTo(x + w, y + h / 2)
  ctx.stroke()

  // Trace
  applyPen(ctx, p)
  ctx.strokeStyle = SCOPE_COLOR
  ctx.beginPath()
  let started = false
  for (let i = 0; i < bufLen; i++) {
    const idx = (writeIdx + 1 + i) % bufLen
    const val = history[idx]
    const px = x + (i / (bufLen - 1)) * w
    const py = y + h - (val / 100) * h
    if (!started) { ctx.moveTo(px, py); started = true }
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  resetPen(ctx)

  // Current value readout
  const current = history[writeIdx]
  if (current !== undefined) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = '9px monospace'
    ctx.textAlign = 'left'
    ctx.fillText(Math.round(current), x + 3, y + 11)
  }
}

// Color: filled rectangle
export function drawColor(ctx, signal, x, y, w, h, p) {
  const { r, g, b, a } = signal.value
  ctx.globalAlpha = (p.opacity / 100) * a
  ctx.fillStyle = `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4)
  resetPen(ctx)
}

// Points: wireframe (with edges) or waveform polyline (without edges)
export function drawPoints(ctx, signal, x, y, w, h, p) {
  const pts = signal.value
  if (!pts || pts.length === 0) return

  applyPen(ctx, p)

  if (signal.edges && signal.edges.length > 0) {
    ctx.strokeStyle = WIRE_COLOR
    ctx.beginPath()
    for (const [i, j] of signal.edges) {
      if (i >= pts.length || j >= pts.length) continue
      ctx.moveTo(x + pts[i].x * w, y + pts[i].y * h)
      ctx.lineTo(x + pts[j].x * w, y + pts[j].y * h)
    }
    ctx.stroke()
  } else {
    ctx.strokeStyle = SCOPE_COLOR
    ctx.beginPath()
    ctx.moveTo(x + pts[0].x * w, y + pts[0].y * h)
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(x + pts[i].x * w, y + pts[i].y * h)
    }
    ctx.stroke()
  }

  resetPen(ctx)
}

// Dispatch: auto-detect signal type and draw with pen style
export function drawSignal(ctx, signal, x, y, w, h, history, writeIdx, bufLen, penSignal) {
  if (!signal) return
  const p = penSignal?.type === 'pen' ? penSignal.value : PEN_DEFAULTS
  if (signal.type === 'scalar') drawScalar(ctx, history, writeIdx, bufLen, x, y, w, h, p)
  else if (signal.type === 'color') drawColor(ctx, signal, x, y, w, h, p)
  else if (signal.type === 'points') drawPoints(ctx, signal, x, y, w, h, p)
}
