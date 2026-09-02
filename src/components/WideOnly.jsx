import { Navigate } from 'react-router-dom'
import { useNarrow } from '../hooks/useNarrow'

/**
 * WideOnly — renders `children` above the fold. Below it, one of two things.
 *
 * **With `to`: it sends the phone somewhere that works.** This is the default
 * for anything a real user can reach. A route that cannot serve a small screen
 * is not an excuse to end the session — kol-monitor faced the identical choice
 * on 2026-09-01 and ruled the same way, deleting its "Desktop recommended"
 * panel outright: the phone stops being told to go away, and the one route that
 * genuinely cannot serve redirects to the one that can. `state.narrowFrom`
 * carries the name so the destination can say a single line about why the user
 * is not where they tapped.
 *
 * **Without `to`: the plain note.** Kept for `/icons` and `/fronts` only —
 * sketchbooks nobody reaches from a phone except us. There is nothing to send
 * them to, and inventing a destination would be worse than the sentence.
 *
 * ponytail: no dismiss, no "continue anyway". kol-shell's `TouchDeviceOverlay`
 * has both and is the wrong tool here — it is app-wide, dismissible and keyed
 * on pointer, where this is per-surface, absolute and keyed on width.
 *
 * @param {string} what  names the surface ("The mixer") — the redirect's reason
 * @param {string} to    where a phone goes instead; omit for the dead-end note
 */
export default function WideOnly({ what = 'This view', to, children }) {
  const narrow = useNarrow()
  if (!narrow) return children
  if (to) return <Navigate to={to} replace state={{ narrowFrom: what }} />

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
