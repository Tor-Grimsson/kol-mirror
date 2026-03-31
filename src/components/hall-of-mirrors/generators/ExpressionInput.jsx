import { useEffect, useRef, useState, useCallback } from 'react'
import { compile } from '../../../hooks/useExpressionValue'

/**
 * Expression text input for trigger/clock/sync signals.
 * Compiles expression against the signal bus, evaluates per-frame.
 * Provides rising edge detection (value crosses above threshold).
 *
 * Props:
 *   label        — display label
 *   expr         — current expression string (controlled)
 *   onExprChange — callback when user edits expression
 *   busRef       — signal bus ref
 *   onValue      — called every frame with current value (0-100)
 *   onTrigger    — called on rising edge (value crosses above 50)
 *   threshold    — edge detection threshold (default 50)
 */
export default function ExpressionInput({
  label,
  expr = '',
  onExprChange,
  busRef,
  onValue,
  onTrigger,
  threshold = 50,
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(expr)
  const rafRef = useRef(null)
  const prevRef = useRef(0)
  const startRef = useRef(performance.now() / 1000)
  const frameRef = useRef(0)
  const onValueRef = useRef(onValue)
  const onTriggerRef = useRef(onTrigger)
  onValueRef.current = onValue
  onTriggerRef.current = onTrigger

  useEffect(() => {
    if (!expr) {
      prevRef.current = 0
      return
    }
    const busKeys = busRef?.current ? Object.keys(busRef.current) : []
    const fn = compile(expr, busKeys)
    if (!fn) return

    const start = startRef.current
    frameRef.current = 0

    const tick = () => {
      const t = performance.now() / 1000 - start
      const f = frameRef.current++
      try {
        const raw = fn(t, f, 0, 100, busRef?.current)
        const val = Math.max(0, Math.min(100, raw))
        onValueRef.current?.(val)
        // Rising edge detection
        if (prevRef.current <= threshold && val > threshold) {
          onTriggerRef.current?.()
        }
        prevRef.current = val
      } catch { /* silent */ }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [expr, busRef, threshold])

  const commitDraft = useCallback(() => {
    setEditing(false)
    onExprChange?.(draft.trim())
  }, [draft, onExprChange])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') commitDraft()
    if (e.key === 'Escape') { setEditing(false); setDraft(expr) }
  }, [commitDraft, expr])

  const active = expr && expr.length > 0

  if (editing) {
    return (
      <div className="flex items-center justify-between kol-helper-xs" style={{ height: '24px' }}>
        <span className="text-fg-64 shrink-0">{label}</span>
        <input
          autoFocus
          className="bg-transparent text-fg-96 text-right outline-none kol-helper-xs"
          style={{ width: '120px', fontFamily: 'var(--kol-font-mono)', caretColor: '#e74c3c' }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
        />
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between kol-helper-xs cursor-pointer"
      style={{ height: '24px' }}
      onClick={() => { setDraft(expr); setEditing(true) }}
    >
      <span className="text-fg-64 shrink-0">{label}</span>
      <span
        className={active ? 'text-[#e74c3c]' : 'text-fg-24'}
        style={{ fontFamily: 'var(--kol-font-mono)', fontSize: '10px' }}
      >
        {active ? expr : '---'}
      </span>
    </div>
  )
}
