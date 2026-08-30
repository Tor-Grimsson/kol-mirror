/**
 * The analog chain — chroma split · h-skew · v-roll · VHS head-switch · CRT · tear.
 *
 * The 70s TV-station look, as ONE fragment pass. Not six passes: every one of
 * these is a coordinate warp or a per-pixel tint, so they compose in a single
 * shader with no intermediate targets, and a neutral knob costs a comparison
 * rather than a fullscreen draw. That is the whole reason it is one unit with
 * many knobs instead of six units in a chain — the analog original is a signal
 * path where everything runs at once, not a stack you reorder.
 *
 * Ported from kol-monitor's SlitEchoModule, whose numbers were arrived at by
 * ear; the constants below are its constants, kept rather than re-guessed.
 *
 * THIS FILE OWNS THE SOURCE AND THE STATE, NOT THE DRAW (rewritten 2026-08-28).
 * It used to carry its own program, its own texture upload and its own
 * `runAnalog`, which is why `processChannelFx` needed a bespoke "solo analog"
 * branch — and why five knobs produced NOTHING the moment a second effect was
 * enabled: analog was in neither `FX_PROCESSORS` nor `GPU_FX`, so a chain
 * containing it fell to the CPU path, which filtered it out. It is a normal
 * entry in `GPU_FX` now and composes like every other unit. The old runner is
 * kept at `_tmp/2026-08-28-analog-runner/`.
 */

/** The fragment body, for `GPU_FX.analog`. gpuFx's FRAG_HEAD supplies
 *  `vUv`, `uTex`, `uSize` and `fragColor`, so they are not declared here. */
export const ANALOG_FRAG_BODY = `uniform float uTime;
uniform float uSplit;    // chroma separation
uniform float uSkew;     // per-band horizontal displacement
uniform float uRoll;     // vertical wrap-scroll position
uniform float uVhs;      // head-switch band + jitter
uniform float uCrt;      // scanlines, mask, vignette
uniform float uTear;     // 0-1, decays after a trigger

float hash(float n) { return fract(sin(n) * 43758.5453123); }

void main() {
  vec2 uv = vUv;

  // ── V-ROLL. The picture slips vertically and wraps, like a frame held badly.
  uv.y = fract(uv.y + uRoll);

  // ── H-SKEW. A sine down the raster displaces each line sideways; this is the
  //    wobble of a signal whose horizontal sync is drifting.
  if (uSkew > 0.001) {
    float band = floor(uv.y * 24.0);
    uv.x += sin(band * 0.7 + uTime * 2.2) * uSkew * 0.06;
  }

  // ── TEAR. A trigger throws random bands sideways for a moment. Random per
  //    BAND, not per pixel, or it reads as noise instead of a broken signal.
  if (uTear > 0.001) {
    float band = floor(uv.y * 32.0);
    float r = hash(band + floor(uTime * 30.0));
    uv.x += (r - 0.5) * uTear * 0.25;
  }

  // ── VHS head-switch. The bottom of the frame is where the head leaves the
  //    tape: a torn, jittering band that never reaches the top of the picture.
  if (uVhs > 0.001) {
    float headZone = smoothstep(0.10, 0.0, uv.y);     // bottom ~10%
    float j = (hash(floor(uv.y * 200.0) + floor(uTime * 24.0)) - 0.5);
    uv.x += j * uVhs * 0.12 * headZone;
  }

  uv = clamp(uv, 0.0, 1.0);

  // ── CHROMA SPLIT. R and B pulled apart horizontally — the colour-under
  //    carrier losing registration against luma.
  vec3 c;
  if (uSplit > 0.001) {
    float o = uSplit * 0.02;
    c.r = texture(uTex, clamp(uv + vec2( o, 0.0), 0.0, 1.0)).r;
    c.g = texture(uTex, uv).g;
    c.b = texture(uTex, clamp(uv + vec2(-o, 0.0), 0.0, 1.0)).b;
  } else {
    c = texture(uTex, uv).rgb;
  }

  // ── CRT. Scanlines, a phosphor triad, and a vignette — the tube itself.
  if (uCrt > 0.001) {
    float line = 0.5 + 0.5 * sin(vUv.y * uSize.y * 3.14159);
    c *= 1.0 - uCrt * 0.35 * (1.0 - line);
    // Phosphor triad: each column favours one gun.
    float col = mod(floor(vUv.x * uSize.x), 3.0);
    vec3 mask = col < 1.0 ? vec3(1.0, 0.85, 0.85)
              : col < 2.0 ? vec3(0.85, 1.0, 0.85)
                          : vec3(0.85, 0.85, 1.0);
    c *= mix(vec3(1.0), mask, uCrt);
    vec2 d = vUv - 0.5;
    c *= 1.0 - uCrt * 0.7 * dot(d, d);
  }

  fragColor = vec4(c, 1.0);
}`

/* Roll is an accumulating POSITION, not a function of wall-clock: a dropped
   frame should slow the roll, not jump it. Tear decays from a trigger. Keyed
   per channel, so two channels running analog keep separate rolls. */
const inst = new Map()

/**
 * Advance one channel's analog state and return the uniform values for it.
 * Called once per frame from the pass's `setUniforms`.
 * @param {string} key  per channel
 * @param {{split,skew,roll,vhs,crt}} p  0-100 knobs
 */
export function analogTick(key, p) {
  const now = performance.now() / 1000
  const s = inst.get(key) || { roll: 0, tear: 0, last: now }
  const dt = Math.min(0.1, now - (s.last || now))   // clamp, or a hitch jumps the roll
  s.last = now
  s.roll = (s.roll + dt * ((p.roll ?? 0) / 100) * 0.8) % 1
  s.tear = Math.max(0, s.tear - dt / 0.3)
  inst.set(key, s)
  return {
    time: now,
    roll: s.roll,
    tear: s.tear,
    split: (p.split ?? 0) / 100,
    skew: (p.skew ?? 0) / 100,
    vhs: (p.vhs ?? 0) / 100,
    crt: (p.crt ?? 0) / 100,
  }
}

/** Throw a tear on one channel — decays over ~0.3s. */
export function triggerTear(key) {
  const s = inst.get(key) || { roll: 0, tear: 0, last: performance.now() / 1000 }
  s.tear = 1
  inst.set(key, s)
}

export const analogState = (key) => inst.get(key) || null
export const releaseAnalog = (key) => inst.delete(key)
