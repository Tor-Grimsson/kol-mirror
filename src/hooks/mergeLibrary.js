/**
 * mergeLibrary — the user's saves on this device + the rows in D1, newest wins.
 * Pure, so `scripts/check-library-merge.mjs` runs it without a browser.
 *
 * A save is never edited, only added or removed, so its stamp is `savedAt`. A remote
 * tombstone drops a local save only when it is newer than the save (a delete on one
 * machine must not eat a save made later on another). A local save the remote lacks
 * is kept and pushed up — a machine that saved signed-out reconciles on sign-in.
 *
 * @param {Array} local   the saved items (no presets)
 * @param {Array} rows    `{ id, spec, updatedAt, deleted }` from the API, kind already filtered
 * @returns {{ next: Array, pushes: Array }}  the new local list, and the items to PUT
 */
export function mergeLibrary(local, rows) {
  const remote = new Map(rows.map((r) => [r.id, r]))
  const next = []
  const pushes = []
  for (const l of local) {
    const r = remote.get(l.id)
    if (!r) { next.push(l); pushes.push(l); continue }
    if (r.deleted) { if ((l.savedAt ?? 0) > r.updatedAt) { next.push(l); pushes.push(l) } continue }
    next.push(r.updatedAt >= (l.savedAt ?? 0) ? r.spec : l)
  }
  const seen = new Set(local.map((l) => l.id))
  for (const r of rows) if (!r.deleted && !seen.has(r.id)) next.push(r.spec)
  return { next, pushes }
}
