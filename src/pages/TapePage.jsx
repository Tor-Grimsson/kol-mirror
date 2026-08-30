import { PageHeader, PageShell } from '@kolkrabbi/kol-shell'
import { transport, useTransportPlaying } from '../hooks/transport'
import { DECKS } from '../components/mirror/tape/registry'
import { useReels } from '../components/mirror/tape/useReels'

/**
 * TapePage — /tape, ten tape-delay designs side by side (user 2026-08-28).
 *
 * Every deck runs off the SAME transport, so pressing Run turns all ten at
 * once and they can be compared in motion rather than as ten still drawings —
 * which is the only way to judge a machine whose whole subject is rotation.
 * Each has its own `useReels`, so their packs drift apart over a long pass
 * exactly as separate machines would.
 */
function Cell({ name, note, Deck }) {
  const reels = useReels()
  return (
    <div className="flex flex-col gap-2">
      <Deck {...reels} />
      <div className="flex items-baseline gap-3">
        <span className="kol-mono-14 text-fg-96">{name}</span>
        <span className="kol-helper-12 text-fg-32">{note}</span>
      </div>
    </div>
  )
}

export default function TapePage() {
  const playing = useTransportPlaying()
  return (
    <PageShell>
      <PageHeader title="Tape" subtitle="Ten decks, one transport" size="sm" voice="mono" />

      <div className="flex items-center gap-4" style={{ marginBottom: 24 }}>
        <span
          className="kol-helper-12 uppercase cursor-pointer select-none"
          style={{ color: playing ? 'var(--kol-accent-primary)' : 'var(--kol-fg-64)', border: '1px solid var(--kol-fg-16)', borderRadius: 'var(--kol-radius-xs)', padding: '6px 14px' }}
          onClick={() => transport.toggle()}
        >{playing ? 'Running' : 'Run'}</span>
        <span className="kol-helper-12 text-fg-32">All ten run off the studio transport — Space works here too.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
        {DECKS.map((d) => <Cell key={d.id} {...d} />)}
      </div>
    </PageShell>
  )
}
