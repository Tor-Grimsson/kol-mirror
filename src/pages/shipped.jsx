import { useNavigate } from 'react-router-dom'
import { downloadBlob } from '@kolkrabbi/kol-component'
import { PatchThumb } from '../components/PatchThumb'
import ModuleMedia from '../components/ModuleMedia'
import { PatchOutput } from '../components/PatchThumb'
import usePersistedState from '../hooks/usePersistedState'
import { PRESETS } from '../hooks/useLibraryStore'
import { MODULE_REGISTRY, slugFor } from '../data/moduleRegistry'

/**
 * shipped — WHAT THE APP SHIPS, as the Library's files (kol-ds-ui plan home-library-detail-one-card, 2026-10-24;
 * the twin is apps/mixer-hub/src/pages/shipped.jsx). Home is the user's saved patches; the Library is the shipped
 * presets, the registry's one-tap patches and the desk's modules — system saves (user 2026-10-24: *"home now would
 * only show USER saved patches, which are different from LIBRARY saves, which are more like system saves. what app
 * ships with"*). Every one is THE card with every field and icon (*"EVERY CARD HAS THE SAME FIELDS AND ICONS … NON
 * NEGOTIABLE"*). A card opens its page — `/library/patch/<id>` · `/library/module/<slug>` — never the studio.
 *
 * Mirror's one difference from the twin: the edits PERSIST (`mirror-shipped`), so a shipped item the user deletes
 * stays out of his Library. Only the overrides are stored — renames, tags, notes, uploaded covers, removed ids and
 * duplicates; the registry and the presets files are untouched.
 */
const SHIP_DATE = Date.parse('2026-10-19T12:00:00Z')
const DAY = 86400000
const channelsOf = (p) => (p.data?.channels || []).filter((c) => c.variantId).length
const bytesOf = (o) => new Blob([JSON.stringify(o)]).size

/* a shipped preset as a file — its cover is the patch's OUTPUT: the capture, then the wiring drawing */
export const SHIPPED_PRESETS = PRESETS.filter((p) => p.kind === 'patch').map((p, i) => ({
  id: p.id, kind: 'patch', name: p.name, tags: p.tags ?? [], note: p.description ?? '',
  updatedAt: SHIP_DATE - i * DAY, bytes: bytesOf(p), cover: <PatchThumb patch={p} />,
  details: [{ label: 'Channels', value: channelsOf(p) }], data: p,
}))
/* a registry one-tap patch as a file — Slit-Scan Camera and its kin; `detail` is its one line, in the rail. The
   desk's Patch MODULE (`module:patch`, kind Patch with a front) is a module, not a patch: it sits under MODULES.
   Its cover is its OUTPUT, `pnpm generate-previews --kind patches` → /previews/patches/<slug>.jpg; a patch with no
   capture yet draws the honest blank, never the glyph. */
const isOneTap = (m) => m.kind === 'Patch' && !m.front
export const SHIPPED_REGISTRY_PATCHES = MODULE_REGISTRY.filter(isOneTap).map((m, i) => {
  const data = { id: m.id, name: m.name, detail: m.detail, tags: m.tags }
  return {
    id: m.id, kind: 'patch', name: m.name, tags: m.tags ?? [], note: m.detail ?? '',
    updatedAt: SHIP_DATE - (SHIPPED_PRESETS.length + i) * DAY, bytes: bytesOf(data), cover: <PatchOutput entry={m} />,
    details: [{ label: 'Kind', value: m.kind }, { label: 'Group', value: m.group }], data,
  }
})
const moduleFile = (kind) => (m, i) => {
  const data = { id: m.id, name: m.name, kind: m.kind, group: m.group, detail: m.detail }
  return {
    id: slugFor(m), kind, ...(kind === 'part' && { entryId: m.id, kindLabel: m.kind }), name: m.name, group: m.group,
    tags: m.tags ?? [], note: m.detail ?? '', updatedAt: SHIP_DATE - i * DAY, bytes: bytesOf(data),
    /* a one-tap patch among Create's parts is still a patch — its cover is its output, not the glyph */
    cover: isOneTap(m) ? <PatchOutput entry={m} /> : <ModuleMedia src={m.preview} contain={m.contain || m.front?.kind === 'desk'} />,
    details: [{ label: 'Kind', value: m.kind }, { label: 'Group', value: m.group }], data,
  }
}
/* a module as a file — the desk's furniture and every unit that stands on its own, its front contained as the cover */
/* EVERY MODULE (plan 16 W1, user 2026-10-25: *"if this isnt every module, THEN SOMETHING IS MISSING"*): the FX units
   stand on the desk as modules of their own with an IN and an OUT, so they list here under Effect, their cover the
   module's front (`/previews/modules/fx-<id>.png`) — the still of what the effect does stays Create's. The sources
   (Displacement · Movement · Copies) load INTO a channel; they are not modules. */
const SOURCE_GROUPS = ['Displacement', 'Movement', 'Copies']
const asModule = (m) => (m.group === 'Canvas FX' ? { ...m, group: 'Effect', preview: `/previews/modules/fx-${m.id.slice(3)}.png`, front: { ...m.front, kind: 'fx' }, contain: true }
  : m.front?.kind === 'generator' ? { ...m, contain: true } : m)
export const SHIPPED_MODULES = MODULE_REGISTRY.filter((m) => !isOneTap(m) && !SOURCE_GROUPS.includes(m.group)).map(asModule).map(moduleFile('module'))
export const MODULE_GROUP_VALUES = [...new Set(SHIPPED_MODULES.map((m) => m.group))]
/* Create's parts — every registry entry with its own `add` verb (variants, generators, FX units), as the same files */
export const SHIPPED_ADDABLE = MODULE_REGISTRY.filter((m) => m.add).map(moduleFile('part'))
export const entryOf = (f) => MODULE_REGISTRY.find((m) => m.id === (f.entryId ?? f.id))

const BASE = { patch: [...SHIPPED_PRESETS, ...SHIPPED_REGISTRY_PATCHES], module: SHIPPED_MODULES, part: SHIPPED_ADDABLE }
const NONE = { edits: {}, removed: [], copies: [] }

/* the stored overrides applied to one list: duplicates beside their source, the removed out, the edits on top.
   An uploaded cover is a data URL, stored as a string and drawn as an image. */
function listOf(kind, { edits, removed, copies }) {
  const base = BASE[kind]
  const dupes = copies.filter((c) => c.kind === kind).map((c) => ({ ...base.find((f) => f.id === c.of), ...c }))
  return [...dupes, ...base]
    .filter((f) => f.name && !removed.includes(f.id))
    .map((f) => {
      const e = edits[f.id]
      if (!e) return f
      const { cover, ...rest } = e
      return { ...f, ...rest, ...(cover && { cover: <img src={cover} alt="" className="size-full object-cover" /> }) }
    })
}

/* the shipped lists as this device's library, with every verb, and the ONE card every view draws */
export function useShipped() {
  const navigate = useNavigate()
  const [store, setStore] = usePersistedState('shipped', NONE)
  const s = { ...NONE, ...store }
  const edit = (f, patch) => setStore((o) => ({ ...NONE, ...o, edits: { ...o.edits, [f.id]: { ...o.edits?.[f.id], ...patch } } }))
  const card = (f) => ({
    key: f.id, title: f.name, date: f.updatedAt, size: f.bytes, media: f.cover, tags: f.tags, details: f.details,
    onTags: (tags) => edit(f, { tags }),
    note: f.note, onNote: (note) => edit(f, { note }),
    onCover: (src) => edit(f, { cover: src }),
    verbs: {
      rename: (name) => edit(f, { name, updatedAt: Date.now() }),
      duplicate: () => setStore((o) => ({ ...NONE, ...o, copies: [{ id: `${f.id}-${Date.now().toString(36)}`, of: f.of ?? f.id, kind: f.kind, name: `${f.name} copy`, updatedAt: Date.now() }, ...(o.copies || [])] })),
      remove: () => setStore((o) => ({ ...NONE, ...o, removed: [...(o.removed || []), f.id] })),
    },
    download: () => downloadBlob(new Blob([JSON.stringify(f.data, null, 2)], { type: 'application/json' }), `${f.name}.json`),
    /* a duplicate opens its source's page — the copy is this device's name for it, the page is the shipped thing */
    onClick: () => navigate(f.kind === 'patch' ? `/library/patch/${encodeURIComponent(f.of ?? f.id)}` : `/library/module/${f.of ?? f.id}`),
  })
  return { patches: listOf('patch', s), modules: listOf('module', s), addable: listOf('part', s), card }
}
