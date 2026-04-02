import { useEffect, useRef, useCallback } from 'react'
import RotaryDial from './RotaryDial'
import ModuleIO from './ModuleIO'
import JackSocket from './JackSocket'
import { renderDither, SHAPE_OPTIONS } from './ditherEngine'

const PREVIEW_W = 252
const PREVIEW_H = 200

// Subset of modes grouped
const MODE_GROUPS = {
  halftone: ['halftone', 'inv_halftone', 'flat', 'checker', 'posterize'],
  transform: ['rotation', 'stretch_v', 'stretch_h', 'crosshatch', 'flow'],
  glitch: ['glitch', 'melt', 'jitter', 'random_size', 'random_rot'],
  video: ['opacity', 'inv_opacity', 'threshold', 'edges', 'crt_scan'],
  organic: ['interference', 'bio', 'eraser'],
}

const GROUP_KEYS = Object.keys(MODE_GROUPS)
const GROUP_LABELS = { halftone: 'HALT', transform: 'TRNS', glitch: 'GLTC', video: 'VID', organic: 'ORG' }

export default function DitherModule({ id = 'dither1', label = 'DITHER', config, onChange, busRef }) {
  const {
    mode = 'halftone', shape = 'circle',
    cellSize = 10, baseScale = 0.9, gap = 1,
    contrast = 0, intensity = 1.0,
    useColor = true, monoColor = '#ffffff', bgColor = '#111111',
    enabled = false, modeGroup = 'halftone',
    inputExpr = '',
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
      if (busRef?.current) busRef.current[`${id}_out`] = enabled ? 100 : 0
      if (valRef.current) valRef.current.textContent = `${mode}/${shape}`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, mode, shape, cellSize, baseScale, gap, contrast, intensity, useColor, monoColor, bgColor])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const currentModes = MODE_GROUPS[modeGroup] || MODE_GROUPS.halftone

  // Mode group selector
  const grpIdx = GROUP_KEYS.indexOf(modeGroup)
  const cycleGroup = (dir) => {
    const next = (grpIdx + dir + GROUP_KEYS.length) % GROUP_KEYS.length
    const newGroup = GROUP_KEYS[next]
    update('modeGroup', newGroup)
    // Also set mode to first of new group
    const modes = MODE_GROUPS[newGroup]
    if (modes && modes.length) onChange?.({ ...config, modeGroup: newGroup, mode: modes[0] })
  }

  // Mode within group selector
  const modeIdx = currentModes.indexOf(mode)
  const cycleMode = (dir) => {
    const next = (modeIdx + dir + currentModes.length) % currentModes.length
    update('mode', currentModes[next])
  }

  // Shape selector
  const shapeList = SHAPE_OPTIONS.slice(0, 12)
  const shpIdx = shapeList.findIndex(s => s.value === shape)
  const cycleShape = (dir) => {
    const next = (shpIdx + dir + shapeList.length) % shapeList.length
    update('shape', shapeList[next].value)
  }

  return (
    <div className="flex flex-col h-full border-r border-fg-08">
      {/* Header -- 20px */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08 shrink-0" style={{ height: '20px', fontFamily: 'monospace', fontSize: '9px' }}>
        <span className="flex items-center gap-1.5">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}>
            <div className={`rounded-full ${enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`} style={{ width: '6px', height: '6px' }} />
          </span>
          <span className="text-fg-96">{label}</span>
        </span>
        <span ref={valRef} className="text-fg-32" style={{ fontVariantNumeric: 'tabular-nums', fontSize: '8px' }}>
          {enabled ? `${mode}/${shape}` : '—'}
        </span>
      </div>

      {/* Hidden canvas -- still renders for processing */}
      <canvas
        ref={canvasRef}
        width={PREVIEW_W}
        height={PREVIEW_H}
        style={{ display: 'none' }}
      />

      {/* Controls -- flex-1 */}
      <div className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
        {/* Mode group selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">GRP</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleGroup(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '32px', textAlign: 'center' }}>{GROUP_LABELS[modeGroup] || modeGroup}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleGroup(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Mode within group selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">MODE</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleMode(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '56px', textAlign: 'center', fontSize: '8px' }}>{mode.replace('_', ' ')}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleMode(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Shape selector */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">SHP</span>
          <span className="flex items-center gap-1">
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleShape(-1)}>{'\u2039'}</span>
            <span className="text-fg-96" style={{ minWidth: '40px', textAlign: 'center' }}>{shapeList[shpIdx]?.value?.slice(0, 6) || shape}</span>
            <span className="cursor-pointer select-none text-fg-32 hover:text-fg-64" onClick={() => cycleShape(1)}>{'\u203a'}</span>
          </span>
        </div>

        {/* Knobs -- vertical stack */}
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center justify-around w-full">
            <RotaryDial label="Cell" value={Math.round((cellSize - 4) / 36 * 100)} onChange={(v) => update('cellSize', Math.round(v / 100 * 36 + 4))} size={32} defaultValue={17} busRef={busRef} />
            <RotaryDial label="Scale" value={Math.round(baseScale / 3 * 100)} onChange={(v) => update('baseScale', Math.round(v / 100 * 3 * 100) / 100)} size={32} defaultValue={30} busRef={busRef} />
          </div>
          <div className="flex items-center justify-around w-full">
            <RotaryDial label="Gap" value={Math.round(gap / 20 * 100)} onChange={(v) => update('gap', Math.round(v / 100 * 20))} size={32} defaultValue={5} busRef={busRef} />
            <RotaryDial label="Ctrst" value={Math.round((contrast + 100) / 200 * 100)} onChange={(v) => update('contrast', Math.round(v / 100 * 200 - 100))} size={32} defaultValue={50} busRef={busRef} />
          </div>
          <RotaryDial label="Int" value={Math.round(intensity / 5 * 100)} onChange={(v) => update('intensity', Math.round(v / 100 * 5 * 100) / 100)} size={32} defaultValue={20} busRef={busRef} />
        </div>

        {/* Color toggle */}
        <div className="flex items-center justify-between" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
          <span className="text-fg-32">COLOR</span>
          <span
            className={`cursor-pointer select-none ${useColor ? 'text-fg-96' : 'text-fg-32'}`}
            onClick={() => update('useColor', !useColor)}
          >
            {useColor ? 'SOURCE' : 'MONO'}
          </span>
        </div>
      </div>

      {/* Inputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="in" moduleId={id} configKey="inputExpr" onExprChange={(v) => update('inputExpr', v)} busRef={busRef} active={!!inputExpr} label="IN" size="md" />
      </div>

      {/* Outputs */}
      <div className="flex items-center justify-center gap-3 py-2">
        <JackSocket type="out" busKey={`${id}_out`} moduleId={id} onEnable={() => update('enabled', true)} busRef={busRef} label="OUT" size="md" />
      </div>

      <ModuleIO
        moduleId={id}
        onEnable={() => update('enabled', true)}
        busRef={busRef}
        outputs={[]}
        inputs={[]}
      />
    </div>
  )
}
