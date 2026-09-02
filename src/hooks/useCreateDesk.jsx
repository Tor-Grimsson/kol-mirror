import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { EMPTY_CHANNEL } from './useMirrorState'
import { CreateDeskContext, EMPTY_MASTER } from './createDeskContext'

/* Which navigations this tab has already seen. History back lands on the KEY it
   left, so a key we have stored means "returning" — keep the desk. Session
   scoped, capped, every read and write guarded: private mode throws. */
const KEYS = 'mirror-create-keys'
const readKeys = () => { try { return JSON.parse(sessionStorage.getItem(KEYS) || '[]') } catch { return [] } }
const rememberKey = (k) => { try { sessionStorage.setItem(KEYS, JSON.stringify([...readKeys().filter((x) => x !== k), k].slice(-20))) } catch { /* private mode */ } }

/**
 * CreateDeskProvider — the mixer under construction, held ABOVE the routes.
 *
 * kol-monitor §6 (2026-09-02): *"the item routes moved INSIDE the rack
 * provider's route group so state survives canvas → item page → Back"*. That is
 * the structural half; `location.key` bookkeeping is the other half and cannot
 * substitute for it — `CreatePage` UNMOUNTS on navigation, so state in the page
 * is gone before any key logic runs. Measured: place Master, open
 * `/mixer/channel`, press Back → empty desk.
 *
 * Monitor has `useRack()` for the same reason: its create page and its rack
 * page drive one store. Mirror's equivalent is this — small, because a mirror
 * desk is three fields.
 *
 * NOT persisted. A refresh is a new session and starts empty, which is what the
 * `location.key` logic in `CreatePage` already says about a fresh navigation.
 */

export function CreateDeskProvider({ children }) {
  const [channels, setChannels] = useState([])
  const [placed, setPlaced] = useState(() => new Set())
  const [master, setMaster] = useState(EMPTY_MASTER)
  const location = useLocation()

  /* THE RESET LIVES HERE, not in `CreatePage`. React's render-phase adjustment
     is only legal for a component's OWN state — doing it from the page set the
     PROVIDER's state while the page rendered, which WebKit surfaced as "Cannot
     update a component while rendering a different component". Chrome did not
     report it. The provider owns the state, so the provider owns the reset.

     A key seen before = returning (history back lands on the key it left) →
     keep the desk. `?insert=` / `?from=` keep it too. Anything else is a new
     mixer — including the Create rung tapped while already on the page, which
     is a new key on the same component. */
  const [lastKey, setLastKey] = useState(null)
  if (location.pathname === '/create' && location.key !== lastKey) {
    setLastKey(location.key)
    const params = new URLSearchParams(location.search)
    const fresh = !params.get('insert') && !params.get('from') && !readKeys().includes(location.key)
    rememberKey(location.key)
    if (fresh) {
      setChannels([])
      setPlaced(new Set())
      setMaster(EMPTY_MASTER)
    }
  }

  const value = useMemo(() => ({
    channels, setChannels,
    placed, setPlaced,
    master, setMaster,
    patchChannel: (i, patch) => setChannels((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c))),
    addChannel: (fields) => setChannels((cs) => [...cs, { ...EMPTY_CHANNEL, enabled: true, ...fields }]),
    removeChannel: (i) => setChannels((cs) => cs.filter((_, j) => j !== i)),
    place: (id) => setPlaced((s) => new Set(s).add(id)),
    unplace: (id) => setPlaced((s) => { const n = new Set(s); n.delete(id); return n }),
    clear: () => { setChannels([]); setPlaced(new Set()); setMaster(EMPTY_MASTER) },
  }), [channels, placed, master])

  return <CreateDeskContext.Provider value={value}>{children}</CreateDeskContext.Provider>
}
