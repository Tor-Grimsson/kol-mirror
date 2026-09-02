import { SegmentedToggle, Divider } from '@kolkrabbi/kol-component'
import Button from '../atoms/Button'
import { Icon } from '../icons'
import { CANVAS_FX_DEFS, MAX_CANVAS_FX } from '../../hooks/useCanvasFx'

/**
 * MixerBuilder — the MIXER view of `/library`'s CREATE, ported from
 * kol-monitor's `CreatePage` (user ruling 2026-09-01: *"monitor is the
 * reference … REFERENCE MONITOR ALWAYS INSTEAD OF GUESSING"*).
 *
 * Monitor's create page has two views in one `ContentFilters` strip — CASE, the
 * thing being built, and MODULES, the filterable list you build it from. This
 * is mirror's CASE: the desk under construction. What replaced it here was a
 * single sticky `ChannelRail` beside the catalogue, which built ONE channel and
 * sent it to a strip; monitor builds the whole rack before you open it, and so
 * does this.
 *
 * Deliberately NOT a live render — same rule the old rail carried and worth
 * keeping: a preview here would be a second instrument, and the instrument is
 * the studio's (ARCHITECTURE §1). This is a parts list.
 *
 * @param {Array}    slots      `[{ source, chain }]`, one per channel
 * @param {number}   active     which channel the catalogue's clicks land on
 * @param {Function} onActive   (index) => void
 * @param {Function} onClear    (index) => void — drop that channel's source
 * @param {Function} onMoveUp   (index, i) => void
 * @param {Function} onRemoveFx (index, i) => void
 * @param {Function} onOpen     hand the whole desk to /studio
 */
export default function MixerBuilder({ slots, active, onActive, onClear, onMoveUp, onRemoveFx, onOpen }) {
  const filled = slots.filter((s) => s.source).length

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* WHICH CHANNEL THE CATALOGUE FEEDS. Monitor's case view drops a module
          onto a rack row; mirror has no rows, so the target is a channel and it
          has to be explicit — otherwise clicking a source on the MODULES view
          has no visible destination. */}
      <SegmentedToggle
        value={String(active)}
        onChange={(v) => onActive(Number(v))}
        options={slots.map((s, i) => ({ value: String(i), label: `Ch ${i + 1}${s.source ? ' ·' : ''}` }))}
        size="sm"
      />

      <div className="flex flex-col" style={{ gap: 12 }}>
        {slots.map((s, i) => (
          <div
            key={i}
            className="flex flex-col kol-helper-12"
            style={{
              gap: 4,
              padding: 12,
              border: '1px solid var(--kol-fg-08)',
              borderRadius: 'var(--kol-radius-xs)',
              /* the target channel reads as selected — the same job
                 `SegmentedToggle`'s active cell does, said twice on purpose
                 because the strip scrolls out of view on a phone */
              background: i === active ? 'var(--kol-fg-04)' : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="kol-eyebrow text-fg-48">Channel {i + 1}</span>
              {s.source && (
                <span className="cursor-pointer text-fg-32 hover:text-fg-96 flex" onClick={() => onClear(i)} title="Remove source">
                  <Icon name="x" size={12} />
                </span>
              )}
            </div>

            <span className={s.source ? 'text-fg-96' : 'text-fg-32'}>
              {s.source ? s.source.title : 'No source — pick one from MODULES'}
            </span>
            {s.source && <span className="text-fg-32">{s.source.category}</span>}

            {s.chain.length > 0 && <Divider className="my-1" />}
            {s.chain.map((fx, j) => (
              <div key={j} className="flex items-center justify-between" style={{ height: 24 }}>
                <span className="text-fg-64">
                  {j + 1}. {CANVAS_FX_DEFS.find((d) => d.id === fx.type)?.label || fx.type}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {j > 0 && (
                    <span className="cursor-pointer text-fg-32 hover:text-fg-96" title="Move up" onClick={() => onMoveUp(i, j)}>↑</span>
                  )}
                  <span className="cursor-pointer text-fg-32 hover:text-fg-96 flex" title="Remove" onClick={() => onRemoveFx(i, j)}>
                    <Icon name="x" size={12} />
                  </span>
                </span>
              </div>
            ))}
            {s.source && s.chain.length < MAX_CANVAS_FX && (
              <span className="text-fg-32">{s.chain.length}/{MAX_CANVAS_FX} effects</span>
            )}
          </div>
        ))}
      </div>

      {/* ONE handover for the whole desk, where the old rail sent one channel to
          a strip you had to name. The receiver merges per index and skips an
          empty entry, so a builder with only Ch 2 filled does not blank the
          others (`MirrorPlayground`'s deep-link handler). */}
      <Button variant="primary" size="md" disabled={!filled} onClick={onOpen}>
        {filled ? `Open ${filled} channel${filled > 1 ? 's' : ''} in the studio` : 'Add a source to begin'}
      </Button>
    </div>
  )
}
