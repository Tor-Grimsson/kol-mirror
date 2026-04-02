# Session: Video Modulo — Phase 4-5, 19 New Modules, Fixes

**Date:** 2026-04-02
**Agent:** Claude Code (Opus 4.6)
**Summary:** Completed phases 4 (Display) and 5 (Patch & Play), built 19 new modules across all categories, added Pen module for draw style control, Dropdown control, PatchModule with save/load/clear, extensive layout and UX fixes.

## Changes Made

### Phase 4: Display
- `src/videomodulo/hooks/signals.js` — Added `edges` param to `points(arr, edges)`, added `pen` signal type with `PEN_DEFAULTS`
- `src/videomodulo/modules/generators/WireframeModule.jsx` — `generateGeometry` returns `{ vertices, edges }` per shape (cube 12 edges, tetra 6, octa 12, sphere sequential loop)
- `src/videomodulo/modules/display/drawSignal.js` — New shared drawing primitives. Scope trace (ring buffer), color fill, wireframe (edge segments), waveform (polyline). All accept pen signal for style control (thickness, dash, gap, opacity, lineCap)
- `src/videomodulo/modules/display/MonitorModule.jsx` — Rewritten with 128-sample ring buffers per channel, pen input jack replaces lo-fi toggle, enable guard
- `src/videomodulo/modules/display/OutputModule.jsx` — New 16HP composited 4-layer display with bg knob, pen input jack, enable guard

### Phase 5: Patch & Play
- `src/videomodulo/hooks/usePatchRouting.jsx` — Added `initialConnections` prop, `loadPatch(connections)` method
- `src/videomodulo/hooks/useRenderLoop.js` — Frame timing via `performance.now()`, `timingRef` returned, console.debug every 60 frames
- `src/videomodulo/modules/utility/PatchCableOverlay.jsx` — RAF-delayed forceUpdate after mount so initial connections render
- `src/videomodulo/patches.js` — Named patch presets (init, ref), loaded by PatchModule
- `src/videomodulo/modules/utility/PatchModule.jsx` — 6HP 3U, Dropdown for patch selection, Load/Save/Clear, connection count display

### New Control Component
- `src/videomodulo/modules/controls/Dropdown.jsx` — Overlay select via createPortal, positioned from trigger rect, click-outside-to-close

### 19 New Modules

**1U (4HP):**
- `modules/math/MultModule.jsx` — 1:4 passive splitter, horizontal jack layout
- `modules/generators/NoiseModule.jsx` — White/pink/S&H random, horizontal layout
- `modules/math/AttenuatorModule.jsx` — Bipolar attenuverter, CV input, horizontal layout
- `modules/math/VCAModule.jsx` — Voltage controlled amplifier (in × cv), horizontal layout

**3U Small (4HP):**
- `modules/control/LogicModule.jsx` — AND/OR/XOR/NOT/NAND/NOR gate
- `modules/control/ComparatorModule.jsx` — Threshold → gate (0 or 100)
- `modules/control/ClockDividerModule.jsx` — Divide clock by 2/4/8/16
- `modules/math/SwitchModule.jsx` — CV-controlled A/B switch
- `modules/math/QuantizerModule.jsx` — Snap to N steps (2-16)
- `modules/math/ScaleOffsetModule.jsx` — Linear transform (scale + offset)

**3U Medium (6HP):**
- `modules/control/SampleHoldModule.jsx` — Latch on trigger, smooth slew
- `modules/math/RingModModule.jsx` — Signal multiplication with depth
- `modules/math/WaveshaperModule.jsx` — Clip/fold/wrap/sine with drive
- `modules/generators/RampModule.jsx` — Linear sweep (up/down/tri), sync input
- `modules/math/DelayModule.jsx` — Frame-based ring buffer (1-256 frames), feedback
- `modules/math/ReverbModule.jsx` — 4-tap delay with decay, dry/wet mix

**3U Large (8-12HP):**
- `modules/math/MixerModule.jsx` — 4-channel weighted sum
- `modules/math/MathsModule.jsx` — Dual slew limiter (add/sub/min/max/avg), EOC gate
- `modules/generators/SMX3Module.jsx` — 3×3 color routing matrix, 9 bipolar knobs, RGB + color output

### Pen Module
- `modules/control/PenModule.jsx` — 6HP, outputs pen signal (thickness/dash/gap/opacity/cap). 4 CV inputs. Patched into Monitor or Output pen jack to control draw style. Replaces lo-fi toggle.

### Fixes
- **Module disable audit**: Monitor and Output now fully disabled when off (no processing, null refs)
- **Jack differentiation**: Input jacks have white donut inner ring (`rgba(255,255,255,0.15)` border)
- **Jack layout**: All 4HP 3U modules use stacked vertical layout (inputs above, divider, outputs below). All 1U modules use horizontal layout.
- **Sequencer**: 12HP, step length control (1-32, default 8), follow playhead toggle, out-of-range steps dimmed
- **RGB Oscillator**: 8HP, per-channel osc toggle (off = constant brightness, on = rate oscillator), per-channel clr toggle (off = scalar output, on = color output)

### Documentation
- `docs/video-modulo/components/control.md` — 10 control modules documented
- `docs/video-modulo/components/math.md` — 12 math modules documented
- `docs/video-modulo/components/generators.md` — 6 generator modules documented
- `docs/video-modulo/components/display.md` — 2 display modules + drawSignal.js documented
- `docs/video-modulo/components/utility.md` — 7 utility components documented
- `docs/video-modulo/architecture/README.md` — Phases 1-5 marked complete, module count, categorized list
- `docs/video-modulo/architecture/conventions.md` — Full file tree updated
- Phase docs 1-5 marked complete with dates
- Phase docs 6-7 file trees updated

## Current State

### Working
- 31 modules across 5 categories (control, math, generators, display, utility)
- 6 shared UI controls (Knob, ModuleHeader, Selector, Toggle, WaveSelect, Dropdown)
- Centralized RAF render loop with topological sort, frame timing
- Drag-to-connect patch cables with initial connection support
- Patch save/load/clear via PatchModule + patches.js
- Pen signal type controls draw style on display modules
- Signal types: scalar, color, points (with edges), pen

### Layout
- Row 1 (1U): Mult(8) + Noise(8) + Atten(8) + VCA(8) = 32/104 HP
- Row 2 (3U): Patch(6) + Clock(4) + ClkDiv(4) + LFO(6) + Env(6) + Seq(12) + S&H(6) + Logic(4) + Comp(4) + Const(4) + Pen(6) + Switch(4) + Quant(4) + ScaleOfs(4) + Maths(8) + Mixer(8) = 90/104 HP
- Row 3 (3U): RGB(8) + Wave(6) + Wire(8) + Ramp(6) + SMX3(12) + RingMod(6) + Waveshaper(6) + Delay(6) + Reverb(6) + Monitor(12) + Output(16) = 92/104 HP

### Known Issues
- 1U modules may still clip content on very narrow viewport
- Patch cables coordinates may drift on scroll
- CV inputs on most modules replace knob value instead of modulating it
- No edge connectivity data visualization in lo-fi mode (dots only)
- Envelope cycle + clk positioning still awkward

## Next Steps
1. Phase 6: Raster Bridge — WebGL shader pipeline, first effect (Feedback or Blur)
2. Phase 7: Integration — Image/video input, mixer connection, extended effects
3. Module shelf / drag-to-insert / delete from rack
4. More patches demonstrating new modules
