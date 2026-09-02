import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, findVariant } from '../../data/mirrorVariants'
import MirrorViewport from './MirrorViewport'
import VariantControls from './VariantControls'
import Icon from '../icons/Icon'
import { ShellDrawer, SegmentedToggle, ContentRow, Button } from '@kolkrabbi/kol-component'

/**
 * MobileStudio — the studio below the fold (2026-09-01).
 *
 * NOT the desktop studio shrunk. The old mobile path put the whole
 * `MirrorSidebar` in a drawer — a 400-line panel carrying hall nav, a variant
 * list, canvas-ratio controls, archive slots and a save row, at 288px. That is
 * the desktop instrument behind a hamburger, which is the thing this replaces.
 *
 * What a phone gets instead is the app's other half: a picture, an effect on
 * it, and the two or three knobs that effect actually has. Full-bleed canvas,
 * one sheet, three taps to anywhere.
 *
 * The Symphony desk, the routing matrix and the expression columns are not
 * here and are not coming — see `WideOnly`. Blocking them is the decision that
 * makes the rest of this simple.
 *
 * ponytail: the canvas is `MirrorViewport` unchanged (already `absolute
 * inset-0`, already dispatches all three backends) and the knobs are
 * `VariantControls` unchanged. This file is a SHEET, not a second instrument —
 * the moment it starts reimplementing either, it has become the thing above.
 */

const HALLS = [
  { id: 'displacement', label: 'Displacement', variants: DISPLACEMENT_VARIANTS },
  { id: 'movement', label: 'Movement', variants: MOVEMENT_VARIANTS },
  { id: 'copies', label: 'Copies', variants: COPIES_VARIANTS },
  /* THE DESK IS A DESTINATION HERE TOO. It has no variant list of its own —
     the mixer IS the surface — so `variants: []` and the sheet shows its
     controls instead of a list. Added when the desk was ungated on the user's
     ruling that nothing is omitted from mobile. */
  { id: 'symphony', label: 'Mixer', variants: [] },
]

/* The row rung for this sheet. NOT a hit floor invented here — the estate ruled
   that on 2026-08-27 (`MobileTouchFloor`, kol-ds-ui): 24px, WCAG 2.5.8 AA, and
   the DS button ladder 26/32/40 already clears it. 40 is `size="lg"`, the rung
   the hall picker and the picture button sit on, so the list rows and the
   control rows match them instead of standing 4px taller for no reason. */
const ROW = 40

export default function MobileStudio({ state }) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)

  /* WHY YOU ARE NOT WHERE YOU TAPPED. `WideOnly to="/studio"` sends the phone
     here from /expressions, /mixer and /tape, and a silent redirect reads as a
     broken link. One sentence, once, and it dies with the navigation — no
     dismiss button and no localStorage key to remember, because a fresh visit
     to the mixer deserves the fresh explanation. */
  const narrowFrom = useLocation().state?.narrowFrom

  const hall = HALLS.find((h) => h.id === state.activeHall) ?? HALLS[0]
  const variantData = state.activeVariant ? findVariant(state.activeVariant) : null
  const params = state.activeVariant ? state.getVariantParams(state.activeVariant) : null

  /* FULL BLEED, always. `hallCanvasRatio` letterboxes the canvas inside a
     labelled frame with 16px of padding and a "Displacement Canvas [16:9]"
     header — a desk affordance for judging an export ratio. On a 390px screen
     that is chrome eating the picture, and choosing an aspect ratio is not
     something this view offers. Shimmed rather than added as a prop so
     `MirrorViewport` keeps one signature.

     `activeHall` is shimmed to the SAME hall the sheet is showing. The state's
     default is `'symphony'` (`useMirrorState.js:27`) and the home cards and
     /library's CREATE view both deep-link to it, so without this the phone
     opens the studio on `MirrorViewport`'s Symphony branch — which is
     `WideOnly` — and the first thing a phone ever showed was "Needs a bigger
     screen" over a picture that was never drawn, while the sheet underneath
     read "Displacement". The sheet already resolves an unknown hall to
     `HALLS[0]`; this makes the canvas agree instead of rendering a hall the
     sheet does not offer. Verified at 390×844, 2026-09-01. */
  const canvasState = { ...state, hallCanvasRatio: 'none', activeHall: hall.id }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MirrorViewport state={canvasState} />

      {/* THE COLLAPSED BAR — local, and staying local. `ShellDrawer` ships ONE
          detent (open or closed, `ShellDrawerBottomSide` 2026-09-01); the 56px
          bar that is always on screen is a second height, and the DS declined
          to half-build a detent nobody has ruled on. So the split is: this bar
          is chrome we own, the sheet below is the DS's. If the two-height shape
          turns out to be estate-wide — monitor's `StageParams` may want it —
          that is its own ticket and it becomes a prop with a ruling behind it. */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-surface-primary border-t border-fg-08 flex flex-col"
        style={{
          zIndex: 'var(--kol-z-overlay)',
          /* the home-bar inset, or a phone's own chrome sits on the last row */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {narrowFrom && (
          <div className="px-4 pt-3 kol-mono-12 text-fg-64 shrink-0">
            {narrowFrom} needs a wide screen — this is the studio instead.
          </div>
        )}

        {/* The bar. Always visible: what is on screen right now, and the way in. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center justify-between w-full px-4 shrink-0"
          style={{ height: 56 }}
        >
          <span className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="kol-helper-10 text-fg-32 uppercase">{hall.label}</span>
            <span className="kol-mono-14 text-fg-96 truncate">
              {variantData?.title ?? 'Choose an effect'}
            </span>
          </span>
          <span className="text-fg-64 shrink-0" style={{ transform: open ? 'rotate(180deg)' : undefined }}>
            <Icon name="chevron-up" size={20} />
          </span>
        </button>
      </div>

      {/* THE SHEET IS THE DS'S NOW (kol-component 0.153.0). What the local
          `<div>` never had: a portal, Escape, a focus trap that returns focus to
          this bar, a body-scroll lock, the reduced-motion gate, and a foot
          padded by `env(safe-area-inset-bottom)` so the picker clears the home
          bar. `backdrop={false}` because this is a canvas app — the whole point
          of a bottom sheet here is that the picture stays lit behind it. */}
      <ShellDrawer
        open={open}
        onClose={() => setOpen(false)}
        side="bottom"
        height="68dvh"
        backdrop={false}
        header={
          <span className="flex flex-col items-start gap-0.5 min-w-0">
            <span className="kol-helper-10 text-fg-32 uppercase">{hall.label}</span>
            <span className="kol-mono-14 text-fg-96 truncate">
              {variantData?.title ?? 'Choose an effect'}
            </span>
          </span>
        }
      >
          <div style={{ overscrollBehavior: 'contain' }}>
            {/* THE HALL PICKER — `SegmentedToggle`, not three hand-rolled
                buttons. Three mutually-exclusive cells sharing one stroke is
                the shape this component IS, and it brings radiogroup
                semantics and arrow-key selection the local buttons never had.
                `size="lg"` is the 40px rung of the DS button ladder, which
                clears the estate's ruled 24px hit floor (MobileTouchFloor:
                WCAG 2.5.8 AA, "the size scale 26/32/40 and .kol-seg-cell
                already clear it"). The 44 this file used to pin everywhere was
                a number invented against a ruling that already exists.

                `sm`, measured down twice: `lg` wanted 372px in a 358px row and
                clipped "Copies"; `md` fitted three cells but the desk makes
                FOUR and it went to 391 in 354, clipping "Mixer". `sm` is the
                26px rung and still clears the ruled 24px floor. No `px-4`
                here either — `ShellDrawer` pads its own panel 16, and adding
                ours on top took the content box to 322. */}
            <div className="pt-4">
              <SegmentedToggle
                value={hall.id}
                onChange={(id) => state.selectHall(id)}
                options={HALLS.map((h) => ({ value: h.id, label: h.label }))}
                size="sm"
                className="w-full"
              />
            </div>

            {/* CONTROLS FIRST, and this is the fix for "where are the
                controls?" — they used to render BELOW the eight-row variant
                list, so choosing Heavy Distortion and reaching for its knobs
                meant opening the sheet and scrolling past every effect you did
                not pick. On the desk the list and the knobs live in different
                places; stacking them put the thing you just chose furthest from
                your thumb. The active effect's knobs now sit directly under the
                hall row, and the list is below them. */}
            {variantData && params && (
              <div className="pt-4">
                <VariantControls
                  controls={variantData.controls}
                  params={params}
                  onParamChange={(key, value) => state.setVariantParam(state.activeVariant, key, value)}
                  rowHeight={ROW}
                />
              </div>
            )}

            {/* THE VARIANT LIST — `ContentRow variant="file" thumb={0}`, the
                DS's selectable row with its title/detail ruling and its own
                `selected` state, in place of eight raw `<button>`s. A list, not
                a grid: the titles are long ("Animated Turbulence") and two
                columns truncate every one at this width. */}
            <div className="pt-4">
              {variantData && (
                <div className="kol-helper-10 text-fg-32 uppercase pb-2">{hall.label} effects</div>
              )}
              {hall.variants.map((v) => (
                <ContentRow
                  key={v.id}
                  variant="file"
                  thumb={0}
                  minHeight={ROW}
                  title={v.title}
                  selected={state.activeVariant === v.id}
                  onClick={() => state.selectVariant(v.id)}
                />
              ))}
            </div>

            {/* The picture. This comment used to claim `handleImageUpload`
                already budgeted the upload, "so a 12MP phone photo does not
                become a 12MP texture". It did not — only the SVG branch was
                rasterised, and the raster branch handed the file's own pixels
                to the GPU. Fixed 2026-09-01 with `capRaster`, which caps a
                photo at `maxChannelPixels` before it becomes a texture; this
                input is the entry point that made it matter, since a camera
                roll hands over 12 MP as a matter of course.
                `capture` is deliberately NOT set — that would force the camera
                and rule out the camera roll, which is where the picture
                usually is. */}
            <div className="py-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) state.handleImageUpload(file)
                  e.target.value = ''
                }}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={() => fileRef.current?.click()}
                disabled={!state.activeVariant}
                className="w-full"
              >
                Choose a picture
              </Button>
            </div>
          </div>
      </ShellDrawer>
    </div>
  )
}
