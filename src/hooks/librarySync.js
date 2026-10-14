/**
 * librarySync — the saves survive the machine (2026-10-14, kol-fxr's plan 07 shape).
 *
 * The app names the API once (`setLibraryApi(import.meta.env.VITE_MIRROR_API)`); unset, there is no
 * Sign in and everything is localStorage, exactly as before. Signed in, three things change:
 *
 *   - the library (`mirror-library`: patches, expressions, effects) merges with D1 at sign-in and
 *     every explicit save or delete is pushed after the local write
 *   - the nine memory slots (`mirror-archive`) are ONE row, `memory`, newest wins
 *   - the rail shows Media — the R2 / B2 stores through the DS browser
 *
 * The API is `kol-mirror-api` at `mirror-api.kolkrabbi.io` (`api/`): one shared password, traded
 * at `/api/session` for a 90-day token. The TOKEN is kept in localStorage — never the password —
 * so a reload stays signed in. Pushes are fire-and-forget; a failed one is reconciled by the next
 * sign-in's merge. Nothing autosaves to it.
 */
import { useSyncExternalStore } from 'react'
import { getSaved, replaceSaved } from './useLibraryStore'
import { mergeLibrary } from './mergeLibrary'

const SESSION_KEY = 'kol.mirror.library-session'
const ARCHIVE_KEY = 'mirror-archive'
const ARCHIVE_STAMP = 'mirror-archive-updated'
const MEMORY_ID = 'memory'

let apiBase = null
let session = null
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export class UnauthorizedError extends Error { constructor() { super('unauthorized'); this.name = 'UnauthorizedError' } }

export function setLibraryApi(base) {
  apiBase = typeof base === 'string' && base.trim() ? base.trim().replace(/\/+$/, '') : null
  restoreSession()
}
export const getLibraryApi = () => apiBase
const getSession = () => session
export const useLibrarySession = () => useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, getSession, getSession)

function backend(token) {
  const call = async (path, init = {}) => {
    const res = await fetch(`${apiBase}${path}`, { ...init, headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' } })
    if (res.status === 401) { signOutLibrary(); throw new UnauthorizedError() }
    if (!res.ok) throw new Error(`library api ${res.status}`)
    return res.json()
  }
  return {
    hydrate: async () => (await call('/api/documents')).documents,
    put: (id, kind, name, spec, updatedAt) => call(`/api/documents/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ kind, name, spec, updatedAt }) }),
    remove: (id) => call(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  }
}

const quiet = (p) => p.catch((e) => console.warn('library sync:', e.message))

function store(value) {
  try { value ? localStorage.setItem(SESSION_KEY, JSON.stringify(value)) : localStorage.removeItem(SESSION_KEY) } catch { /* storage blocked — the session lasts the tab */ }
}
function restoreSession() {
  if (session || !apiBase) return
  let s = null
  try { s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null') } catch { /* unreadable — signed out */ }
  if (!s?.token || s.base !== apiBase || !(s.expiresAt > Date.now())) return
  session = { api: backend(s.token) }
  emit()
}

const archiveStamp = () => Number(localStorage.getItem(ARCHIVE_STAMP) || 0)

/** Trades the password for a token, merges the library and the memory slots, starts syncing.
 *  Resolves to the number of saves in the cloud. Wrong password → UnauthorizedError, nothing changes. */
export async function signInLibrary(password) {
  if (!apiBase) throw new Error('no library api')
  const res = await fetch(`${apiBase}/api/session`, { method: 'POST', headers: { authorization: 'Basic ' + btoa(`admin:${password}`) } })
  if (res.status === 401) throw new UnauthorizedError()
  if (!res.ok) throw new Error(`library api ${res.status}`)
  const { token, expiresAt } = await res.json()
  const api = backend(token)
  const rows = await api.hydrate()

  const { next, pushes } = mergeLibrary(getSaved(), rows.filter((r) => r.kind !== 'memory'))
  replaceSaved(next)
  for (const i of pushes) quiet(api.put(i.id, i.kind, i.name, i, i.savedAt ?? Date.now()))

  /* the memory slots: one row, newest wins. A remote win lands in localStorage, which the studio
     reads on mount — a studio already open picks it up on the next visit. */
  const mem = rows.find((r) => r.id === MEMORY_ID && !r.deleted)
  if (mem && mem.updatedAt > archiveStamp()) {
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(mem.spec))
    localStorage.setItem(ARCHIVE_STAMP, String(mem.updatedAt))
  } else if (archiveStamp()) {
    quiet(api.put(MEMORY_ID, 'memory', 'Memory', JSON.parse(localStorage.getItem(ARCHIVE_KEY) || 'null'), archiveStamp()))
  }

  session = { api }
  store({ base: apiBase, token, expiresAt })
  emit()
  return next.length
}

export function signOutLibrary() { store(null); if (!session) return; session = null; emit() }

/* the store's two verbs and the memory write call these after the local write */
export function pushSave(item) { if (session) quiet(session.api.put(item.id, item.kind, item.name, item, item.savedAt)) }
export function pushRemove(id) { if (session) quiet(session.api.remove(id)) }
export function pushMemory(slots) {
  const now = Date.now()
  try { localStorage.setItem(ARCHIVE_STAMP, String(now)) } catch { /* quota */ }
  if (session) quiet(session.api.put(MEMORY_ID, 'memory', 'Memory', slots, now))
}
