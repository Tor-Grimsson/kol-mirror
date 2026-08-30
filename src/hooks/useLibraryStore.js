import { useSyncExternalStore } from 'react'

/**
 * The library store — user saves in ONE localStorage list plus the shipped
 * presets under src/data/presets/<kind>/*.json. Every entry is the file shape:
 *   { version, kind, name, description, tags, savedAt, data }
 * `kind` picks what `data` holds: expression → { expr }; effect → { variantId,
 * params }; patch → { channels, master, canvas }. Export writes that shape to
 * disk (mirror-<kind>-<slug>-<date>.json); import ADDS it back, never replaces.
 * Presets are read-only — they carry `preset: true` and no user id.
 */
const KEY = 'mirror-library'
export const KINDS = ['expression', 'effect', 'patch']

const presetFiles = import.meta.glob('../data/presets/*/*.json', { eager: true, import: 'default' })
export const PRESETS = Object.entries(presetFiles).map(([path, p]) => ({
  ...p, id: `preset:${p.kind}:${path.split('/').pop().replace(/\.json$/, '')}`, preset: true,
}))

function read() {
  try { const arr = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(arr) ? arr : [] } catch { return [] }
}
let items = read()
const listeners = new Set()
function write(next) {
  items = next
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* quota — keep session state */ }
  listeners.forEach((l) => l())
}
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
const getSnapshot = () => items

const isEntry = (p) => p && KINDS.includes(p.kind) && typeof p.name === 'string' && p.data && typeof p.data === 'object'
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function addToLibrary(entry) {
  // ponytail: an imported file may carry an id / preset flag — both are ours to assign.
  const { id: _id, preset: _preset, ...rest } = entry
  const item = { version: 1, description: '', tags: [], ...rest, id: `usr:${Date.now().toString(36)}`, savedAt: Date.now() }
  write([...items, item])
  return item
}

export function removeFromLibrary(id) {
  write(items.filter((i) => i.id !== id))
}

/** Presets + user saves, newest save last; `kind` narrows. */
export function useLibrary(kind) {
  const saved = useSyncExternalStore(subscribe, getSnapshot)
  const all = [...PRESETS, ...saved]
  return kind ? all.filter((i) => i.kind === kind) : all
}

export function exportEntry(item) {
  const { id: _id, preset: _preset, ...file } = item
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mirror-${file.kind}-${slug(file.name)}-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Opens the file picker; resolves to the added entry, or null (cancelled / not a library file). */
export function importEntry() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (!file) return resolve(null)
      file.text().then((text) => {
        try { const p = JSON.parse(text); resolve(isEntry(p) ? addToLibrary(p) : null) } catch { resolve(null) }
      })
    }
    input.click()
  })
}
