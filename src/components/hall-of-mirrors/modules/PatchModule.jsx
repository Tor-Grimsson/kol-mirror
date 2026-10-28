import { useState } from 'react'
import Dropdown from '@kolkrabbi/kol-component/molecules/Dropdown'
import { useLibrary, exportEntry, importEntry, removeFromLibrary } from '../../../hooks/useLibraryStore'
import { DeskModule, ModuleFooter, ModuleBack, ModuleAction } from './ModuleFrame'

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

  const [flipped, setFlipped] = useState(false)
  const save = () => { if (name.trim()) { api?.save(name.trim()); setName('') } }

  /* THE STANDARD (plan 12): the header says how much is wired (monitor's "{n} cables" readout); the body is the
     patch you hold — the picker and its verbs as the text-button row; the footer's PRESET · FILE tabs carry the
     naming and the file verbs (monitor's split verbatim: a Preset lives in the library, a File on disk); the back
     holds the file notes. No jacks — the patch module patches nothing itself. */
  return (
    <DeskModule
      width={320}
      /* storage has no off (plan 16 W5): the lamp says a cable is patched into the master, and is not a switch */
      power={{ on: patched > 0, title: patched ? `${patched} in` : 'Nothing patched' }}
      head={<span className="text-fg-96">Patch</span>}
      headRight={<span className="kol-helper-10 text-fg-32">{patched}/{(master?.inputs || CLEARED_INPUTS).length} in</span>}
      flipped={flipped}
      onFlip={() => setFlipped((v) => !v)}
      back={(
        <ModuleBack>
          <span className="kol-mono-12 text-fg-64">
            Export writes the patch selected on the Preset tab. Import reads a
            patch file onto the desk and keeps it in the library.
          </span>
          <span className="kol-mono-12 text-fg-32">
            Uploaded images and recorded takes are not carried — a patch
            reloads against the default source.
          </span>
        </ModuleBack>
      )}
      actions={(
        <>
          <ModuleAction dim={!selected} onClick={() => selected && api?.load(selected)}><span className="uppercase">Load</span></ModuleAction>
          <ModuleAction dim={!patched} onClick={() => patched && api?.clear()} title="Pull the master input cables — the channels stay loaded"><span className="uppercase">Clear</span></ModuleAction>
          {/* Delete is only ever offered for a USER save. `useLibrary` returns presets and saves in one list, and
              `removeFromLibrary` filters the saved half — aiming it at a preset silently does nothing. */}
          {selected && !selected.preset && (
            <ModuleAction dim onClick={() => { removeFromLibrary(selected.id); setCurrent(null) }}>Delete “{selected.name}”</ModuleAction>
          )}
        </>
      )}
      footer={(
        <ModuleFooter
          width={320}
          tabs={[{ value: 'preset', label: 'preset' }, { value: 'file', label: 'file' }]}
          value={tab}
          onChange={setTab}
          readout={<span className="text-fg-24">{channels.filter((c) => c.variantId).length}/{channels.length} channels loaded</span>}
        >
          {tab === 'preset' && (
            /* Save needs a NAME, so it is a row and not a button. An unnamed patch in a list of patches is the same
               problem as no list. */
            <div className="flex items-center justify-between gap-2" style={{ height: 24 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                placeholder="Patch name"
                className="kol-helper-12 text-fg-96 bg-surface-secondary px-2 flex-1 min-w-0"
                style={{ height: 24, border: 'none', outline: 'none', borderRadius: 2, fontFamily: 'var(--kol-font-family-mono)' }}
              />
              <ModuleAction dim={!name.trim()} onClick={save}><span className="uppercase">Save</span></ModuleAction>
            </div>
          )}
          {tab === 'file' && (
            <div className="flex items-center justify-between" style={{ height: 24 }}>
              <ModuleAction dim={!selected} onClick={() => selected && exportEntry(selected)} title={selected ? `Write ${selected.name} to a .json file` : 'Select a patch on the Preset tab first'}><span className="uppercase">Export</span></ModuleAction>
              <ModuleAction
                onClick={() => importEntry().then((e) => {
                  /* `importEntry` adds ANY library kind — an expression file would land in the library and return
                     here as a non-patch. Load only what the desk can actually take. */
                  if (e?.kind === 'patch') { setCurrent(e.id); api?.load(e) }
                })}
              ><span className="uppercase">Import</span></ModuleAction>
            </div>
          )}
        </ModuleFooter>
      )}
    >
      {/* No `placeholder` — the empty
          state has to be a real branch. */}
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
    </DeskModule>
  )
}
