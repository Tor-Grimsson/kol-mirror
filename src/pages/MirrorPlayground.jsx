import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useNavHidden } from '@kolkrabbi/kol-shell'
import ModulePalette from '../components/mirror/ModulePalette'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState'
import { getDefaultCanvasFxParams } from '../hooks/useCanvasFx'
import { findVariant, getDefaultParams } from '../data/mirrorVariants'
import { useMirrorState } from '../hooks/useMirrorState'
import { transport } from '../hooks/transport'
import { useTheme } from '@kolkrabbi/kol-framework/src/theme.js'
import MirrorSidebar from '../components/mirror/MirrorSidebar'
import MirrorViewport from '../components/mirror/MirrorViewport'
import MobileStudio from '../components/mirror/MobileStudio'
import { useNarrow } from '../hooks/useNarrow'

export default function MirrorPlayground() {
  const state = useMirrorState()
  const narrow = useNarrow()

  // Sidebar open/close — monitor's rack mechanics verbatim: closed by default,
  // the global rail hides only WHILE the sidebar is open, [Show]/[Hide]
  // affordances, H toggles.
  const nav = useNavHidden()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navRef = useRef(nav)
  useEffect(() => { navRef.current = nav })
  // The rail follows the sidebar from an EFFECT, not from inside the state
  // updater. A updater must be pure — calling the shell's setNavHidden in there
  // is a setState-during-render, which React reports as "Cannot update a
  // component while rendering a different component". Reading nav through the
  // ref keeps this off the shell's context identity, which changes every render.
  useEffect(() => { navRef.current?.setNavHidden(sidebarOpen) }, [sidebarOpen])
  // Reset nav visibility when leaving the studio
  useEffect(() => () => navRef.current?.setNavHidden(false), [])

  // Deep-link entry from the home page gallery / memory row (router location.state)
  const location = useLocation()
  const deepLinkDone = useRef(false)
  useEffect(() => {
    if (deepLinkDone.current) return
    deepLinkDone.current = true
    const { variantId, slotIndex, patch, slot, channelIndex } = location.state || {}
    if (slot) {
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

  /* THE MODULE PALETTE (user 2026-08-28, from kol-monitor): ⌘K searches the
     registry, E opens it as a shelf. Both are views over `moduleRegistry`; what
     an entry DOES is its own `add`, run against this api — so the palette never
     learns what kind of thing it is adding. */
  const [palette, setPalette] = useState(null)
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
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPalette((m) => (m === 'search' ? null : 'search'))
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return
      switch (e.key.toLowerCase()) {
        case 'e': setPalette((m) => (m === 'shelf' ? null : 'shelf')); break
        case 'h': setSidebarOpen(v => !v); break
        case 't': cycleRef.current?.(); break
        case 'm': s.setSymphonyMixerVisible(v => !v); break
        case 'r': s.symphonyReloaded?.(null); break
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
  const [sidebarWidth, setSidebarWidth] = useState(null)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)
  const asideRef = useRef(null)

  const getDefaultWidth = useCallback(() => {
    return window.innerWidth >= 1024 ? 320 : 288
  }, [])

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = sidebarWidth ?? getDefaultWidth()
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [sidebarWidth, getDefaultWidth])

  useEffect(() => {
    const onPointerMove = (e) => {
      if (!dragging.current) return
      const defaultW = getDefaultWidth()
      const delta = e.clientX - startX.current
      const next = Math.max(defaultW, Math.min(defaultW * 3, startW.current + delta))
      setSidebarWidth(next)
    }
    const onPointerUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [getDefaultWidth])

  /* BELOW THE FOLD, a different studio (2026-09-01). Placed after every hook in
     this component, never inside a condition — `MirrorViewport` already carries
     four conditional-hook errors and this file is not going to add a fifth.

     `MobileStudio` is not this layout reflowed: the resizable overlay sidebar,
     the drag handle, the H key and the rail-hiding dance are all mouse
     mechanics, and a phone gets a canvas and a sheet instead. The desktop tree
     below is left exactly as it was. */
  if (narrow) return <MobileStudio state={state} />

  return (
    /* The page wash (kol-shell 0.11.0 `AppShell pageWash`): the shell paints the
       primary back, PageShell reads the wash var — this root paints its own, so it
       reads the same var to stay in step with the other routes. */
    <div className="flex h-dvh w-full overflow-hidden" style={{ background: 'var(--kol-shell-page-wash, var(--kol-surface-primary))' }}>
      <ModulePalette mode={palette} onClose={() => setPalette(null)} api={paletteApi} />
      {/* `MobileHeader` + `MobileDrawer` stood here and are retired to
          `_tmp/2026-09-01-mobile-studio/`. They put the WHOLE `MirrorSidebar` —
          hall nav, variant list, canvas-ratio controls, archive slots, the save
          row — behind a hamburger at 288px, which is the desktop instrument in
          a drawer. `MobileStudio` replaced them above; this tree is now only
          ever rendered above the fold, so both were dead. */}

      {/* Desktop sidebar — closed by default; a FIXED OVERLAY like monitor's
          rack sidebar (VideoModulo ~85): the studio never reflows on H, the
          panel floats over the canvas at z-40. */}
      {sidebarOpen && (
        <aside
          ref={asideRef}
          className="mirror-sidebar-desktop border-r border-fg-08 overflow-y-auto"
          style={{
            /* the sidebar is a PANEL, not the page — surface-primary, like
               the rail. Painting the wash here too stacked it on the root's
               (user 2026-08-28: "there is double wash"); the page carries
               exactly one, on the root below, which is PageShell's stack. */
            backgroundColor: 'var(--kol-surface-primary)',
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 40,
            ...(sidebarWidth ? { width: `${sidebarWidth}px` } : {}),
          }}
        >
          {!sidebarWidth && <style>{`.mirror-sidebar-desktop { width: 18rem; } @media (min-width: 1024px) { .mirror-sidebar-desktop { width: 20rem; } }`}</style>}
          <MirrorSidebar state={state} onHide={() => setSidebarOpen(false)} />
          {/* Drag handle — below channel area */}
          <div
            className="absolute bottom-0 right-0 cursor-col-resize"
            style={{ width: '5px', height: '50%' }}
            onPointerDown={onPointerDown}
            onDoubleClick={() => setSidebarWidth(null)}
          />
        </aside>
      )}

      {/* Sidebar opens via H (or the rail) — no floating affordance, per user. */}

      {/* Main viewport — pushed right while the sidebar overlay is open
          (+24px breathing room between panel and content) */}
      <main
        className="mirror-viewport flex-1 relative"
        style={sidebarOpen ? { paddingLeft: (sidebarWidth ?? getDefaultWidth()) + 24 } : undefined}
      >
        <MirrorViewport state={state} />
      </main>

    </div>
  )
}
