import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, GENERATOR_VARIANTS, getDefaultParams, findVariant, DEFAULT_IMAGE } from '../data/mirrorVariants'
import { GENERATOR_COMPONENTS } from '../components/hall-of-mirrors/generators'
import { CANVAS_FX_DEFS, getDefaultCanvasFxParams, applyCanvasFx, fxPath, fxCapability } from '../hooks/useCanvasFx'
import { buildPasses } from '../hooks/gpuFxShaders'
import { runChain, gpuAvailable } from '../hooks/gpuFx'
import { runSlitscan } from '../hooks/gpuSlitscan'
import MirrorVariant from '../components/hall-of-mirrors/MirrorVariant'
import MovementVariant from '../components/hall-of-mirrors/MovementVariant'
import PixiSliceVariant from '../components/hall-of-mirrors/PixiSliceVariant'
import PixiGlitchSliceVariant from '../components/hall-of-mirrors/PixiGlitchSliceVariant'
import PixiMorphVariant from '../components/hall-of-mirrors/PixiMorphVariant'
import PixiRadialVariant from '../components/hall-of-mirrors/PixiRadialVariant'
import PixiKaleidoscopeVariant from '../components/hall-of-mirrors/PixiKaleidoscopeVariant'

/**
 * DevCapturePage — /dev/capture (DEV builds only; monitor's pattern).
 * Render surface for scripts/generate-previews.mjs:
 *   ?kind=list       → JSON list of capturable ids in #capture-list
 *   ?variant=<id>    → that variant standalone at default params in #capture-target
 *   ?fx=<id>         → ONE canvas-FX unit over the canonical still, ditto
 * Not instrument navigation — the studio stays state-driven (ARCHITECTURE §1);
 * this is a tooling seam the studio never links to.
 *
 * The generator branch and the FX branch are 2026-08-28 (plan 1.3): the six
 * generator cards in `/library`'s CREATE view are `kind: 'Source'`, so they
 * requested `/previews/variants/gen-*.png`, which did not exist, and fell back
 * to the stock photo — Live Input and Noise advertised an unprocessed
 * photograph as their own output. A blank says "no preview"; a photo lies.
 */

const PIXI_COMPONENTS = {
  'pixi-slices': PixiSliceVariant,
  'pixi-glitch': PixiGlitchSliceVariant,
  'pixi-morph': PixiMorphVariant,
  'pixi-radial': PixiRadialVariant,
  'pixi-kaleidoscope': PixiKaleidoscopeVariant,
}

const W = 800
const H = 500

/* ONE unit's render path. A single unit is a single run, so none of
 * `processChannelFx`'s segmentation applies — but the three-way choice does,
 * and it is the whole reason Analog TV and Dither used to bake to an unchanged
 * copy of the input. `fxPath` is the instrument's own answer (lifted out of
 * `processChannelFx`'s closure 2026-08-28 precisely so this page cannot hold a
 * second one that drifts).
 */
function runOneFx(canvas, fx, key) {
  const path = fxPath(fx.type, { gpu: gpuAvailable() })
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const out = path === 'slit'
    ? runSlitscan(key, canvas, canvas.width, canvas.height, fx.params || {})
    : path === 'gpu'
    ? runChain(canvas, canvas.width, canvas.height, buildPasses([fx], key))
    : null

  if (out) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(out, 0, 0)
  } else {
    // Same fall-through as the instrument: a GPU run that cannot init goes to
    // the CPU rather than dropping the unit.
    applyCanvasFx(canvas, [fx])
  }
}

/**
 * One FX unit over the canonical still.
 *
 * The still DRIFTS — it pans across 24 frames before the capture. Slitscan
 * keeps a ring of past frames: fed a genuinely static input its `depth`
 * resolves to 0 and the output equals the input, so a still would bake a
 * passthrough and advertise "this unit does nothing" (kol-mirror-cc lost a
 * diagnosis to exactly that false positive on 2026-08-28). Analog TV's roll and
 * tear are time-dependent for the same reason.
 *
 * DRIFT_PX is 8, not the 1.5 tried first: slitscan's bands are offsets INTO
 * that ring, so what they displace by is how far the subject moved between
 * frames. At 1.5 the whole ring spanned 36px and the output was a photograph
 * with faint seams — indistinguishable from the passthrough it exists to avoid.
 * At 8 the ring spans ~190px and the banding is the unit's actual look. The pan
 * stays a pan, so the preview still reads as the same subject as a variant
 * preview, which is the point of using the sample photo at all.
 */
const DRIFT_PX = 8
const DRIFT_FRAMES = 24

function FxCapture({ id }) {
  const canvasRef = useRef(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || doneRef.current) return
    doneRef.current = true
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const fx = { type: id, enabled: true, params: getDefaultCanvasFxParams(id) }
    const key = `preview-${id}`

    /* A unit that cannot run HERE must not bake a PNG. Dither and Analog TV are
       shader-only, so on a machine without WebGL2 they would write out an
       unchanged copy of the still and the card would advertise "this unit does
       nothing" — the stock-photo lie in a new costume. Flag it and let the
       script skip: no PNG, and the card falls to the glyph, which is true. */
    const capability = fxCapability(id, { gpu: gpuAvailable() })
    if (!capability.runs) { canvas.dataset.captureReady = 'skip'; canvas.dataset.captureReason = capability.reason || ''; return }

    const img = new Image()
    img.onload = () => {
      let frame = 0
      const tick = () => {
        // Cover-fit the photo, offset a little further each frame.
        const s = Math.max(W / img.width, H / img.height)
        const dw = img.width * s
        const dh = img.height * s
        const drift = frame * DRIFT_PX
        ctx.clearRect(0, 0, W, H)
        ctx.drawImage(img, (W - dw) / 2 - drift, (H - dh) / 2, dw, dh)
        runOneFx(canvas, fx, key)
        if (++frame < DRIFT_FRAMES) requestAnimationFrame(tick)
        else canvas.dataset.captureReady = 'true'
      }
      tick()
    }
    img.onerror = () => { canvas.dataset.captureReady = 'error' }
    img.src = DEFAULT_IMAGE
  }, [id])

  return <canvas id="capture-canvas" ref={canvasRef} style={{ width: W, height: H, display: 'block' }} />
}

/** A generator at default params, running, so the frame captured is its own output. */
function GeneratorCapture({ id }) {
  const Gen = GENERATOR_COMPONENTS[id.replace('gen-', '')]
  const variant = findVariant(id)
  if (!Gen) return <pre>unknown generator: {String(id)}</pre>
  const params = getDefaultParams(variant.controls)
  /* Motion defaults OFF on the procedural generators — a still frame is what
     that knob means there. The preview wants the moving form, which is what
     the card is advertising, so it is forced on for the capture. */
  return <Gen width={W} height={H} {...params} animate motion />
}

export default function DevCapturePage() {
  const [search] = useSearchParams()

  if (search.get('kind') === 'list') {
    const variantIds = [...DISPLACEMENT_VARIANTS, ...MOVEMENT_VARIANTS, ...COPIES_VARIANTS].map(v => v.id)
    /* Live Input is NOT capturable and that is the honest answer, not a gap.
       Its output is whatever camera is attached, so there is no canonical
       frame to bake — and captured under Chromium's fake device it would ship
       a green test card as the module's advertised look, which is the same
       class of lie as the stock photo this whole pass exists to remove. With
       no PNG the card degrades to the glyph, which says "no preview" and is
       true. */
    const generatorIds = GENERATOR_VARIANTS.map(v => v.id).filter(id => id !== 'gen-live')
    const fxIds = CANVAS_FX_DEFS.map(d => d.id)
    return <pre id="capture-list">{JSON.stringify({ variantIds, generatorIds, fxIds })}</pre>
  }

  const fxId = search.get('fx')
  if (fxId) {
    if (!CANVAS_FX_DEFS.some(d => d.id === fxId)) return <pre>unknown fx: {String(fxId)}</pre>
    return (
      <div id="capture-target" className="relative overflow-hidden bg-surface-primary" style={{ width: W, height: H }}>
        <FxCapture id={fxId} />
      </div>
    )
  }

  const id = search.get('variant')
  const variant = findVariant(id)
  if (!variant) return <pre>unknown variant: {String(id)}</pre>

  const params = getDefaultParams(variant.controls)
  const isDisplacement = DISPLACEMENT_VARIANTS.some(v => v.id === id)
  const isMovement = MOVEMENT_VARIANTS.some(v => v.id === id)
  const isGenerator = id.startsWith('gen-')
  const Pixi = PIXI_COMPONENTS[id]

  return (
    <div id="capture-target" className="relative overflow-hidden bg-surface-primary" style={{ width: W, height: H }}>
      {isGenerator && <GeneratorCapture id={id} />}
      {isDisplacement && (
        <MirrorVariant
          title={variant.title}
          {...params}
          isEnabled
          isSelected
          onToggleEnabled={() => {}}
          onToggleSelect={() => {}}
          onImageUpload={() => {}}
          fullBleed
        >
          <img
            src={DEFAULT_IMAGE}
            alt=""
            className="pointer-events-none"
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: 'auto' }}
          />
        </MirrorVariant>
      )}
      {isMovement && (
        <MovementVariant
          title={variant.title}
          imageSrc={DEFAULT_IMAGE}
          isEnabled
          speed={params.speed}
          amount={params.amount}
          easing={params.easing}
          type={params.type}
          transformOrigin={params.transformOrigin}
        />
      )}
      {Pixi && (
        <div className="absolute inset-0 pixi-fullbleed">
          <Pixi
            title={id}
            imageSrc={DEFAULT_IMAGE}
            isEnabled
            isSelected
            onToggleEnabled={() => {}}
            onToggleSelect={() => {}}
            onImageUpload={() => {}}
            onParamChange={() => {}}
            {...params}
            grabOutlineVisible={false}
          />
        </div>
      )}
    </div>
  )
}
