import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { MediaLibrary, ModalProvider, useModal } from '@kolkrabbi/kol-component'
import Studio from './components/Studio'
import { ThemeToggle } from '@kolkrabbi/kol-framework'
import logomarkUrl from '@kolkrabbi/kol-brand/svg/favicon-01.svg?url'
import { Icon as DSIcon, registerIcons } from '@kolkrabbi/kol-icons'
import { useHomeProps } from './pages/HomePage'
import LibrarySheet from './pages/LibraryPage'
import DevPage from './pages/DevPage'
import CreatePage from './pages/CreatePage'
import { CreateDeskProvider } from './hooks/useCreateDesk'
import ModuleDetailPage from './pages/ModuleDetailPage'
import MirrorPlayground from './pages/MirrorPlayground'
import { SettingsContent, PerformanceContent, AboutContent } from './pages/SettingsPage'
import { KEYBOARD_SHORTCUTS } from './data/shortcuts'
import { transport } from './hooks/transport'
import { useRenderStats, setStatsEnabled } from './hooks/renderStats'
import { useRenderQuality } from './hooks/renderQuality'
import { useAdaptiveQuality } from './hooks/adaptiveQuality'
import { setLibraryApi, getLibraryApi, useLibrarySession, signInLibrary, signOutLibrary, UnauthorizedError } from './hooks/librarySync'
import { client as mediaClient } from './hooks/useMediaLibrary'

/* Where the saves sync to (`api/`, `mirror-api.kolkrabbi.io`). Unset — the `pnpm dev` default without
   `.env.local` — there is no Sign in and everything is localStorage, as before. */
setLibraryApi(import.meta.env.VITE_MIRROR_API)

// Dev-only render surface for scripts/generate-previews.mjs — dropped from
// prod builds entirely. Not instrument navigation (ARCHITECTURE §1).
const DevCapturePage = import.meta.env.DEV ? lazy(() => import('./pages/DevCapturePage')) : null


/* THE APP, as the Hub reads it: the masthead on Home, the mark's title, About
   and the repo links on Settings. The logomark ships from kol-brand — one
   source for the rail and the studio sidebar's nav header. */
const APP = {
  name: 'Mirror',
  subtitle: 'Interactive image distortion playground',
  logomark: logomarkUrl,
  about: <AboutContent />,
  links: [
    { label: 'GitHub', url: 'https://github.com/Tor-Grimsson/kol-mirror' },
    { label: 'Kolkrabbi', url: 'https://mirror.kolkrabbi.io' },
    { label: 'Vercel', url: 'https://vercel.com/tor-grimssons-projects/kol-mirror' },
  ],
}

/* HubSettings' pieces: the Memory section above the Hub's shortcut rows, and
   the PERFORMANCE tab between SETTINGS and ABOUT · REPO */
const SETTINGS = {
  content: <SettingsContent />,
  tabs: [
    { value: 'performance', label: 'PERFORMANCE', title: 'Performance', subtitle: 'Render budget and quality limits', content: <PerformanceContent /> },
  ],
}

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
 * Shell — kol-shell's `AppStudio` (2026-10-14): the Hub plus the workstation's
 * page set, the shape ui.kolkrabbi.io/apps/mixer-hub runs mirror in. Home
 * (`HubHome`), Settings (`HubSettings`), the `S` sheet, `,`, `\` and ⌥1…9 are
 * the Hub's; the Studio routes its slots off `currentPath`. One day on
 * `AppHub` (2026-10-13) ended when mixer-hub showed the Library slot takes
 * mirror's catalogue as props (`useLibraryCatalog`) — the reason given for
 * AppHub was wrong.
 *
 * `NavHiddenContext` is still the seam AppShell provides: the studio hides the
 * rail while its own sidebar is open (MirrorPlayground), and it returns on
 * every route change.
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

/* The rail's two sign-in rows are sentinels: they act, they do not route. */
const SIGN_IN_PATH = '#sign-in'
const MEDIA_PATH = '#media'

/* Sign in · sign out, under the ModalProvider so the KOL prompt serves it on every route (fxr's). */
function useSignIn() {
  const modal = useModal()
  const session = useLibrarySession()
  return async () => {
    if (session) {
      if (await modal.confirm('Sign out of the sync? Saves stay on this device only.', { okLabel: 'Sign out' })) signOutLibrary()
      return
    }
    const pw = await modal.prompt('Password for the mirror sync:', '')
    if (!pw) return
    try {
      const n = await signInLibrary(pw)
      await modal.alert(`Signed in. ${n} ${n === 1 ? 'save' : 'saves'} in the library; saves and memory slots now sync, and Media is in the rail.`)
    } catch (e) {
      await modal.alert(e instanceof UnauthorizedError ? 'Wrong password. Still local only.' : `Sign in failed: ${e?.message || e}`)
    }
  }
}

function Shell() {
  return <ModalProvider><CreateDeskProvider><ShellBody /></CreateDeskProvider></ModalProvider>
}

function ShellBody() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showFps, setShowFps] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  useAdaptiveQuality()
  const { home, walkthrough } = useHomeProps()
  const session = useLibrarySession()
  const signIn = useSignIn()

  /* the pinned foot: Media (signed in — the R2 / B2 stores) and Sign in (when there is an API) above
     Settings. A `shell.bottomItems` replaces AppHub's own list, so Settings is named here too. */
  const bottomItems = [
    ...(session ? [{ icon: 'image', path: MEDIA_PATH, label: 'Media' }] : []),
    ...(getLibraryApi() ? [{ icon: session ? 'cloud' : 'user', path: SIGN_IN_PATH, label: session ? 'Synced · sign out' : 'Sign in' }] : []),
    { icon: 'nav-settings', path: '/settings', label: 'Settings' },
  ]
  const onNavigate = (path) => {
    if (path === SIGN_IN_PATH) return signIn()
    if (path === MEDIA_PATH) return setMediaOpen(true)
    navigate(path)
  }
  /* a pick lands on channel 1 through the studio's own `slot` deep link — the SRC shelf's fields: an
     image is the channel's media, a video is the live-input source pointed at the file */
  const onMediaPick = (url, { kind } = {}) => {
    const src = mediaClient.proxied(url)
    const name = decodeURIComponent(url.split('/').pop())
    setMediaOpen(false)
    navigate('/studio', {
      state: {
        channelIndex: 0,
        slot: kind === 'video'
          ? { variantId: 'gen-live', params: { source: 'file', fileUrl: src, mirrored: 0, animate: true }, customImageName: name }
          : { customImageSrc: src, customRasterSrc: src, customImageName: name },
      },
    })
  }

  /* App-wide keys that are MIRROR'S — Space (the timeline) and F (the frame
     budget). `S`, `,`, `\` and ⌥1…9 are the Hub's since 2026-10-13: its
     `navKeys` walks mark → items → Settings, which is exactly the ⌥1 = HOME
     form the local handler existed for. The studio's keys stay in
     MirrorPlayground. */
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return
      if (e.key === ' ') { if (t.tagName === 'BUTTON') return; e.preventDefault(); transport.toggle() }
      else if (e.key.toLowerCase() === 'f') setShowFps((v) => !v)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      {/* THE STUDIO (2026-10-14, the user's seven points): kol-shell's AppStudio through the local
          `Studio` fork (one seam — a Library with sub-pages). The rail: Mirror · Library · Create ·
          Studio · Dev · Settings. Library is Modules · Patches, monitor's shape, with every module's
          page under it; the Studio is the float arrangement, the monitor a bare frame; Expression is
          a module on the desk, not a row; the Mixer sheet, Tape, Fronts and Icons are gone from the
          rail — the three sketchbooks live under Dev. */}
      <Studio
        app={APP}
        currentPath={location.pathname}
        onNavigate={onNavigate}
        iconComponent={DSIcon}
        shortcuts={KEYBOARD_SHORTCUTS}
        walkthrough={walkthrough}
        /* the Settings masthead toggle — a NODE, because kol-framework is not a peer of kol-shell */
        themeToggle={<ThemeToggle fill="none" tone="sunken" label={false} size="sm" />}
        home={home}
        library={{
          children: (
            <Routes>
              <Route path="/library" element={<LibrarySheet />} />
              {/* a module's own page — monitor's `/library/:moduleType` */}
              <Route path="/library/:id" element={<ModuleDetailPage />} />
            </Routes>
          ),
        }}
        create={{ children: <CreatePage /> }}
        use={{ path: '/studio', label: 'Studio', icon: 'nav-studio', children: <MirrorPlayground /> }}
        pages={[
          { path: '/dev', icon: 'component', label: 'Dev', children: <DevPage /> },
        ]}
        settings={SETTINGS}
        /* `drawer` below 768, not the Hub's phone bar — the bar and the studio's bottom sheet would
           both own the phone's bottom edge */
        shell={{ touch: 'drawer', bottomItems }}
      />
      {/* outside the Hub so F works on every route, Home and Settings included */}
      {showFps && <FpsMeter />}
      <MediaLibrary variant="picker" open={mediaOpen} client={mediaClient} accept={['image', 'video']} onClose={() => setMediaOpen(false)} onSelect={onMediaPick} />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {DevCapturePage && (
          <Route path="/dev/capture" element={<Suspense fallback={null}><DevCapturePage /></Suspense>} />
        )}
        {/* the Studio routes itself off `currentPath` — one catch-all hands it every other path */}
        <Route path="*" element={<Shell />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
