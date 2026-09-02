import { useState } from 'react'
import { Icon } from './icons'

/**
 * ModuleMedia — a catalogue card's thumbnail, or an honest blank.
 *
 * Lifted out of `LibraryPage` 2026-09-01 when `/mixer` became the second
 * consumer. The rule it carries is the reason it exists rather than an `<img>`:
 * a missing preview degrades to the GLYPH, never to a stock photograph. The
 * card used to fall back to the sample image, so the six generators — whose
 * PNGs did not exist — advertised an unprocessed photo as their output, and
 * Live Input's card showed a still of two models. A blank says "no preview"; a
 * photo says "this is what it looks like", and one of those is a lie.
 *
 * `pnpm generate-previews` fills `/previews/variants/`, `/previews/fx/` and —
 * since 2026-09-02 — `/previews/modules/`, captured through
 * `/dev/capture?module=<id>`.
 *
 * `contain` exists for those module shots. A variant preview is a full-bleed
 * frame and covers correctly; a module shot is the PANEL centred in an 8:5
 * frame, and the catalogue card's cover crop cut its sides off — the master
 * lost its meter bank and read as "aster Out". Contained, the whole module is
 * in the card.
 */
export default function ModuleMedia({ src, glyph = 'frequency', contain = false }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return (
      <div className="flex items-center justify-center h-full text-fg-32">
        <Icon name={glyph} size={24} />
      </div>
    )
  }
  return (
    <img
      src={src}
      onError={() => setFailed(true)}
      alt=""
      style={contain ? { width: '100%', height: '100%', objectFit: 'contain' } : undefined}
    />
  )
}
