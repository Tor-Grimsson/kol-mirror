import { compileExpression } from '@kolkrabbi/kol-hardware/signal'

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
