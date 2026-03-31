import { useState, useRef, useEffect, useCallback } from 'react'
import Divider from '../atoms/Divider'
import { Icon } from '../icons'
import Slider from '../atoms/Slider'
import { compile } from '../../hooks/useExpressionValue'

function Code({ text, onAppend }) {
  return (
    <span
      className="text-fg-96 bg-surface-tertiary px-2 py-1 kol-helper-xxs cursor-pointer select-none"
      style={{ borderRadius: '2px' }}
      onClick={(e) => { if ((e.ctrlKey || e.metaKey) && onAppend) onAppend(text) }}
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

function Oscilloscope({ expr, setExpr, expanded, setExpanded }) {
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
  const startRef = useRef(performance.now() / 1000)
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
    startRef.current = performance.now() / 1000
  }, [expr])

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
      const now = performance.now() / 1000
      const elapsed = now - startRef.current

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
          className="w-full bg-surface-tertiary text-fg-96 kol-helper-xxs"
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
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={() => {
          const fn = fnRef.current
          if (!fn) return
          let lo = Infinity, hi = -Infinity
          const dur = typeof duration === 'number' ? duration : 5
          for (let i = 0; i <= 300; i++) {
            const t = (i / 300) * dur
            try { const v = fn(t, Math.round(t * 60), 0, 100); if (isFinite(v)) { if (v < lo) lo = v; if (v > hi) hi = v } } catch { break }
          }
          if (lo !== Infinity) { const m = (hi - lo) * 0.1; setMin(Math.floor(lo - m)); setMax(Math.ceil(hi + m)) }
        }}><Icon name="maximize" size={12} /> Fit</span>
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={() => setExpanded(!expanded)}><Icon name="grid-05" size={12} /> {expanded ? 'Collapse' : 'Expand'}</span>
        <span className="text-fg-64 cursor-pointer select-none hover:text-fg-96 flex items-center gap-1" onClick={() => { setZoomX(1); setZoomY(1); setPanX(0); setPanY(0) }}><Icon name="refresh" size={14} /> Reset</span>
      </div>
      <Divider className="py-2" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between kol-helper-xxs" style={{ height: '24px' }}>
          {[
            { label: 'Min', value: min, set: setMin },
            { label: 'Max', value: max, set: setMax },
            { label: 'Sec', value: duration, set: setDuration },
            { label: 'Ofs', value: panX, set: setPanX },
          ].map(({ label, value, set }) => (
            <span key={label} className="flex items-center gap-2">
              <span className="text-fg-48 kol-helper-xs">{label}</span>
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
          <div key={label} className="flex items-center gap-3 kol-helper-xs" style={{ height: '24px' }}>
            <span className="text-fg-48">{label}</span>
            <Slider min={0.1} max={10} step={0.1} value={val} onChange={set} className="flex-1" variant="minimal" formatValue={() => null} />
            <NumberInput value={val} onChange={set} />
          </div>
        ))}
        <div className="flex items-center gap-3 kol-helper-xs" style={{ height: '24px' }}>
          <span className="text-fg-48">Scale</span>
          <Slider min={0.1} max={10} step={0.1} value={(zoomX + zoomY) / 2} onChange={(v) => { setZoomX(v); setZoomY(v) }} className="flex-1" variant="minimal" formatValue={() => null} />
          <NumberInput value={(zoomX + zoomY) / 2} onChange={(v) => { setZoomX(v); setZoomY(v) }} />
        </div>
      </div>
    </>
  )
}

export default function ExpressionReference() {
  const [scopeExpr, setScopeExpr] = useState('wave(t)')
  const [expanded, setExpanded] = useState(true)
  const append = useCallback((text) => setScopeExpr(prev => prev ? prev + text : text), [])
  const code = (text) => <Code text={text} onAppend={append} />
  return (
    <div className="flex flex-row gap-4" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: expanded ? '656px' : '320px', maxHeight: '100%', transition: 'width 0.2s' }}>
        <div className="flex flex-col gap-0 flex-1" style={{ minHeight: 0 }}>
          <div className="kol-helper-xs text-fg-48 uppercase shrink-0" style={{ height: '24px' }}>Oscilloscope</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs flex-1" style={{ borderRadius: '4px', minHeight: 0, overflow: 'hidden' }}>
            <Oscilloscope expr={scopeExpr} setExpr={setScopeExpr} expanded={expanded} setExpanded={setExpanded} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: '320px', maxHeight: '100%' }}>
        <div className="flex flex-col gap-0 flex-1" style={{ minHeight: 0 }}>
          <div className="kol-helper-xs text-fg-48 uppercase shrink-0" style={{ height: '24px' }}>Examples</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs flex-1" style={{ borderRadius: '4px', overflowY: 'auto', scrollbarWidth: 'none', minHeight: 0 }}>
            <div className="flex justify-between items-center shrink-0" style={{ height: '24px' }}>{code('wave(t*2)')}<span className="text-fg-48">Fast sine</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('saw(t)*0.8')}<span className="text-fg-48">Ramp to 80</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('tri(t*0.5)')}<span className="text-fg-48">Slow bounce</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t*2, 4)')}<span className="text-fg-48">Fast + punchy</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('pulse(t*3)')}<span className="text-fg-48">Fast toggle</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('pulse(t, 0.3)')}<span className="text-fg-48">PWM 30%</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('sin(t)*30+50')}<span className="text-fg-48">Sine 20–80</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('abs(sin(t*3))*max')}<span className="text-fg-48">Bouncing</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('rand()')}<span className="text-fg-48">Noise</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('t*20 % max')}<span className="text-fg-48">Linear ramp</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('exp(t)')}<span className="text-fg-48">Exponential</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('log(t)')}<span className="text-fg-48">Logarithmic</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('bell(t)')}<span className="text-fg-48">Bell curve</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('step(t, 4)')}<span className="text-fg-48">4 steps</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('step(t, 8)')}<span className="text-fg-48">8 steps</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('exp(t)*0.5+25')}<span className="text-fg-48">Exp 25–75</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('bell(t*2)')}<span className="text-fg-48">Fast bell</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('wave(t)+saw(t*2)*0.3')}<span className="text-fg-48">Layered</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('tri(t)*pulse(t*4)')}<span className="text-fg-48">Gated bounce</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('step(t, 6)*0.8+10')}<span className="text-fg-48">Steps 10–90</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t*0.3, 3)*0.6+20')}<span className="text-fg-48">Slow dramatic</span></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: '320px' }}>
        <div className="flex flex-col gap-0">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Waves</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('wave(t)')}<span className="text-fg-48">Smooth up and down</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('saw(t)')}<span className="text-fg-48">Ramp up, jump back</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('tri(t)')}<span className="text-fg-48">Ramp up, ramp down</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('pulse(t)')}<span className="text-fg-48">Snap on/off</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('rand()')}<span className="text-fg-48">Random every frame</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('bell(t)')}<span className="text-fg-48">Bell curve</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('exp(t)')}<span className="text-fg-48">Exponential ramp</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('log(t)')}<span className="text-fg-48">Logarithmic ramp</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('step(t, 4)')}<span className="text-fg-48">Staircase</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-0 flex-1">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Functions</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs flex-1 content-start" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('sin')}<span className="text-fg-48">-1 to 1</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('cos')}<span className="text-fg-48">-1 to 1</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('abs')}<span className="text-fg-48">Absolute</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('floor')}<span className="text-fg-48">↓ Round</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ceil')}<span className="text-fg-48">↑ Round</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('round')}<span className="text-fg-48">Nearest</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('sqrt')}<span className="text-fg-48">√</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('pow')}<span className="text-fg-48">Power</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('PI')}<span className="text-fg-48">3.14159</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('PHI')}<span className="text-fg-48">1.61803</span></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: '320px' }}>
        <div className="flex flex-col gap-0">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Variables</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}><span className="flex items-center gap-2">{code('t')}{code('f')}</span><span className="text-fg-48">Second / Frame count</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('min')}<span className="text-fg-48">Knob minimum</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('max')}<span className="text-fg-48">Knob maximum</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-0">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Curves</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t)')}<span className="text-fg-48">Gentle breath</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t, 1)')}<span className="text-fg-48">Linear, no curve</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t, 5)')}<span className="text-fg-48">Dramatic punch</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t, 0.5)')}<span className="text-fg-48">Quick flick</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-0 flex-1">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Range</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs flex-1 justify-start" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('saw(t)*0.8')}<span className="text-fg-48">0 to 80</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('wave(t)*0.5+25')}<span className="text-fg-48">25 to 75</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('tri(t)*0.3+70')}<span className="text-fg-48">70 to 100</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t)*0.2')}<span className="text-fg-48">0 to 20</span></div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 shrink-0" style={{ width: '320px' }}>
        <div className="flex flex-col gap-0">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Speed</div>
          <div className="flex flex-col gap-0 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs" style={{ borderRadius: '4px' }}>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('wave(t*0.5)')}<span className="text-fg-48">Half speed</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('saw(t*2)')}<span className="text-fg-48">Double speed</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('tri(t*3)')}<span className="text-fg-48">3x faster</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('ease(t*5)')}<span className="text-fg-48">5x faster</span></div>
            <div className="flex justify-between items-center" style={{ height: '24px' }}>{code('pulse(t*0.1)')}<span className="text-fg-48">Very slow</span></div>
          </div>
        </div>
        <div className="flex flex-col gap-0 flex-1">
          <div className="kol-helper-xs text-fg-48 uppercase" style={{ height: '24px' }}>Tips</div>
          <div className="flex flex-col gap-2 p-4 bg-surface-secondary border border-fg-08 kol-helper-xs flex-1" style={{ borderRadius: '4px', lineHeight: '150%' }}>
            <div className="text-fg-48">→ Click numbers for expression input</div>
            <div className="text-fg-48">→ Alt+click number to reset</div>
            <div className="text-fg-48" style={{ paddingLeft: '1em', textIndent: '-1em' }}>→ Cmd+click expression to append to oscilloscope</div>
          </div>
        </div>
      </div>
    </div>
  )
}
