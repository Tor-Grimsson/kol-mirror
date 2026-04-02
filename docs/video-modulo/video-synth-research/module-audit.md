# Video Modulo — Module Audit

Status of every module as of 2026-04-01 end of session.

## Signal Modules (Case 1)

### CLK (ClockModule.jsx) — 8HP, 3U
**What it does:** Master clock with BPM, swing, pulse width. Publishes clk1, clk1_phase, clk1_div2/4/8.
**What works:** BPM knob drives pulse timing. Division outputs publish correctly. Red dot pulses on beat. JackSocket outputs at bottom.
**What's wrong:** EXT clock input jack exists but has no processing — doesn't actually accept external clock. The rAF loop reads from config closure, should use refs for BPM/swing/PW to avoid restart on knob turn.
**Fix:** Add external clock expression evaluation. Move BPM/swing/PW to refs like EnvelopeModule.

### GATE (GateModule.jsx) — 8HP, 1U
**What it does:** Trigger to timed gate. Delay, length, repeat params.
**What works:** Trigger expression input fires gate. State machine (delaying → active → done). Red dot pulses with output.
**What's wrong:** No visible feedback on when gate is open vs closed beyond the dot. The dot opacity logic is simple (output > 0 = full bright), doesn't show gate timing shape.
**Fix:** Could add a tiny 1-pixel-high bar that shows gate open duration visually.

### LOGIC (LogicModule.jsx) — 8HP, 1U
**What it does:** Boolean logic (AND/OR/XOR/NOT/NAND) on two expression inputs.
**What works:** `‹` `›` type selector. Expression inputs for A and B. A/B/OUT indicator bars. Publishes logic1.
**What's wrong:** Has BOTH JackSocket I/O AND ModuleIO I/O — duplicate jacks. The indicator bars are tiny and hard to see at 1U height.
**Fix:** Remove inputs/outputs from ModuleIO (keep only JackSocket). Or remove JackSocket and keep ModuleIO.

### MULT (MultiplesModule.jsx) — 6HP, 1U
**What it does:** Signal splitter. Input → 3 outputs with scale per output.
**What works:** `‹` `›` source selector cycles through hardcoded signal sources. Three colored output dots with scale knobs.
**What's wrong:** Source selector uses hardcoded SIGNAL_SOURCES array (6 entries) instead of reading from dynamic bus. Should be an ExpressionInput or JackSocket, not a dropdown. Scale knobs at 28px may be too big for 6HP.
**Fix:** Replace source selector with ExpressionInput for input. Smaller knobs or vertical faders.

### S&H (RandomSHModule.jsx) — 6HP, 1U
**What it does:** Sample & hold. Internal rate-based random sampling with smoothing.
**What works:** Rate/min/max/smooth knobs. Publishes sh1 to bus. Dot pulses with output value.
**What's wrong:** No trigger input — only internal clock. A real S&H samples an INPUT on a TRIGGER, not generates random values. Missing both signal input and trigger input jacks.
**Fix:** Add trigger expression input (clock source). Add signal expression input (what to sample). The current behavior (random) should be fallback when no signal input is connected.

### MIX (MixerModule.jsx) — 16HP, 1U
**What it does:** 4-input signal mixer with levels, mode (ADD/AVG/MAX/MIN), master.
**What works:** Expression inputs for 4 channels. Mode selector. Master knob. Publishes mix1.
**What's wrong:** At 1U height (120px), 4 expression inputs + mode selector + master + ModuleIO is too much content. Overflows. Level knobs per input are missing in the 1U version — only expression inputs visible.
**Fix:** Either make MIX a 3U module (more room) or reduce to 2 inputs for 1U. Add level knobs back.

### LFO (LFOModule.jsx) — 12HP, 3U ×2
**What it does:** Low frequency oscillator with waveform selection, rate/depth/offset.
**What works:** `‹` `›` waveform selector. 3 knobs vertical. Small scope canvas (40px). Publishes lfo1/lfo2 to bus. JackSocket output added.
**What's wrong:** Rate knob uses linear scaling (0-20Hz mapped to 0-100) which makes low rates hard to set precisely. The LFO was supposed to be dual (two oscillators per module with cross-mod and sync input) per the plan but was never rewritten — still single oscillator.
**Fix:** Exponential rate scaling. Consider dual oscillator rewrite per original plan. Add sync input jack.

### SEQ (SequencerModule.jsx) — 16HP, 3U
**What it does:** 8-64 step sequencer with clock/reset inputs, direction selector, paginated steps.
**What works:** Clock expression input advances steps on rising edge. Reset input. Step bars with drag. Direction `‹` `›` selector. Step count selector. Publishes seq1, seq1_gate, seq1_step. JackSocket inputs and outputs.
**What's wrong:** Step bars at 48px height get cramped in 3U with all the other controls. Page indicators for >16 steps are small text that's hard to click. The clock input rising edge detection runs in ExpressionInput component but the step advancement happens in a useCallback that may have stale closure over step array.
**Fix:** Use refs for step array in the clock trigger callback. Make page indicators clickable dots, not text.

### ENV (EnvelopeModule.jsx) — 12HP, 3U
**What it does:** ADSR envelope with trigger/gate expression inputs, retrigger toggle.
**What works:** State machine (IDLE→ATK→DEC→SUS→REL). Trigger fires attack on rising edge. Gate holds sustain, release on drop. ADSR knobs with busRef. Small scope canvas. Publishes env1, env1_eoc. JackSocket inputs/outputs.
**What's wrong:** Gate input logic — when gate expression drops below 50, release starts. But if no gate expression is set, the envelope just goes through full ADSR cycle without sustain hold. This is correct but not obvious to user. The scope canvas draws a scrolling history which doesn't show the ADSR shape — only the current output level.
**Fix:** When no gate expression, auto-release after sustain hold of ~0.5s. Scope should draw the ADSR shape as a preview when idle.

### MATHS (MathsModule.jsx) — 16HP, 3U
**What it does:** Dual function generator. Each channel: rise/fall knobs + signal/trigger expression inputs. Behavior depends on connections (envelope, slew, LFO, or triggered slew).
**What works:** Ch1/Ch2 independent processing. Mode auto-detection based on what's connected. Dual-trace scope canvas. Publishes math1_ch1/ch2/sum/inv/eor/eoc. JackSocket inputs/outputs.
**What's wrong:** The rise/fall knob scaling (0-5 seconds) may be too coarse for fast envelopes. The free-running LFO mode (nothing connected) works but the rise/fall asymmetry creates complex waveforms that are hard to predict without visual feedback. The scope is only 40px tall.
**Fix:** Logarithmic rise/fall scaling. Bigger scope or mode indicator showing current behavior per channel.

### GEN (GeneratorModule.jsx) — 12HP, 3U ×2
**What it does:** Unified pattern generator. 5 algorithms: noise/gradient/pattern/wave/color. Hidden canvas renders patterns, publishes luma/density as scalars.
**What works:** Algorithm `‹` `›` selector. Sub-type selector per algorithm. Knobs change per algorithm. Canvas renders correctly (tested: noise generates fbm, wave generates sine bands). Publishes gen1_luma, gen1_density. JackSocket outputs.
**What's wrong:** THE BIG PROBLEM — the canvas is hidden (`display: none`). It renders to a canvas nobody can see. It publishes luma (average brightness) as a scalar, not the actual image. The monitor can't display the pattern because there's no video bus. The module generates video but has no way to output it as video.
**Fix:** Implement useVideoBus. Publish canvas ref to video bus. Monitor reads canvas and displays it. This is the #1 priority.

### DITHER (DitherModule.jsx) — 16HP, 3U
**What it does:** 23-mode dither engine from kol-radar. Mode/shape selection, cell/scale/gap/contrast/intensity knobs.
**What works:** Algorithm renders to hidden canvas using renderDither from ditherEngine.js. Mode group and mode `‹` `›` selectors. Shape selector. All knobs with busRef. JackSocket in/out added.
**What's wrong:** Same as GEN — hidden canvas, no video output. Also: the dither engine requires a SOURCE IMAGE to process, but the test pattern is a static gradient created on mount. There's no video input — the input jack was added but it only writes an expression to config, doesn't feed a canvas frame. The dither should process an incoming video signal (canvas from another module).
**Fix:** Video bus for input and output. Read input canvas from video bus, process with dither engine, publish output canvas.

### GEO (Geometry3DModule.jsx) — 16HP, 3U
**What it does:** Three.js 3D geometry. 6 primitives (ICO/BOX/TOR/OCT/SPH/CYL), 3 render modes (wire/solid/point), rotation knobs, detail/scale.
**What works:** Three.js initializes, creates scene/camera/renderer. Geometry `‹` `›` selector. Render mode selector. Knobs drive rotation speed. Canvas exists and renders. Publishes geo1, geo1_phase. JackSocket outputs.
**What's wrong:** The canvas wrapper was set to 1px height (hidden), then changed to visible with `height: auto`. But inside a 3U HP slot with overflow hidden, it may still be clipped. The Three.js renderer needs a real visible canvas — `display: none` doesn't work. The rotation values accumulate in a ref and can overflow (though JS handles this fine with floating point). No video bus output — same problem as GEN/DITHER.
**Fix:** Video bus. Also: the geometry creation effect has `[geometry, renderMode, detail, scale, color]` as dependencies — changing any of these disposes and recreates the mesh. This is correct but causes a flash. Could lerp between geometries.

### MON (MonitorModule.jsx) — 16HP, 3U
**What it does:** Dual A/B oscilloscope with expression input, zoom/pan/grab, CRT scanlines.
**What works:** Expression input compiles and evaluates. Zoom +/- and reset buttons. Grab to pan. CRT scanline effect. Dual input jacks A and B. Expression field for direct function visualization (wave(t*2) etc).
**What's wrong:** It's an OSCILLOSCOPE, not a VIDEO MONITOR. It plots signal values as traces over time. It cannot display video frames. A video monitor should show canvas content — actual pixels, actual images. This module should be renamed to SCOPE and a separate MON module built that displays video bus frames.
**Fix:** Rename to SCOPE. Build a new MON that reads from video bus and displays canvas frames. Keep SCOPE for signal debugging.

### PM (Mult2HPModule.jsx) — 2HP, any row
**What it does:** Passive dual mult. Two sections, each with 1 input + 4 outputs.
**What works:** JackSocket layout with in/out labels.
**What's wrong:** No actual signal processing — the jacks are registered for position/connection but there's no rAF loop copying input to outputs. The mult doesn't actually mult anything. It's purely visual.
**Fix:** Add rAF loop that reads input bus key and copies value to all output bus keys.

---

## Video Processing Modules (Case 2) — All 20

All built by agents. All compiled clean. None tested functionally. All follow the same pattern: header with red dot, vertical knobs, `‹` `›` selectors, JackSocket I/O, ModuleIO footer.

### Common issues across all 20:
1. **Built for scalar bus** — they read/write single numbers, not canvas frames
2. **Input jacks may use inconsistent config keys** — some use `inputExpr`, some use `signalExpr`, etc.
3. **Not wired into Case 1** — only exist in Case 2 workspace
4. **ExpressionInput onValue callbacks** — may have stale closure issues
5. **No visual feedback** — dot pulses but no signal indicator beyond that

### Individual notes:

- **RGB Split/Mix**: Should operate per-pixel on canvas frames, not on scalar values
- **VCA**: Multiplies two scalar bus values — correct for CV, wrong for video
- **Key**: Thresholds a scalar — should threshold per-pixel
- **Ramp Gen**: Outputs a scalar ramp value — should output a canvas gradient
- **Fader**: Crossfades two scalars — should crossfade two canvas frames
- **Luma Key**: Processes a scalar — should analyze canvas brightness per-pixel
- **Waveshaper**: Correct for scalar signal processing (clip/fold/wrap/sine)
- **Slew**: Correct for scalar signal processing (rate-limited follower)
- **Invert**: Correct for scalar (100 - input + offset)
- **Quantizer**: Correct for scalar (snap to steps)
- **Noise Source**: Correct (generates scalar noise)
- **Clock Div**: Correct (divides incoming trigger)
- **Comparator**: Correct for scalar (A vs B)
- **Delay**: Correct for scalar (circular buffer)
- **Sample**: Correct for scalar (capture on trigger)
- **Scale/Offset**: Correct for scalar (multiply + add)
- **Rectifier**: Correct for scalar (abs/half-wave)
- **Switch**: Correct for scalar (route A or B based on CV)
- **Console**: 4-channel scalar mixer with aux sends — should be video mixer with canvas compositing

---

## Summary

### What works:
- Signal bus passes scalar values between modules
- Expression engine compiles and evaluates per-frame
- Clock generates pulses, LFO generates waveforms
- Envelope state machine with trigger/gate inputs
- Sequencer advances on clock input
- Patch cable SVG overlay draws connections
- Jack sockets register positions and support drag-to-connect
- Module shelf lists all available modules
- Rack layout with HP-based widths and aluminum rails
- Three.js renders 3D geometry
- Dither engine processes images with 23 modes

### What doesn't work:
- **No video output** — generators render to hidden canvases but there's no way to display them
- **Patching unreliable** — hit detection inconsistent, connections sometimes fail
- **Mult doesn't mult** — passive mult has no processing
- **S&H has no sample input** — only generates random, can't sample external signal
- **Monitor is scope, not video** — shows oscilloscope traces, not images
- **20 new modules untested** — may have bugs in processing logic
- **Video processors operate on scalars** — should process canvas frames per-pixel

### Priority fix:
1. **useVideoBus** + generators publish canvas + monitor displays canvas
2. Then everything else falls into place
