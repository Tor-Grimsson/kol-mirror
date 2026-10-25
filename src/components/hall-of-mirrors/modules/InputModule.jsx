import { useRef, useState } from 'react'
import Dropdown from '../../molecules/Dropdown'
import { Icon } from '../../icons'
import { useFileDrop } from '../../../hooks/useFileDrop'
import { DeskModule, ModuleFooter } from './ModuleFrame'

/**
 * InputModule — where a picture ENTERS the instrument. One module, four ways
 * in: the camera, an image, a video, an SVG. Its OUT is a channel.
 *
 * User, 2026-09-02: *"how do you plug in camera, upload videos and images? is
 * there an input module output module?"* — there was not. The camera was
 * `gen-live`, a generator you load into a strip; image and SVG were two Upload
 * rows on the strip's SRC shelf; video only went into the Recorder as a loop.
 * The Master is the output module and always was; this is its opposite end.
 *
 * NOTHING NEW DOWNSTREAM. Every button writes the same channel fields the
 * shelf and the drop zone already wrote (`useFileDrop` for files, gen-live's
 * own params for the camera), so a source loaded here is indistinguishable
 * from one loaded the old way — the strip, the studio and a saved patch all
 * see the same thing. That is the point: the module is the front, not a
 * second pipeline.
 *
 * @param {Array}    channels        the desk's strips; OUT picks one
 * @param {Function} onChannelUpdate (index, patch) => void
 */
const CAMERA = { variantId: 'gen-live', params: { source: 'camera', deviceId: '', mirrored: 1, animate: true }, customImageName: 'Camera' }

export default function InputModule({ channels = [], onChannelUpdate }) {
  /* OUT → which strip. Defaults to the last one, which is the strip you most
     likely just added; re-targets when strips are removed under it. */
  const [target, setTarget] = useState(0)
  const out = Math.min(target, Math.max(0, channels.length - 1))
  const ch = channels[out]
  const patch = (fields) => channels.length && onChannelUpdate?.(out, fields)

  const imageRef = useRef(null)
  const videoRef = useRef(null)
  const { dragging, handlers, acceptFile } = useFileDrop(patch)

  const live = ch?.variantId === 'gen-live'
  const loaded = live
    ? (ch.params?.source === 'file' ? ch.customImageName || 'Video' : 'Camera')
    : ch?.customImageName || null

  const row = (label, onClick, icon) => (
    <div className="flex items-center justify-between kol-helper-12" style={{ height: 24 }}>
      <span className="text-fg-64">{label}</span>
      <span className="text-fg-96 cursor-pointer select-none flex items-center gap-1" onClick={onClick}>
        Load <Icon name={icon} size={14} />
      </span>
    </div>
  )

  return (
    /* THE STANDARD (plan 15, user 2026-10-25: *"SAME LAYOUT SECTIONS … OF THE MODULES"*): `DeskModule`'s bands like
       every other module — the four ways in and the drop zone are the plate, OUT (which strip it feeds) is the
       footer's row, the jack row stands empty because Input's out is a choice of strip, not a cable. The whole
       module still takes a drop. No back: nothing lives there. */
    <div className="h-full" {...handlers}>
      <DeskModule
        width={320}
        /* on = a source is loaded on its strip; off unloads it (plan 16 W5) — a new source turns it back on */
        power={{ on: !!loaded, onToggle: loaded ? () => patch({ variantId: null, params: {}, customImageSrc: null, customRasterSrc: null, customImageName: null }) : undefined, title: loaded ? 'Unload the source' : 'No source — load one below' }}
        head={<span className="text-fg-96">Input</span>}
        headRight={<span className="kol-helper-10 text-fg-32 truncate" style={{ maxWidth: 140 }}>{loaded || 'No source'}</span>}
        footer={(
          <ModuleFooter width={320}>
            <div className="flex items-center justify-between" style={{ height: 24 }}>
              <span className="text-fg-32">OUT</span>
              {channels.length
                ? (
                  <Dropdown
                    options={channels.map((c, i) => ({ value: String(i), label: `CH ${i + 1}` }))}
                    value={String(out)}
                    onChange={(v) => setTarget(Number(v))}
                    variant="minimal"
                    size="sm"
                  />
                )
                : <span className="text-fg-64">no channel — add one</span>}
            </div>
          </ModuleFooter>
        )}
      >
        {row('Camera', () => patch(CAMERA), 'video')}
        {row('Image', () => imageRef.current?.click(), 'upload')}
        {row('Video', () => videoRef.current?.click(), 'upload')}
        {row('SVG', () => imageRef.current?.click(), 'upload')}
        {/* THE DROP ZONE — the whole module accepts a drop (`handlers` on the root); this box is where it says so.
            `useFileDrop` decides image vs video, same as the strip. */}
        <div
          className="flex items-center justify-center kol-helper-10 text-fg-32 border border-dashed"
          style={{ height: 72, borderRadius: 4, marginTop: 4, borderColor: dragging ? 'var(--kol-accent-primary)' : 'var(--kol-fg-12)', color: dragging ? 'var(--kol-accent-primary)' : undefined }}
        >
          {dragging ? 'Drop to load' : 'Drop an image or video'}
        </div>
        <input ref={imageRef} type="file" accept="image/*,.svg" className="hidden" onChange={(e) => { acceptFile(e.target.files?.[0]); e.target.value = '' }} />
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={(e) => { acceptFile(e.target.files?.[0]); e.target.value = '' }} />
      </DeskModule>
    </div>
  )
}
