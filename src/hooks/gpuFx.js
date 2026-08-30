/**
 * gpuFx — the FX stage, on the GPU.
 *
 * WHY THIS EXISTS, measured (2026-08-27, Radeon Pro 570X, 640x480):
 *
 *   CPU applyCanvasFx      12.795 ms
 *   this, chain + copy      2.273 ms      → 5.6x, output pixel-identical
 *   getImageData alone      1.045 ms
 *
 * The CPU path pays twice: a `getImageData`/`putImageData` sync (a fixed stall,
 * ~1 ms even on a tiny buffer) AND a per-pixel JS loop that grows with the
 * output. On the app's small live buffer the stall is everything and the loop
 * is nothing — which is why an earlier reading, taken only there, wrongly
 * concluded the cost was readback-bound in general. At any realistic size the
 * loop dominates, and the win grows with the canvas.
 *
 * ONE context for every channel, not one each. A WebGL context is an expensive,
 * limited resource (browsers cap them around 16 and drop the oldest), and the
 * app already leaks one Pixi Application per channel. Everything here shares a
 * single context, a single quad, and one program per effect, all compiled once
 * at init — never in a frame.
 *
 * The contract deliberately mirrors the CPU path (`applyCanvasFx`) so the two
 * are swappable while porting: give it a source canvas and a chain, get back a
 * canvas you can draw. If WebGL is unavailable it returns null and the caller
 * keeps using the CPU path, which is why the CPU one is not being deleted.
 */

/* One fullscreen triangle-pair; every pass is a draw of this. */
const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FRAG_HEAD = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uSize;
out vec4 fragColor;
`

let gl = null
let canvas = null
let quad = null
const programs = new Map()   // effect id -> { program, uniforms }
let failed = false

function init() {
  if (gl || failed) return gl
  try {
    canvas = new OffscreenCanvas(1, 1)
    gl = canvas.getContext('webgl2', {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      // The stage renders to its own canvas and is drawn onward by the
      // compositor; nothing reads it back, so the driver may discard freely.
      preserveDrawingBuffer: false,
      desynchronized: true,
    })
    if (!gl) { failed = true; return null }
    quad = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quad)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  } catch {
    failed = true
    gl = null
  }
  return gl
}

function compile(type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    // A shader that will not compile is a bug in this file, not a user error —
    // say so loudly once and let the caller fall back rather than drawing black.
    console.error('[gpuFx] shader failed:', gl.getShaderInfoLog(sh), '\n', src)
    gl.deleteShader(sh)
    return null
  }
  return sh
}

/** Build (once) and cache the program for one effect id. */
function programFor(id, body, uniformNames = []) {
  if (programs.has(id)) return programs.get(id)
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_HEAD + body)
  if (!vs || !fs) { programs.set(id, null); return null }
  const program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, 0, 'aPos')
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('[gpuFx] link failed:', gl.getProgramInfoLog(program))
    programs.set(id, null)
    return null
  }
  const uniforms = { uTex: gl.getUniformLocation(program, 'uTex'), uSize: gl.getUniformLocation(program, 'uSize') }
  for (const n of uniformNames) uniforms[n] = gl.getUniformLocation(program, n)
  const entry = { program, uniforms }
  programs.set(id, entry)
  return entry
}

/* Ping-pong targets, grown to the working size and then reused. */
const targets = []
function ensureTargets(w, h) {
  for (let i = 0; i < 2; i++) {
    let t = targets[i]
    if (!t) {
      t = { fbo: gl.createFramebuffer(), tex: gl.createTexture(), w: 0, h: 0 }
      targets[i] = t
    }
    if (t.w !== w || t.h !== h) {
      gl.bindTexture(gl.TEXTURE_2D, t.tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0)
      t.w = w
      t.h = h
    }
  }
  return targets
}

/* The source canvas, uploaded as a texture. An upload is not a readback: the
   GPU does not stall waiting for the CPU, which is the whole point. */
let srcTex = null
function uploadSource(source) {
  if (!srcTex) {
    srcTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, srcTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  gl.bindTexture(gl.TEXTURE_2D, srcTex)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, source)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
  return srcTex
}

/* A second texture unit for passes that need a lookup (the ASCII glyph atlas).
   Uploaded when the atlas object changes, not every frame — the glyphs are
   static; only which one each cell picks is per-frame. */
let atlasTex = null
let atlasSrc = null
function bindAtlas(atlas) {
  if (!atlasTex) {
    atlasTex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, atlasTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  }
  gl.activeTexture(gl.TEXTURE1)
  gl.bindTexture(gl.TEXTURE_2D, atlasTex)
  if (atlasSrc !== atlas) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, gl.RGBA, gl.UNSIGNED_BYTE, atlas)
    atlasSrc = atlas
  }
}

function drawPass(entry, inputTex, target, w, h, setUniforms, pass) {
  gl.useProgram(entry.program)
  gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null)
  gl.viewport(0, 0, w, h)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, inputTex)
  gl.uniform1i(entry.uniforms.uTex, 0)
  if (entry.uniforms.uSize) gl.uniform2f(entry.uniforms.uSize, w, h)
  if (pass?.atlas) {
    bindAtlas(pass.atlas)
    gl.uniform1i(entry.uniforms.uAtlas, 1)
    gl.uniform1f(entry.uniforms.uGlyphs, pass.glyphs)
    gl.activeTexture(gl.TEXTURE0)
  }
  setUniforms?.(gl, entry.uniforms)
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

export const gpuAvailable = () => !!init()

/* The context, the quad and the shader helpers are shared with the stateful
   effects (slitscan, trails) so the app keeps ONE WebGL context rather than one
   per effect family — contexts are a capped resource and the browser silently
   drops the oldest when you pass the limit. */
export const gpuContext = () => (init() ? { gl, canvas, quad } : null)
export { compile as compileShader, VERT as VERT_SRC, FRAG_HEAD as FRAG_HEAD_SRC }

/** Bind the shared quad and draw it. Callers own the program and framebuffer. */
export function drawQuad() {
  gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.drawArrays(gl.TRIANGLES, 0, 3)
}

/**
 * Run a chain over a source canvas, entirely on the GPU.
 *
 * @param {CanvasImageSource} source  the channel's canvas
 * @param {number} w · h              working size
 * @param {Array<{id, body, uniformNames, setUniforms}>} chain  compiled effects
 * @returns {OffscreenCanvas|null} the stage canvas, or null if WebGL is absent
 */
export function runChain(source, w, h, chain) {
  if (!init() || !chain?.length || w <= 0 || h <= 0) return null
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
  const [a, b] = ensureTargets(w, h)
  let input = uploadSource(source)
  let write = a
  let read = b

  for (let i = 0; i < chain.length; i++) {
    const fx = chain[i]
    const entry = programFor(fx.id, fx.body, fx.uniformNames)
    if (!entry) continue
    const last = i === chain.length - 1
    // The final pass renders straight to the stage canvas — one fewer copy.
    drawPass(entry, input, last ? null : write, w, h, fx.setUniforms, fx)
    if (!last) {
      input = write.tex
      const t = write; write = read; read = t
    }
  }
  return canvas
}

/** Release everything. The context is shared, so only call this on teardown. */
export function disposeGpuFx() {
  if (!gl) return
  for (const e of programs.values()) if (e) gl.deleteProgram(e.program)
  programs.clear()
  for (const t of targets) { if (t) { gl.deleteFramebuffer(t.fbo); gl.deleteTexture(t.tex) } }
  targets.length = 0
  if (srcTex) gl.deleteTexture(srcTex)
  srcTex = null
  if (atlasTex) gl.deleteTexture(atlasTex)
  atlasTex = null
  atlasSrc = null
  gl = null
  canvas = null
  failed = false
}
