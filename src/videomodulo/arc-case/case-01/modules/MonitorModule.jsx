import { useEffect, useRef, useCallback, useState } from 'react'
import ExpressionInput from './ExpressionInput'
import JackSocket from './JackSocket'
import { compile } from '../hooks/useExpressionValue'

const W = 320, H = 240

export default function MonitorModule({ id = 'mon1', label = 'MON', config, onChange, busRef }) {
  const {
    inputAExpr = '',
    inputBExpr = '',
    enabled = true,
    scopeExpr = '',
  } = config || {}

  const [mode, setMode] = useState('scope') // 'scope' or 'video'
  const [zoomX, setZoomX] = useState(1)
  const [zoomY, setZoomY] = useState(1)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)

  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const aValRef = useRef(0)
  const bValRef = useRef(0)
  const startRef = useRef(performance.now() / 1000)
  const dragRef = useRef(null)
  const fnRef = useRef(null)

  // Refs for render loop
  const zxRef = useRef(zoomX); zxRef.current = zoomX
  const zyRef = useRef(zoomY); zyRef.current = zoomY
  const pxRef = useRef(panX); pxRef.current = panX
  const pyRef = useRef(panY); pyRef.current = panY

  // Compile scope expression
  useEffect(() => {
    if (scopeExpr) {
      const busKeys = busRef?.current ? Object.keys(busRef.current) : []
      fnRef.current = compile(scopeExpr, busKeys)
    } else {
      fnRef.current = null
    }
    startRef.current = performance.now() / 1000
  }, [scopeExpr, busRef])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled) {
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, W, H)
        for (let y = 0; y < H; y += 2) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.015})`
          ctx.fillRect(0, y, W, 1)
        }
      }
      return
    }

    const ctx = canvas.getContext('2d')
    const dur = 5

    const tick = () => {
      const now = performance.now() / 1000
      const elapsed = now - startRef.current
      const zx = zxRef.current
      const zy = zyRef.current
      const px = pxRef.current
      const py = pyRef.current
      const viewDur = dur / zx
      const range = 100 / zy
      const center = 50 + py
      const lo = center - range / 2
      const toY = (v) => 4 + (H - 8) * (1 - (v - lo) / range)
      const toT = (x) => (x / W) * viewDur + px

      // Clear
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(100,255,100,0.04)'
      ctx.lineWidth = 1
      for (let i = 1; i < 4; i++) {
        const gy = Math.round(H * i / 4) + 0.5
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }

      // 0-100 reference lines (red dashed)
      ctx.strokeStyle = 'rgba(231,76,60,0.2)'
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(0, toY(0)); ctx.lineTo(W, toY(0)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, toY(100)); ctx.lineTo(W, toY(100)); ctx.stroke()
      ctx.setLineDash([])

      // Expression trace (teal, like your oscilloscope)
      const fn = fnRef.current
      if (fn) {
        const playT = elapsed % dur
        const playX = ((playT - px) / viewDur) * W

        // Static curve (dim)
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const t = toT(x)
          try {
            const v = fn(t, Math.round(t * 60), 0, 100, busRef?.current)
            x === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v))
          } catch { break }
        }
        ctx.stroke()

        // Live trace (bright teal)
        ctx.strokeStyle = '#2dd4bf'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let x = 0; x < Math.min(playX, W); x++) {
          const t = toT(x)
          try {
            const v = fn(t, Math.round(t * 60), 0, 100, busRef?.current)
            x === 0 ? ctx.moveTo(x, toY(v)) : ctx.lineTo(x, toY(v))
          } catch { break }
        }
        ctx.stroke()

        // Playhead
        ctx.strokeStyle = 'rgba(45,212,191,0.3)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(playX, 0); ctx.lineTo(playX, H); ctx.stroke()

        // Dot
        try {
          const curV = fn(playT, Math.round(playT * 60), 0, 100, busRef?.current)
          ctx.fillStyle = '#2dd4bf'
          ctx.beginPath(); ctx.arc(playX, toY(curV), 3, 0, Math.PI * 2); ctx.fill()
        } catch {}
      }

      // Signal A trace (green, scrolling)
      if (inputAExpr && !fn) {
        const aY = toY(aValRef.current)
        ctx.strokeStyle = 'rgba(100,255,100,0.6)'
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(0, aY); ctx.lineTo(W, aY); ctx.stroke()
        ctx.fillStyle = 'rgba(100,255,100,0.8)'
        ctx.beginPath(); ctx.arc(W * 0.8, aY, 3, 0, Math.PI * 2); ctx.fill()
      }

      // Signal B trace (cyan, scrolling)
      if (inputBExpr && !fn) {
        const bY = toY(bValRef.current)
        ctx.strokeStyle = 'rgba(100,200,255,0.6)'
        ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(0, bY); ctx.lineTo(W, bY); ctx.stroke()
        ctx.fillStyle = 'rgba(100,200,255,0.8)'
        ctx.beginPath(); ctx.arc(W * 0.8, bY, 3, 0, Math.PI * 2); ctx.fill()
      }

      // Scanlines
      ctx.fillStyle = 'rgba(0,0,0,0.04)'
      for (let sy = 0; sy < H; sy += 3) ctx.fillRect(0, sy, W, 1)

      // Value readout
      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(100,255,100,0.4)'
      if (inputAExpr) ctx.fillText(`A:${Math.round(aValRef.current)}`, 4, 12)
      if (inputBExpr) ctx.fillText(`B:${Math.round(bValRef.current)}`, 4, inputAExpr ? 22 : 12)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [enabled, inputAExpr, inputBExpr, busRef])

  const update = useCallback((key, val) => onChange?.({ ...config, [key]: val }), [config, onChange])

  const handleFit = () => { setZoomX(1); setZoomY(1); setPanX(0); setPanY(0) }

  return (
    <div className="flex flex-col h-full border-r border-fg-08" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-2 border-b border-fg-08" style={{ height: '20px', minHeight: '20px' }}>
        <span className="flex items-center gap-1.5">
          <span className="cursor-pointer select-none" onClick={() => update('enabled', !enabled)}
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: enabled ? '#4ade80' : '#333' }} />
          <span className="text-fg-96" style={{ fontSize: '9px', fontFamily: 'var(--kol-font-mono)' }}>{label}</span>
        </span>
        <span className="flex items-center gap-2" style={{ fontSize: '8px', fontFamily: 'var(--kol-font-mono)' }}>
          <span className="cursor-pointer select-none text-fg-24 hover:text-fg-64" onClick={handleFit}>RST</span>
          <span className="cursor-pointer select-none text-fg-24 hover:text-fg-64" onClick={() => { setZoomX(z => Math.min(10, z * 1.5)); setZoomY(z => Math.min(10, z * 1.5)) }}>+</span>
          <span className="cursor-pointer select-none text-fg-24 hover:text-fg-64" onClick={() => { setZoomX(z => Math.max(0.1, z / 1.5)); setZoomY(z => Math.max(0.1, z / 1.5)) }}>−</span>
        </span>
      </div>

      {/* Expression input for scope mode */}
      <div className="px-2 py-1 border-b border-fg-08">
        <input
          type="text"
          value={scopeExpr}
          onChange={(e) => update('scopeExpr', e.target.value)}
          onClick={(e) => { if (e.altKey) update('scopeExpr', '') }}
          placeholder="wave(t*2)"
          className="w-full bg-transparent text-fg-96"
          style={{ border: 'none', outline: 'none', fontSize: '9px', fontFamily: 'var(--kol-font-mono)', height: '16px', caretColor: '#2dd4bf' }}
        />
      </div>

      {/* Screen with grab-to-pan */}
      <div
        className="flex-1 p-1"
        style={{ cursor: 'grab', touchAction: 'none' }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          e.currentTarget.style.cursor = 'grabbing'
          dragRef.current = { startX: e.clientX, startY: e.clientY, startPanX: panX, startPanY: panY }
        }}
        onPointerMove={(e) => {
          if (!dragRef.current) return
          const dx = e.clientX - dragRef.current.startX
          const dy = e.clientY - dragRef.current.startY
          const viewDur = 5 / zoomX
          const range = 100 / zoomY
          setPanX(dragRef.current.startPanX - (dx / W) * viewDur)
          setPanY(dragRef.current.startPanY + (dy / H) * range)
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.cursor = 'grab'
          dragRef.current = null
        }}
      >
        <canvas ref={canvasRef} width={W} height={H}
          style={{ width: '100%', height: '100%', borderRadius: '2px', border: '1px solid rgba(100,255,100,0.06)', display: 'block' }} />
      </div>

      {/* Signal inputs A/B */}
      <div className="flex items-center gap-2 px-2 py-0.5 border-t border-fg-08">
        <JackSocket type="in" moduleId={id} configKey="inputAExpr" onExprChange={(v) => update('inputAExpr', v)} busRef={busRef} active={!!inputAExpr} label="A" size="sm" />
        <div className="flex-1">
          <ExpressionInput label="" expr={inputAExpr} onExprChange={(v) => update('inputAExpr', v)} busRef={busRef} onValue={(v) => { aValRef.current = v }} />
        </div>
      </div>
      <div className="flex items-center gap-2 px-2 py-0.5">
        <JackSocket type="in" moduleId={id} configKey="inputBExpr" onExprChange={(v) => update('inputBExpr', v)} busRef={busRef} active={!!inputBExpr} label="B" size="sm" />
        <div className="flex-1">
          <ExpressionInput label="" expr={inputBExpr} onExprChange={(v) => update('inputBExpr', v)} busRef={busRef} onValue={(v) => { bValRef.current = v }} />
        </div>
      </div>
    </div>
  )
}
