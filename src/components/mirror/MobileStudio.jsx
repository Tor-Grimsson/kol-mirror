import { useRef, useState } from 'react'
import { DISPLACEMENT_VARIANTS, MOVEMENT_VARIANTS, COPIES_VARIANTS, findVariant } from '../../data/mirrorVariants'
import MirrorViewport from './MirrorViewport'
import VariantControls from './VariantControls'
import Icon from '../icons/Icon'

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
]

/* 44px, not the desktop's 24. Every tap target in this file clears the platform
   floor — a 24px row is a mouse row, and the whole point of the fold is that
   below it the input is a thumb. */
const TAP = 44

export default function MobileStudio({ state }) {
  const [open, setOpen] = useState(false)
  const fileRef = useRef(null)

  const hall = HALLS.find((h) => h.id === state.activeHall) ?? HALLS[0]
  const variantData = state.activeVariant ? findVariant(state.activeVariant) : null
  const params = state.activeVariant ? state.getVariantParams(state.activeVariant) : null

  /* FULL BLEED, always. `hallCanvasRatio` letterboxes the canvas inside a
     labelled frame with 16px of padding and a "Displacement Canvas [16:9]"
     header — a desk affordance for judging an export ratio. On a 390px screen
     that is chrome eating the picture, and choosing an aspect ratio is not
     something this view offers. Shimmed rather than added as a prop so
     `MirrorViewport` keeps one signature. */
  const canvasState = { ...state, hallCanvasRatio: 'none' }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <MirrorViewport state={canvasState} />

      {/* THE SHEET. Two heights, tap to move between them — no drag gesture and
          no library for one. A swipe would be nicer and is not worth a
          dependency until the tap is proven wrong on a real phone. */}
      <div
        className="absolute left-0 right-0 bottom-0 bg-surface-primary border-t border-fg-08 flex flex-col"
        style={{
          zIndex: 'var(--kol-z-overlay)',
          maxHeight: open ? '68dvh' : undefined,
          /* the home-bar inset, or a phone's own chrome sits on the last row */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          transition: 'max-height 200ms var(--kol-ease-house, ease)',
        }}
      >
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

        {open && (
          <div className="overflow-y-auto border-t border-fg-08" style={{ overscrollBehavior: 'contain' }}>
            {/* Hall chips — three, so they fit one row at 390 without scrolling */}
            <div className="flex gap-2 px-4 pt-4">
              {HALLS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => state.selectHall(h.id)}
                  className={`flex-1 rounded kol-helper-12 border ${
                    hall.id === h.id
                      ? 'accentYellow border-fg-32 bg-fg-04'
                      : 'text-fg-64 border-fg-08'
                  }`}
                  style={{ height: TAP }}
                >
                  {h.label}
                </button>
              ))}
            </div>

            {/* Variants. A list, not a grid: the titles are long
                ("Animated Turbulence") and a two-column grid truncates every
                one of them at this width. */}
            <div className="flex flex-col px-4 pt-4">
              {hall.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => state.selectVariant(v.id)}
                  className={`flex items-center text-left px-3 rounded kol-mono-14 ${
                    state.activeVariant === v.id ? 'accentYellow bg-fg-04' : 'text-fg-64'
                  }`}
                  style={{ height: TAP }}
                >
                  {v.title}
                </button>
              ))}
            </div>

            {/* The knobs the ACTIVE effect has — however many that is. Reusing
                VariantControls means a variant added to the data file shows up
                here with no edit, which is the only reason this stays small.
                rowHeight 44: the same tap floor as everything else here. */}
            {variantData && params && (
              <div className="px-4 pt-4 border-t border-fg-08" style={{ marginTop: 16 }}>
                <VariantControls
                  controls={variantData.controls}
                  params={params}
                  onParamChange={(key, value) => state.setVariantParam(state.activeVariant, key, value)}
                  rowHeight={TAP}
                />
              </div>
            )}

            {/* The picture. `handleImageUpload` already rasterises against the
                Settings raster scale, so a 12MP phone photo does not become a
                12MP texture. `capture` is deliberately NOT set — that would
                force the camera and rule out the camera roll, which is where
                the picture usually is. */}
            <div className="px-4 py-4">
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
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!state.activeVariant}
                className="w-full rounded border border-fg-08 kol-helper-12 text-fg-96 disabled:text-fg-32"
                style={{ height: TAP }}
              >
                Choose a picture
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
