import { useParams, useNavigate } from 'react-router-dom'
import { StudioDetail } from '@kolkrabbi/kol-shell'
import ModuleFront from '../components/hall-of-mirrors/ModuleFront'
import ModuleMedia from '../components/ModuleMedia'
import { MODULE_REGISTRY, slugFor } from '../data/moduleRegistry.js'
import { MIXER_MODULES } from '../data/mixerModules.js'
import { findVariant } from '../data/mirrorVariants.js'
import { CANVAS_FX_DEFS } from '../hooks/useCanvasFx.js'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState.js'

/**
 * ModuleDetailPage — `/library/module/:id`, one module's page on kol-shell's `StudioDetail` (plan
 * home-library-detail-one-card 3.1 · 3.2, 2026-10-24; was a hand-written port of kol-monitor's page). It hands DATA —
 * the registry entry, the written spec where `MIXER_MODULES` has one, the variant's or FX unit's own controls — and the
 * Studio draws the page; the preview column is the real front off an empty channel, as Create draws it.
 */
const EMPTY_MASTER = { inputs: [null, null, null], fx: [], sends: {}, opacity: 100 }
const noop = () => {}

/* the def's own controls as spec rows — `{ key, type, label, min, max, step, default }` is already a specification */
const controlRows = (controls = []) => controls
  .filter((c) => c.key && c.type !== 'divider')
  .map((c) => ({
    label: c.label || c.key,
    value: c.type === 'select'
      ? `${(c.options || []).map((o) => o.label).join(' · ')} — default ${c.default}`
      : c.min != null ? `${c.min} to ${c.max}, step ${c.step ?? 1} — default ${c.default}` : `${c.type} — default ${String(c.default)}`,
  }))

export default function ModuleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const entry = MODULE_REGISTRY.find((m) => slugFor(m) === id)
  /* the written spec, where one exists — desk furniture is `module:channel` in the registry and `channel` in the catalogue */
  const bare = entry ? entry.id.split(':').slice(1).join(':') : id
  const doc = MIXER_MODULES.find((m) => m.id === bare || m.id === id)
  if (!entry && !doc) return <StudioDetail notFound={{ title: 'Module not found', subtitle: id }} />

  const name = entry?.name || doc?.name
  const kind = entry?.kind || doc?.kind
  const front = entry?.front
  const rows = doc
    ? [{ label: 'In', value: doc.io.in }, { label: 'Out', value: doc.io.out }, ...doc.controls.map(([label, value]) => ({ label, value }))]
    : front?.kind === 'fx'
      ? controlRows(Object.entries(CANVAS_FX_DEFS.find((d) => d.id === front.id)?.params || {}).map(([key, spec]) => ({ key, label: key, type: 'slider', ...spec })))
      : controlRows(findVariant(front?.id)?.controls)
  const goBack = () => ((window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate('/library'))

  return (
    <StudioDetail
      back={{ onClick: goBack }}
      title={name}
      subtitle={entry?.group ? `${kind} — ${entry.group}` : kind}
      description={doc?.role || entry?.detail}
      sections={rows.length ? [{ label: 'Controls', rows }] : []}
      /* the front — the real unit, as Create draws it; a preview above it where the repo has one */
      preview={(
        <div className="flex flex-col" style={{ gap: 12 }}>
          {entry?.preview && (
            <div className="border border-fg-08 overflow-hidden" style={{ width: 320, height: 240, borderRadius: 4 }}>
              <ModuleMedia src={entry.preview} contain={front?.kind === 'desk'} />
            </div>
          )}
          {front
            ? <ModuleFront front={front} id={bare} channel={{ ...EMPTY_CHANNEL }} channels={[{ ...EMPTY_CHANNEL }]} master={EMPTY_MASTER} onChannelUpdate={noop} onMasterChange={noop} />
            : <div className="kol-helper-12 text-fg-32" style={{ width: 320, padding: 24, border: '1px dashed var(--kol-fg-08)', borderRadius: 4 }}>No standalone front yet</div>}
        </div>
      )}
      actions={[
        ...(entry?.add ? [{ label: 'Add to Create', onClick: () => navigate('/create', { state: { add: entry.id } }) }] : []),
        { label: 'Open in Mixer', onClick: () => navigate('/studio') },
      ]}
    />
  )
}
