import { gpuContext, compileShader, VERT_SRC, drawQuad } from './gpuFx'

/**
 * gpuSlitscan — time displacement and motion trails, on the GPU.
 *
 * The instrument this repo is actually for: the 70s TV-station look, which is
 * per-band time displacement plus vidicon persistence.
 *
 * THE RING IS A TEXTURE ARRAY, and the frames get there by UPLOAD, not by
 * rendering into a layer. That distinction matters: imweb's TimeDisplaceEngine
 * needs a runtime capability probe and a whole fallback path because
 * render-to-layer is broken on some backends (ANGLE/Metal on Intel), and when
 * it fails the effect is lost rather than degraded. We never render into a
 * layer — the source is already a canvas being uploaded each frame, so
 * `texSubImage3D` into layer `head` is all we need, and that is universally
 * supported in WebGL2. No probe, no fallback, no silent loss.
 *
 * MEASURED, AND IT IS NOT A SPEED WIN (640x480, 48 bands):
 *
 *   this (upload + pass + blit)        2.51 ms
 *   CPU fxSlitscan, arrays in hand     0.70 ms
 *
 * The CPU version is per-band `set(subarray())` — memcpy, about the cheapest
 * thing a CPU does — while this pays a full texture upload every frame. In the
 * APP the comparison is closer, because the CPU path only gets those arrays via
 * `getImageData`/`putImageData` (~2 ms of sync), which is why the wiring sends
 * a SOLO slitscan here and leaves it on the CPU inside a mixed chain.
 *
 * What this actually buys, and the reason to keep it:
 *   - ring depth is FREE. One pass regardless, so 64 frames cost what 4 do;
 *     the CPU ring is bounded by bytes and gets short exactly when the picture
 *     gets big.
 *   - the read rule can go PER-PIXEL — radial, noise-driven, curved delay —
 *     which the band-based CPU form cannot express at all.
 * Speed was never the argument here; depth and expressiveness are.
 *
 * Memory is the real budget: depth x w x h x 4 in VRAM. Bounded by bytes rather
 * than a frame count, so a small buffer gets a long ring and a large one does
 * not blow the budget — the same rule the CPU version uses.
 */

const RING_BUDGET = 24 * 1024 * 1024   // 24 MB of VRAM per instance, matching the CPU ring's budget
const MAX_DEPTH = 64

const FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec2 vUv;
uniform sampler2DArray uRing;
uniform sampler2D uPrev;      // last output, for the trail
uniform vec2  uSize;
uniform float uHead;          // layer written this frame
uniform float uCount;         // layers actually filled so far
uniform float uDepth;         // ring length
uniform float uMaxDelay;      // frames of displacement across the bands
uniform float uBands;
uniform float uAxis;          // 0 = rows, 1 = columns
uniform float uTrail;
uniform float uGens;          // echo generations, 0-6
uniform float uHop;           // frames between generations
uniform float uFade;          // per-generation gain, compounding
out vec4 fragColor;

const int MAX_GENS = 6;

/* A 5-tap cross blur, radius growing with the generation. Each relay hop in a
   broadcast chain is softer and dimmer than the last; on the CPU this is the
   one part that cannot be afforded, because ctx.filter = blur() per
   generation is a separate full-frame convolution — six of them per frame.
   Here every generation is a handful of extra taps inside the SAME pass. */
vec3 tapBlur(float layer, vec2 uv, float radius) {
  vec2 t = radius / uSize;
  vec3 sum = texture(uRing, vec3(uv, layer)).rgb * 0.4;
  sum += texture(uRing, vec3(clamp(uv + vec2( t.x, 0.0), 0.0, 1.0), layer)).rgb * 0.15;
  sum += texture(uRing, vec3(clamp(uv + vec2(-t.x, 0.0), 0.0, 1.0), layer)).rgb * 0.15;
  sum += texture(uRing, vec3(clamp(uv + vec2(0.0,  t.y), 0.0, 1.0), layer)).rgb * 0.15;
  sum += texture(uRing, vec3(clamp(uv + vec2(0.0, -t.y), 0.0, 1.0), layer)).rgb * 0.15;
  return sum;
}

void main() {
  /* Which band this pixel is in, and how far back that band reads.
     The rows axis reads 1-vUv.y: frames are uploaded with UNPACK_FLIP_Y, so
     vUv.y=0 is the BOTTOM of the picture, and without this band 0 (the newest)
     would sit at the bottom — upside down against the CPU version. */
  float coord = uAxis > 0.5 ? vUv.x : (1.0 - vUv.y);
  float band  = floor(clamp(coord, 0.0, 0.9999) * uBands);
  float ramp  = uBands > 1.0 ? band / (uBands - 1.0) : 0.0;
  float delay = floor(ramp * uMaxDelay + 0.5);
  // Never read further back than the ring has actually been filled, or the
  // first seconds show whatever was in VRAM.
  delay = clamp(delay, 0.0, max(0.0, min(uDepth - 1.0, uCount - 1.0)));

  float layer = mod(uHead - delay + uDepth * 2.0, uDepth);
  vec4 c = texture(uRing, vec3(vUv, layer));

  /* THE REPEATER CHAIN. Each generation is the picture from hop frames
     further back, softer, dimmer and less saturated than the one before,
     added rather than mixed — stacked broadcast relays blooming, which is
     what globalCompositeOperation = 'lighter' does in the analog original. */
  if (uGens >= 1.0) {
    float maxBack = max(0.0, min(uDepth - 1.0, uCount - 1.0));
    for (int g = 1; g <= MAX_GENS; g++) {
      if (float(g) > uGens) break;
      float back = float(g) * uHop;
      if (back > maxBack) break;
      float gain = pow(uFade, float(g)) * 0.55;
      if (gain < 0.02) break;              // below this it cannot be seen
      float echoLayer = mod(uHead - back + uDepth * 2.0, uDepth);
      vec3 e = tapBlur(echoLayer, vUv, float(g) * 0.5);
      // Desaturate with distance down the chain, as a worn relay would.
      float lum = dot(e, vec3(0.299, 0.587, 0.114));
      e = mix(e, vec3(lum), clamp(float(g) * 0.12, 0.0, 0.6));
      c.rgb += e * gain;
    }
    c.rgb = min(c.rgb, vec3(1.0));
  }

  if (uTrail > 0.001) {
    // Vidicon persistence: the previous OUTPUT bleeds through, so trails
    // accumulate through the displacement rather than behind it.
    vec4 prev = texture(uPrev, vUv);
    c = mix(c, prev, uTrail * 0.97);
  }
  fragColor = c;
}`

const state = new Map()   // key -> instance

function makeInstance(gl, key, w, h) {
  const frameBytes = w * h * 4
  const depth = Math.max(2, Math.min(MAX_DEPTH, Math.floor(RING_BUDGET / frameBytes)))

  const ring = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, ring)
  gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, w, h, depth)
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  /* Two targets: the trail reads the previous OUTPUT, so it cannot render into
     the texture it is sampling. */
  const mk = () => {
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    const fbo = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
    return { tex, fbo }
  }

  const inst = { w, h, depth, ring, head: -1, count: 0, a: mk(), b: mk(), program: null, u: {} }

  const vs = compileShader(gl.VERTEX_SHADER, VERT_SRC)
  const fs = compileShader(gl.FRAGMENT_SHADER, FRAG)
  if (vs && fs) {
    const program = gl.createProgram()
    gl.attachShader(program, vs); gl.attachShader(program, fs)
    gl.bindAttribLocation(program, 0, 'aPos')
    gl.linkProgram(program)
    gl.deleteShader(vs); gl.deleteShader(fs)
    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      inst.program = program
      for (const n of ['uRing', 'uPrev', 'uSize', 'uHead', 'uCount', 'uDepth', 'uMaxDelay', 'uBands', 'uAxis', 'uTrail', 'uGens', 'uHop', 'uFade']) {
        inst.u[n] = gl.getUniformLocation(program, n)
      }
    } else {
      console.error('[gpuSlitscan] link failed:', gl.getProgramInfoLog(program))
    }
  }
  state.set(key, inst)
  return inst
}

function dispose(gl, inst) {
  gl.deleteTexture(inst.ring)
  for (const t of [inst.a, inst.b]) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo) }
  if (inst.program) gl.deleteProgram(inst.program)
}

/**
 * Advance the ring by one frame and render the displaced result.
 *
 * @param {string} key                stable per channel+slot, so two slitscans keep separate rings
 * @param {CanvasImageSource} source  this frame
 * @param {number} w · h              working size
 * @param {{depth,bands,axis,trail}} params
 * @returns {OffscreenCanvas|null}
 */
export function runSlitscan(key, source, w, h, params) {
  const ctx = gpuContext()
  if (!ctx || w <= 0 || h <= 0) return null
  const { gl, canvas } = ctx

  let inst = state.get(key)
  if (inst && (inst.w !== w || inst.h !== h)) { dispose(gl, inst); state.delete(key); inst = null }
  if (!inst) inst = makeInstance(gl, key, w, h)
  if (!inst.program) return null

  // Write this frame into the next layer.
  inst.head = (inst.head + 1) % inst.depth
  if (inst.count < inst.depth) inst.count++
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, inst.ring)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, inst.head, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, source)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)

  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }

  const write = inst.a
  const prev = inst.b

  gl.useProgram(inst.program)
  gl.bindFramebuffer(gl.FRAMEBUFFER, write.fbo)
  gl.viewport(0, 0, w, h)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, inst.ring)
  gl.uniform1i(inst.u.uRing, 0)
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, prev.tex)
  gl.uniform1i(inst.u.uPrev, 1)
  gl.uniform2f(inst.u.uSize, w, h)
  gl.uniform1f(inst.u.uHead, inst.head)
  gl.uniform1f(inst.u.uCount, inst.count)
  gl.uniform1f(inst.u.uDepth, inst.depth)
  gl.uniform1f(inst.u.uMaxDelay, ((params.depth ?? 60) / 100) * (Math.min(inst.count, inst.depth) - 1))
  gl.uniform1f(inst.u.uBands, Math.max(2, Math.min(64, params.bands | 0 || 24)))
  gl.uniform1f(inst.u.uAxis, (params.axis | 0) === 1 ? 1 : 0)
  gl.uniform1f(inst.u.uTrail, (params.trail ?? 0) / 100)
  /* Echo: 0-6 generations, `space` frames apart, each `fade` dimmer than the
     last — the knob ranges monitor's SlitEchoModule settled on. */
  gl.uniform1f(inst.u.uGens, Math.round(((params.echo ?? 0) / 100) * 6))
  gl.uniform1f(inst.u.uHop, 2 + ((params.space ?? 30) / 100) * 12)
  gl.uniform1f(inst.u.uFade, (params.fade ?? 60) / 100)
  drawQuad()

  // Blit to the visible stage canvas, then keep this frame as the trail source.
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, write.fbo)
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null)
  gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT, gl.NEAREST)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  inst.a = prev
  inst.b = write

  return canvas
}

/** Drop one instance's VRAM — call when a channel or effect slot goes away. */
export function releaseSlitscan(key) {
  const ctx = gpuContext()
  const inst = state.get(key)
  if (ctx && inst) dispose(ctx.gl, inst)
  state.delete(key)
}

export const slitscanRingInfo = (key) => {
  const i = state.get(key)
  return i ? { depth: i.depth, count: i.count, head: i.head, mb: +(i.depth * i.w * i.h * 4 / 1048576).toFixed(1) } : null
}
