import { useNarrow } from '../hooks/useNarrow'

/**
 * WideOnly — renders `children` above the fold, and a plain note below it.
 *
 * For the surfaces that are not a small-screen object and never will be: the
 * Symphony desk, the expression columns, the module sheet, the sketchbooks.
 * They do not get a phone layout, so the honest thing is to say so rather than
 * ship a broken one — a five-column scroll panel at 390px is not a feature.
 *
 * ponytail: no dismiss, no "continue anyway". kol-shell's `TouchDeviceOverlay`
 * has both and is the wrong tool here — it is app-wide, dismissible and keyed
 * on pointer, where this is per-surface, absolute and keyed on width.
 *
 * @param {string} what  names the surface in the sentence ("The mixer")
 */
export default function WideOnly({ what = 'This view', children }) {
  if (!useNarrow()) return children
  return (
    <div className="flex items-center justify-center h-full w-full" style={{ padding: 24 }}>
      <div className="flex flex-col gap-2" style={{ maxWidth: 320 }}>
        <div className="kol-helper-14 text-fg-96">Needs a bigger screen</div>
        <div className="kol-mono-12 text-fg-64">
          {what} is built for a wide screen and a mouse. Open Hall of Mirrors on
          a computer to use it.
        </div>
      </div>
    </div>
  )
}
