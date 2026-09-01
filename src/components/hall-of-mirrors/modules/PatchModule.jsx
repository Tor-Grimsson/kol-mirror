import { useState } from 'react'
import Dropdown from '../../molecules/Dropdown'
import { useLibrary, exportEntry, importEntry, removeFromLibrary } from '../../../hooks/useLibraryStore'

/**
 * PatchModule — the whole desk out and back, as a front panel.
 *
 * kol-monitor's `PatchModule` (6HP, `modules/utility/`) is the reference: two
 * tabs, Preset and File, because saving to a named slot and writing a file are
 * different acts and a single row of six buttons hides that.
 *
 * Nothing here is new machinery. `savePatch` / `loadPatch` have been on
 * `useMirrorState` since patches existed, `serializePatch` / `applyPatch` /
 * `buildPatchEntry` are `patchFile.js` (which has its own test), and
 * `useLibrary` / `exportEntry` / `importEntry` are the library store's. What was
 * missing was a face: the patch-name input and an `[Import]` / `[Library]` pair
 * sat at the BOTTOM OF THE SIDEBAR's symphony section, three scrolls under the
 * desk they act on, while export happened somewhere else entirely — on the
 * Library page. This is those, gathered, where the instrument is.
 *
 * Why a desk module and not a channel-strip shelf tab (user question,
 * 2026-09-01): a patch straddles channels AND master AND canvas — `master.inputs`
 * is half of every cable — so it is a desk-level object. A strip is per-channel,
 * and per-channel saving already exists and is a different thing: the nine
 * archive slots.
 */

/* CLEAR PULLS THE CABLES, it does not empty the desk. Monitor's `handleClear` is
   `routing.loadPatch([])` — the modules stay in the rack, the patch cables go.
   Mirror's cables are `master.inputs`, which `patchFile.js` names outright as
   "the INPUT SLOTS that are the patch itself". Wiping the channels too would be
   a different, much larger verb wearing a four-letter label. */
const CLEARED_INPUTS = [null, null, null]

export default function PatchModule({ api, master, channels = [] }) {
  const [tab, setTab] = useState('preset')
  const [name, setName] = useState('')
  const [current, setCurrent] = useState(null)

  const patches = useLibrary('patch')
  const selected = patches.find((p) => p.id === current) ?? null
  const patched = (master?.inputs || []).filter((i) => i != null).length

  const btn = 'flex-1 kol-helper-10 text-fg-64 hover:text-fg-96 border border-fg-08 rounded-sm cursor-pointer select-none disabled:text-fg-24 disabled:cursor-default'

  return (
    <div
      className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08"
      style={{ width: '280px', borderRadius: '4px', height: '100%' }}
    >
      {/* Header — the name and what is currently wired, on monitor's
          "{n} cables" readout. A patch module whose whole subject is the
          cabling should say how much of it there is. */}
      <div className="flex items-center justify-between kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
        <span className="text-fg-96">Patch</span>
        <span className="kol-helper-10 text-fg-32">{patched}/{(master?.inputs || CLEARED_INPUTS).length} in</span>
      </div>

      <div className="flex flex-col gap-3 p-3" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* The two tabs, monitor's split verbatim: a Preset lives in the
            library, a File lives on disk. */}
        <div className="flex gap-3 shrink-0">
          {['preset', 'file'].map((t) => (
            <span
              key={t}
              onClick={() => setTab(t)}
              className={`kol-helper-10 cursor-pointer select-none uppercase ${tab === t ? 'text-fg-96' : 'text-fg-32 hover:text-fg-64'}`}
            >{t}</span>
          ))}
        </div>

        {tab === 'preset' && (
          <>
            {/* No `placeholder` — `molecules/Dropdown` lists it in `DROPPED`,
                so passing one is a dead prop and the empty state has to be a
                real branch. */}
            {patches.length > 0 ? (
              <Dropdown
                options={patches.map((p) => ({ value: p.id, label: p.name }))}
                value={current}
                onChange={setCurrent}
                className="w-full"
              />
            ) : (
              <span className="kol-helper-10 text-fg-32">No patches yet — name one below and save.</span>
            )}

            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                className={btn}
                style={{ height: 22 }}
                disabled={!selected}
                onClick={() => selected && api?.load(selected)}
              >Load</button>
              <button
                type="button"
                className={btn}
                style={{ height: 22 }}
                disabled={!patched}
                onClick={() => api?.clear()}
                title="Pull the master input cables — the channels stay loaded"
              >Clear</button>
            </div>

            {/* Save needs a NAME, so it is a row and not a button. An unnamed
                patch in a list of patches is the same problem as no list. */}
            <div className="flex items-center gap-2 shrink-0" style={{ height: 22 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && name.trim()) { api?.save(name.trim()); setName('') }
                }}
                placeholder="Patch name"
                className="kol-helper-10 text-fg-96 bg-surface-tertiary px-2 flex-1 min-w-0"
                style={{ height: 20, border: 'none', outline: 'none', borderRadius: 2, fontFamily: 'var(--kol-font-family-mono)' }}
              />
              <span
                className={`kol-helper-10 select-none shrink-0 ${name.trim() ? 'text-fg-96 cursor-pointer hover:text-accent-primary' : 'text-fg-32'}`}
                onClick={() => { if (name.trim()) { api?.save(name.trim()); setName('') } }}
              >[Save]</span>
            </div>

            {/* Delete is only ever offered for a USER save. `useLibrary` returns
                presets and saves in one list, and `removeFromLibrary` filters
                the saved half — so aiming it at a preset silently does nothing,
                which is worse than not offering it. */}
            {selected && !selected.preset && (
              <span
                className="kol-helper-10 text-fg-32 hover:text-[#e74c3c] cursor-pointer select-none shrink-0"
                onClick={() => { removeFromLibrary(selected.id); setCurrent(null) }}
              >[Delete “{selected.name}”]</span>
            )}
          </>
        )}

        {tab === 'file' && (
          <>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                className={btn}
                style={{ height: 22 }}
                disabled={!selected}
                onClick={() => selected && exportEntry(selected)}
                title={selected ? `Write ${selected.name} to a .json file` : 'Select a patch on the Preset tab first'}
              >Export</button>
              <button
                type="button"
                className={btn}
                style={{ height: 22 }}
                onClick={() => importEntry().then((e) => {
                  /* `importEntry` adds ANY library kind — an expression file
                     would land in the library and return here as a non-patch.
                     Load only what the desk can actually take. */
                  if (e?.kind === 'patch') { setCurrent(e.id); api?.load(e) }
                })}
              >Import</button>
            </div>
            <div className="kol-helper-10 text-fg-32" style={{ lineHeight: '150%' }}>
              Export writes the patch selected on the Preset tab. Import reads a
              patch file onto the desk and keeps it in the library.
            </div>
            <div className="kol-helper-10 text-fg-24" style={{ lineHeight: '150%' }}>
              Uploaded images and recorded takes are not carried — a patch
              reloads against the default source.
            </div>
          </>
        )}

        <div className="flex-1" />
        <span className="kol-helper-10 text-fg-24 shrink-0">
          {channels.filter((c) => c.variantId).length}/{channels.length} channels loaded
        </span>
      </div>
    </div>
  )
}
