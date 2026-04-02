# Utility Components

Infrastructure — case, panels, jacks, cables, patch management. Not signal processors.

7 components.

---

### Case
`Case.jsx`

> Outermost enclosure. Renders left/right side rails and a vertical column of RackRow children.

**Props:** `children` — RackRow elements
**Exports:** `Case` (default), `RackRow`, `HP`
**Layout:** max-width 1400px, 24px horizontal padding. Side rails are 24px wide with rounded ends.

---

### RackRow
`Case.jsx`

> Single horizontal row within the case. Renders top/bottom rails with screw-hole grid and a module slot area between them.

**Props:** `height` — `'1u'` or `'3u'` (default `'3u'`), `children` — HP-sized module slots
**Layers:**
- Z0: case background (#141414)
- Z1: top and bottom Rail components (visible in empty HP gaps)
- Z2: module panels (cover rails where present)
**Notes:** Aspect ratio set from `ASPECT` constants. Modules laid out as flex row with 2px gap.

---

### HP (helper)
`Case.jsx`

> Returns inline style object for a module slot of given HP width.

**Signature:** `HP(hp)` returns `{ width, flexShrink: 0, height: '100%', overflow: 'hidden' }`
**Width:** percentage of TOTAL_HP (104HP row).

---

### Module
`Module.jsx`

> Front panel wrapper. Provides panel background, rail dead-zone padding, and safe content area for module children.

**Props:** `children`, `className` (default `'bg-surface-secondary'`)
**Layout:** Full width/height flex column. MODULE_PADDING (12px) top/bottom padding. Inner content area has 4px horizontal padding and overflow hidden.

---

### BlankPanel
`BlankPanel.jsx`

> Empty front panel with no controls or jacks. Fills unused HP space.

**Props:** `className` — passed to Module wrapper
**Notes:** Renders a bare `<Module />` with no children.

---

### JackSocket
`JackSocket.jsx`

> 3.5mm eurorack jack socket. Handles drag-to-patch interaction and signal-proportional ring glow animation.

**Props:**
- `type` — `'in'` or `'out'`
- `port` — port name string
- `moduleId` — owning module ID
- `signalRef` — ref to current signal value (for glow animation)
- `active` — whether a cable is connected
- `size` — `'sm'` (12px) or `'md'` (16px, default)
- `label` — text below socket
- `category` — unused, default `'utility'`
**Interaction:**
- Output jacks: pointerDown starts pending connection (grab cursor)
- Input jacks: click on active jack disconnects the cable
- Idle input jacks become pointer targets when a pending output exists
**Visual:**
- Ring glows proportional to signal amplitude (color derived from signal type)
- Signal-to-brightness: scalar = value/100, color = luminance, points = 0.8 if non-empty
- Glow color: `#e74c3c` (red)
**Notes:** Registers/unregisters jack DOM element with routing context for cable hit-testing.

---

### PatchCableOverlay
`PatchCableOverlay.jsx`

> SVG overlay rendering catenary patch cables between connected jacks and a dashed preview cable while dragging.

**Props:** `containerRef` — ref to the scrollable case container
**Cable rendering:**
- Established connections: double-stroke catenary (black shadow + amber `#f59e0b` wire, 2.5px)
- Pending connection: dashed red `rgba(231,76,60,0.4)`, 2px, follows pointer
**Catenary formula:** cubic bezier with sag = 30 + distance * 0.12, control points at 30%/70% horizontal
**Notes:**
- SVG sized to container scrollWidth/clientHeight, pointer-events: none.
- Re-renders on scroll and after jack registration.
- Reads jack positions from routing context's `jackRefs` map via `getJackCenter()`.

---

### PatchModule
`PatchModule.jsx` · 6HP

> Save/load/clear patch cable presets.

**Props:** `id` (default `'patch1'`)
**Controls:** dropdown (patch name selector), load button, save button, clear button
**Behavior:**
- `load` — applies selected patch's connection array via `routing.loadPatch()`
- `save` — snapshots current connections to `usr-NN` slot (auto-incrementing)
- `clear` — removes all connections, resets to `'init'`
**Notes:** Initial presets loaded from `../../patches.js`. Displays current cable count.

---

### eurorack.js (constants)
`eurorack.js`

> Grid constants derived from eurorack spec.

| Constant | Value | Description |
|---|---|---|
| `TOTAL_HP` | 104 | Full row width in HP |
| `MIN_HP` | 2 | Minimum module width |
| `ASPECT['1u']` | `'12 / 1'` | 1U row aspect ratio |
| `ASPECT['3u']` | `'4 / 1'` | 3U row aspect ratio |
| `RAIL_HEIGHT` | 14 | Rail dead zone in px |
| `MODULE_PADDING` | 12 | Content padding inside rails |
| `hpToPercent(hp)` | `(hp / 104) * 100` | HP to percentage conversion |
