import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AppShell, ShortcutsOverlay } from '@kolkrabbi/kol-shell'
import logomarkUrl from '@kolkrabbi/kol-brand/svg/favicon-01.svg?url'
import { Icon as DSIcon, registerIcons } from '@kolkrabbi/kol-icons'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import MirrorPlayground from './pages/MirrorPlayground'
import ExpressionsPage from './pages/ExpressionsPage'
import SettingsPage from './pages/SettingsPage'
import MixerPage from './pages/MixerPage'
import FrontsPage from './pages/FrontsPage'
import IconsPage from './pages/IconsPage'
import TapePage from './pages/TapePage'
import WideOnly from './components/WideOnly'
import { KEYBOARD_SHORTCUTS } from './data/shortcuts'
import { transport } from './hooks/transport'
import { useRenderStats, setStatsEnabled } from './hooks/renderStats'
import { useRenderQuality } from './hooks/renderQuality'
import { useAdaptiveQuality } from './hooks/adaptiveQuality'

// Dev-only render surface for scripts/generate-previews.mjs — dropped from
// prod builds entirely. Not instrument navigation (ARCHITECTURE §1).
const DevCapturePage = import.meta.env.DEV ? lazy(() => import('./pages/DevCapturePage')) : null

// The rail's `nav-*` glyphs ship in kol-icons ≥0.20.0 (ShellHomeSystem); the
// generic `library` / `rack` / `slider-01` stand-ins retired 2026-08-27.
const NAV_ITEMS = [
  { icon: 'nav-library', path: '/library', label: 'Library' },
  // The DS set has no `wave` (the mixer tab's local glyph); `frequency` is the
  // nearest mark and already names the channel strip's expressions shelf.
  { icon: 'frequency', path: '/expressions', label: 'Expression' },
  // /mixer is the rack SHEET — every module and its specs (ARCHITECTURE §1: a
  // reference surface, like /expressions; the desk itself stays state).
  { icon: 'rack', path: '/mixer', label: 'Mixer' },
  { icon: 'dith-radial', path: '/tape', label: 'Tape' },
  // Studio last in the top group (user 2026-08-28) — the instrument sits at
  // the end of the reference surfaces that lead to it.
  { icon: 'nav-studio', path: '/studio', label: 'Studio' },
  // Reference surfaces, same class as /expressions and /mixer: `component` for
  // the front-panel sketchbook (it IS a parts catalogue), `grid-02` for the
  // icon sheet — a grid of marks is literally what that page is.
  { icon: 'component', path: '/fronts', label: 'Fronts' },
  { icon: 'grid-02', path: '/icons', label: 'Icons' },
]

const BOTTOM_ITEMS = [
  { icon: 'nav-settings', path: '/settings', label: 'Settings' },
]

// The logomark ships from kol-brand — one source for the rail and the studio
// sidebar's nav header; the local /svg copy is retired.
const LOGOMARK = { svgUrl: logomarkUrl, title: 'Mirror' }

/* Mirror's own glyphs, handed to the DS resolver ONCE at boot. `resolveIcon` is
   consumer → v1 → signal, so a registered name wins over both packaged sets —
   which is the documented contract, not a lucky ordering.
   This replaces a hand-rolled version of exactly this (a `RailIcon` switch over
   a `hasLocalIcon` predicate). Before that it was a hand-WRITTEN set of two
   names, so `component` and `grid-02` — both of which mirror draws and the DS
   does not — fell through and logged "not found in icon set" every render.
   Registered names also resolve synchronously, with no wait on the packaged
   async chunk. `03-custom.md` in the DS docs is the page for this. */
registerIcons(import.meta.glob('./components/icons/svg/**/*.svg', { eager: true, query: '?raw', import: 'default' }))

/**
 * Shell — kol-shell's `AppShell`, whose rail is the flat 48px column this repo
 * built and filed as `RailFlatGrabOpen` (kol-shell 0.16.0 · kol-theme 0.88.0,
 * closed 2026-08-28). The local `NavRail.jsx` and its `.rail-grab` block are
 * retired to `_tmp/2026-08-28-rail-upstream/`; what came back is the same rail
 * with the app-specific bits generalised — `--kol-z-sticky` instead of a
 * hardcoded 70, the open width read off `--kol-sidenav-w`'s ladder, and the
 * pill's numbers in kol-component's `utilities/motion`.
 *
 * `NavHiddenContext` is still the seam AppShell provides: the studio hides the
 * rail while its own sidebar is open (MirrorPlayground), and it returns on
 * every route change. `railToggleKey` and `navKeys` are AppShell's again, so
 * the local `\` and ⌥-digit handlers go with them — except ⌥1, which is HOME
 * here and not a rail item, so that one stays.
 */
/* F — the frame budget, top-right. Not just fps: where the frame GOES, so a
   slow mixer names its own bottleneck instead of being guessed at. Mounting
   turns sampling on; unmounting turns it off, so the cost of measuring is only
   paid while the readout is open. */
function FpsMeter() {
  const stats = useRenderStats()
  const q = useRenderQuality()
  useEffect(() => { setStatsEnabled(true); return () => setStatsEnabled(false) }, [])
  const rows = Object.entries(stats.stages || {}).filter(([, ms]) => ms > 0.01)
  const bad = stats.fps > 0 && stats.fps < 50
  return (
    <div
      className="kol-helper-10 bg-surface-secondary border border-fg-08"
      style={{ position: 'fixed', right: 12, top: 12, borderRadius: 4, padding: '6px 8px', zIndex: 'var(--kol-z-tooltip)', fontVariantNumeric: 'tabular-nums', minWidth: 132, pointerEvents: 'none' }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className={bad ? 'text-[#e74c3c]' : 'text-fg-96'}>{stats.fps} fps</span>
        <span className="text-fg-32">{stats.frameMs ? `${stats.frameMs}ms` : '—'}</span>
      </div>
      {(stats.p95 > 0 || stats.jank > 0) && (
        <div className="flex items-center justify-between gap-4 text-fg-32">
          <span>p95 {stats.p95}ms</span>
          <span className={stats.jank > 0 ? 'text-[#e74c3c]' : ''}>{stats.jank} jank</span>
        </div>
      )}
      {rows.length > 0 && (
        <div className="flex flex-col" style={{ marginTop: 4 }}>
          {rows.map(([name, ms]) => (
            <div key={name} className="flex items-center justify-between gap-4 text-fg-48">
              <span>{name}</span><span>{ms.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      {Object.keys(stats.perChannel || {}).length > 0 && (
        <div className="flex flex-col" style={{ marginTop: 4 }}>
          {Object.entries(stats.perChannel).map(([i, ms]) => (
            <div key={i} className="flex items-center justify-between gap-4 text-fg-48">
              <span>ch {Number(i) + 1}</span><span>{ms.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-4 text-fg-32" style={{ marginTop: 4 }}>
        <span>{stats.pixels ? `${(stats.pixels / 1e6).toFixed(2)}MP` : '—'}</span>
        <span>{q.effectiveScale === 1 ? 'full' : `${q.effectiveScale}x`}{q.adaptive && q.autoScale && q.autoScale < q.scale ? ' auto' : ''} · {stats.channels} ch</span>
      </div>
    </div>
  )
}

function Shell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showFps, setShowFps] = useState(false)
  useAdaptiveQuality()

  /* The Settings rung TOGGLES (user, 2026-08-28: "click settings opens
     settings, click again closes") — the shell's own since kol-shell 0.25.0 /
     0.26.0 (SettingsToggleGesture: three repos had each built this), so the
     local `lastPage` ref and the branch in `onNavigate` are gone. Passed as
     `settingsPath` + `settingsKey` below; `onNavigate` is a plain navigate
     again. */

  /* App-wide keys — S (the shortcuts sheet), Space (the timeline) and
     Option+1..N. The rail's own `\` and its nav-hidden state are AppShell's
     since kol-shell 0.16.0, so they are gone from here; ⌥-digit is NOT, because
     AppShell's `navKeys` maps ⌥n to `items[n-1]` and mirror's ⌥1 is HOME — the
     logomark's row, which is not a rail item. The studio's keys stay in
     MirrorPlayground. */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      const digit = e.altKey && !e.metaKey && !e.ctrlKey && /^Digit([1-9])$/.exec(e.code)
      if (digit) {
        // ⌥1 is HOME — the logomark's row (user 2026-08-28); the rail's items
        // start at ⌥2, so the digit is the row's position in the rail
        const n = Number(digit[1])
        const path = n === 1 ? '/' : NAV_ITEMS[n - 2]?.path
        if (path) { e.preventDefault(); navigate(path) }
        return
      }
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (e.key === ' ') { if (t.tagName === 'BUTTON') return; e.preventDefault(); transport.toggle() }
      else if (e.key.toLowerCase() === 's') setShowShortcuts((v) => !v)
      else if (e.key.toLowerCase() === 'f') setShowFps((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  return (
    <AppShell
      items={NAV_ITEMS}
      bottomItems={BOTTOM_ITEMS}
      logomark={LOGOMARK}
      currentPath={location.pathname}
      onNavigate={navigate}
      iconComponent={DSIcon}
      railToggleKey={'\\'}
      settingsPath="/settings"
      settingsKey=","
      pageWash="var(--kol-fg-02)"
      /* Below 768 the rail goes off-canvas and gives its 48px back (kol-shell
         0.31.0). On a 390px phone that column is 12.3% of the viewport, and
         `railToggleKey` cannot help there — it is a KEY, and a phone has no
         keyboard. A WIDTH, not a pointer test: an iPad is coarse and has the
         room, so ARCHITECTURE §2's pointer rule is not what governs this one. */
      touch="drawer"
    >
      <Outlet />
      {showShortcuts && <ShortcutsOverlay shortcuts={KEYBOARD_SHORTCUTS} onClose={() => setShowShortcuts(false)} />}
      {showFps && <FpsMeter />}
    </AppShell>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/studio" element={<MirrorPlayground />} />
          {/* WIDE ONLY. Five reference surfaces that are not small-screen
              objects: five 320px scroll columns, a module spec sheet, an icon
              grid, ten tape decks side by side, a front-panel sketchbook. A
              phone gets the note, not a broken layout. `/` `/library`
              `/settings` and the studio's halls are the mobile app. */}
          <Route path="/expressions" element={<WideOnly what="The expression reference"><ExpressionsPage /></WideOnly>} />
          <Route path="/mixer" element={<WideOnly what="The module sheet"><MixerPage /></WideOnly>} />
          <Route path="/icons" element={<WideOnly what="The icon sheet"><IconsPage /></WideOnly>} />
          <Route path="/tape" element={<WideOnly what="The tape decks"><TapePage /></WideOnly>} />
          {/* a sketchbook of module-front ideas — not wired to the instrument */}
          <Route path="/fronts" element={<WideOnly what="The front sketchbook"><FrontsPage /></WideOnly>} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        {DevCapturePage && (
          <Route path="/dev/capture" element={<Suspense fallback={null}><DevCapturePage /></Suspense>} />
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
