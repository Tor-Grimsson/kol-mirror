import { useState, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { ShellSearchOverlay, useRailKey } from '@kolkrabbi/kol-component'
import { MODULE_REGISTRY, searchModules } from '../data/moduleRegistry'
import Workbench from '../components/mirror/Workbench'
import PatchTableOverlay from '../components/hall-of-mirrors/PatchTableOverlay'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState'
import { getDefaultCanvasFxParams } from '../hooks/useCanvasFx'
import { findVariant, getDefaultParams } from '../data/mirrorVariants'
import { useMirrorState } from '../hooks/useMirrorState'
import { transport } from '../hooks/transport'
import { useTheme } from '@kolkrabbi/kol-framework/src/theme.js'
import StudioRail from '../components/mirror/StudioRail'
import MirrorViewport from '../components/mirror/MirrorViewport'
import MobileStudio from '../components/mirror/MobileStudio'
import { useNarrow } from '../hooks/useNarrow'
import { useLibrary } from '../hooks/useLibraryStore'
import { useLibrarySession } from '../hooks/librarySync'
import TimelineStrip from '../components/mirror/TimeStrip'

/* the registry as rows for kol-component's `ShellSearchOverlay` — the name, with the group and
   the detail as the row's own; `add` rides along and is what a pick runs */
const moduleRow = (m) => ({ id: m.id, label: m.name, group: m.group, hint: m.detail, add: m.add })
const MODULE_ROWS = MODULE_REGISTRY.map(moduleRow)

/* `arrangement` — 'float' (THE studio since 2026-10-14, user: Studio B is the default and the old
   one goes: the desk takes the view and the monitor is a bare frame over it — `SymphonyViewport`)
   or 'stage' (the older layout, kept in code, mounted nowhere). */
export default function MirrorPlayground({ arrangement = 'float' }) {
  const state = useMirrorState()
  const narrow = useNarrow()

  // Sidebar — closed by default, H toggles. A right-edge Rail since plan 13 § 2.3 (user: *"put H siderail on the
  // right side like monitor"*), so it no longer hides the shell's rail on the left while it is open.
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Deep-link entry from the home page gallery / memory row (router location.state)
  const location = useLocation()
  const deepLinkDone = useRef(false)
  useEffect(() => {
    if (deepLinkDone.current) return
    deepLinkDone.current = true
    const { variantId, slotIndex, patch, slot, slots, channelIndex } = location.state || {}
    /* a Library expression card — the bench lives in the Workbench rail since plan 15 (the studio's tab row is gone) */
    if (location.state?.expr) { state.setWorkbenchView('expressions'); state.setDeskEdit(true) }
    /* `slots` — the whole mixer, from CREATE's builder view (2026-09-01, on
       kol-monitor's CreatePage shape: you assemble the instrument and then open
       it). Same merge semantics as the single `slot` below, N at a time: each
       entry lands on its own strip and whatever it does not specify — level,
       sends, routing — survives. An entry that is `null` leaves that strip
       untouched, so a builder with only Ch 2 filled does not blank Ch 1 and 3. */
    if (Array.isArray(slots)) {
      state.setSymphonyChannels((prev) =>
        prev.map((ch, i) => (slots[i] ? { ...ch, ...slots[i] } : ch)))
      state.selectHall('symphony')
    } else if (slot) {
      /* A channel built on /library's CREATE view. Merged into the target channel rather than
         replacing it, so whatever the slot does not specify (level, sends,
         routing) survives. */
      /* CLAMPED. The CREATE view offers Ch 1-3 because it cannot see the desk — the
         instrument's state lives inside /studio by design (ARCHITECTURE §1) and
         a catalogue page does not get to read it. So the RECEIVER decides: a
         send aimed past the end of the desk lands on the last strip instead of
         matching nothing and silently doing nothing, which is what happened
         after a channel was removed. */
      state.setSymphonyChannels((prev) => {
        const target = Math.min(Math.max(0, channelIndex ?? 0), prev.length - 1)
        return prev.map((ch, i) => (i === target ? { ...ch, ...slot } : ch))
      })
      state.selectHall('symphony')
    } else if (patch) state.loadPatch(patch)
    else if (variantId) state.openVariant(variantId)
    else if (slotIndex != null) state.loadSlotToHall(slotIndex)
  }, [location.state, state]) // guarded by deepLinkDone — runs once on mount

  // Global shortcuts — S shortcuts · H sidebar · T theme · M mixer · R reloaded · ⌘Z/⌘⇧Z undo/redo
  const { cycle: cycleTheme } = useTheme()
  const cycleRef = useRef(cycleTheme)
  useEffect(() => { cycleRef.current = cycleTheme })
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state })

  /* NOT AN EMPTY STUDIO — WHEN SIGNED IN (user 2026-10-14, 2026-10-15). Signed out, the studio opens
     empty. Signed in, a desk with nothing loaded takes the newest saved patch — on mount, and when the
     first saves arrive (the sign-in seed). A deep link wins; a desk cleared on purpose stays cleared,
     because clearing changes no save. */
  const signedIn = !!useLibrarySession()
  const newestPatch = useLibrary('patch').filter((p) => signedIn && !p.preset).sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0))[0]
  useEffect(() => {
    const st = location.state || {}
    if (st.patch || st.slots || st.slot || st.variantId || st.slotIndex != null) return
    if (!newestPatch || stateRef.current.symphonyChannels.some((c) => c.variantId)) return
    stateRef.current.loadPatch(newestPatch)
  }, [newestPatch?.id]) // eslint-disable-line react-hooks/exhaustive-deps -- the desk is read, not watched

  /* THE MODULE PALETTE (user 2026-08-28, from kol-monitor): ⌘K searches the
     registry, E opens it as a shelf. Both are views over `moduleRegistry`; what
     an entry DOES is its own `add`, run against this api — so the palette never
     learns what kind of thing it is adding. */
  const [palette, setPalette] = useState(null)
  const [moduleQuery, setModuleQuery] = useState('')
  /* THE PATCH TABLE (kol-monitor's `PatchTableOverlay`, user 2026-09-01:
     "a mobile and structure friendly patch bay … follow suit"). `p` toggles
     it, as over there; on a phone the `Patch` control beside `Modules` does. */
  const [patchTable, setPatchTable] = useState(false)
  /* the timeline strip — hidden by default, `B` shows it (user 2026-10-15) */
  const [timeline, setTimeline] = useState(false)
  /* The channel the palette is currently building. A source and the FX that
     follow it are ONE patch, so they have to land on the same strip — this used
     to be "first free channel" for the source and "channel 0" for the FX, which
     split a two-part patch across two channels. */
  const paletteTargetRef = useRef(0)
  const paletteApi = useMemo(() => ({
    addChannel: () => {
      stateRef.current.setSymphonyChannels((prev) => {
        paletteTargetRef.current = prev.length
        return [...prev, { ...EMPTY_CHANNEL, enabled: true }]
      })
      stateRef.current.selectHall('symphony')
    },
    loadVariant: (variantId) => {
      const s = stateRef.current
      const chans = s.symphonyChannels || []
      const free = chans.findIndex((c) => !c.variantId)
      const i = free < 0 ? 0 : free
      paletteTargetRef.current = i
      /* Defaults filled and `enabled` set, the same two things the desk's own
         LOAD tab does. Every channel boots disabled, so loading a source into
         one and leaving it off rendered nothing and read as a dead palette. */
      const def = findVariant(variantId)
      const params = def?.controls ? getDefaultParams(def.controls) : {}
      s.setSymphonyChannels((prev) => prev.map((c, n) => (
        n === i ? { ...c, variantId, params, enabled: true } : c
      )))
      s.selectHall('symphony')
    },
    addCanvasFx: (fxId) => {
      const i = paletteTargetRef.current
      /* `type` + `params`, the shape the whole FX chain reads. The palette was
         writing `{ id, enabled }`: no `type` means `FX_PROCESSORS[fx.type]` is
         undefined and the unit is filtered out, so it appeared in the rack and
         did nothing at all. */
      stateRef.current.setSymphonyChannels((prev) => prev.map((c, n) => (
        n === i
          ? { ...c, enabled: true, canvasFx: [...(c.canvasFx || []), { type: fxId, enabled: true, params: getDefaultCanvasFxParams(fxId) }] }
          : c
      )))
      stateRef.current.selectHall('symphony')
    },
    /* PLACING A UNIT (2026-10-03). The registry gives the FX units and the desk's own modules
       `add: api.placeUnit(…)`, and this api never had the verb — picking any of the fifteen from
       ⌘K or the shelf threw "api.placeUnit is not a function".
       AN FX PICK LOADS THE MODULE AND NOTHING ELSE (user, same day: *"it should go into a
       independednt fx module with inputs and outputs"*, then *"no preconfigured paths ever. just
       load the fx. the whole point is to patch yourself … think about a physical mixer, does it
       ever do anything on auto"*). So: one module on the desk, its IN and its OUT empty. No
       channel, no bus, no master slot — every cable is his, a loop into itself included.
       A one-per-desk module is already on this desk, so its pick does nothing. */
    placeUnit: (entryId) => {
      if (!entryId.startsWith('fx:')) return
      const type = entryId.slice(3)
      stateRef.current.setSymphonyFxModules((prev) => [...prev, {
        id: String(prev.reduce((n, m) => Math.max(n, Number(m.id) || 0), 0) + 1),
        type,
        params: getDefaultCanvasFxParams(type),
        enabled: true,
        input: null,
      }])
      stateRef.current.selectHall('symphony')
    },
    /* The cable. A channel that is not in `master.inputs` is force-disabled by
       the viewport, so a source added with nothing patched renders black — and
       auto-patching on enable was deliberately REMOVED (2026-08-28), which is
       the right call for a bare channel. A PATCH is the exception: wiring is
       what it is, so it lays its own cable and nothing else gained one. */
    patchToMaster: () => {
      const i = paletteTargetRef.current
      stateRef.current.setSymphonyMaster((m) => {
        const inputs = [...(m.inputs || [null, null, null])]
        if (inputs.includes(i)) return m
        const free = inputs.indexOf(null)
        inputs[free < 0 ? 0 : free] = i
        return { ...m, inputs }
      })
    },
  }), [])
  /* THE RAIL KEYS ARE THE ROLES' (plan 17): E the bottom rail (edit mode), H the page rail. P stays the handler below —
     the role's key ignores Shift, and ⇧P is the whole-desk flip. */
  useRailKey('bottom', () => state.setDeskEdit((v) => !v))
  useRailKey('page', () => setSidebarOpen((v) => !v))
  /* the channels M muted, so the next M restores exactly those */
  const mutedRef = useRef(null)
  /* ⌘K IS THE STUDIO'S ADD-MODULE SEARCH (monitor's key). The Hub binds ⌘K to its own search on every page, so on
     /studio both opened and the Hub's stayed over the desk. The studio takes it first — window capture, before the
     Hub's bubble listener — and stops it there; off the studio the Hub's search is untouched. */
  useEffect(() => {
    const onK = (e) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k' || e.shiftKey || e.altKey || e.repeat) return
      e.preventDefault()
      e.stopImmediatePropagation()
      setPalette((m) => (m === 'search' ? null : 'search'))
    }
    window.addEventListener('keydown', onK, true)
    return () => window.removeEventListener('keydown', onK, true)
  }, [])
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      const s = stateRef.current
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.symphonyRedo()
        else s.symphonyUndo()
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key.toLowerCase()) {
        case 'p': if (!e.shiftKey) setPatchTable((v) => !v); break
        case 't': cycleRef.current?.(); break
        /* M and D are monitor's (plan 13 § 1.3): M mutes every channel and a second M brings back the ones
           that were on; D clears the display — here, the mixer — which M used to do */
        case 'm': {
          const on = s.symphonyChannels.map((c) => c.enabled)
          if (on.some(Boolean)) { mutedRef.current = on; s.setSymphonyChannels((prev) => prev.map((c) => ({ ...c, enabled: false }))) }
          else if (mutedRef.current) { const was = mutedRef.current; mutedRef.current = null; s.setSymphonyChannels((prev) => prev.map((c, i) => ({ ...c, enabled: !!was[i] }))) }
          break
        }
        case 'd': s.setSymphonyMixerVisible(v => !v); break
        case 'r': s.symphonyReloaded?.(null); break
        case 'b': setTimeline((v) => !v); break
        default:
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  /* Space (App's Shell) drives the transport; the studio follows it — the
     mixer's master animate, and in a hall the active variant's `animate`. */
  useEffect(() => transport.subscribe(() => {
    const s = stateRef.current
    const playing = transport.playing
    s.setSymphonyAnimating(playing)
    if (s.activeVariant && !['symphony', 'archive', 'presets'].includes(s.activeHall)) s.setVariantParam(s.activeVariant, 'animate', playing)
  }), [])

  /* BELOW THE FOLD, a different studio (2026-09-01). Placed after every hook in
     this component, never inside a condition — `MirrorViewport` already carries
     four conditional-hook errors and this file is not going to add a fifth.

     `MobileStudio` is not this layout reflowed: the resizable overlay sidebar,
     the drag handle, the H key and the rail-hiding dance are all mouse
     mechanics, and a phone gets a canvas and a sheet instead. The desktop tree
     below is left exactly as it was. */
  /* Below the fold the studio IS `MobileStudio` — but the module palette lives
     here, so its touch entry has to be rendered on this side of the return or
     it never mounts at all (which is exactly what happened on the first
     attempt: the button sat in the desktop tree below and a phone never
     reached it). */
  /* ⌘K IS THE DS SEARCH MODAL (2026-10-03, the rack's wiring) — mirror drew its own in
     `ModulePalette`, which is now only the E shelf; its search chrome is no longer reached. A unit
     with no `add` (one per desk) is listed and a pick on it does nothing. */
  const modulePalette = (
    <>
      {/* E is monitor's edit mode — the bottom Workbench rail: the case's rows, and the module shelf as its Library
          view (plan 13 § 2.2). Its open state is edit mode (`state.deskEdit`, plan 15) — the desk's move arrows follow it. */}
      <Workbench open={state.deskEdit} onClose={() => state.setDeskEdit(false)} view={state.workbenchView} onView={state.setWorkbenchView} consoleState={state.symphonyConsole} onConsole={state.setSymphonyConsole} api={paletteApi} />
      <ShellSearchOverlay
        open={palette === 'search'}
        onClose={() => { setPalette(null); setModuleQuery('') }}
        query={moduleQuery}
        onQueryChange={setModuleQuery}
        results={moduleQuery.trim() ? searchModules(moduleQuery).map(moduleRow) : []}
        suggestions={MODULE_ROWS}
        placeholder="Search modules…"
        selectLabel="Add module"
        onSelect={(m) => m.add?.(paletteApi)}
      />
    </>
  )

  if (narrow) return (
    <>
      <MobileStudio state={state} />
      {/* THE TOUCH WAY IN. `ModulePalette` has had both chromes since
          2026-08-28 — ⌘K a search, E a bottom shelf, ported from kol-monitor —
          and BOTH are bound to keys, so on a phone the module library did not
          exist at all. kol-monitor has the same gap (`useKeybindings.js:16`,
          ⌘K only), so there is no decision to port here; what IS monitor's is
          the idiom for desk chrome — a fixed corner control, `VideoModulo.jsx:167`
          puts `[Lock]` at bottom-right the same way.

          The SHELF, not the search: a search opens a keyboard over the surface
          you are trying to see, and the shelf is the browsable half. Bottom-LEFT
          because the drawer trigger owns the top-right corner and the mobile
          sheet owns the bottom edge's full width. */}
      {!palette && !state.deskEdit && (
        <button
          type="button"
          onClick={() => { state.setWorkbenchView('library'); state.setDeskEdit(true) }}
          className="fixed kol-helper-12 text-fg-64"
          style={{ bottom: 72, left: 16, zIndex: 'var(--kol-z-overlay)', background: 'var(--kol-surface-primary)', border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', height: 40, padding: '0 12px' }}
        >
          Modules
        </button>
      )}
      {narrow && !patchTable && state.activeHall === 'symphony' && (
        <button
          type="button"
          onClick={() => setPatchTable(true)}
          className="fixed kol-helper-12 text-fg-64"
          style={{ bottom: 72, left: 104, zIndex: 'var(--kol-z-overlay)', background: 'var(--kol-surface-primary)', border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', height: 40, padding: '0 12px' }}
        >
          Patch
        </button>
      )}

      {modulePalette}
      <PatchTableOverlay
        open={patchTable}
        onClose={() => setPatchTable(false)}
        patch={{ channels: state.symphonyChannels, master: state.symphonyMaster, screen2: state.symphonyScreen2, fxModules: state.symphonyFxModules }}
        onApply={(next) => {
          state.setSymphonyChannels(next.channels)
          state.setSymphonyMaster(next.master)
          state.setSymphonyScreen2(next.screen2)
          state.setSymphonyFxModules(next.fxModules)
        }}
      />

    </>
  )

  return (
    /* The page wash (kol-shell 0.11.0 `AppShell pageWash`): the shell paints the
       primary back, PageShell reads the wash var — this root paints its own, so it
       reads the same var to stay in step with the other routes. */
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: 'var(--kol-shell-page-wash, var(--kol-surface-primary))' }}>
      {modulePalette}
      <PatchTableOverlay
        open={patchTable}
        onClose={() => setPatchTable(false)}
        patch={{ channels: state.symphonyChannels, master: state.symphonyMaster, screen2: state.symphonyScreen2, fxModules: state.symphonyFxModules }}
        onApply={(next) => {
          state.setSymphonyChannels(next.channels)
          state.setSymphonyMaster(next.master)
          state.setSymphonyScreen2(next.screen2)
          state.setSymphonyFxModules(next.fxModules)
        }}
      />

      {/* `MobileHeader` + `MobileDrawer` stood here and are retired to
          `_tmp/2026-09-01-mobile-studio/`. They put the WHOLE `MirrorSidebar` —
          hall nav, variant list, canvas-ratio controls, archive slots, the save
          row — behind a hamburger at 288px, which is the desktop instrument in
          a drawer. `MobileStudio` replaced them above; this tree is now only
          ever rendered above the fold, so both were dead. */}

      {/* H IS THE PAGE ROLE (plan 17 W2): the studio's own settings as the KOL page rail — `StudioRail` */}
      <StudioRail state={state} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Sidebar opens via H (or the rail) — no floating affordance, per user. */}

      {/* Main viewport — the sidebar Rail floats over it, as monitor's does over the rack */}
      <main className="mirror-viewport flex-1 relative">
        <MirrorViewport state={state} arrangement={arrangement} />
        {timeline && <TimelineStrip onClose={() => setTimeline(false)} />}
      </main>

    </div>
  )
}
