# Video Synthesis — Signal Flow

## Table of Contents

- [The Fundamental Principle](#the-fundamental-principle)
- [Voltage Standards](#voltage-standards)
- [Signal Flow: Generation -> Processing -> Display](#signal-flow-generation--processing--display)
  - [Step by step](#step-by-step)
- [Three Frequency Domains](#three-frequency-domains)
- [How Ramps Become Shapes](#how-ramps-become-shapes)
- [How Colors Are Created](#how-colors-are-created)
- [Key Insight for Our System](#key-insight-for-our-system)

## The Fundamental Principle

**It's all just voltage.** In modular video synthesis, every signal — whether it represents brightness, color, position, shape, or timing — is the same thing: a voltage between 0V and 1V. There is no distinction between "video" and "control voltage." A ramp generator's output IS the video when you display it, and IS a control voltage when you feed it to another module's CV input.

Sources: [LZX Getting Started](https://lzxindustries.net/getting-started), [Knobulism — It's All Just Voltage](https://www.knobulism.com/2024/07/02/modular-synth-signal-flow-its-all-just-voltage-people/)

## Voltage Standards

| Range | Name | Use |
|-------|------|-----|
| 0V to +1V | Unipolar | Video levels (0V = black, 1V = white) |
| -1V to +1V | Bipolar | Modulation, position offsets |

In our digital system: **0 = black, 100 = white**. Same principle.

Source: [LZX Getting Started](https://lzxindustries.net/getting-started)

## Signal Flow: Generation → Processing → Display

```
GENERATORS (create signals from nothing)
    │
    ▼
PROCESSORS (transform, combine, compare)
    │
    ▼
ENCODER (convert R, G, B voltages → video output)
    │
    ▼
MONITOR (display the result)
```

### Step by step:

1. **Generators** produce waveforms synchronized to screen dimensions
   - Ramp generators: linear gradient across screen (H or V)
   - Oscillators: repeating patterns at various frequencies
   - Noise: random voltage

2. **Processors** modify and combine signals
   - Comparators: threshold → binary (shape edges)
   - VCAs: multiply signal × control voltage
   - Mixers: add signals together
   - Key generators: create masks for compositing

3. **Encoder** takes 3 signals (Red, Green, Blue) and combines into displayable video
   - Each channel is just a voltage: 0V = no color, 1V = full color
   - Patch ANY signal to R, G, or B

4. **Monitor** displays the encoded signal

Source: [LZX Getting Started](https://lzxindustries.net/getting-started)

## Three Frequency Domains

Video synthesis operates across three speed domains, unlike audio which only has two:

| Domain | Frequency | Creates | Audio equivalent |
|--------|-----------|---------|-----------------|
| Animation | ~0-30 Hz | Motion, movement | LFOs |
| Vertical | ~30-15 kHz | Vertical patterns | Audio oscillators |
| Horizontal | ~15 kHz-6 MHz | Horizontal patterns | **No audio equivalent** |

Audio LFOs and envelopes work for animation. Audio oscillators work for vertical patterns. But horizontal patterns require video-rate generators.

Source: [LZX Community — Using Audio Modules](https://community.lzxindustries.net/t/using-audio-modules-in-a-video-synth-system/65)

## How Ramps Become Shapes

A **ramp** is a voltage that sweeps from 0V to 1V across the screen:
- **Horizontal ramp**: 0V at left edge, 1V at right edge
- **Vertical ramp**: 0V at top, 1V at bottom

Feed a ramp into a **comparator** with a threshold knob:
- Comparator outputs 1V (white) where ramp > threshold
- Comparator outputs 0V (black) where ramp < threshold
- Result: a hard-edged rectangle

Feed TWO ramps (H + V) into logic: you get rectangles, crosses, diamonds.

Mirror a ramp (fold it at the center): you get centered shapes.

Source: [Midwest Modular — Rampes](https://midwestmodular.com/rampes-ramp-generator/), [LZX Getting Started](https://lzxindustries.net/getting-started)

## How Colors Are Created

Patch different signals to R, G, B inputs of the encoder:
- Same signal → all three = grayscale
- Ramp to R, inverted ramp to B = gradient from red to blue
- Different oscillator frequencies per channel = rainbow patterns

There is no "color picker" — color emerges from the relationships between three independent voltage signals.

Source: [LZX Getting Started](https://lzxindustries.net/getting-started)

## Key Insight for Our System

Our modules pass scalar values 0-100 on a shared bus. This IS the video signal. When the monitor displays `ramp1_out`, it should render that value as brightness across the screen. When `gen1_luma` feeds into the RGB encoder (monitor), it IS the image.

The missing piece: our monitor treats bus values as oscilloscope traces (plotting value over TIME). A real video monitor should map values spatially — value at each PIXEL POSITION. That requires per-pixel rendering, not per-frame scalar values.

The architecture shift needed: generators should output per-pixel data (canvas frames), not single scalar values. OR: the monitor should evaluate expressions per-pixel using screen coordinates as variables (x, y), the same way ramp generators work.
