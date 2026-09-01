import { useSyncExternalStore } from 'react'

/* THE FOLD. Same number as AppShell's `drawerBelow` default, so the rail and
   the page agree on where mobile starts — two folds would show as the rail
   collapsing at one width and the content at another.

   A WIDTH, not ARCHITECTURE §2's pointer test, and deliberately so: §2 asks
   "can this device point precisely", the right question for a drag handle and
   the wrong one for a surface that needs 1200px of room. An iPad is coarse and
   fits the desk; a narrow desktop window is fine-pointered and does not. §2
   still governs interaction — this governs layout. */
export const FOLD = 768

const query = () => window.matchMedia(`(max-width: ${FOLD - 1}px)`)

const subscribe = (cb) => {
  const mq = query()
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/**
 * useNarrow — true below the fold. Live, so a resized window flips it.
 *
 * `useSyncExternalStore` rather than useState + useEffect: the first paint
 * reads the real width instead of rendering the wrong branch and correcting
 * it, which on the studio would mount a WebGL context only to tear it down.
 */
export const useNarrow = () => useSyncExternalStore(
  subscribe,
  () => query().matches,
  () => false, // no window: assume wide — the desktop app is the default
)
