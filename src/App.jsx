import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ModalProvider, useModal } from '@kolkrabbi/kol-component'
import { AppStudio } from '@kolkrabbi/kol-shell'
import { Icon as DSIcon } from '@kolkrabbi/kol-icons'
import { useHomeProps } from './pages/HomePage'
import LibrarySheet from './pages/LibraryPage'
import WideOnly from './components/WideOnly'
import Tape from './pages/dev/Tape'
import Fronts from './pages/dev/Fronts'
import Icons from './pages/dev/Icons'
import ConsoleSkin from './pages/dev/Console'
import CreatePage from './pages/CreatePage'
import { CreateDeskProvider } from './hooks/useCreateDesk'
import ModuleDetailPage from './pages/ModuleDetailPage'
import PatchDetailPage from './pages/PatchDetailPage'
import MirrorPlayground from './pages/MirrorPlayground'
import { ABOUT, LINKS, DOCS, useSettings } from './pages/SettingsPage.jsx'
import { KEYBOARD_SHORTCUTS } from './data/shortcuts'
import { transport } from './hooks/transport'
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
   and the repo links on Settings. The logomark is Mirror's own favicon
   (`public/svg/favicon.svg`) — one source for the rail and the studio sidebar's nav header. */
const APP = {
  name: 'Mirror',
  subtitle: 'Interactive image distortion playground',
  logomark: '/svg/favicon.svg',
  about: ABOUT,
  links: LINKS,
  docs: DOCS,
  /* dark by default (user 2026-10-24) — the rail's reset and the toggle's system choice land here, not on the OS */
  defaultTheme: 'dark',
}

const DEV_TABS = [
  { value: 'tape', label: 'Tape', content: <Tape /> },
  { value: 'fronts', label: 'Fronts', content: <WideOnly what="The front sketchbook"><Fronts /></WideOnly> },
  { value: 'icons', label: 'Icons', content: <WideOnly what="The icon sheet"><Icons /></WideOnly> },
  { value: 'console', label: 'Console', content: <WideOnly what="The console skin"><ConsoleSkin /></WideOnly> },
]

/**
 * Shell — kol-shell's `AppStudio` (2026-10-14): the Hub plus the workstation's
 * page set, the shape ui.kolkrabbi.io/apps/mixer-hub runs mirror in. Home
 * (`HubHome`), Settings (`HubSettings`), the `S` sheet, `,`, `\` and ⌥1…9 are
 * the Hub's; the Studio routes its slots off `currentPath`. One day on
 * `AppHub` (2026-10-13) ended when mixer-hub showed the Library slot takes
 * mirror's catalogue as props (`useLibraryCatalog`) — the reason given for
 * AppHub was wrong.
 *
 * The studio's sidebar is a right-edge Rail since plan 13 § 2.3, so it no longer
 * hides the shell's rail (`NavHiddenContext`) while it is open.
 */
/* Sign in · sign out — the Hub asks the password or the sign-out confirm in the DS dialog itself, then
   hands `onPress(password)` or `onPress(null)` here, under the ModalProvider (fxr's). */
function useSignIn() {
  const modal = useModal()
  return async (password) => {
    if (password == null) { signOutLibrary(); return }
    try {
      const n = await signInLibrary(password)
      await modal.alert(`Signed in. ${n} ${n === 1 ? 'save' : 'saves'} in the library; saves and memory slots now sync, and Media is in the rail.`)
    } catch (e) {
      await modal.alert(e instanceof UnauthorizedError ? 'Wrong password. Still local only.' : `Sign in failed: ${e?.message || e}`)
    }
  }
}

/* `/library/<id>` was a module's page before the patch/module slugs — it redirects, so nothing bookmarked breaks */
function LegacyModuleRedirect() {
  const { id } = useParams()
  return <Navigate to={`/library/module/${id}`} replace />
}

function Shell() {
  return <ModalProvider><CreateDeskProvider><ShellBody /></CreateDeskProvider></ModalProvider>
}

function ShellBody() {
  const location = useLocation()
  const navigate = useNavigate()
  useAdaptiveQuality()
  const { home, walkthrough } = useHomeProps()
  const session = useLibrarySession()
  const onPress = useSignIn()
  const settings = useSettings()

  /* a pick lands on channel 1 through the studio's own `slot` deep link — the SRC shelf's fields: an
     image is the channel's media, a video is the live-input source pointed at the file */
  const onMediaPick = (url, { kind } = {}) => {
    const src = mediaClient.proxied(url)
    const name = decodeURIComponent(url.split('/').pop())
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
      /* Space is the transport's even with a button focused — after any click on
         the desk one is, so the old `BUTTON` bail-out made Space dead most of the
         time (user 2026-10-15). The keyup half below stops the browser
         activating that button as well; Enter still activates it. */
      if (e.key === ' ') { e.preventDefault(); transport.toggle() }
      /* ↑ / ↓ — the head to start / end (user 2026-10-15). Only an arrow nobody
         else claimed: the recorder's trim keys, the palette and the scope's
         fields all `preventDefault`, and they run after this listener, so the
         check waits for the dispatch to finish. */
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const up = e.key === 'ArrowUp'
        queueMicrotask(() => { if (!e.defaultPrevented) (up ? transport.home() : transport.end()) })
      }
      /* F is the KOL canvas's framerate chip now (plan 13 § 1.2) — mirror's own frame-budget meter is in _tmp/2026-10-25-plan-13/before/App.jsx */
    }
    const onKeyUp = (e) => { if (e.key === ' ' && e.target.tagName === 'BUTTON') e.preventDefault() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  return (
    <>
      {/* THE STUDIO (2026-10-14, the user's seven points): kol-shell's AppStudio — direct since
          kol-shell 0.64.0 shipped `library.children`; the local fork is retired to
          `_tmp/2026-10-15-studio-fork/`. The rail: Mirror · Library · Create ·
          Studio · Dev · Settings. Library is Modules · Patches, monitor's shape, with every module's
          page under it; the Studio is the float arrangement, the monitor a bare frame; Expression is
          a module on the desk, not a row; the Mixer sheet, Tape, Fronts and Icons are gone from the
          rail — the sketchbooks live under Dev. */}
      <AppStudio
        app={APP}
        currentPath={location.pathname}
        onNavigate={navigate}
        iconComponent={DSIcon}
        shortcuts={KEYBOARD_SHORTCUTS}
        walkthrough={walkthrough}
        home={home}
        library={{
          children: (
            <Routes>
              <Route path="/library" element={<LibrarySheet />} />
              <Route path="/library/patch/:id" element={<PatchDetailPage />} />
              {/* a module's own page — monitor's `/library/:moduleType` */}
              <Route path="/library/module/:id" element={<ModuleDetailPage />} />
              <Route path="/library/:id" element={<LegacyModuleRedirect />} />
            </Routes>
          ),
        }}
        /* `shell: false` — StudioCreate owns its PageShell; `bar: false` — the desk owns the phone's bottom edge */
        create={{ shell: false, bar: false, children: <CreatePage /> }}
        use={{ path: '/studio', label: 'Studio', icon: 'rack-h', children: <MirrorPlayground /> }}
        /* Dev is kol-shell's HubDev (2026-10-22): a dev server's page only, the local DevPage retired to
           `_tmp/2026-10-22-dev-page/`. Expression left it for the studio's Expressions tab. */
        dev={{ subtitle: 'Experiments and reference — nothing here is the app', tabs: DEV_TABS }}
        settings={settings}
        media={session ? { client: mediaClient, accept: ['image', 'video'], onSelect: onMediaPick } : undefined}
        signIn={getLibraryApi() ? { signedIn: !!session, onPress } : undefined}
      />
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
