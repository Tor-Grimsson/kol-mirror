import { useState, useEffect } from 'react'

/**
 * usePersistedState — `useState` that survives a reload, ported from
 * kol-monitor's `src/hooks/usePersistedState.js`.
 *
 * Monitor's `/create` keeps the case name and description this way, so the
 * thing you are designing still has its name tomorrow. Mirror's does the same
 * for the mixer's name.
 *
 * Namespaced `mirror-*` so it cannot collide with the other keys this app
 * already writes (`mirror-archive`, `mirror-render-quality`). Every read and
 * write is guarded: private mode throws on both.
 */
export default function usePersistedState(key, initial) {
  const storageKey = `mirror-${key}`
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw === null ? initial : JSON.parse(raw)
    } catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)) } catch { /* private mode */ }
  }, [storageKey, value])
  return [value, setValue]
}
