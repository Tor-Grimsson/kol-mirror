import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { StudioCreate, StudioCreateAction } from '@kolkrabbi/kol-shell'
import { Icon } from '../components/icons/index.js'
import ModuleFront from '../components/hall-of-mirrors/ModuleFront'
import PatchTableOverlay from '../components/hall-of-mirrors/PatchTableOverlay.jsx'
import usePersistedState from '../hooks/usePersistedState'
import { MODULE_REGISTRY, KINDS, MODULE_HEIGHT } from '../data/moduleRegistry.js'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState.js'
import { useCreateDesk } from '../hooks/createDeskContext'
import { findVariant, getDefaultParams } from '../data/mirrorVariants.js'
import { getDefaultCanvasFxParams } from '../hooks/useCanvasFx.js'
import { useShipped, entryOf } from './shipped.jsx'

/**
 * CreatePage — `/create` ON `StudioCreate` (user 2026-10-24: *"why is patches still not following the system … same
 * in row, missing fields"* · *"WHY DID THE PAGEHEADER CHANGE"* · *"wrong row item · wrong grid item"*). Mirror ran its
 * own copy of monitor's page — a mono masthead, the old catalog rows and cards, its own grid — so it drifted from
 * studio-hub on every one. The page is kol-shell's now, as studio-hub's is: the display masthead (editable, the pencil
 * in the filter row), the one filter row with MIXER ⇄ MODULES, the `app` part card and row with Insert, the desk on
 * the studio canvas under the whole-page dot grid, the bottom bar with the zoom readout. What stays Mirror's is the
 * MODEL — the registry's own `add` verb, the desk held in `CreateDeskProvider` above the routes, the patch table — and
 * the three bar actions. The old page is in `_tmp/2026-10-24-create-on-studiocreate/`.
 *
 * WHAT YOU PLACE: `MODULE_REGISTRY`'s addable entries — every variant, generator and FX unit with its own `add` verb
 * (2026-09-02; the desk's furniture — Master, Routing, Playback — and the strip's tabs are not modules).
 */

const MODULE_FILTER_GROUPS = [
  { label: 'Kind', key: 'kindLabel', stack: true, values: KINDS },
  { label: 'Group', key: 'group', values: [...new Set(MODULE_REGISTRY.map((m) => m.group))].sort() },
]

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mixerName, setMixerName] = usePersistedState('createMixerName', 'Untitled')
  const [mixerDescription, setMixerDescription] = usePersistedState('createMixerDescription', 'Design a new mixer')
  const [page, setPage] = useState('case')
  const [patchTable, setPatchTable] = useState(false)
  const [showCase, setShowCase] = useState(true)
  const [view, setView] = useState({ zoom: 1, x: 0, y: 0 })

  /* the desk lives in `CreateDeskProvider`, above the route group, so it survives the trip to a module page and back */
  const { channels, setChannels, placed, setPlaced, master, setMaster, clear } = useCreateDesk()

  const [draggingModule, setDraggingModule] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const justDraggedRef = useRef(false)

  const patchChannel = (i, patch) => setChannels((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)))

  /* a unit is placeable unless it is one-per-desk and already down */
  const canPlace = (m) => !!m.add && !(m.onePerDesk && placed.has(m.id))

  /* THE REGISTRY'S OWN VERB. Every entry carries `add(api)` and the api is the desk's — the palette has run on this
     contract since 2026-08-28 and never had to know what kind of thing it was adding. */
  const placeApi = useMemo(() => ({
    addChannel: () => setChannels((cs) => [...cs, { ...EMPTY_CHANNEL, enabled: true }]),
    loadVariant: (variantId) => setChannels((cs) => {
      const def = findVariant(variantId)
      const params = def?.controls ? getDefaultParams(def.controls) : {}
      const free = cs.findIndex((c) => !c.variantId)
      const entry = { variantId, params, enabled: true, name: def ? `${def.title}` : variantId }
      if (free < 0) return [...cs, { ...EMPTY_CHANNEL, ...entry }]
      return cs.map((c, i) => (i === free ? { ...c, ...entry } : c))
    }),
    addCanvasFx: (fxId) => setChannels((cs) => {
      if (!cs.length) return [{ ...EMPTY_CHANNEL, enabled: true, canvasFx: [{ type: fxId, enabled: true, params: getDefaultCanvasFxParams(fxId) }] }]
      const i = cs.length - 1
      return cs.map((c, n) => (n === i
        ? { ...c, canvasFx: [...(c.canvasFx || []), { type: fxId, enabled: true, params: getDefaultCanvasFxParams(fxId) }] }
        : c))
    }),
    placeUnit: (entryId) => setPlaced((s) => (s.has(entryId) ? s : new Set([...s, entryId]))),
    patchToMaster: () => setMaster((m) => {
      const inputs = [...(m.inputs || [null, null, null])]
      const free = inputs.indexOf(null)
      if (free >= 0) inputs[free] = Math.max(0, channels.length - 1)
      return { ...m, inputs }
    }),
  }), [channels.length, setChannels, setMaster, setPlaced])

  /* Monitor's `addModule`: place it, then SHOW you where it went */
  const addModule = (m) => {
    if (!canPlace(m)) return
    m.add(placeApi)
    setPage('case')
  }

  const removeChannel = (i) => setChannels((cs) => cs.filter((_, j) => j !== i))
  const removePlaced = (id) => setPlaced((s) => { const n = new Set(s); n.delete(id); return n })

  /* Monitor's `handleModuleDragStart`, mechanics intact: a finger on a row SCROLLS, INSERT is the touch action */
  const handleModuleDragStart = (m, e) => {
    if (e.pointerType === 'touch' || !canPlace(m)) return
    const startX = e.clientX
    const startY = e.clientY
    let started = false
    const onMove = (me) => {
      if (!started && Math.abs(me.clientX - startX) + Math.abs(me.clientY - startY) > 8) {
        started = true
        setDraggingModule(m)
        setPage('case')
      }
      if (started) setDragPos({ x: me.clientX, y: me.clientY })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (started) {
        justDraggedRef.current = true
        addModule(m)
        setDraggingModule(null)
        requestAnimationFrame(() => { justDraggedRef.current = false })
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  /* The studio receives channels as a straight merge — same shape, no translation. `null` skips a strip this page never filled. */
  const outgoing = useMemo(() => channels.map((c) => (c.variantId || c.enabled ? c : null)), [channels])
  const count = channels.length + placed.size
  const openInStudio = () => navigate('/studio', { state: { slots: outgoing } })

  /* ARRIVING WITH A MODULE. The module page's `Add to Create` navigates here with `state.add` = a registry id; run that
     entry's own `add` verb once per navigation (keyed on `location.key`, cleared with a `replace`). */
  const addedKeyRef = useRef(null)
  useLayoutEffect(() => {
    const id = location.state?.add
    if (!id || addedKeyRef.current === location.key) return
    addedKeyRef.current = location.key
    const entry = MODULE_REGISTRY.find((m) => m.id === id)
    if (entry?.add) entry.add(placeApi)
    navigate('/create?from=create', { replace: true })
  }, [location.key, location.state, placeApi, navigate])

  /* `placed` holds registry ids; the canvas needs the entries themselves — each one's `front` is what `ModuleFront` draws */
  const placedList = [...placed].map((pid) => MODULE_REGISTRY.find((m) => m.id === pid)).filter(Boolean)

  /* THE PARTS ARE THE ONE CARD (user 2026-10-24: every card the same fields and icons — there is no part card): the
   * registry's addable units as the Library's files, with their verbs; Insert is StudioCreate's; a click opens the page */
  const { addable, card } = useShipped()
  const partCard = (f) => { const c = card(f); return { ...c, onClick: () => { if (justDraggedRef.current) return; c.onClick() } } }

  return (
    <>
      <StudioCreate
        header={{ title: mixerName, subtitle: mixerDescription, onTitleChange: setMixerName, onSubtitleChange: setMixerDescription }}
        parts={addable}
        partGroups={MODULE_FILTER_GROUPS}
        toCard={partCard}
        onPlace={(f) => { const m = entryOf(f); if (m) addModule(m) }}
        onPartPointerDown={(f, e) => { const m = entryOf(f); if (m) handleModuleDragStart(m, e) }}
        labels={{ case: 'MIXER', parts: 'MODULES', partsTitle: 'All Modules', caseTitle: 'Mixer' }}
        caseCount={count}
        showCase={showCase}
        page={page}
        onPageChange={setPage}
        view={view}
        onViewChange={setView}
        caseActions={(
          <>
            <StudioCreateAction icon="flip-vertical" label="Patch table" pressed={patchTable} onClick={() => channels.length && setPatchTable((v) => !v)} />
            <StudioCreateAction icon="grid" label="Case preview" pressed={showCase} onClick={() => setShowCase((v) => !v)} />
            <StudioCreateAction icon="x" label="Clear the mixer" onClick={clear} />
          </>
        )}
        caseLink={{ label: 'Open in Studio', onClick: () => channels.length && openInStudio() }}
      >
        {/* THE DESK: every placed module drawn by `ModuleFront` — the same components the studio mounts — and an empty
          * slot footprint at the end. EVERY MODULE IS `MODULE_HEIGHT` TALL (the constant and the reason live in
          * `moduleRegistry.js`). */}
        <div className="flex" style={{ gap: 8, padding: 8, alignItems: 'flex-start' }}>
          {channels.map((c, i) => (
            <div key={`ch-${i}`} className="flex" style={{ height: MODULE_HEIGHT }}>
              <ModuleFront
                id="channel"
                index={i}
                channel={c}
                channels={channels}
                master={master}
                onChannelUpdate={patchChannel}
                onEdit={() => setPage('parts')}
                onRemove={() => removeChannel(i)}
              />
            </div>
          ))}
          {placedList.map((m) => (
            <div key={m.id} className="relative flex" style={{ height: MODULE_HEIGHT }}>
              <ModuleFront
                front={m.front}
                id={m.front.id}
                channels={channels}
                master={master}
                onChannelUpdate={patchChannel}
                onMasterChange={(patch) => setMaster((mm) => ({ ...mm, ...patch }))}
              />
              <button
                type="button"
                aria-label="Remove module"
                onClick={() => removePlaced(m.id)}
                className="absolute text-oq-32 hover:text-oq-96 cursor-pointer"
                style={{ top: 6, right: 6, background: 'none', border: 'none', padding: 4, lineHeight: 0 }}
              >
                <Icon name="x" size={12} />
              </button>
            </div>
          ))}
          {/* MONITOR'S EMPTY ROW — empty space is visible furniture: a strip's width, the desk's border and surface */}
          <button
            type="button"
            onClick={() => setPage('parts')}
            className="flex flex-col items-center justify-center border border-fg-08 bg-surface-tertiary text-fg-32 hover:text-fg-64 cursor-pointer shrink-0"
            style={{ width: 320, height: MODULE_HEIGHT, borderRadius: 4, gap: 8 }}
          >
            <Icon name="plus" size={20} />
            <span className="kol-mono-12">{count === 0 ? 'Empty — add a module' : 'Add a module'}</span>
          </button>
        </div>
      </StudioCreate>

      <PatchTableOverlay
        open={patchTable}
        onClose={() => setPatchTable(false)}
        patch={{ channels, master }}
        onApply={(next) => { setChannels(next.channels); setMaster(next.master) }}
      />

      {draggingModule && (
        <div className="fixed pointer-events-none kol-helper-12 text-fg-96" style={{ left: dragPos.x + 12, top: dragPos.y - 12, zIndex: 'var(--kol-z-tooltip)', background: 'var(--kol-surface-primary)', border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', padding: '4px 8px' }}>
          {draggingModule.name}
        </div>
      )}
    </>
  )
}
