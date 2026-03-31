import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from '../RotaryDial'
import Divider from '../../atoms/Divider'
import ModuleIO from './ModuleIO'
import { renderDither, MODE_OPTIONS, SHAPE_OPTIONS, DEFAULT_PARAMS } from './ditherEngine'

const PREVIEW_W = 252
const PREVIEW_H = 200

// Subset of modes grouped for button rows
const MODE_GROUPS = {
  halftone: ['halftone', 'inv_halftone', 'flat', 'checker', 'posterize'],
  transform: ['rotation', 'stretch_v', 'stretch_h', 'crosshatch', 'flow'],
  glitch: ['glitch', 'melt', 'jitter', 'random_size', 'random_rot'],
  video: ['opacity', 'inv_opacity', 'threshold', 'edges', 'crt_scan'],
  organic: ['interference', 'bio', 'eraser'],
}

export default function DitherModule({ id = 'dither1', label = 'DITHER', config, onChange, busRef }) {
  const {
    mode = 'halftone', shape = 'circle',
    cellSize = 10, baseScale = 0.9, gap = 1,
    contrast = 0, intensity = 1.0,
    useColor = true, monoColor = '#ffffff', bgColor = '#111111',
    enabled = false, modeGroup = 'halftone', preview = true,
  } = config || {}

  const canvasRef = useRef(null)
  const sourceRef = useRef(null)
  const rafRef = useRef(null)
  const valRef = useRef(null)

  // Create a test pattern as source image
  useEffect(() => {
    const img = new Image()
    const c = document.createElement('canvas')
    c.width = PREVIEW_W; c.height = PREVIEW_H
    const ctx = c.getContext('2d')
    // Gradient test pattern
    const grad = ctx.createLinearGradient(0, 0, PREVIEW_W, PREVIEW_H)
    grad.addColorStop(0, '#000'); grad.addColorStop(0.3, '#444')
    grad.addColorStop(0.5, '#888'); grad.addColorStop(0.7, '#ccc')
    grad.addColorStop(1, '#fff')
    ctx.fillStyle = grad; ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H)
    // Add some circles for variation
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.arc(PREVIEW_W * (i + 1) / 6, PREVIEW_H / 2, 20 + i * 5, 0, Math.PI * 2)
      ctx.fillStyle = `hsl(${i * 60}, 70%, ${30 + i * 10}%)`
      ctx.fill()
    }
    img.src = c.toDataURL()
    img.onload = () => { sourceRef.current = img }
  }, [])

  // Render loop
  useEffect(() => {
    if (!enabled || !canvasRef.current) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.fillStyle = 'rgba(255,255,255,0.03)'
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      if (valRef.current) valRef.current.textContent = '—'
      return
    }

    const tick = () => {
      const canvas = canvasRef.current
      const source = sourceRef.current
      if (canvas && source) {
        canvas.width = PREVIEW_W
        canvas.height = PREVIEW_H
        renderDither(canvas, source, {
          mode, shape, cellSize, baseScale, gap,
          contrast, intensity, useColor, monoColor, bgColor,
        })
      }
      if (valRef.current) valRef.current.textContent = `${mode}/${shape}`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, mode, shape, cellSize, baseScale, gap, contrast, intensity, useColor, monoColor, bgColor])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const currentModes = MODE_GROUPS[modeGroup] || MODE_GROUPS.halftone

  return (
    <div className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08" style={{ width: '280px', borderRadius: '4px' }}>
      {/* Header */}
      <div className="flex items-center justify-between kol-helper-xs px-3 border-b border-fg-08" style={{ height: '29px' }}>
        <span className="flex items-center gap-3">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} />
          </span>
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{label}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className={`cursor-pointer select-none kol-helper-xxs ${preview ? 'text-fg-32' : 'text-fg-16'}`}
            onClick={() => update('preview', !preview)}
          >
            {preview ? '◉' : '◎'}
          </span>
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-3">
        {/* Preview */}
        <canvas
          ref={canvasRef}
          width={PREVIEW_W}
          height={PREVIEW_H}
          style={{ width: '100%', height: preview ? `${PREVIEW_H}px` : '6px', borderRadius: '3px', backgroundColor: 'var(--kol-surface-tertiary)', display: 'block', overflow: 'hidden', transition: 'height 0.15s' }}
        />

        {/* Mode group tabs */}
        <div className="flex items-center gap-1">
          {Object.keys(MODE_GROUPS).map(g => (
            <button
              key={g}
              className={`flex-1 kol-helper-xxs py-0.5 rounded-sm cursor-pointer border ${
                modeGroup === g
                  ? 'bg-[#e74c3c] text-fg-96 border-[#e74c3c]'
                  : 'bg-transparent text-fg-24 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '8px', textTransform: 'uppercase' }}
              onClick={() => update('modeGroup', g)}
            >
              {g.slice(0, 4)}
            </button>
          ))}
        </div>

        {/* Mode buttons within group */}
        <div className="flex items-center gap-1 flex-wrap">
          {currentModes.map(m => (
            <button
              key={m}
              className={`kol-helper-xxs py-0.5 px-1 rounded-sm cursor-pointer border ${
                mode === m
                  ? 'bg-fg-96 text-surface-primary border-fg-96'
                  : 'bg-transparent text-fg-32 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '8px' }}
              onClick={() => update('mode', m)}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Shape selector — compact scrollable row */}
        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-fg-24 kol-helper-xxs shrink-0">SHP</span>
          {SHAPE_OPTIONS.slice(0, 12).map(s => (
            <button
              key={s.value}
              className={`shrink-0 kol-helper-xxs py-0.5 px-1 rounded-sm cursor-pointer border ${
                shape === s.value
                  ? 'bg-fg-96 text-surface-primary border-fg-96'
                  : 'bg-transparent text-fg-24 border-fg-08 hover:text-fg-64'
              }`}
              style={{ fontSize: '7px' }}
              onClick={() => update('shape', s.value)}
            >
              {s.value.slice(0, 4)}
            </button>
          ))}
        </div>

        <Divider />

        {/* Knobs row 1 */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Cell" value={Math.round((cellSize - 4) / 36 * 100)} onChange={(v) => update('cellSize', Math.round(v / 100 * 36 + 4))} size={36} defaultValue={17} busRef={busRef} />
          <RotaryDial label="Scale" value={Math.round(baseScale / 3 * 100)} onChange={(v) => update('baseScale', Math.round(v / 100 * 3 * 100) / 100)} size={36} defaultValue={30} busRef={busRef} />
          <RotaryDial label="Gap" value={Math.round(gap / 20 * 100)} onChange={(v) => update('gap', Math.round(v / 100 * 20))} size={36} defaultValue={5} busRef={busRef} />
        </div>

        {/* Knobs row 2 */}
        <div className="flex items-center justify-around">
          <RotaryDial label="Ctrst" value={Math.round((contrast + 100) / 200 * 100)} onChange={(v) => update('contrast', Math.round(v / 100 * 200 - 100))} size={36} defaultValue={50} busRef={busRef} />
          <RotaryDial label="Int" value={Math.round(intensity / 5 * 100)} onChange={(v) => update('intensity', Math.round(v / 100 * 5 * 100) / 100)} size={36} defaultValue={20} busRef={busRef} />
        </div>

        {/* Color toggle */}
        <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-64">Color</span>
          <span
            className={`cursor-pointer select-none ${useColor ? 'text-fg-96' : 'text-fg-32'}`}
            onClick={() => update('useColor', !useColor)}
          >
            {useColor ? 'SOURCE' : 'MONO'}
          </span>
        </div>

        {/* Output */}
        <div className="flex items-center justify-between kol-helper-xs">
          <span className="text-fg-32">Mode</span>
          <span ref={valRef} className="text-fg-64" style={{ fontVariantNumeric: 'tabular-nums', fontSize: '9px' }}>
            {enabled ? `${mode}/${shape}` : '—'}
          </span>
        </div>
      </div>

      <ModuleIO
        moduleId={id}
        outputs={[]}
        inputs={[]}
      />
    </div>
  )
}
