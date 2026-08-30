import { useEffect, useState } from 'react'
import { createMediaClient, isImageType, isVideoType } from '@kolkrabbi/kol-media-client'

/**
 * useMediaLibrary — the Kolkrabbi CDN as channel sources.
 *
 * Three stores behind one CORS-open listing API (`admin.kolkrabbi.io/api/list`,
 * `bucket=r2|b2|b2vault`). The TABLE — which host each bucket is on and which
 * needs proxying — is `KOL_BUCKETS` in `@kolkrabbi/kol-media-client`, filed by
 * mirror and kol-fxr because both of us were carrying a copy. Do not restate it
 * here: which store sends `Access-Control-Allow-Origin` is kol-r2b2's
 * infrastructure state, it changes without this repo hearing, and a stale
 * `proxy: false` taints the canvas so `getImageData` throws — which mirror does
 * on every source (slitscan, trails, every canvas FX). `buckets: true` takes the
 * table as shipped; pass an object only to OVERRIDE, never to repeat.
 *
 * `crossOrigin="anonymous"` still matters on every load, direct or proxied: the
 * header rides the response, not the object, so a pre-policy entry already in
 * the user's cache stays non-CORS and taints anyway. The attribute partitions
 * the cache so the browser refetches.
 *
 * Adopted at 0.3.2. 0.3.0 and 0.3.1 are deprecated — they ran `process.argv` at
 * module scope for a self-test guard, which is a ReferenceError in a browser and
 * white-screened the studio on import.
 */
const client = createMediaClient({ buckets: true })

export const BUCKET_OPTIONS = client.buckets().map((b) => ({ value: b.id, label: b.label }))

/** A canvas-safe URL for a key. `proxied` reads the bucket's own `proxy` flag,
 *  so the decision is the table's — there is nothing to gate here. */
export const mediaSrc = (key, bucket = 'r2') => client.proxied(client.mediaUrl(key, bucket))

export const mediaKind = (contentType) =>
  isVideoType(contentType) ? 'video' : isImageType(contentType) ? 'image' : 'other'

/* One fetch per bucket per session — the listings are thousands of rows and do
   not change while the app is open. */
const cache = new Map()

export function useMediaLibrary(bucket = 'r2') {
  const [state, setState] = useState({ items: [], loading: true, error: null })

  useEffect(() => {
    let live = true
    const cached = cache.get(bucket)
    if (cached) { setState({ items: cached, loading: false, error: null }); return }
    setState({ items: [], loading: true, error: null })
    client.listMedia('', { bucket })
      .then((objects) => {
        // Only what a channel can actually show.
        const items = (objects || [])
          .map((o) => ({ key: o.key, size: o.size, type: o.contentType, kind: mediaKind(o.contentType) }))
          .filter((o) => o.kind !== 'other')
        cache.set(bucket, items)
        if (live) setState({ items, loading: false, error: null })
      })
      .catch((e) => { if (live) setState({ items: [], loading: false, error: e?.message || 'Could not reach the library' }) })
    return () => { live = false }
  }, [bucket])

  return state
}
