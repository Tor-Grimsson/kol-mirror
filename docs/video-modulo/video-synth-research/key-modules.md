# Video Synthesis — Key Module Types

## Table of Contents

- [Ramp Generator](#ramp-generator)
- [Comparator / Key Generator](#comparator--key-generator)
- [VCO (Voltage Controlled Oscillator)](#vco-voltage-controlled-oscillator)
- [RGB Encoder](#rgb-encoder)
- [Video Math (Processor)](#video-math-processor)
- [Video Mixer / Fader](#video-mixer--fader)
- [Waveshaper](#waveshaper)
- [Monitor / Output](#monitor--output)

## Ramp Generator

**What it does:** Produces a linear voltage sweep synchronized to the screen. Horizontal ramp = gradient left-to-right. Vertical ramp = gradient top-to-bottom.

**Outputs:** H ramp, V ramp, inverted versions, mirrored versions, sync signals, and derived 2D shapes (diamond, rectangle, cross, star, ellipse).

**Why it matters:** The ramp IS the coordinate system. It maps voltage to screen position. Without ramps, you can't place anything on screen. Every shape starts as a ramp fed through processors.

**Real modules:** Syntonie Rampes, LZX DSG3

Source: [Midwest Modular — Rampes](https://midwestmodular.com/rampes-ramp-generator/), [LZX Getting Started](https://lzxindustries.net/getting-started)

---

## Comparator / Key Generator

**What it does:** Compares input voltage to a threshold. Output = 1V (white) when input > threshold, 0V (black) otherwise. Creates hard edges.

**Types:**
- **Hard key**: Binary output, sharp edges. Used for geometric shapes and masks.
- **Soft key**: Gradual transition around threshold. Used for fades and dissolves.

**How shapes are made:** Feed a ramp (smooth gradient) into a comparator. Adjust threshold = move the edge. Feed mirrored ramp = centered shape. Feed two comparators with different thresholds = stripe.

**Real modules:** LZX Cadet VIII Hard Key Generator, LZX Stacker (triple quadrilateral key generator)

Source: [JonDent — LZX Cadet VIII Hard Key Generator](https://djjondent.blogspot.com/2018/10/lzx-cadet-viii-video-synth-hard-key.html), [Schneidersladen — LZX Stacker](https://schneidersladen.de/en/lzx-industries-stacker)

---

## VCO (Voltage Controlled Oscillator)

**What it does:** Generates repeating waveforms (sine, saw, triangle, pulse) at controllable frequencies. Video-rate VCOs run at MHz, not Hz.

**In video context:** Creates stripes, bars, patterns. Frequency = density of pattern. Different waveforms = different brightness profiles across the pattern.

**Real modules:** LZX Scrolls (dual channel, video-rate waveforms with phase CV), Prismatic Ray

Source: [Schneidersladen — LZX Scrolls](https://schneidersladen.de/en/lzx-industries-scrolls)

---

## RGB Encoder

**What it does:** Takes three input signals (Red, Green, Blue) and encodes them into a displayable video signal.

**How it works:** Each input is a voltage (0-1V) representing that color channel's intensity at each point. The encoder combines them according to video standards (composite, component, HDMI).

**In our system:** The monitor module should accept 3 inputs (R, G, B) and render each as a color channel. Or accept 1 input and display as grayscale.

**Real modules:** Syntonie Sortie, LZX ESG3

Source: [LZX Getting Started](https://lzxindustries.net/getting-started)

---

## Video Math (Processor)

**What it does:** Addition, subtraction, multiplication, attenuation of video signals. Pure analog math on voltages.

**Operations:**
- **Add**: Brighten, combine patterns
- **Subtract**: Invert relative to another signal
- **Multiply (VCA)**: Amplitude modulation — one signal controls another's brightness
- **Invert**: 1V - signal = negative image

**Real modules:** LZX PGO (patch-programmable math, no knobs — behavior comes from how you patch it)

Source: [Schneidersladen — LZX PGO](https://schneidersladen.de/en/lzx-industries-pgo)

---

## Video Mixer / Fader

**What it does:** Blends multiple video signals. Crossfader between A and B. Multi-input mixer with level per channel.

**In video context:** Dissolves between scenes, layers patterns, composites foreground over background.

**Real modules:** Syntonie Cadrans (triple VCA + crossfader + four-quadrant multiplier), Video Headroom RGBMIX

Source: [Schneidersladen — Video Synthesis](https://schneidersladen.de/en/eurorack-modular-3u/video-synthesis)

---

## Waveshaper

**What it does:** Non-linear transform of input signal. Clip, fold, wrap, sine-shape.

**In video context:** Creates complex brightness patterns from simple ramps. A ramp through a wavefolder = multiple stripes. A ramp through a sine shaper = smooth undulating brightness.

**Real modules:** Syntonie Courves (triple exponential/logarithmic shaper)

Source: [Schneidersladen — Video Synthesis](https://schneidersladen.de/en/eurorack-modular-3u/video-synthesis)

---

## Monitor / Output

**What it does:** Displays the video signal. In eurorack video, this is typically a small composite monitor or an HDMI output module.

**In our system:** Should render canvas frames from connected generators/processors. NOT an oscilloscope (that's for signal debugging). The monitor IS the audience — what you see on it is the art.

**Real modules:** Gleix GVM008 (dual 3.5" monitors in eurorack), Sleepy Circuits Hypno (built-in display)

Source: [Gleix Video Modular](https://gleix.net/modular)
