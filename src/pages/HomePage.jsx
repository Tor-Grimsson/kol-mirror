import { useNavigate } from 'react-router-dom'
import { findVariant } from '../data/mirrorVariants'
import Button from '../components/atoms/Button'
import { useLibrary } from '../hooks/useLibraryStore'
import { useLibrarySession } from '../hooks/librarySync'
import { PatchThumb } from './LibraryPage'

/**
 * HomePage — `/`, as the DATA the Hub's `HubHome` renders (kol-shell `AppHub`,
 * 2026-10-13). This page, fxr's and monitor's were the same `CatalogPage`
 * written three times (ShellHomeSystemAdoption, 2026-08-27); the Hub is that
 * page made once, so what is left here is only what is mirror's: the patches
 * under RECENT, the persisted memory slots under SAVED, the
 * walkthrough's five steps, and where the buttons go. `App.jsx` hands
 * `useHomeProps()` to `AppHub home=` / `walkthrough=`; the route itself
 * renders nothing because the Hub owns `/`.
 *
 * The walkthrough is the Hub's: its button follows `actions`, its X closes it,
 * and a step whose `actions` is a FUNCTION receives `close`.
 */

const WALKTHROUGH_STEPS = [
  {
    title: '1. Distort',
    text: [
      'Three halls of distortion — Displacement (SVG turbulence), Movement (GSAP transforms), Copies (WebGL slicing, glitch, kaleidoscope).',
      'Pick a variant, drop in an image or vector, and shape it with the per-variant controls.',
    ],
  },
  {
    title: '2. Mix',
    text: [
      'The Symphony mixer layers three channels with independent FX chains, blend modes, and opacity — plus procedural generators (Noise, Gradient, Pattern, Color Field) as channel sources.',
      'Six send/return buses composite shared processing on top.',
    ],
  },
  {
    title: '3. Route',
    text: [
      'The routing matrix patches any output to any input — channel to channel, bus to channel, bus to bus.',
      'Loops are legal: a cycle reads last frame’s buffer, the classic video-synth feedback trick.',
    ],
  },
  {
    title: '4. Feed back',
    text: [
      'Per-channel feedback accumulates trails — decay sets how fast new frames take over (high decay = short trails), freeze holds the buffer.',
      'Drive any knob with an expression — click its value and type wave(t), rand(), ease(t).',
    ],
  },
  {
    title: '5. Record',
    text: [
      'Arm a channel and capture loops as .webm — trim with I/O marks, frame-step with arrows, freeze a take onto the channel as a video source.',
      'Save favourite states to the 9 memory slots; they persist across sessions.',
    ],
  },
  { title: 'Get started', actions: true },
]

const PREVIEW_SRC = '/images/stack-hero-400.jpg'

const EMPTY_STUDIO = [
  { name: 'empty-studio', title: 'Empty Studio', detail: '3 channels — mixer, buses, routing', src: PREVIEW_SRC, alt: 'Empty Studio' },
]

/* RECENT, fxr's shape (user 2026-10-15: *"this is USER PATCHES, as in ON LOGIN, when
   not logged in then show what was there before"*). Signed in: your patches, newest
   first — the sign-in seed makes that three on a fresh account. Signed out: the one
   Empty Studio card, as it always was. */
const RECENT_FILES = 12
const patchCard = (e) => ({
  name: e.id,
  title: e.name,
  detail: e.description || `${(e.data?.channels || []).filter((c) => c.variantId).length} channels`,
  patch: e,
})

/* Read on every SAVED render, not once per Shell mount: the Shell is mounted
   for the app's whole life, and a slot saved in the studio has to be on Home
   when you come back. Nine rows of JSON — cheaper than the stale card. */
const savedItems = () => {
  let slots = []
  try {
    const raw = localStorage.getItem('mirror-archive')
    if (raw) slots = JSON.parse(raw) || []
  } catch { /* no memory */ }
  return slots.map((slot, i) => ({ slot, i })).filter(({ slot }) => slot).map(({ slot, i }) => ({
    name: `m${i + 1}`,
    title: `M${i + 1} — ${findVariant(slot.variantId)?.title || slot.variantId}`,
    detail: slot.variantId,
    src: slot.imageSrc || PREVIEW_SRC,
    alt: '',
    slotIndex: i,
  }))
}

export function useHomeProps() {
  const navigate = useNavigate()
  const signedIn = !!useLibrarySession()
  const saved = useLibrary('patch').filter((e) => !e.preset)
  const recent = signedIn
    ? [...saved].sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0)).slice(0, RECENT_FILES).map(patchCard)
    : EMPTY_STUDIO

  const illustration = <img src="/images/stack-hero-800.jpg" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
  const walkthrough = WALKTHROUGH_STEPS.map((s) => s.actions
    ? {
        ...s,
        actions: (close) => (
          <>
            <Button tone="grey" size="md" onClick={() => { close(); navigate('/studio') }}>Enter Studio</Button>
            <Button tone="grey" size="md" onClick={() => { close(); navigate('/library') }}>Browse Library</Button>
          </>
        ),
      }
    : { ...s, illustration })

  const home = {
    items: (view) => (view === 'recent' ? recent : savedItems()),
    filtersTitle: 'Studio',
    toCard: (item) => ({
      key: item.name,
      title: item.title,
      detail: item.detail,
      media: item.patch ? <PatchThumb patch={item.patch} /> : <img src={item.src} alt={item.alt} />,
      onClick: item.patch
        ? () => navigate('/studio', { state: { patch: item.patch } })
        : item.slotIndex != null
          ? () => navigate('/studio', { state: { slotIndex: item.slotIndex } })
          : () => navigate('/studio'),
    }),
    actions: <Button tone="grey" size="md" onClick={() => navigate('/studio')}>Enter Studio</Button>,
  }

  return { home, walkthrough }
}
