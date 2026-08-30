import { useMemo, useState } from 'react'
import Dropdown from '../molecules/Dropdown'
import Input from '@kolkrabbi/kol-component/atoms/Input'
import { useMediaLibrary, mediaSrc, BUCKET_OPTIONS } from '../../hooks/useMediaLibrary'

/* taxonomy-ok: nests the DS Input + the local Dropdown */

/**
 * MediaBrowser — pick a source out of the Kolkrabbi CDN.
 *
 * Around 8,000 images and videos across three buckets, so this is a search box
 * and a list rather than a grid of thumbnails: fetching thumbnails for a
 * thousand rows would cost more than the effect the user came here for. The
 * list is capped and says how much it is hiding, because a silently truncated
 * library reads as a missing file.
 *
 * @param {(sel: {key,kind,src}) => void} onPick  chosen media; `src` is already
 *   canvas-safe (proxied where the store sends no CORS header).
 */
const LIMIT = 60

export default function MediaBrowser({ onPick }) {
  const [bucket, setBucket] = useState('r2')
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const { items, loading, error } = useMediaLibrary(bucket)

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return items.filter((o) =>
      (kind === 'all' || o.kind === kind) &&
      (!needle || o.key.toLowerCase().includes(needle)))
  }, [items, q, kind])

  const shown = filtered.slice(0, LIMIT)

  return (
    <div className="flex flex-col gap-2 kol-helper-12">
      <div className="flex items-center gap-2">
        <Dropdown options={BUCKET_OPTIONS} value={bucket} onChange={setBucket} variant="minimal" size="md" rowHeight={24} className="flex-1" />
        <Dropdown
          options={[{ value: 'all', label: 'All' }, { value: 'image', label: 'Images' }, { value: 'video', label: 'Video' }]}
          value={kind}
          onChange={setKind}
          variant="minimal"
          size="md"
          rowHeight={24}
        />
      </div>

      <Input value={q} onChange={(e) => setQ(e.target?.value ?? e)} placeholder="Search" size="sm" />

      {loading && <span className="text-fg-32">Loading library…</span>}
      {error && <span className="text-fg-32">{error}</span>}
      {!loading && !error && filtered.length === 0 && <span className="text-fg-32">Nothing matches</span>}

      <div className="flex flex-col" style={{ maxHeight: 220, overflowY: 'auto', scrollbarWidth: 'none' }}>
        {shown.map((o) => (
          <div
            key={o.key}
            className="flex items-center justify-between gap-2 cursor-pointer text-fg-64 hover:text-fg-96 shrink-0"
            style={{ height: 22 }}
            onClick={() => onPick?.({ ...o, src: mediaSrc(o.key, bucket) })}
            title={o.key}
          >
            {/* The tail of the key is the identifying part — the prefix repeats. */}
            <span className="truncate">{o.key.split('/').pop()}</span>
            <span className="text-fg-24 shrink-0">{o.kind === 'video' ? 'VID' : 'IMG'}</span>
          </div>
        ))}
      </div>

      {filtered.length > LIMIT && (
        <span className="text-fg-32">Showing {LIMIT} of {filtered.length} — search to narrow</span>
      )}
    </div>
  )
}
