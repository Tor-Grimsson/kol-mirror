# Knob Expressions

Click any knob value to type an expression. The expression runs every frame and drives the knob automatically.

Type a plain number to set a static value. Alt+click to cancel an active expression.

## Time

| Variable | Description |
|----------|-------------|
| `t` | Seconds since expression started |

## Shorthand Waves

These return values in the knob's range (0-100 by default).

| Function | Description | Example |
|----------|-------------|---------|
| `wave(t)` | Sine wave, smooth up and down | `wave(t*2)` — 2x speed |
| `saw(t)` | Ramp up, then jump back to zero | `saw(t*0.5)` — slow ramp |
| `tri(t)` | Ramp up, then ramp back down | `tri(t*0.5)` — slow bounce |
| `pulse(t)` | Snaps between 0 and max, on/off | `pulse(t*3)` — fast toggle |
| `rand()` | Random value every frame | `rand()` |

## Ease — Shaping the Curve

`ease(t, curve)` — like `tri` (goes up then down) but you control the *shape* of the movement.

The `curve` number changes how the value accelerates:

| Curve | What it does | Feels like |
|-------|-------------|------------|
| `1` | Straight line, constant speed | Same as `tri(t)` |
| `2` | Starts slow, speeds up, slows down | A gentle breath |
| `3` | Starts very slow, whips through the middle | A heavy swing |
| `0.5` | Starts fast, cruises through the middle | A quick flick that floats |
| `5` | Almost nothing... then BANG... then nothing | A dramatic hit |

Think of it like a volume knob for "drama". Low numbers = chill, even movement. High numbers = lazy start, explosive middle, lazy end.

**Examples:**

| Expression | What happens |
|------------|-------------|
| `ease(t)` | Default curve (2), gentle breathing motion |
| `ease(t, 1)` | Straight line up and down, no curve at all |
| `ease(t, 3)` | Hangs at the bottom, rushes to the top, hangs again |
| `ease(t, 0.5)` | Jumps up quick, glides through the top, drops quick |
| `ease(t*2, 4)` | Double speed, very punchy |
| `ease(t*0.5, 2)` | Half speed, smooth and slow |

**Speed and curve are separate:**
- The number you multiply `t` by = how fast (bigger = faster)
- The second number = the shape (bigger = more dramatic)

So `ease(t*3, 5)` = fast AND dramatic. `ease(t*0.2, 1)` = slow AND linear.

## Math Functions

No `Math.` prefix needed.

| Function | Description |
|----------|-------------|
| `sin(x)` | Sine (-1 to 1) |
| `cos(x)` | Cosine (-1 to 1) |
| `abs(x)` | Absolute value |
| `floor(x)` | Round down |
| `ceil(x)` | Round up |
| `round(x)` | Round to nearest |
| `sqrt(x)` | Square root |
| `pow(x, y)` | x to the power of y |
| `PI` | 3.14159... |

## Range Variables

| Variable | Description |
|----------|-------------|
| `min` | Knob minimum (usually 0) |
| `max` | Knob maximum (usually 100) |

## More Examples

| Expression | Result |
|------------|--------|
| `wave(t)` | Smooth sine oscillation |
| `wave(t*4)` | Fast sine |
| `saw(t)*0.8` | Ramp up to 80, reset, repeat |
| `tri(t*2)` | Bounce up and down, 2x speed |
| `pulse(t*2)` | Toggle on/off twice per second |
| `ease(t, 3)` | Dramatic slow-fast-slow bounce |
| `rand()` | Noise every frame |
| `t*10 % max` | Sawtooth via modulo |
