# Display Modules (L4)

Signal layer 4 — Canvas2D rendering of any signal type. Pen input controls draw style.

2 modules + 1 shared utility.

---

### MonitorModule
`MonitorModule.jsx` · 12HP

> Dual-channel signal monitor with pass-through. Accepts any signal type. Pen input styles the drawing.

**Inputs:** `a` (any), `b` (any), `pen` (pen)
**Outputs:** `a` (any), `b` (any) — pass-through of inputs
**Controls:** none (display only)
**Display behavior:**
- Single input: full canvas width
- Two inputs: canvas split vertically, divider at center
- Scalar signals: rolling oscilloscope trace from 128-sample ring buffer
- Color signals: filled rectangle
- Points signals: wireframe or polyline (see drawSignal)
**Notes:**
- Canvas auto-resizes via ResizeObserver.
- Background: semi-transparent dark fill with 3px scanline overlay.
- Drawing dispatched through `drawSignal()`.

---

### OutputModule
`OutputModule.jsx` · 16HP

> Four-layer composited display. All layers draw to the same canvas with additive layering. Terminal output node — no signal outputs.

**Inputs:** `a`, `b`, `c`, `d` (any), `pen` (pen)
**Outputs:** none
**Controls:** bg knob (background brightness, 0 = black, 100 = white)
**Display behavior:**
- All four channels render to the full canvas area via `drawSignal()`.
- Layers draw in order a-b-c-d, later layers paint over earlier ones.
- Each channel maintains its own 128-sample scalar history ring buffer.
**Notes:** Canvas auto-resizes via ResizeObserver. Background is solid RGB gray derived from bg knob.

---

### drawSignal (shared utility)
`drawSignal.js`

> Canvas2D drawing primitives dispatched by signal type. All functions accept a pen object for line style control.

**Exported functions:**

`drawScalar(ctx, history, writeIdx, bufLen, x, y, w, h, pen)`
- Draws center reference line, then rolling oscilloscope trace from ring buffer.
- Shows numeric readout of current value (top-left corner).
- Trace color: `#2ecc71` (green).

`drawColor(ctx, signal, x, y, w, h, pen)`
- Fills a rectangle with the signal's RGBA value.
- Inset 2px on each side.

`drawPoints(ctx, signal, x, y, w, h, pen)`
- With edges: draws wireframe segments between indexed vertex pairs. Color: `#3498db` (blue).
- Without edges: draws continuous polyline through all points. Color: `#2ecc71` (green).

`drawSignal(ctx, signal, x, y, w, h, history, writeIdx, bufLen, penSignal)`
- Dispatcher. Auto-detects signal type (`scalar`, `color`, `points`) and calls the matching draw function.
- Extracts pen values from penSignal if type is `pen`, otherwise falls back to `PEN_DEFAULTS`.

**Pen signal effect:**
- `thickness` — stroke lineWidth
- `cap` — lineCap style
- `opacity` — globalAlpha (0-100 mapped to 0.0-1.0)
- `dash` — setLineDash pattern length (0 = solid). `gap` sets dash gap, defaults to dash value.
- Applied via `applyPen()`, reset via `resetPen()` after each draw call.
