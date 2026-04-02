# Phase 2: Control Modules ✓

Port core L1 control modules into the new engine. Pure JS math, scalar output.

**Status:** Complete (2026-04-02). Extended with Logic, Comparator, ClockDivider, SampleHold.

## File Tree

```
src/videomodulo/
  modules/
    control/
      ClockModule.jsx          — master tempo, gate output, clock division
      LFOModule.jsx            — wave shapes, rate/depth/offset, sync input
      EnvelopeModule.jsx       — ADSR curve, gate input
      SequencerModule.jsx      — step values, clock/reset inputs
```

## Modules

### Clock
- Master tempo (BPM knob)
- Output: gate signal (0 or 100) on each tick
- Clock division output jack

### LFO
- Wave shape selector (sine, saw, triangle, square, pulse)
- Rate knob, depth knob, offset knob
- Sync input jack (resets phase on gate)
- Output: scalar (0-100)

### Envelope (ADSR)
- Attack, Decay, Sustain, Release knobs
- Gate input jack (triggers envelope)
- Output: scalar (0-100) following the envelope curve

### Sequencer
- Step count, step values
- Clock input jack (advances step)
- Reset input jack
- Output: scalar value of current step

## Success Criteria

- All modules register with render loop and process correctly
- Clock → LFO sync works (LFO resets phase on clock gate)
- Clock → Envelope gate triggers ADSR curve
- Clock → Sequencer advances steps
- All outputs patchable to any scalar input
