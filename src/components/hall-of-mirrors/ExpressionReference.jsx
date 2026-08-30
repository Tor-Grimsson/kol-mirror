import { useState, useRef, useEffect, useCallback } from 'react'
import { TabsRow } from '@kolkrabbi/kol-component'
import Divider from '../atoms/Divider'
import { Icon } from '../icons'
import Slider from '../atoms/Slider'
import { compile } from '../../hooks/useExpressionValue'
import { transport } from '../../hooks/transport'
import { useLibrary, addToLibrary, removeFromLibrary } from '../../hooks/useLibraryStore'

function Code({ text, onAppend, onLoad }) {
  return (
    <span
      className="text-fg-96 bg-surface-tertiary px-2 py-1 kol-helper-10 cursor-pointer select-none min-w-0 truncate"
      style={{ borderRadius: '2px', display: 'inline-block', maxWidth: '100%' }}
      onClick={(e) => { if (e.ctrlKey || e.metaKey) onAppend?.(text); else onLoad?.(text) }}
    >{text}</span>
  )
}

function NumberInput({ value, onChange, format = (v) => v.toFixed(1) }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const commit = () => {
    setEditing(false)
    const n = parseFloat(draft)
    if (!isNaN(n)) onChange(n)
  }
  return (
    <span className="text-fg-96 bg-surface-tertiary" style={{ width: '36px', height: '20px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: '10px', fontFamily: 'var(--kol-font-family-mono)', lineHeight: '20px', borderRadius: '2px', padding: '0 8px' }}>
      {editing ? (
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
          autoFocus
          style={{ width: '100%', height: '20px', border: 'none', outline: 'none', color: 'inherit', fontSize: 'inherit', fontFamily: 'inherit', padding: 0, textAlign: 'center', background: 'transparent', lineHeight: '20px' }}
        />
      ) : (
        <span className="cursor-pointer" onClick={() => { setDraft(String(typeof value === 'number' ? format(value) : value)); setEditing(true) }}>{typeof value === 'number' ? format(value) : value}</span>
      )}
    </span>
  )
}

// Exported for Screen 2 (SymphonyViewport) — same scope, different host.
export function Oscilloscope({ expr, setExpr, expanded, setExpanded, fitRequest = 0 }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(100)
  const [duration, setDuration] = useState(5)
  const [zoomX, setZoomX] = useState(1)
  const [zoomY, setZoomY] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const fnRef = useRef(null)
  const dragRef = useRef(null)

  const minRef = useRef(min)
  const maxRef = useRef(max)
  const durRef = useRef(duration)
  const zoomXRef = useRef(zoomX)
  const zoomYRef = useRef(zoomY)
  const panXRef = useRef(panX)
  const panYRef = useRef(panY)
  minRef.current = min
  maxRef.current = max
  zoomXRef.current = zoomX
  zoomYRef.current = zoomY
  panXRef.current = panX
  panYRef.current = panY
  durRef.current = duration

  useEffect(() => {
    fnRef.current = compile(expr)
  }, [expr])

  /* Fit the view to the expression's range over one duration — the Fit button,
     and every load from the reference or the Library (`fitRequest` bumps). */
  const fit = () => {
    const fn = fnRef.current
    if (!fn) return
    let lo = Infinity, hi = -Infinity
    const dur = typeof duration === 'number' ? duration : 5
    for (let i = 0; i <= 300; i++) {
      const t = (i / 300) * dur
      try { const v = fn(t, Math.round(t * 60), 0, 100); if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v } } catch { break }
    }
    if (lo !== Infinity) { const m = (hi - lo) * 0.1; setMin(Math.floor(lo - m)); setMax(Math.ceil(hi + m)) }
  }
  useEffect(() => { if (fitRequest) fit() }, [fitRequest]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.getContext('2d').scale(dpr, dpr)
    })
    ro.observe(canvas.parentElement)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      const fn = fnRef.current
      const elapsed = transport.now()

      ctx.fillStyle = 'var(--kol-surface-primary)'
      ctx.clearRect(0, 0, w, h)

      const mn = minRef.current
      const mx = maxRef.current
      const baseDur = durRef.current
      const zx = zoomXRef.current
      const zy = zoomYRef.current
      const px = panXRef.current
      const py = panYRef.current
      const dur = baseDur / zx
      const viewMin = mn / zy + py
      const viewMax = mx / zy + py + (mx - mn) * (1 - 1 / zy)
      const pad = 12
      const range = (mx - mn) / zy || 1
      const center = (mn + mx) / 2 + py
      const lo = center - range / 2
      const toY = (v) => pad + (h - pad * 2) * (1 - (v - lo) / range)
      const toT = (pixelX) => (pixelX / w) * dur + px

      if (fn) {
        // Sample values to find actual min/max
        let vMin = Infinity, vMax = -Infinity
        for (let i = 0; i < w; i++) {
          const t = toT(i)
          try {
            const v = fn(t, Math.round(t * 60), 0, 100)
            if (v < vMin) vMin = v
            if (v > vMax) vMax = v
          } catch { break }
        }
        const vMid = (vMin + vMax) / 2

        // Knob range 0-100 reference lines (red dashed)
        ctx.strokeStyle = 'rgba(231,76,60,0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        const y0 = toY(0), y100 = toY(100)
        ctx.beginPath(); ctx.moveTo(0, y100); ctx.lineTo(w, y100); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(w, y0); ctx.stroke()
        ctx.setLineDash([])
        ctx.font = '9px var(--kol-font-family-mono)'
        ctx.fillStyle = 'rgba(231,76,60,0.4)'
        ctx.fillText('100', w - 20, y100 + 10)
        ctx.fillText('0', w - 10, y0 - 4)

        // Grid lines at actual min, mid, max
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        ctx.font = '9px var(--kol-font-family-mono)'
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        for (const v of [vMax, vMid, vMin]) {
          const y = toY(v)
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
          ctx.fillText(Math.round(v), 4, y - 3)
        }

        // Static curve
        ctx.strokeStyle = 'rgba(255,255,255,0.15)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 0; i < w; i++) {
          const t = toT(i)
          try {
            const v = fn(t, Math.round(t * 60), 0, 100)
            const y = toY(v)
            i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y)
          } catch { break }
        }
        ctx.stroke()

        // Playhead
        const playT = (elapsed % baseDur)
        const playX = ((playT - px) / dur) * w
        ctx.strokeStyle = 'rgba(45,212,191,0.4)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, h); ctx.stroke()

        // Live trace up to playhead
        ctx.strokeStyle = '#2dd4bf'
        ctx.lineWidth = 2
        ctx.beginPath()
        const traceEnd = Math.min(playX, w)
        for (let i = 0; i < traceEnd; i++) {
          const t = toT(i)
          try {
            const v = fn(t, Math.round(t * 60), 0, 100)
            const y = toY(v)
            i === 0 ? ctx.moveTo(i, y) : ctx.lineTo(i, y)
          } catch { break }
        }
        ctx.stroke()

        // Current value dot
        try {
          const curV = fn(playT, Math.round(playT * 60), 0, 100)
          const dotY = toY(curV)
          ctx.fillStyle = '#2dd4bf'
          ctx.beginPath(); ctx.arc(playX, dotY, 3, 0, Math.PI * 2); ctx.fill()
        } catch {}
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <>
      <div className="pb-2">
        <input
          type="text"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          onClick={(e) => { if (e.altKey) setExpr('0') }}
          placeholder="wave(t)"
          className="w-full bg-surface-tertiary text-fg-96 kol-helper-10"
          style={{ border: 'none', outline: 'none', padding: '4px 8px', borderRadius: '2px', height: '24px', fontFamily: 'var(--kol-font-family-mono)' }}
        />
      </div>
      <div
        className="bg-surface-tertiary flex-1"
        style={{ borderRadius: '2px', minHeight: '160px', position: 'relative', overflow: 'hidden', cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          e.currentTarget.style.cursor = 'grabbing'
          dragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const dx = e.clientX - dragRef.current.startX
          const dy = e.clientY - dragRef.current.startY
          const rect = canvasRef.current
          const w = rect?.width || 300
          const h = rect?.height || 160
          const dur = (typeof duration === 'number' ? duration : 5) / zoomX
          const range = ((typeof max === 'number' ? max : 100) - (typeof min === 'number' ? min : 0)) / zoomY
          setPanX(dragRef.current.startPanX - (dx / w) * dur)
          setPanY(dragRef.current.startPanY + (dy / h) * range)
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.cursor = 'grab'
          dragRef.current = null
        }}
      >
        <canvas ref={canvasRef} width={300} height={160} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex items-center justify-between pt-1 kol-helper-xs-2" style={{ height: '24px' }}>
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={fit}><Icon name="maximize" size={12} /> Fit</span>
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={() => setExpanded(!expanded)}><Icon name="grid-05" size={12} /> {expanded ? 'Collapse' : 'Expand'}</span>
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={() => { setZoomX(1); setZoomY(1); setPanX(0); setPanY(0) }}><Icon name="refresh" size={14} /> Reset</span>
      </div>
      <Divider className="py-2" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between kol-helper-10" style={{ height: '24px' }}>
          {[
            { label: 'Min', value: min, set: setMin },
            { label: 'Max', value: max, set: setMax },
            { label: 'Sec', value: duration, set: setDuration },
            { label: 'Ofs', value: panX, set: setPanX },
          ].map(({ label, value, set }) => (
            <span key={label} className="flex items-center gap-2">
              <span className="text-fg-48 kol-helper-12">{label}</span>
              <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => { const v = e.target.value; if (v === '' || v === '-' || !isNaN(Number(v))) set(v === '' || v === '-' ? v : Number(v)) }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault()
                    const step = e.shiftKey ? 10 : 1
                    const dir = e.key === 'ArrowUp' ? 1 : -1
                    set(prev => (Number(prev) || 0) + step * dir)
                  }
                }}
                className="bg-surface-tertiary text-fg-96"
                style={{ width: '36px', border: 'none', outline: 'none', padding: '2px 8px', borderRadius: '2px', height: '20px', fontFamily: 'var(--kol-font-family-mono)', fontSize: 'inherit', textAlign: 'right' }}
              />
            </span>
          ))}
        </div>
        {[
          { label: 'X', value: zoomX, set: setZoomX },
          { label: 'Y', value: zoomY, set: setZoomY },
        ].map(({ label, value: val, set }) => (
          <div key={label} className="flex items-center gap-3 kol-helper-12" style={{ height: '24px' }}>
            <span className="text-fg-48">{label}</span>
            <Slider min={0.1} max={10} step={0.1} value={val} onChange={set} className="flex-1" variant="minimal" formatValue={() => null} />
            <NumberInput value={val} onChange={set} />
          </div>
        ))}
        <div className="flex items-center gap-3 kol-helper-12" style={{ height: '24px' }}>
          <span className="text-fg-48">Scale</span>
          <Slider min={0.1} max={10} step={0.1} value={(zoomX + zoomY) / 2} onChange={(v) => { setZoomX(v); setZoomY(v) }} className="flex-1" variant="minimal" formatValue={() => null} />
          <NumberInput value={(zoomX + zoomY) / 2} onChange={(v) => { setZoomX(v); setZoomY(v) }} />
        </div>
      </div>
    </>
  )
}

/* The reference as data — one source for the desk's four columns and the
   fold's tabbed panel. A row is [code, label]; `codes` for a multi-code row. */
const SECTIONS = {
  examples: { title: 'Examples', rows: [
    ['wave(t*2)', 'Fast sine'], ['saw(t)*0.8', 'Ramp to 80'], ['tri(t*0.5)', 'Slow bounce'], ['ease(t*2, 4)', 'Fast + punchy'],
    ['pulse(t*3)', 'Fast toggle'], ['pulse(t, 0.3)', 'PWM 30%'], ['sin(t)*30+50', 'Sine 20–80'], ['abs(sin(t*3))*max', 'Bouncing'],
    ['rand()', 'Noise'], ['t*20 % max', 'Linear ramp'], ['exp(t)', 'Exponential'], ['log(t)', 'Logarithmic'], ['bell(t)', 'Bell curve'],
    ['step(t, 4)', '4 steps'], ['step(t, 8)', '8 steps'], ['exp(t)*0.5+25', 'Exp 25–75'], ['bell(t*2)', 'Fast bell'],
    ['wave(t)+saw(t*2)*0.3', 'Layered'], ['tri(t)*pulse(t*4)', 'Gated bounce'], ['step(t, 6)*0.8+10', 'Steps 10–90'], ['ease(t*0.3, 3)*0.6+20', 'Slow dramatic'],
  ] },
  waves: { title: 'Waves', rows: [
    ['wave(t)', 'Smooth up and down'], ['saw(t)', 'Ramp up, jump back'], ['tri(t)', 'Ramp up, ramp down'], ['pulse(t)', 'Snap on/off'],
    ['rand()', 'Random every frame'], ['bell(t)', 'Bell curve'], ['exp(t)', 'Exponential ramp'], ['log(t)', 'Logarithmic ramp'], ['step(t, 4)', 'Staircase'],
  ] },
  functions: { title: 'Functions', grid: true, rows: [
    ['sin', '-1 to 1'], ['cos', '-1 to 1'], ['abs', 'Absolute'], ['floor', '↓ Round'], ['ceil', '↑ Round'],
    ['round', 'Nearest'], ['sqrt', '√'], ['pow', 'Power'], ['PI', '3.14159'], ['PHI', '1.61803'],
  ] },
  variables: { title: 'Variables', rows: [
    { codes: ['t', 'f'], label: 'Second / Frame count' }, ['min', 'Knob minimum'], ['max', 'Knob maximum'],
  ] },
  curves: { title: 'Curves', rows: [
    ['ease(t)', 'Gentle breath'], ['ease(t, 1)', 'Linear, no curve'], ['ease(t, 5)', 'Dramatic punch'], ['ease(t, 0.5)', 'Quick flick'],
  ] },
  range: { title: 'Range', rows: [
    ['saw(t)*0.8', '0 to 80'], ['wave(t)*0.5+25', '25 to 75'], ['tri(t)*0.3+70', '70 to 100'], ['ease(t)*0.2', '0 to 20'],
  ] },
  speed: { title: 'Speed', rows: [
    ['wave(t*0.5)', 'Half speed'], ['saw(t*2)', 'Double speed'], ['tri(t*3)', '3x faster'], ['ease(t*5)', '5x faster'], ['pulse(t*0.1)', 'Very slow'],
  ] },
  tips: { title: 'Tips', tips: [
    '→ Click numbers for expression input',
    '→ Alt+click number to reset',
    '→ Cmd+click expression to append to oscilloscope',
  ] },
}

/* The desk (mixer tab): four 320px columns, the last section of each grows. */
const DESK_COLUMNS = [['examples'], ['waves', 'functions'], ['variables', 'curves', 'range'], ['speed', 'tips']]

/* The fold (/expressions): one panel, three tabs (user, 2026-08-27 — the
   rotated edge tabs were rejected on sight). Examples stands alone; Language
   is what the expression language has; Usage is how to shape it. */
const FOLD_TABS = [
  { id: 'examples', label: 'Examples', sections: ['examples'] },
  { id: 'saved', label: 'Saved', sections: [] },
  { id: 'language', label: 'Language', sections: ['waves', 'functions', 'variables'] },
  { id: 'usage', label: 'Usage', sections: ['curves', 'range', 'speed', 'tips'] },
]

const layoutClass = (s) => s.tips ? 'flex flex-col gap-2' : s.grid ? 'grid grid-cols-2 gap-x-4 gap-y-0 content-start' : 'flex flex-col gap-0'

function Eyebrow({ children }) {
  return <div className="kol-helper-12 text-fg-48 uppercase shrink-0" style={{ height: '24px' }}>{children}</div>
}

function Rows({ section, append, load }) {
  if (section.tips) {
    return section.tips.map((tip) => (
      <div key={tip} className="text-fg-48" style={{ lineHeight: '150%', paddingLeft: '1em', textIndent: '-1em' }}>{tip}</div>
    ))
  }
  return section.rows.map((row) => {
    const codes = Array.isArray(row) ? [row[0]] : row.codes
    const label = Array.isArray(row) ? row[1] : row.label
    return (
      <div key={codes.join()} className="flex justify-between items-center" style={{ height: '24px' }}>
        <span className="flex items-center gap-2 min-w-0">{codes.map((c) => <Code key={c} text={c} onAppend={append} onLoad={load} />)}</span>
        <span className="text-fg-48 shrink-0">{label}</span>
      </div>
    )
  })
}

/* Which helpers an expression uses — its tags in the Library; no tag editor. */
const HELPERS = ['wave', 'saw', 'tri', 'pulse', 'rand', 'ease', 'bell', 'exp', 'log', 'step', 'sin', 'cos']
const tagsFor = (expr) => HELPERS.filter((h) => new RegExp(`\\b${h}\\(`).test(expr))

/* SAVED — the library's expressions (presets + user saves) under a save row
   for the scope's current expression. Presets carry no ×. */
function SavedSection({ scopeExpr, append, load, boxed }) {
  const saved = useLibrary('expression')
  const [name, setName] = useState('')
  const canSave = Boolean(name.trim() && scopeExpr)
  const save = () => {
    if (!canSave) return
    addToLibrary({ kind: 'expression', name: name.trim(), tags: tagsFor(scopeExpr), data: { expr: scopeExpr } })
    setName('')
  }
  const rows = (
    <>
      <div className="flex items-center gap-2 shrink-0" style={{ height: '24px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') save() }}
          placeholder="Name"
          className="kol-helper-10 text-fg-96 bg-surface-tertiary px-2 flex-1 min-w-0"
          style={{ height: '20px', border: 'none', outline: 'none', borderRadius: '2px', fontFamily: 'var(--kol-font-family-mono)' }}
        />
        <span className={`kol-helper-12 select-none ${canSave ? 'text-fg-64 hover:text-fg-96 cursor-pointer' : 'text-fg-32'}`} onClick={save}>Save</span>
      </div>
      {saved.map((item) => (
        <div key={item.id} className="flex justify-between items-center gap-2 shrink-0" style={{ height: '24px' }}>
          <Code text={item.data.expr} onAppend={append} onLoad={load} />
          <span className="flex items-center gap-2 shrink-0 text-fg-48">
            {item.name}
            {!item.preset && <span className="cursor-pointer hover:text-fg-96 flex" onClick={() => removeFromLibrary(item.id)} title="Remove"><Icon name="x" size={10} /></span>}
          </span>
        </div>
      ))}
    </>
  )
  if (!boxed) return <div className="flex flex-col gap-0">{rows}</div>
  return (
    <div className="flex flex-col gap-0 flex-1" style={{ minHeight: 0 }}>
      <Eyebrow>Saved</Eyebrow>
      <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-12 flex-1" style={{ borderRadius: '4px', overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>{rows}</div>
    </div>
  )
}

/* A section in its own box — the desk's shape. */
function DeskSection({ section, append, load, grow }) {
  return (
    <div className={`flex flex-col gap-0 ${grow ? 'flex-1' : ''}`} style={{ minHeight: 0 }}>
      <Eyebrow>{section.title}</Eyebrow>
      <div className={`${layoutClass(section)} p-4 bg-surface-secondary border border-fg-08 kol-helper-12 ${grow ? 'flex-1' : ''}`} style={{ borderRadius: '4px', overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>
        <Rows section={section} append={append} load={load} />
      </div>
    </div>
  )
}

/**
 * @param {boolean} scopeFill  the scope takes every pixel the reference columns
 *                             leave (the /expressions page); off = the desk's
 *                             fixed 656px column (the mixer tab). Collapsed is
 *                             320px either way.
 */
export default function ExpressionReference({ scopeFill = false, initialExpr }) {
  const [scopeExpr, setScopeExpr] = useState(initialExpr || 'wave(t)')
  /* A load replaces the expression AND fits the scope to it; the count is the
     request — 1 on mount when the page arrived with an expression. */
  const [fitRequest, setFitRequest] = useState(initialExpr ? 1 : 0)
  const load = useCallback((text) => { setScopeExpr(text); setFitRequest((n) => n + 1) }, [])
  const [expanded, setExpanded] = useState(true)
  const append = useCallback((text) => setScopeExpr(prev => prev ? `${prev} + ${text}` : text), [])
  const fill = expanded && scopeFill
  const [tab, setTab] = useState('examples')
  const foldSections = FOLD_TABS.find((t) => t.id === tab).sections
  return (
    <div className="flex flex-row gap-4" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: fill ? undefined : (expanded ? '656px' : '320px'), flex: fill ? 1 : undefined, minWidth: fill ? '656px' : undefined, maxHeight: '100%', transition: 'width 0.2s' }}>
        <div className="flex flex-col gap-0 flex-1" style={{ minHeight: 0 }}>
          <Eyebrow>Oscilloscope</Eyebrow>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-12 flex-1" style={{ borderRadius: '4px', minHeight: 0, overflow: 'hidden' }}>
            <Oscilloscope expr={scopeExpr} setExpr={setScopeExpr} expanded={expanded} setExpanded={setExpanded} fitRequest={fitRequest} />
          </div>
        </div>
      </div>
      {fill ? (
        /* THE FOLD: one 320px panel the height of the scope, tabs in its head,
           the active tab's sections stacked inside — sub-eyebrows only when a
           tab holds more than one. */
        <div className="flex flex-col gap-0 shrink-0" style={{ width: '320px', maxHeight: '100%' }}>
          <Eyebrow>Reference</Eyebrow>
          <div className="flex flex-col bg-surface-secondary border border-fg-08 kol-helper-12 flex-1" style={{ borderRadius: '4px', minHeight: 0, overflow: 'hidden' }}>
            <div className="px-4 border-b border-fg-08 shrink-0">
              <TabsRow tabs={FOLD_TABS} value={tab} onChange={setTab} />
            </div>
            <div className="flex flex-col gap-4 p-4 flex-1" style={{ overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>
              {tab === 'saved' && <SavedSection scopeExpr={scopeExpr} append={append} load={load} />}
              {foldSections.map((k) => (
                <div key={k} className="flex flex-col gap-0 shrink-0">
                  {foldSections.length > 1 && <Eyebrow>{SECTIONS[k].title}</Eyebrow>}
                  <div className={layoutClass(SECTIONS[k])}><Rows section={SECTIONS[k]} append={append} load={load} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {DESK_COLUMNS.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-4 shrink-0" style={{ width: '320px', maxHeight: ci === 0 ? '100%' : undefined }}>
              {col.map((k, i) => <DeskSection key={k} section={SECTIONS[k]} append={append} load={load} grow={i === col.length - 1} />)}
            </div>
          ))}
          <div className="flex flex-col gap-4 shrink-0" style={{ width: '320px', maxHeight: '100%' }}>
            <SavedSection scopeExpr={scopeExpr} append={append} load={load} boxed />
          </div>
        </>
      )}
    </div>
  )
}
