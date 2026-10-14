import { useState, useEffect, useRef, useCallback } from 'react'
import { compileExpression, isExpression } from '@kolkrabbi/kol-hardware/signal'
import { transport } from './transport'

/* THE ENGINE'S COMPILER (2026-10-03, user ruling) — kol-hardware `./signal`, the one written to
   replace four drifted copies, this file's among them. The hook's own helpers and its bare
   `new Function` are retired to `_tmp/2026-10-03-mixer-expression-compiler/`.

   `compile` keeps its shape — `fn(t, f, min, max, bus)` or null — so the dial, the scope and the
   Library's thumbnails did not change. What did:
     · every helper spans the dial's [min, max], where this file's always started at 0. The same
       curve when min is 0, which is every dial on the desk but TEMPO (10–400) and whichever
       generator controls start above zero.
     · the text goes through the engine's two gates (math characters, an identifier allowlist)
       before it reaches `Function`.
     · a bus value is read by its name; the bare `bus` object is no longer in scope. */
export function compile(expr, busKeys) {
  const { ok, fn } = compileExpression(expr, { bus: busKeys || [] })
  return ok ? fn : null
}

export default function useExpressionValue({ onChange, min = 0, max = 100, busRef }) {
  const [expr, setExpr] = useState(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const rafRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!expr) { frameRef.current = 0; return }
    const busKeys = busRef?.current ? Object.keys(busRef.current) : []
    const fn = compile(expr, busKeys)
    if (!fn) { setExpr(null); return }
    frameRef.current = 0
    const tick = () => {
      const t = transport.now()
      const f = frameRef.current++
      try {
        const raw = fn(t, f, min, max, busRef?.current)
        onChangeRef.current(Math.max(min, Math.min(max, Math.round(raw))))
      } catch { /* silent */ }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [expr, min, max])

  const commit = useCallback((draft, currentOnChange) => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setExpr(null)
      return
    }
    const n = parseFloat(trimmed)
    if (!isNaN(n) && !isExpression(trimmed)) {
      setExpr(null)
      currentOnChange(Math.round(n))
    } else {
      setExpr(trimmed)
    }
  }, [])

  return { expr, commit, isAnimating: expr !== null }
}
