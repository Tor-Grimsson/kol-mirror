import { useState, useRef, useMemo, useLayoutEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageShell, PageHeader } from '@kolkrabbi/kol-shell'
import { ContentFilters, ContentCard, ContentRow } from '@kolkrabbi/kol-component'
import { useNarrow } from '../hooks/useNarrow'
import { Icon } from '../components/icons'
import ModuleMedia from '../components/ModuleMedia'
import InfiniteCanvas from '../components/mirror/InfiniteCanvas'
import ModuleFront from '../components/hall-of-mirrors/ModuleFront'
import PatchTableOverlay from '../components/hall-of-mirrors/PatchTableOverlay'
import usePersistedState from '../hooks/usePersistedState'
import { MODULE_REGISTRY, KINDS, MODULE_HEIGHT, slugFor } from '../data/moduleRegistry'
import { EMPTY_CHANNEL } from '../hooks/useMirrorState'
import { useCreateDesk, EMPTY_MASTER } from '../hooks/createDeskContext'
import { findVariant, getDefaultParams } from '../data/mirrorVariants'
import { getDefaultCanvasFxParams } from '../hooks/useCanvasFx'

/**
 * CreatePage — `/create`, its own route, ported from kol-monitor's
 * `src/pages/CreatePage.jsx` (user ruling 2026-09-01, asked four times:
 * *"Create A PAGE. cALLED CREATE"*, and *"REFERENCE MONITOR ALWAYS INSTEAD OF
 * GUESSING"*). Monitor keeps `/create` a route with its own rail row
 * (`App.jsx:29`, `AppLayout.jsx:32`); the 2026-08-28 merge into `/library` is
 * superseded.
 *
 * WHAT YOU PLACE. The mixer's modules (user, 2026-09-01): *"1 a channel module
 * 2 a mixer module 3 matrix module 4 playback/clock 5 generator"*. That is
 * `MIXER_MODULES` — the desk's own catalogue, the same list `/mixer`
 * documents — and NOT sources and effects, which are what a single channel is
 * built from. The first version of this page listed effects; that was the
 * library's pool carried over, and it was the wrong list.
 *
 * WHAT IS PORTED, structure for structure:
 *   · `PageShell mode="fixed"` + `isolation: isolate`, app-tier `fg-02` wash
 *   · `PageHeader size="sm" voice="mono"`, title/subtitle EDITABLE and persisted
 *   · a dot grid over the WHOLE page, under the chrome
 *   · `ContentFilters tone="sunken"`, `viewModeOptions` MIXER ⇄ MODULES, items
 *     emptied on the builder view, `layoutOptions` LIST/GRID default list
 *   · the builder view is THE REAL CONTAINER, empty: monitor's CASE renders its
 *     actual `<RackViewport />`, and `RackRow` paints case + rails so an empty
 *     rack is visible furniture. Here: `InfiniteCanvas` (the studio's own) with
 *     every placed module drawn by `ModuleFront` — the same components the desk
 *     mounts — and an empty slot footprint at the end
 *   · drag-to-place: 8px threshold, the view flips to the builder mid-drag, a
 *     ghost under the pointer, `justDraggedRef` swallowing the post-drag click
 *   · a fixed bottom bar tracking the rail width, `[Open in Studio]` where
 *     monitor has `[Open in Rack]`
 *
 * WHAT DIFFERS — monitor's rows/HP/zoom are physical-rack controls (a 1664px
 * case, U heights). Mirror's modules have no position on a rail, so those have
 * no counterpart and are not faked.
 */

const DOT_GRID = {
  backgroundImage: 'radial-gradient(var(--kol-fg-12) 1px, transparent 1px)',
  backgroundSize: '36px 36px',
}

const MODULE_FILTER_GROUPS = [
  { label: 'Kind', key: 'kind', stack: true, values: KINDS },
  { label: 'Group', key: 'group', values: [...new Set(MODULE_REGISTRY.map((m) => m.group))].sort() },
]

/* THE LIST IS THE REGISTRY (2026-09-02). It was `MIXER_MODULES`, which is a
   documentation catalogue of the desk's PARTS — and by the user's definition
   ("a module is self contained unit i can load into the channel strip") most of
   those are not modules at all: Master, Routing and Playback are the case, and
   Feedback / Canvas FX / Recorder are tabs on a strip. `MODULE_REGISTRY` is the
   list of things that can actually be ADDED — every variant, every generator,
   every FX unit, each with its own `add` verb — which is what monitor's
   `MODULE_DEFS` is to its rack. */
const ADDABLE = MODULE_REGISTRY.filter((m) => m.add)

export default function CreatePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [mixerName, setMixerName] = usePersistedState('createMixerName', 'Untitled')
  const [mixerDescription, setMixerDescription] = usePersistedState('createMixerDescription', 'Design a new mixer')
  const [editingName, setEditingName] = useState(false)
  const titleRef = useRef(null)

  const [view, setView] = useState('mixer')
  const [dots, setDots] = useState(true)
  const [patchTable, setPatchTable] = useState(false)
  /* the canvas's zoom, for the bar's readout — monitor's `− 100 % +` */
  const [zoom, setZoom] = useState(1)
  const [zoomInput, setZoomInput] = useState('100')
  const zoomEditing = useRef(false)
  const canvas = useRef(null)
  const onZoomChange = useCallback((k) => {
    setZoom(k)
    if (!zoomEditing.current) setZoomInput(String(Math.round(k * 100)))
  }, [])
  /* TOUCH. Drag-to-place is gated on `e.pointerType === 'touch'` at the drag
     start (monitor's §4) — a finger on a row scrolls, INSERT places. The card
     wrapper carries no `touch-action`, so the list scrolls under a thumb the
     way monitor's does. `narrow` drives the 70% canvas scale and the card's
     `fit`; it is a WIDTH, matching the fold. */
  const narrow = useNarrow()

  /* THE DESK, EMPTY. `channels` is the same shape the studio holds; `placed`
     is the set of one-per-desk modules (master, matrix, playback) that are on
     it. Nothing pre-made — he never named a count, and *"i could as well just
     load a generator module and nothing else"*. */
  /* KEEPING THE WORK ACROSS A ROUND TRIP (monitor's §6). Keyed on
     `location.key` in a LAYOUT EFFECT, not once per mount:
       · a key seen before = returning (history back lands on the key it left)
         → keep what is on the desk
       · `?insert=<id>` or `?from=create` → keep, and add the one module
       · anything else = a NEW mixer
     A lazy initialiser — what was here — runs once per MOUNT, so tapping the
     Create rung while already on the page was a no-op (same component, new
     key), and returning from a module page rebuilt the desk from scratch. */
  /* the desk lives in `CreateDeskProvider`, above the route group, so it
     survives the trip to a module page and back */
  const { channels, setChannels, placed, setPlaced, master, setMaster, clear } = useCreateDesk()

  const [draggingModule, setDraggingModule] = useState(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const justDraggedRef = useRef(false)

  const patchChannel = (i, patch) => setChannels((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)))

  /* a unit is placeable unless it is one-per-desk and already down */
  const canPlace = (m) => !!m.add && !(m.onePerDesk && placed.has(m.id))

  /* Monitor's `addModule`: place it, then SHOW you where it went — its version
     ends `setView('case')`. A channel module appends a channel; a generator
     appends a channel carrying the first generator variant (a generator IS a
     channel source on this desk); master / matrix / playback land once. */
  /* THE REGISTRY'S OWN VERB. Every entry carries `add(api)` and the api is the
     desk's — the palette has run on this contract since 2026-08-28 and never
     had to know what kind of thing it was adding. `/create` now uses the same
     one instead of a switch over ids, which is what let it "place" things that
     could not be placed. */
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
    /* A UNIT ON THE DESK — a registry id, so `placed` holds anything with a
       front: the desk's furniture AND the standalone FX modules. It was a set
       of bare desk ids, which is why an FX unit had nowhere to land except
       inside a channel's chain. A repeat is a no-op, which is what a palette
       wants; `onePerDesk` is enforced by `canPlace` before we get here. */
    placeUnit: (entryId) => setPlaced((s) => (s.has(entryId) ? s : new Set([...s, entryId]))),
    patchToMaster: () => setMaster((m) => {
      const inputs = [...(m.inputs || [null, null, null])]
      const free = inputs.indexOf(null)
      if (free >= 0) inputs[free] = Math.max(0, channels.length - 1)
      return { ...m, inputs }
    }),
  }), [channels.length, setChannels, setMaster, setPlaced])

  const addModule = (m) => {
    if (!canPlace(m)) return
    m.add(placeApi)
    setView('mixer')
  }

  const removeChannel = (i) => setChannels((cs) => cs.filter((_, j) => j !== i))
  const removePlaced = (id) => setPlaced((s) => { const n = new Set(s); n.delete(id); return n })

  /* Monitor's `handleModuleDragStart`, mechanics intact. */
  const handleModuleDragStart = (m, e) => {
    /* `pointerType`, not `useCoarsePointer()` — monitor's §4 and the narrower
       test: a finger on a row SCROLLS, and INSERT is the touch action. A
       coarse-pointer machine with a mouse attached keeps drag-to-place. */
    if (e.pointerType === 'touch' || !canPlace(m)) return
    const startX = e.clientX
    const startY = e.clientY
    let started = false
    const onMove = (me) => {
      if (!started && Math.abs(me.clientX - startX) + Math.abs(me.clientY - startY) > 8) {
        started = true
        setDraggingModule(m)
        setView('mixer')
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

  /* The studio receives channels as a straight merge — same shape, no
     translation. `null` skips a strip this page never filled. */
  const outgoing = useMemo(() => channels.map((c) => (c.variantId || c.enabled ? c : null)), [channels])
  const count = channels.length + placed.size
  const openInStudio = () => navigate('/studio', { state: { slots: outgoing } })

  /* ARRIVING WITH A MODULE. The module page's `Add to Create` navigates here
     with `state.add` = a registry id; run that entry's own `add` verb once per
     navigation. Keyed on `location.key` and cleared with a `replace`, so a
     reload does not add it twice (monitor §6). */
  const addedKeyRef = useRef(null)
  useLayoutEffect(() => {
    const id = location.state?.add
    if (!id || addedKeyRef.current === location.key) return
    addedKeyRef.current = location.key
    const entry = MODULE_REGISTRY.find((m) => m.id === id)
    if (entry?.add) entry.add(placeApi)
    navigate('/create?from=create', { replace: true })
  }, [location.key, location.state, placeApi, navigate])

  const nameInput = (value, onChange, cls, extra) => (
    <input
      ref={cls.includes('heading') ? titleRef : undefined}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditingName(false)}
      onKeyDown={(e) => { if (e.key === 'Enter') setEditingName(false) }}
      readOnly={!editingName}
      className={`block p-0 bg-transparent outline-none ${cls}`}
      style={{
        width: `${String(value).length + 1}ch`,
        cursor: editingName ? 'text' : 'default',
        border: 'none',
        boxShadow: editingName ? 'inset 0 -1px 0 var(--kol-fg-12)' : 'none',
        caretColor: editingName ? 'auto' : 'transparent',
        pointerEvents: editingName ? 'auto' : 'none',
        ...extra,
      }}
    />
  )

  /* `placed` holds registry ids; the canvas needs the entries themselves —
     each one's `front` is what `ModuleFront` draws */
  const placedList = [...placed].map((pid) => MODULE_REGISTRY.find((m) => m.id === pid)).filter(Boolean)

  /* the list is a page that SCROLLS, the canvas is FIXED — monitor's §3 */
  return (
    <PageShell mode={view === 'mixer' ? 'fixed' : 'scroll'} className="create-canvas" style={{ '--kol-shell-page-wash': 'var(--kol-fg-02)', position: 'relative', isolation: 'isolate' }}>
      {/* NO `z-index: -1`. Monitor put it on its canvas and it went UNDER its
          own transparent wrappers, killing touch. The rule there: lift the
          chrome, never sink the canvas. So the grid sits at the natural rung
          and the chrome above it is lifted (`.create-canvas` in
          mirror-overrides.css + the header wrapper below). */}
      {dots && <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...DOT_GRID }} />}

      {/* lifted over the canvas, monitor's §3 */}
      <div style={{ position: 'relative', zIndex: 'var(--kol-z-sticky)' }}>
      <PageHeader
        size="sm"
        voice="mono"
        title={nameInput(mixerName, setMixerName, 'text-fg-96 kol-mono-heading-03', { height: '35.2px', lineHeight: '35.2px' })}
        subtitle={nameInput(mixerDescription, setMixerDescription, 'text-fg-48 kol-mono-14', { height: '18px', lineHeight: '18px' })}
      />
      </div>

      {/* `PageShell mode="fixed"` is `height: 100vh; overflow: hidden` and its
          own docstring says "pair with a flex:1 overflow:auto body". Without
          `overflow: auto` here the MODULES grid was clipped at the fold and
          could not be scrolled — the bug the user hit. The canvas box below
          is `flex: 1` inside this, so the MIXER view still fills the column. */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <ContentFilters
          tone="sunken"
          items={view === 'mixer' ? [] : ADDABLE}
          title={view === 'mixer' ? 'Mixer' : 'All Modules'}
          totalCount={view === 'mixer' ? count : ADDABLE.length}
          filterGroups={view === 'mixer' ? [] : MODULE_FILTER_GROUPS}
          showCountOnlyWhenFiltering
          searchKeys={['name', 'kind', 'group', 'detail']}
          headerActions={
            <button
              type="button"
              aria-label="Rename mixer"
              title="Rename mixer"
              className="text-fg-48 hover:text-fg-96 cursor-pointer"
              style={{ background: 'none', border: 'none', padding: 8, lineHeight: 0 }}
              onPointerDown={(e) => {
                e.preventDefault()
                setEditingName((prev) => {
                  if (prev) { titleRef.current?.blur(); return false }
                  requestAnimationFrame(() => titleRef.current?.focus())
                  return true
                })
              }}
            >
              <Icon name="edit" size={16} />
            </button>
          }
          viewModeOptions={[
            { value: 'mixer', label: 'MIXER' },
            { value: 'modules', label: 'MODULES' },
          ]}
          viewMode={view}
          onViewModeChange={setView}
          layoutOptions={view === 'modules' ? [
            { value: 'list', label: 'LIST' },
            { value: 'grid', label: 'GRID' },
          ] : undefined}
          defaultLayout="list"
          renderItem={(items, viewMode, layout) => {
            if (view === 'mixer') {
              return (
                /* THE CONTAINER, on the studio's own canvas. A positioned box
                   with a real height keeps `InfiniteCanvas` inside the content
                   slot (`inset: 0` would otherwise resolve against PageShell).
                   Background-drag pans, wheel zooms about the pointer, and the
                   stage carries `touch-action: none` so a thumb drag is not
                   claimed by the scroller. */
                /* Monitor's `RackViewport.jsx:254`: `flex: 1, minHeight: 0,
                   overflow: hidden, display: grid, placeItems: center` — it
                   clips too, but the rack sits CENTRED and zoom-fitted so you
                   never meet the edge. Mirror's was pinned top-left in a
                   fixed-height box, which is where the clipping showed. */
                /* `overflow: visible` — the canvas is the WHOLE page (the dots
                   already are), so the desk is never cut by this box. Monitor's
                   §3; `InfiniteCanvas` keeps its own `overflow: hidden`. */
                <div style={{ position: 'relative', flex: 1, minHeight: 'calc(100dvh - 300px)', overflow: 'visible' }}>
                  <InfiniteCanvas style={{ position: 'absolute', inset: 0 }} controls={canvas} onZoomChange={onZoomChange} showReset={false}>
                    {/* centred INSIDE the layer — `placeItems` on the stage only
                        centres InfiniteCanvas's own 100% layer, which is why the
                        row sat top-left. The layer is the pan target and must
                        stay full-size; this wrapper fills it and centres the
                        row, monitor's `placeItems: center` one level down. */}
                    {/* `pointer-events: none` on the wrapper, `auto` on the row:
                        InfiniteCanvas starts a pan ONLY when the hit is the
                        stage or its layer (`onBackground`, InfiniteCanvas:51).
                        A full-size wrapper swallowed every background tap, so a
                        thumb on empty canvas hit a nameless div and nothing
                        panned — measured. Modules stay interactive; the space
                        between them reads as the layer again. */}
                    <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
                    {/* EVERY MODULE IS `MODULE_HEIGHT` TALL — fixed, not
                        `stretch` (which is the row's tallest sibling, i.e.
                        responsive) and not content height. The constant and the
                        reason live in `moduleRegistry.js`. */}
                    <div className="flex" style={{ gap: 8, padding: 8, alignItems: 'flex-start', zoom: narrow ? 0.7 : 1, pointerEvents: 'auto' }}>
                      {channels.map((c, i) => (
                        <div key={`ch-${i}`} className="flex" style={{ height: MODULE_HEIGHT }}>
                        <ModuleFront
                          id="channel"
                          index={i}
                          channel={c}
                          channels={channels}
                          master={master}
                          onChannelUpdate={patchChannel}
                          onEdit={() => setView('modules')}
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
                            onMasterChange={(patch) => setMaster((m) => ({ ...m, ...patch }))}
                          />
                          <button
                            type="button"
                            aria-label="Remove module"
                            onClick={() => removePlaced(m.id)}
                            className="absolute text-fg-32 hover:text-fg-96 cursor-pointer"
                            style={{ top: 6, right: 6, background: 'none', border: 'none', padding: 4, lineHeight: 0 }}
                          >
                            <Icon name="x" size={12} />
                          </button>
                        </div>
                      ))}
                      {/* MONITOR'S EMPTY ROW — `RackRow` paints case + rails so
                          empty space is visible furniture. The slot footprint:
                          a strip's width, the desk's border and surface. */}
                      <button
                        type="button"
                        onClick={() => setView('modules')}
                        className="flex flex-col items-center justify-center border border-fg-08 bg-surface-tertiary text-fg-32 hover:text-fg-64 cursor-pointer shrink-0"
                        style={{ width: 320, height: MODULE_HEIGHT, borderRadius: 4, gap: 8 }}
                      >
                        <Icon name="plus" size={20} />
                        <span className="kol-helper-12">{count === 0 ? 'Empty — add a module' : 'Add a module'}</span>
                      </button>
                    </div>
                    </div>
                  </InfiniteCanvas>
                </div>
              )
            }

            /* INSERT + the disc, monitor's list action, now on the grid card
               too — on touch it is the ONLY way in, so it cannot be list-only */
            const insertAction = (m) => (
              <span
                className={`flex items-center gap-2 kol-helper-10 ${canPlace(m) ? 'cursor-pointer text-fg-80' : 'text-fg-32'}`}
                onClick={(e) => { e.stopPropagation(); if (justDraggedRef.current) return; addModule(m) }}
              >
                INSERT
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: canPlace(m) ? 'var(--kol-accent-primary)' : 'var(--kol-fg-12)', flexShrink: 0 }} />
              </span>
            )

            const detail = (m) => (m.front ? m.detail : `${m.detail} — no front yet`)

            if (layout === 'grid') {
              return (
                /* columns by FLOOR, not count (monitor's §4) — 2 at 390 */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 160px), 1fr))', gap: 24, paddingBottom: 96 }}>
                  {items.map((m) => (
                    <div key={m.id} onPointerDown={(e) => handleModuleDragStart(m, e)} style={{ opacity: canPlace(m) ? 1 : 0.4 }}>
                      <ContentCard
                        variant="catalog"
                        /* 0.3 preview scale below the fold, 0.5 above */
                        fit={narrow ? 'compact' : 'natural'}
                        title={m.name}
                        detail={detail(m)}
                        media={<ModuleMedia src={m.preview} contain={m.front?.kind === 'desk'} />}
                        onClick={() => navigate(`/mixer/${slugFor(m)}`)}
                      />
                      {/* INSERT IN ITS OWN STRIP under the card — the user
                          rejected it inside the text plate twice (monitor §4).
                          A card TAP opens the module's page; INSERT places it. */}
                      <div
                        className="bg-surface-primary flex items-center justify-end"
                        style={{ padding: '8px var(--kol-pad-card-md)', marginTop: 1 }}
                      >
                        {insertAction(m)}
                      </div>
                    </div>
                  ))}
                </div>
              )
            }

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 8, paddingBottom: 96 }}>
                {items.map((m) => (
                  <div key={m.id} onPointerDown={(e) => handleModuleDragStart(m, e)}>
                    <ContentRow
                      variant="catalog"
                      title={m.name}
                      detail={detail(m)}
                      actions={insertAction(m)}
                      onClick={() => navigate(`/mixer/${slugFor(m)}`)}
                    />
                  </div>
                ))}
              </div>
            )
          }}
        />

        {/* MONITOR'S BOTTOM ROW (`CreatePage.jsx:275`), matched: left is the zoom
            stepper then the action link, in ONE group; right is icon buttons.
            Mine had `[Open in Studio]` alone at one edge and `[Patch]` floating
            mid-row, which is what the user caught. No plate either — monitor's
            sits straight over the canvas. */}
        <div
          className="fixed flex items-center justify-between"
          style={{
            bottom: 24,
            left: 'calc(var(--kol-shell-rail-width, 0px) + 24px)',
            right: 24,
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex items-center gap-2">
            <span onClick={() => canvas.current?.zoomOut()} className="kol-helper-12 text-fg-48 hover:text-fg-96 cursor-pointer select-none">−</span>
            <input
              type="text"
              inputMode="numeric"
              value={zoomInput}
              onFocus={(e) => { zoomEditing.current = true; e.target.select() }}
              onChange={(e) => setZoomInput(e.target.value)}
              onBlur={() => {
                zoomEditing.current = false
                const v = parseInt(zoomInput, 10)
                if (!isNaN(v)) canvas.current?.setZoom(v / 100)
                else setZoomInput(String(Math.round(zoom * 100)))
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
              className="kol-helper-12 text-fg-64 bg-transparent text-right border-none outline-none"
              style={{ width: 32 }}
            />
            <span className="kol-helper-12 text-fg-32">%</span>
            <span onClick={() => canvas.current?.zoomIn()} className="kol-helper-12 text-fg-48 hover:text-fg-96 cursor-pointer select-none">+</span>
            {zoom !== 1 && (
              <span
                className="kol-helper-12 text-fg-48 hover:text-fg-96 cursor-pointer select-none whitespace-nowrap"
                style={{ marginLeft: 12 }}
                onClick={() => canvas.current?.reset()}
                title="Back to 1:1"
              >
                Reset
              </span>
            )}
            <span
              className={`kol-helper-12 select-none whitespace-nowrap ${channels.length ? 'text-fg-48 hover:text-fg-96 cursor-pointer' : 'text-fg-32'}`}
              style={{ marginLeft: 16 }}
              onClick={() => channels.length && openInStudio()}
            >
              [Open in Studio]
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => channels.length && setPatchTable((v) => !v)}
              title="Patch table"
              className={`cursor-pointer ${channels.length ? 'text-fg-80 hover:text-fg-96' : 'text-fg-32'}`}
              style={{ background: 'none', border: 'none', padding: 8, lineHeight: 0 }}
            >
              <Icon name="flip-y" size={20} />
            </button>
            <button type="button" onClick={() => setDots((v) => !v)} title="Dot grid" className="text-fg-80 hover:text-fg-96 cursor-pointer" style={{ background: 'none', border: 'none', padding: 8, lineHeight: 0, opacity: dots ? 1 : 0.4 }}>
              <Icon name="grid-02" size={20} />
            </button>
            <button type="button" onClick={clear} title="Clear the mixer" className="text-fg-80 hover:text-fg-96 cursor-pointer" style={{ background: 'none', border: 'none', padding: 8, lineHeight: 0 }}>
              <Icon name="x" size={20} />
            </button>
          </div>
        </div>
      </div>

      <PatchTableOverlay
        open={patchTable}
        onClose={() => setPatchTable(false)}
        channels={channels}
        master={master}
        onChannelUpdate={patchChannel}
        onMasterChange={(patch) => setMaster((m) => ({ ...m, ...patch }))}
      />

      {draggingModule && (
        <div className="fixed pointer-events-none kol-helper-12 text-fg-96" style={{ left: dragPos.x + 12, top: dragPos.y - 12, zIndex: 'var(--kol-z-tooltip)', background: 'var(--kol-surface-primary)', border: '1px solid var(--kol-fg-08)', borderRadius: 'var(--kol-radius-xs)', padding: '4px 8px' }}>
          {draggingModule.name}
        </div>
      )}
    </PageShell>
  )
}
