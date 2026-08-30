/** Run: node --test — the patch wire format. */
import assert from 'node:assert/strict'
import { serializePatch, applyPatch, buildPatchEntry, PATCH_VERSION } from './patchFile.js'

const EMPTY = { variantId: null, enabled: false, opacity: 100, sends: {}, feedback: { enabled: false }, recSlots: [null, null] }

// ── Data-URL uploads must NOT be serialized: one image can be megabytes and
// takes the whole localStorage library down with it.
{
  const state = {
    channels: [{ ...EMPTY, variantId: 'x', customImageSrc: 'data:image/png;base64,AAAA', customImageName: 'shot.png' }],
    master: { inputs: [0, null, null], opacity: 80 },
    canvas: { ratio: '16:9' },
  }
  const d = serializePatch(state)
  assert.equal(d.channels[0].customImageSrc, undefined, 'an inlined upload is dropped')
  assert.equal(d.channels[0].customImageName, 'shot.png', 'but its name is kept, so the UI can say what is missing')
  assert.equal(d.channels[0].variantId, 'x')
  assert.deepEqual(d.master.inputs, [0, null, null], 'the input slots ARE the patch')
}
{
  const d = serializePatch({ channels: [{ ...EMPTY, customImageSrc: '/images/hero.jpg' }], master: {}, canvas: {} })
  assert.equal(d.channels[0].customImageSrc, '/images/hero.jpg', 'a real URL survives — only data: URLs are dropped')
}
{
  // Session-scoped junk must not be written into a file that outlives the session.
  const d = serializePatch({ channels: [{ ...EMPTY, recSlots: [{ blobUrl: 'blob:x' }], isArmedForRec: true, activeRecSlot: 0 }], master: {}, canvas: {} })
  assert.equal(d.channels[0].recSlots, undefined, 'recorded blob URLs are dead links later — not saved')
  assert.equal(d.channels[0].isArmedForRec, undefined, 'transient UI is not saved')
}

// ── applyPatch
{
  const out = applyPatch({ channels: [{ variantId: 'a' }, { variantId: 'b' }], master: { inputs: [1, null, null] } },
    { emptyChannel: EMPTY, master: { opacity: 80, blendMode: 'normal' } })
  assert.equal(out.channels.length, 2, 'channel count follows the patch')
  assert.equal(out.channels[0].opacity, 100, 'unspecified fields fall back to the empty channel')
  assert.equal(out.master.opacity, 80, 'master fields the patch omits keep their current value')
  assert.deepEqual(out.master.inputs, [1, null, null])
}
{
  // A patch must never hand back an input pointing past the end of the desk.
  const out = applyPatch({ channels: [{ variantId: 'a' }], master: { inputs: [0, 2, 7] } }, { emptyChannel: EMPTY })
  assert.deepEqual(out.master.inputs, [0, null, null], 'out-of-range inputs are cleared, not left dangling')
}
{
  const out = applyPatch({}, { emptyChannel: EMPTY, master: { inputs: [0, 1, 2] } })
  assert.deepEqual(out.channels, [], 'an empty patch yields an empty desk')
  assert.deepEqual(out.master.inputs, [null, null, null], 'with no channels, no input can be valid')
}

// ── round trip
{
  const state = {
    channels: [{ ...EMPTY, variantId: 'v1', enabled: true, opacity: 60, sends: { aux1: 40 } }, { ...EMPTY, variantId: 'v2' }],
    master: { inputs: [0, 1, null], opacity: 90, blendMode: 'screen' },
    canvas: { ratio: '4:3', layout: 'row' },
  }
  const back = applyPatch(serializePatch(state), { emptyChannel: EMPTY, master: {} })
  assert.equal(back.channels[0].opacity, 60)
  assert.deepEqual(back.channels[0].sends, { aux1: 40 })
  assert.equal(back.master.blendMode, 'screen')
  assert.equal(back.canvas.ratio, '4:3')
  assert.deepEqual(back.master.inputs, [0, 1, null], 'the patch survives a round trip')
}

// ── entry shape matches the library's
{
  const e = buildPatchEntry({ channels: [], master: {}, canvas: {} }, { name: 'Test', tags: ['a'] })
  assert.equal(e.kind, 'patch')
  assert.equal(e.version, PATCH_VERSION)
  assert.equal(e.name, 'Test')
  assert.deepEqual(e.tags, ['a'])
  assert.ok(e.data && e.data.channels, 'carries a data payload')
}

console.log('patchFile: all checks passed')
