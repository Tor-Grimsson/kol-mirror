import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLibrary, renameInLibrary, duplicateInLibrary, removeFromLibrary, exportEntry, setThumb } from '../hooks/useLibraryStore'
import { PatchThumb } from '../components/PatchThumb'

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

/* A saved patch as the Hub's file — the files are the saved patches, nothing else: no Empty Studio
   card (Enter Studio is the action), no memory slots (Library has them). The Hub draws RECENT as
   the 12 newest and SAVED as all. */
const patchFile = (e) => ({
  id: e.id,
  name: e.name,
  tags: e.tags ?? [],
  note: e.description ?? '',
  details: [{ label: 'Channels', value: (e.data?.channels || []).filter((c) => c.variantId).length }],
  updatedAt: e.savedAt,
  bytes: new Blob([JSON.stringify(e)]).size,
  cover: <PatchThumb patch={e} />,
})

export function useHomeProps() {
  const navigate = useNavigate()
  const patches = useLibrary('patch').filter((e) => !e.preset)
  const key = patches.map((e) => e.id).join()
  const [files, setFiles] = useState(() => patches.map(patchFile))
  /* re-read when the store's ids change — during render, not in an effect (react-hooks/set-state-in-effect).
     ponytail: a Duplicate or Delete re-seeds from the store, so session-only tags and notes on other
     files reset then; lifts when the store carries tags and description writes */
  const [seeded, setSeeded] = useState(key)
  if (seeded !== key) { setSeeded(key); setFiles(patches.map(patchFile)) }
  const entry = (id) => patches.find((e) => e.id === id)
  const edit = (id, patch) => setFiles((fs) => fs.map((x) => (x.id === id ? { ...x, ...patch } : x)))

  /* the Get started step's actions are data — the Hub draws the DS Buttons and closes the walkthrough
     before each handler; every other step carries the cover the panel draws */
  const walkthrough = WALKTHROUGH_STEPS.map((s) => s.actions
    ? { ...s, actions: [{ label: 'Enter Studio', onClick: () => navigate('/studio') }, { label: 'Browse Library', onClick: () => navigate('/library') }] }
    : { ...s, cover: '/images/stack-hero-800.jpg' })

  const home = {
    files,
    onOpen: (f) => navigate('/studio', { state: { patch: entry(f.id) } }),
    onDownload: (f) => exportEntry(entry(f.id)),
    onRename: (f, name) => { renameInLibrary(f.id, name); edit(f.id, { name, updatedAt: Date.now() }) },
    onDuplicate: (f) => duplicateInLibrary(entry(f.id)),
    onRemove: (f) => removeFromLibrary(f.id),
    onTags: (f, tags) => edit(f.id, { tags }),
    onNote: (f, note) => edit(f.id, { note }),
    /* the rail's Upload image — the store's thumb, so the cover is the user's frame everywhere the patch draws */
    onCover: (f, src) => { setThumb(f.id, src); edit(f.id, { cover: <PatchThumb patch={{ ...entry(f.id), thumb: src }} /> }) },
    action: { label: 'Enter Studio', onClick: () => navigate('/studio') },
  }

  return { home, walkthrough }
}
