/**
 * The FX chain as fragment shaders.
 *
 * One per effect, matching the CPU processors in `useCanvasFx.js` so the two
 * paths are interchangeable while the port lands. Each entry gives `gpuFx` a
 * shader body, the uniform names to look up, and a function to set them from
 * the effect's params — the same `params` object the CPU path reads, so nothing
 * upstream (the rack UI, patches, presets) has to know which path is running.
 *
 * The neutral early-outs from the CPU path are kept at the CALL SITE rather
 * than in the shader: a pass that does nothing still costs a draw and a target
 * switch, so it is better skipped than branched.
 *
 * `pixel-sort` is deliberately absent. It is a scan along a row, not a
 * per-pixel function, so it has no natural shader form; it stays on the CPU and
 * pays the readback alone. Everything else ports cleanly.
 */

import { ANALOG_FRAG_BODY, analogTick } from './gpuAnalog'

const LUMA = 'const vec3 LUMA = vec3(0.299, 0.587, 0.114);\n'

export const GPU_FX = {
  chromatic: {
    id: 'chromatic',
    uniformNames: ['uOffset'],
    body: `
uniform vec2 uOffset;
void main() {
  vec2 o = uOffset / uSize;
  // R pulled one way, B the other, G left alone — the classic split.
  float r = texture(uTex, clamp(vUv - o, 0.0, 1.0)).r;
  vec4  g = texture(uTex, vUv);
  float b = texture(uTex, clamp(vUv + o, 0.0, 1.0)).b;
  fragColor = vec4(r, g.g, b, g.a);
}`,
    setUniforms: (gl, u, p) => gl.uniform2f(u.uOffset, p.offsetX | 0, p.offsetY | 0),
  },

  posterize: {
    id: 'posterize',
    uniformNames: ['uLevels'],
    body: `
uniform float uLevels;
void main() {
  vec4 c = texture(uTex, vUv);
  float n = max(1.0, uLevels - 1.0);
  fragColor = vec4(floor(c.rgb * n + 0.5) / n, c.a);
}`,
    setUniforms: (gl, u, p) => gl.uniform1f(u.uLevels, Math.max(2, p.levels | 0)),
  },

  threshold: {
    id: 'threshold',
    uniformNames: ['uLevel'],
    body: LUMA + `
uniform float uLevel;
void main() {
  vec4 c = texture(uTex, vUv);
  float v = dot(c.rgb, LUMA) >= uLevel ? 1.0 : 0.0;
  fragColor = vec4(vec3(v), c.a);
}`,
    setUniforms: (gl, u, p) => gl.uniform1f(u.uLevel, (p.level ?? 50) / 100),
  },

  'edge-detect': {
    id: 'edge-detect',
    uniformNames: ['uThreshold', 'uInvert'],
    body: LUMA + `
uniform float uThreshold;
uniform float uInvert;
float lum(vec2 uv) { return dot(texture(uTex, clamp(uv, 0.0, 1.0)).rgb, LUMA); }
void main() {
  vec2 t = 1.0 / uSize;
  // Sobel — free here, where on the CPU it is nine reads per pixel.
  float gx = lum(vUv + vec2(-t.x, -t.y)) * -1.0 + lum(vUv + vec2(t.x, -t.y))
           + lum(vUv + vec2(-t.x, 0.0)) * -2.0 + lum(vUv + vec2(t.x, 0.0)) * 2.0
           + lum(vUv + vec2(-t.x,  t.y)) * -1.0 + lum(vUv + vec2(t.x,  t.y));
  float gy = lum(vUv + vec2(-t.x, -t.y)) * -1.0 + lum(vUv + vec2(-t.x, t.y))
           + lum(vUv + vec2(0.0, -t.y)) * -2.0 + lum(vUv + vec2(0.0, t.y)) * 2.0
           + lum(vUv + vec2( t.x, -t.y)) * -1.0 + lum(vUv + vec2( t.x, t.y));
  float e = length(vec2(gx, gy));
  float v = e >= uThreshold ? 1.0 : 0.0;
  if (uInvert > 0.5) v = 1.0 - v;
  fragColor = vec4(vec3(v), texture(uTex, vUv).a);
}`,
    setUniforms: (gl, u, p) => {
      gl.uniform1f(u.uThreshold, (p.threshold ?? 30) / 100)
      gl.uniform1f(u.uInvert, (p.invert | 0) === 1 ? 1 : 0)
    },
  },

  mirror: {
    id: 'mirror',
    uniformNames: ['uAxis'],
    body: `
uniform float uAxis;
void main() {
  vec2 uv = vUv;
  // Reflect the first half over the second, on the chosen axis.
  if (uAxis > 0.5) { if (uv.y > 0.5) uv.y = 1.0 - uv.y; }
  else             { if (uv.x > 0.5) uv.x = 1.0 - uv.x; }
  fragColor = texture(uTex, uv);
}`,
    setUniforms: (gl, u, p) => gl.uniform1f(u.uAxis, (p.axis | 0) === 1 ? 1 : 0),
  },

  dither: {
    id: 'dither',
    uniformNames: ['uCell', 'uBias', 'uMask', 'uColor'],
    body: LUMA + `
uniform float uCell;
uniform float uBias;
uniform float uMask;
uniform float uColor;
/* Bayer 4x4, written out. The bit-interleave forms are shorter but every one I
   tried produced a DIFFERENT valid permutation than the CPU path's matrix — all
   correct dithers, none identical — and a literal table costs nothing while
   guaranteeing the two paths render the same pixels. GLSL ES 3.00 allows a
   dynamic index into a const array. */
const float BAYER[16] = float[16](
   0.0,  8.0,  2.0, 10.0,
  12.0,  4.0, 14.0,  6.0,
   3.0, 11.0,  1.0,  9.0,
  15.0,  7.0, 13.0,  5.0
);
float bayer(vec2 p) {
  ivec2 f = ivec2(mod(p, 4.0));
  return BAYER[f.y * 4 + f.x] / 16.0;
}
/* Interleaved Gradient Noise (Jimenez) — blue-noise thresholds, no table, no
   4px tiling. Three multiplies. */
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
void main() {
  vec4 c = texture(uTex, vUv);
  vec2 px = floor(vUv * uSize / max(1.0, uCell));
  float t = uMask > 0.5 ? ign(px) : (bayer(px) + 0.03125);
  if (uColor > 0.5) {
    fragColor = vec4(step(vec3(t), c.rgb + uBias), c.a);
  } else {
    float l = dot(c.rgb, LUMA) + uBias;
    fragColor = vec4(vec3(l > t ? 1.0 : 0.0), c.a);
  }
}`,
    setUniforms: (gl, u, p) => {
      gl.uniform1f(u.uCell, Math.max(1, p.cell | 0))
      gl.uniform1f(u.uBias, ((p.bias ?? 50) / 100 - 0.5) * 0.6)
      gl.uniform1f(u.uMask, (p.mask | 0) === 1 ? 1 : 0)
      gl.uniform1f(u.uColor, (p.color | 0) === 1 ? 1 : 0)
    },
  },

  /* ASCII needs a glyph ATLAS, which is a second texture, so it cannot be a
     plain body-only pass like the others — `needsAtlas` tells gpuFx to bind it
     on unit 1. The atlas itself is baked once on the CPU (canvas fillText into
     an alpha mask) and uploaded; only the per-cell luminance and the glyph blit
     happen per frame, which is the part that was expensive. */
  ascii: {
    id: 'ascii',
    needsAtlas: true,
    uniformNames: ['uCell', 'uGain', 'uColor', 'uAtlas', 'uGlyphs'],
    body: LUMA + `
uniform sampler2D uAtlas;
uniform float uCell;
uniform float uGain;
uniform float uColor;
uniform float uGlyphs;
void main() {
  vec2 px    = vUv * uSize;
  vec2 cell  = floor(px / uCell);
  vec2 origin = cell * uCell;
  /* Average the cell by sampling a 3x3 grid of it rather than every texel: the
     glyph is chosen from one number, so the extra precision of a full average
     would not change which character is picked. */
  vec3 sum = vec3(0.0);
  for (int j = 0; j < 3; j++) {
    for (int i = 0; i < 3; i++) {
      vec2 p = (origin + (vec2(float(i), float(j)) + 0.5) * (uCell / 3.0)) / uSize;
      sum += texture(uTex, clamp(p, 0.0, 1.0)).rgb;
    }
  }
  vec3 avg = sum / 9.0;
  float l = clamp(dot(avg, LUMA) * uGain, 0.0, 1.0);
  float gi = floor(l * (uGlyphs - 1.0) + 0.5);
  if (gi < 1.0) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
  // Where in the cell we are, mapped into that glyph's slot in the atlas.
  vec2 inCell = (px - origin) / uCell;
  vec2 auv = vec2((gi + inCell.x) / uGlyphs, inCell.y);
  float mask = texture(uAtlas, auv).r;
  vec3 ink = uColor > 0.5 ? avg : vec3(1.0);
  fragColor = vec4(ink * mask, 1.0);
}`,
    setUniforms: (gl, u, p) => {
      gl.uniform1f(u.uCell, Math.max(4, Math.min(32, p.cell | 0 || 8)))
      gl.uniform1f(u.uGain, (p.gain ?? 100) / 100)
      gl.uniform1f(u.uColor, (p.color | 0) === 1 ? 1 : 0)
    },
  },
  /* ANALOG TV — one pass, many knobs, and STATEFUL: the v-roll accumulates and
     the tear decays, so it needs a per-channel key that the stateless passes do
     not. That key is why it used to live outside this table with a bespoke
     runner in `processChannelFx` — and why it produced nothing in any chain of
     two, since a unit in neither `GPU_FX` nor `FX_PROCESSORS` is dropped by
     both paths. `buildPasses` threads the key in; the source and the state
     stay in `gpuAnalog.js`. */
  analog: {
    id: 'analog',
    uniformNames: ['uTime', 'uSplit', 'uSkew', 'uRoll', 'uVhs', 'uCrt', 'uTear'],
    body: ANALOG_FRAG_BODY,
    stateful: true,
    setUniforms: (gl, u, p, key) => {
      const a = analogTick(key || 'default', p)
      gl.uniform1f(u.uTime, a.time)
      gl.uniform1f(u.uSplit, a.split)
      gl.uniform1f(u.uSkew, a.skew)
      gl.uniform1f(u.uRoll, a.roll)
      gl.uniform1f(u.uVhs, a.vhs)
      gl.uniform1f(u.uCrt, a.crt)
      gl.uniform1f(u.uTear, a.tear)
    },
  },
}

/** Effects with no shader form — these keep using the CPU path. */
export const CPU_ONLY = new Set(['pixel-sort', 'slitscan'])

/** Can this whole chain run on the GPU? Mixed chains stay on the CPU. */
export const chainIsGpuCapable = (chain) =>
  chain.length > 0 && chain.every((fx) => GPU_FX[fx.type] && !CPU_ONLY.has(fx.type))

/** Turn an FX chain into the pass list `gpuFx.runChain` wants. */
export const buildPasses = (chain, key) =>
  chain.map((fx) => {
    const def = GPU_FX[fx.type]
    const params = fx.params || {}
    return {
      id: def.id,
      body: def.body,
      uniformNames: def.uniformNames,
      // The atlas is a second texture; gpuFx binds it on unit 1 when present.
      atlas: def.needsAtlas ? asciiAtlasCanvas(params.cell) : null,
      glyphs: def.needsAtlas ? asciiGlyphCount() : 0,
      setUniforms: (gl, u) => def.setUniforms(gl, u, params, key),
    }
  })

/* ── The glyph atlas ──────────────────────────────────────────────────────
 * Baked ONCE per cell size on a 2D canvas and handed to the GPU as a texture.
 * `fillText` per cell was the CPU version's cost — thousands of text draws a
 * frame at a small cell size — and none of it needs repeating: the glyphs do
 * not change, only which one each cell picks. Cached, and the cache is bounded
 * because only a handful of sizes are ever used.
 */
export const ASCII_RAMP = ' .:-=+*#%@'
const atlasCanvases = new Map()

export function asciiAtlasCanvas(cell) {
  const key = Math.max(4, Math.min(32, cell | 0 || 8))
  const hit = atlasCanvases.get(key)
  if (hit) return hit
  const n = ASCII_RAMP.length
  const c = new OffscreenCanvas(key * n, key)
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.fillStyle = '#fff'
  ctx.font = `${key}px monospace`
  ctx.textBaseline = 'top'
  for (let i = 0; i < n; i++) ctx.fillText(ASCII_RAMP[i], i * key, 0)
  if (atlasCanvases.size > 12) atlasCanvases.clear()
  atlasCanvases.set(key, c)
  return c
}

export const asciiGlyphCount = () => ASCII_RAMP.length
