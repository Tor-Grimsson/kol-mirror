# Session: Video Modulo — Module System Build

**Date:** 2026-04-01
**Agent:** Claude Code (Opus 4.6)
**Summary:** Built the /videomodulo/ standalone page with eurorack-style modular video synth system. 36+ modules, rack layout, patch cable routing, expression engine, dither engine, Three.js 3D, and module shelf.

## Changes Made

### Infrastructure
- **Vite multi-page**: `/videomodulo/` and `/videomodulo/case-02/` as separate entry points
- **`appType: 'mpa'`** with trailing slash redirects
- **`server.host: true`** for LAN access (iPad testing)

### Foundation (Phase 0)
- **Dynamic signal bus** (`useSignalBus.js`): removed hardcoded keys, `register`/`unregister`/`getKeys`
- **Dynamic expression engine** (`useExpressionValue.js`): `compile(expr, busKeys)` generates variable bindings from actual bus state
- **busRef wired to every RotaryDial** across all modules
- **ExpressionInput component**: text field for trigger/clock/sync with rising edge detection
- **ModuleIO footer**: shows clickable jack sockets per module
- **ModulationAssign**: reads dynamic bus keys instead of hardcoded list

### Patch Cable System
- **`usePatchRouting.jsx`**: context for patch state, jack registration, connection management
- **`PatchCableOverlay.jsx`**: SVG catenary curves between connected jacks
- **`JackSocket.jsx`**: draggable 3.5mm jack sockets with category color coding (amber=timing, red=signal, blue=video, purple=utility)
- **Drag interaction**: pointerdown on output → cable follows cursor → pointerup near input connects
- **Global hit detection**: `elementsFromPoint` + nearest-jack within 14px
- **ESC to cancel**, click connected input to disconnect

### Signal Modules (16 original)
- **Clock**: 3U, BPM/swing/PW knobs, 5 output jacks (×1, ÷2, ÷4, ÷8, phase)
- **Gate**: trigger in → timed gate out (delay/length/repeat)
- **Logic**: AND/OR/XOR/NOT/NAND with expression inputs (renamed from LogicGate)
- **Envelope**: ADSR with trigger/gate expression inputs, state machine (IDLE→ATK→DEC→SUS→REL)
- **Sequencer**: clock input, reset input, 8-64 steps paginated, direction selector
- **LFO**: expression-capable rate/depth/offset, waveform selector
- **S&H**: rate/min/max/smooth
- **Maths**: dual function generator (Make Noise inspired), envelope/slew/LFO depending on connections
- **Mixer**: 4 expression inputs, ADD/AVG/MAX/MIN mode
- **Multiples**: input → 3 outputs with scale/offset
- **Generator**: unified 5-algorithm generator (noise/grad/pattern/wave/color), replaces 4 separate generators
- **Dither**: 23 modes, 21 shapes from kol-radar engine
- **Geometry 3D**: Three.js (ICO/BOX/TOR/OCT/SPH/CYL, wire/solid/point)
- **Monitor**: dual A/B oscilloscope with zoom/pan/grab, expression input, CRT scanlines
- **Mult2HP**: passive dual 1+4 mult

### Video Processing Modules (20 new)
- **RGB Split**: 3 gain knobs, splits signal to R/G/B
- **RGB Mix**: 3 inputs + master, combines to one
- **Video VCA**: signal × CV × level
- **Video Key**: threshold keyer (hard/soft)
- **Ramp Generator**: H/V/DIAG sawtooth generator
- **Video Fader**: A/B crossfade
- **Luma Key**: luminance extraction with contrast/brightness
- **Waveshaper**: clip/fold/wrap/sine with drive
- **Slew Limiter**: rise/fall rate limiting
- **Inverter**: signal inversion + offset
- **Quantizer**: 2-32 step quantization
- **Noise Source**: white/pink/brown noise generator
- **Clock Divider**: ÷2-÷16 with rising edge detection
- **Comparator**: GT/LT/EQ/NEQ between two signals
- **Delay**: 1-60 frame circular buffer + feedback
- **Sample**: capture on trigger, hold until next
- **Scale/Offset**: ×scale + offset
- **Rectifier**: full/half+/half- rectification
- **Switch**: A/B routing via CV
- **Video Mix Console**: 4-channel mixer with 2 aux sends/returns

### Rack Layout
- **RackRow component**: 1U (120px) and 3U (380px) rows with aluminum rails
- **HP-based widths**: `HP(n)` function maps HP to percentage of 104HP width
- **Case frame**: side panels, dark background
- **Module shelf**: slide-out panel listing all modules by category with HP sizes
- **Two cases**: Case 1 (signal + generators), Case 2 (video processing)

### Files Created
- `videomodulo/index.html`, `videomodulo/case-02/index.html`
- `src/videomodulo/main.jsx`, `src/videomodulo/case2-main.jsx`
- `src/videomodulo/SynthWorkspace.jsx`, `src/videomodulo/Case2Workspace.jsx`
- `src/videomodulo/RackRow.jsx`, `src/videomodulo/ModuleShelf.jsx`
- `src/hooks/usePatchRouting.jsx`
- `src/components/hall-of-mirrors/generators/ExpressionInput.jsx`
- `src/components/hall-of-mirrors/generators/ModuleIO.jsx`
- `src/components/hall-of-mirrors/generators/JackSocket.jsx`
- `src/components/hall-of-mirrors/generators/PatchCableOverlay.jsx`
- `src/components/hall-of-mirrors/generators/ClockModule.jsx` (rewritten)
- `src/components/hall-of-mirrors/generators/GateModule.jsx` (new, separate from Logic)
- `src/components/hall-of-mirrors/generators/LogicModule.jsx` (renamed from LogicGateModule)
- `src/components/hall-of-mirrors/generators/GeneratorModule.jsx` (unified, replaces 4)
- `src/components/hall-of-mirrors/generators/Geometry3DModule.jsx`
- `src/components/hall-of-mirrors/generators/DitherModule.jsx`
- `src/components/hall-of-mirrors/generators/MonitorModule.jsx`
- `src/components/hall-of-mirrors/generators/MathsModule.jsx`
- `src/components/hall-of-mirrors/generators/MixerModule.jsx`
- `src/components/hall-of-mirrors/generators/Mult2HPModule.jsx`
- `src/components/hall-of-mirrors/generators/ditherEngine.js` (copied from kol-radar)
- 20 new video processing modules (RGBSplit, RGBMix, VideoVCA, etc.)

### Files Modified
- `vite.config.js` — MPA mode, host, multiple entries
- `src/hooks/useSignalBus.js` — dynamic keys
- `src/hooks/useExpressionValue.js` — dynamic bus bindings
- `src/hooks/useMirrorState.js` — added clk1, gate1, logic1, math1, mix1 configs
- `src/components/hall-of-mirrors/ModulationAssign.jsx` — dynamic sources
- `src/components/hall-of-mirrors/RotaryDial.jsx` — busRef to ModulationAssign
- All existing generator modules — busRef on RotaryDials, ModuleIO, JackSocket

### Research Documentation
- `docs/video-synth-research/signal-flow.md` — voltage standards, frequency domains, how ramps become shapes
- `docs/video-synth-research/key-modules.md` — ramp gen, comparator, VCO, encoder, math, mixer, waveshaper, monitor
- `docs/video-synth-research/modulation-operators.md` — 39 operator types from LZX Videomancer
- `docs/video-synth-research/cookbook.md` — 24 classic patches and recipes
- `docs/video-synth-research/architecture-plan.md` — video bus plan for next session

## Known Issues
- **Patching unreliable**: drag-to-connect works but hit detection inconsistent at small sizes
- **No actual video output**: modules pass scalar values, not canvas frames. Monitor shows oscilloscope, not video.
- **Video bus missing**: need `useVideoBus` to pass canvas frames between generator→processor→monitor
- **Module internals overflow**: 1U modules too cramped, some 3U modules clip content
- **20 new modules untested**: built by agents, compiled clean, but not verified functionally
- **Duplicate jacks**: some modules have both JackSocket and ModuleIO jacks for same I/O
- **Old visual generators still exist**: NoiseGenerator, GradientGenerator, PatternGenerator, ColorFieldGenerator not deleted (kept per user request)

## Next Steps (Priority Order)
1. **Video bus** — `useVideoBus` hook, generators publish canvas, monitor displays canvas
2. **GEN → Monitor working patch** — see actual stripes/noise on the monitor screen
3. **Per-pixel ramp generator** — render gradient to canvas, not scalar value
4. **Video processors** — VCA/Key/Fader/RGB operate on canvas frames
5. **Three.js visible** — GEO canvas published to video bus → monitor
6. **Module layout polish** — proper HP sizing, no overflow, consistent controls
7. **Module shelf → dynamic rack** — click to add modules, drag to rearrange
