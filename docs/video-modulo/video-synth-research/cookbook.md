# Video Synthesis — Cookbook

Classic patches, famous effects, and useful recipes.

## Basic Recipes

### 1. Horizontal Bars
**Patch:** Vertical ramp → output
**Result:** Gradient from black (top) to white (bottom)
**Variation:** Feed through comparator → hard-edged split screen

### 2. Vertical Bars
**Patch:** Horizontal ramp → output
**Result:** Gradient from black (left) to white (right)

### 3. Centered Circle
**Patch:** H ramp (mirrored) + V ramp (mirrored) → mixer → comparator → output
**How:** Mirrored ramps create V-shapes. Sum of two V-shapes = diamond/circle distance field. Comparator thresholds it into a disc.

### 4. Stripes
**Patch:** Ramp → oscillator (or wavefolder) → output
**Result:** Repeating bars. Frequency = stripe count. Waveform = stripe profile (sine = smooth, square = sharp)

### 5. Checkerboard
**Patch:** H oscillator → XOR → output, V oscillator → XOR
**How:** XOR of two square waves at same frequency = checkerboard

### 6. Color Bars
**Patch:** H ramp → R input, H ramp (phase shifted) → G input, H ramp (inverted) → B input
**Result:** Classic TV color bar pattern. Each color starts at different horizontal position.

---

## Classic Effects

### 7. Solarization
**Patch:** Input signal → wavefolder (fold mode, high drive) → output
**Result:** Psychedelic color inversion at brightness thresholds. The Jimi Hendrix poster effect.

### 8. Posterization
**Patch:** Input → quantizer (4-8 steps) → output
**Result:** Reduces continuous gradient to discrete brightness levels. Comic book / pop art look.

### 9. Feedback Loop
**Patch:** Output → back into input (with VCA for level control)
**Result:** Fractal tunneling, infinite regression. THE classic video synthesis effect. Every video artist's bread and butter. Control with VCA level, offset, and zoom.
**Warning:** Will blow out without gain control. Always use a VCA or mixer in the loop.

### 10. Luma Key
**Patch:** Source A → key generator threshold input. Source B → VCA signal input. Key output → VCA CV input.
**Result:** Source B only visible where Source A is bright. Poor man's green screen using brightness instead of color.

### 11. Raster Manipulation
**Patch:** Audio-rate oscillator → H displacement input
**Result:** Scan line wobble. Higher frequency = tighter wobble. Lower = wave distortion. Classic CRT glitch aesthetic.

---

## Advanced Patches

### 12. Animated Geometric Tunnel
**Patch:** Mirrored H ramp + mirrored V ramp → wavefolder → comparator → feedback loop (with zoom offset)
**Result:** Geometric shape that tunnels inward. The wavefolder creates concentric shapes. Feedback + zoom = infinite tunnel.

### 13. RGB Phase Animation
**Patch:** Oscillator → R, same oscillator (phase +120°) → G, same oscillator (phase +240°) → B
**Result:** Smoothly cycling rainbow. Phase offsets create the color rotation. Speed = oscillator frequency.

### 14. Glitch Displacement
**Patch:** Random/S&H (fast rate) → horizontal offset CV
**Result:** Each scan line displaced randomly. Digital glitch / data corruption aesthetic.

### 15. CRT Scanline Effect
**Patch:** High-frequency V oscillator (square wave, narrow pulse) → multiply with video signal
**Result:** Dark lines between bright lines = CRT monitor appearance

### 16. Kaleidoscope
**Patch:** Video source → mirror (H) → mirror (V) → output
**Result:** 4-way symmetry. Feed through rotation for spinning kaleidoscope.

### 17. VHS Tracking Error
**Patch:** Slow LFO → V position offset, noise → H displacement, low-pass filter on signal
**Result:** Vertical roll + horizontal noise + softness = VHS tracking artifact

### 18. Wipe Transition
**Patch:** H ramp → comparator. Source A → VCA (keyed by comparator). Source B → VCA (keyed by inverted comparator). Both VCAs → mixer → output.
**How:** Moving the comparator threshold sweeps the wipe position. Replace H ramp with V ramp for vertical wipe. Use circular ramp for iris wipe.

---

## Kraftwerk-Style Patches

### 19. Wireframe Grid
**Patch:** H oscillator (square, high freq) + V oscillator (square, high freq) → OR logic → output
**Result:** Grid lines. Feed through perspective transform for the classic Kraftwerk Autobahn look.

### 20. Rotating 3D Wireframe
**Patch:** 3D geometry module → wireframe mode → monitor
**Modulate:** Clock → LFO rate, envelope → rotation speed. Quantize rotation for stepped mechanical movement.

### 21. Neon Typography
**Patch:** Text/SVG source → edge detect → bloom/glow (feedback with brightness) → color (single hue on R or G)
**Result:** Glowing neon outlines on black. The Computer World aesthetic.

---

## Video + Audio Patches

### 22. Audio-Reactive Brightness
**Patch:** Audio envelope follower → VCA CV. Video source → VCA signal → output.
**Result:** Video pulses with the music. Bass hits = bright flash.

### 23. Frequency-to-Color
**Patch:** Audio FFT bands → R (low), G (mid), B (high) → encoder
**Result:** Bass = red, mids = green, treble = blue. Classic music visualizer.

### 24. Oscilloscope Art
**Patch:** Audio signal → V position, audio signal (phase shifted) → H position
**Result:** Lissajous figures. Different phase relationships create circles, figure-8s, spirals.

---

## Tips

- **Start with one ramp and one comparator.** Understand that before adding anything.
- **Feedback is the most powerful tool.** But it needs control (VCA in the loop).
- **Color comes from patching different signals to R, G, B.** Not from a color picker.
- **Speed matters.** Animation-rate (LFO) creates motion. Video-rate (oscillator) creates pattern.
- **Modulate everything.** The difference between static and alive is CV on every parameter.
