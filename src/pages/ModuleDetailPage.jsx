import { useParams, useNavigate } from 'react-router-dom'
import { PageShell, PageHeader } from '@kolkrabbi/kol-shell'
import { Divider } from '@kolkrabbi/kol-component'
import { useNarrow } from '../hooks/useNarrow'
import Button from '../components/atoms/Button'
import ModuleFront from '../components/hall-of-mirrors/ModuleFront'
import ModuleMedia from '../components/ModuleMedia'
import { MODULE_REGISTRY, slugFor } from '../data/moduleRegistry'
import { MIXER_MODULES } from '../data/mixerModules'
import { findVariant } from '../data/mirrorVariants'
import { CANVAS_FX_DEFS } from '../hooks/useCanvasFx'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState'

/**
 * ModuleDetailPage — `/mixer/:id`, one module's own page. Ported from
 * kol-monitor's `src/pages/ModuleDetailPage.jsx` (route `/library/:moduleType`):
 * `PageShell mode="fixed"`, `PageHeader size="sm" voice="mono"` with the
 * module's label and its one-line spec as subtitle, a `Divider`, the control
 * rows, the rendered front, and a button back to the catalogue.
 *
 * **It resolves against `MODULE_REGISTRY`** (2026-09-02), not the mixer
 * catalogue. Every addable unit has a page — all 23 variants, the seven
 * generators, the ten FX units — because the registry is what `/create` places
 * and a module you can place is a module you can read about. `MIXER_MODULES`
 * still supplies the written spec where it has one (the desk's furniture: the
 * channel strip, the master, routing, playback); a variant's spec comes from
 * its own declared controls, which is the only honest source for it.
 *
 * `[Load source]` is not ported: monitor globs its module sources with
 * `import.meta.glob('?raw')`; mirror's fronts have no one-file-per-module rule.
 */

const EMPTY_MASTER = { inputs: [null, null, null], fx: [], sends: {}, opacity: 100 }
const noop = () => {}

/* the def's own controls, as spec rows — `{ key, type, label, min, max, step,
   default }` is already a specification, so nothing is written twice */
function controlRows(controls = []) {
  return controls
    .filter((c) => c.key && c.type !== 'divider')
    .map((c) => [
      c.label || c.key,
      c.type === 'select'
        ? `${(c.options || []).map((o) => o.label).join(' · ')} — default ${c.default}`
        : c.min != null
          ? `${c.min} to ${c.max}, step ${c.step ?? 1} — default ${c.default}`
          : `${c.type} — default ${String(c.default)}`,
    ])
}

export default function ModuleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const narrow = useNarrow()

  const entry = MODULE_REGISTRY.find((m) => slugFor(m) === id)
  /* the written spec, where one exists. Desk furniture is `module:channel` in
     the registry and `channel` in the catalogue — same thing, two files. */
  const bare = entry ? entry.id.split(':').slice(1).join(':') : id
  const doc = MIXER_MODULES.find((m) => m.id === bare || m.id === id)

  if (!entry && !doc) {
    return (
      <PageShell>
        <PageHeader size="sm" voice="mono" title="Module not found" subtitle={id} />
      </PageShell>
    )
  }

  const name = entry?.name || doc?.name
  const kind = entry?.kind || doc?.kind
  const role = doc?.role || entry?.detail
  const front = entry?.front

  const rows = doc
    ? [['In', doc.io.in], ['Out', doc.io.out], ...doc.controls]
    : front?.kind === 'fx'
      ? controlRows(Object.entries(CANVAS_FX_DEFS.find((d) => d.id === front.id)?.params || {})
          .map(([key, spec]) => ({ key, label: key, type: 'slider', ...spec })))
      : controlRows(findVariant(front?.id)?.controls)

  return (
    /* the page SCROLLS below the fold — a fixed shell clipped the specs */
    <PageShell mode={narrow ? 'scroll' : 'fixed'}>
      <PageHeader
        size="sm"
        voice="mono"
        title={name}
        subtitle={entry?.group ? `${kind} — ${entry.group}` : kind}
        /* `‹ Back` as the eyebrow, wired to HISTORY (monitor §5) — conditional
           by construction: from the create canvas it returns there, from the
           mixer catalogue it returns to the catalogue, and a cold load with no
           history falls back to /mixer. */
        eyebrow={
          <span
            className="cursor-pointer select-none text-fg-48 hover:text-fg-96"
            onClick={() => ((history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/mixer'))}
          >
            ‹ Back
          </span>
        }
      />
      <Divider className="mb-6" />

      {/* ONE column below the fold (monitor §5) */}
      <div className="flex" style={{ gap: narrow ? 24 : 48, alignItems: 'flex-start', flexWrap: 'wrap', flexDirection: narrow ? 'column' : 'row' }}>
        {/* the specs — monitor's ControlRow list, in mirror's shape: label
            above prose, because these are sentences and a fixed label column
            wrapped them to one word per line at 390 */}
        <div className="flex flex-col" style={{ gap: 20, flex: '1 1 320px', minWidth: 0 }}>
          <div className="kol-sans-body-02 text-fg-96">{role}</div>
          <dl className="flex flex-col" style={{ gap: 16 }}>
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col" style={{ gap: 4 }}>
                <dt className="kol-eyebrow text-fg-48">{label}</dt>
                {/* `kol-mono-12` — line-height-bearing. `kol-helper-*` is
                    single-line CHROME type and was unreadable at 390. */}
                <dd className="kol-mono-12 text-fg-64">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the front — the real unit, off an empty channel, same as /create
            draws it. Below the fold it is a 160px thumb ABOVE the specs
            (`order: -1`) — the full panel is 320px+ and pushed the prose off
            the first screen. */}
        <div style={{ flex: '0 0 auto', order: narrow ? -1 : 0 }}>
          {/* THE PREVIEW, where the repo has one — what the unit DOES, above
              the panel that does it. `pnpm generate-previews` writes these;
              `ModuleMedia` degrades to the glyph rather than to a stock photo,
              so a module with no capture says so instead of advertising an
              unprocessed image as its output (2026-09-02). */}
          {entry?.preview && (
            <div className="border border-fg-08" style={{ width: narrow ? 160 : 320, height: narrow ? 120 : 240, overflow: 'hidden', borderRadius: 4, marginBottom: 12 }}>
              <ModuleMedia src={entry.preview} contain={front?.kind === 'desk'} />
            </div>
          )}
          {narrow && front && (
            <div className="kol-helper-12 text-fg-32" style={{ marginBottom: 8 }}>Tap to expand</div>
          )}
          {/* SCALED to a 160px thumb, not cropped to one: a panel is 320px+, and
              `overflow: hidden` at 160 cut it in half. `zoom` shrinks the whole
              front and the box collapses to its scaled size. */}
          <div style={narrow ? { zoom: 0.5 } : undefined}>
            {front
              ? <ModuleFront front={front} id={bare} channel={{ ...EMPTY_CHANNEL }} channels={[{ ...EMPTY_CHANNEL }]} master={EMPTY_MASTER} onChannelUpdate={noop} onMasterChange={noop} />
              : <div className="kol-helper-12 text-fg-32" style={{ width: 320, padding: 24, border: '1px dashed var(--kol-fg-08)', borderRadius: 4 }}>No standalone front yet</div>}
          </div>
        </div>
      </div>

      <Divider className="my-6" />
      <div className="flex" style={{ gap: 8 }}>
        <Button variant="grey" size="md" onClick={() => navigate('/mixer', { state: { expandedModule: bare } })}>
          Open in Mixer
        </Button>
        {entry?.add && (
          <Button variant="grey" size="md" onClick={() => navigate('/create', { state: { add: entry.id } })}>
            Add to Create
          </Button>
        )}
      </div>
    </PageShell>
  )
}
