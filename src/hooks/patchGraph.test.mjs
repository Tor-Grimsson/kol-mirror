/**
 * Run: node src/hooks/patchGraph.test.mjs
 *
 * ponytail: one runnable check for the index remapping — the bug it exists to
 * catch (removing a channel silently re-pointing every patch above it) is
 * invisible in the UI until a cable feeds the wrong source.
 */
import assert from 'node:assert/strict'
import { consumedChannels, removeChannelAt, clearAllPatches, patchIntoFreeInput } from './patchGraph.js'

const ch = (over = {}) => ({ enabled: true, sends: {}, routeSendLevels: {}, feedback: { enabled: false }, canvasFx: [], routeFrom: null, ...over })

// ── consumedChannels: only what is actually read
{
  const channels = [ch(), ch(), ch()]
  assert.equal(consumedChannels(channels).size, 0, 'nothing patched → nothing captured')

  assert.deepEqual([...consumedChannels([ch(), ch({ routeFrom: 0 }), ch()])], [0], 'routeFrom pulls its source')
  assert.deepEqual([...consumedChannels([ch({ sends: { aux1: 50 } }), ch(), ch()])], [0], 'a send needs its own frame')
  assert.deepEqual([...consumedChannels([ch(), ch(), ch()], '2')], [2], 'Screen 2 needs its source')
  assert.equal(consumedChannels([ch({ enabled: false, sends: { aux1: 50 } })]).size, 0, 'a disabled channel is not captured')
  assert.deepEqual([...consumedChannels([ch(), ch({ routeSendLevels: { 0: 40 } })])], [0], 'cross-send pulls its source')
}

// ── removeChannelAt: the whole point
{
  const channels = [ch(), ch(), ch({ routeFrom: 1 })]
  const master = { inputs: [0, 2, null] }
  const out = removeChannelAt(channels, master, '2', 1)

  assert.equal(out.channels.length, 2, 'one channel gone')
  assert.equal(out.channels[1].routeFrom, null, 'a patch FROM the removed channel is cut, not re-pointed')
  assert.deepEqual(out.master.inputs, [0, 1, null], 'a master input above the removal shifts down')
  assert.equal(out.screen2, '1', 'Screen 2 follows its channel to its new index')
}
{
  // Removing below a patch must shift it; removing above must leave it alone.
  const out = removeChannelAt([ch(), ch(), ch()], { inputs: [2, null, null] }, 'off', 0)
  assert.deepEqual(out.master.inputs, [1, null, null], 'input shifts down when a channel below it goes')
  const out2 = removeChannelAt([ch(), ch(), ch()], { inputs: [0, null, null] }, 'off', 2)
  assert.deepEqual(out2.master.inputs, [0, null, null], 'input untouched when a channel above it goes')
}
{
  const out = removeChannelAt([ch(), ch({ routeSendLevels: { 0: 60, 2: 30 } }), ch()], { inputs: [] }, 'off', 0)
  assert.deepEqual(out.channels[0].routeSendLevels, { 1: 30 }, 'cross-send keys remap; the one from the removed channel is dropped')
}
{
  const out = removeChannelAt([ch(), ch()], { inputs: [1] }, '1', 1)
  assert.deepEqual(out.master.inputs, [null], 'the removed channel leaves an empty slot, not a dangling index')
  assert.equal(out.screen2, 'off', 'Screen 2 falls back to off when its source goes')
}
{
  // Bus sources are string keys and must survive untouched.
  const out = removeChannelAt([ch({ routeFrom: 'rtn1' }), ch()], { inputs: [] }, 'off', 1)
  assert.equal(out.channels[0].routeFrom, 'rtn1', 'a bus source is not an index and must not be remapped')
}

// ── clearAllPatches: connections go, content stays
{
  const channels = [ch({ variantId: 'x', routeFrom: 1, sends: { aux1: 80 }, feedback: { enabled: true, decay: 70 } })]
  const out = clearAllPatches(channels, { inputs: [0] })
  assert.equal(out.channels[0].variantId, 'x', 'what the channel holds is untouched')
  assert.equal(out.channels[0].routeFrom, null)
  assert.equal(out.channels[0].sends.aux1, 0)
  assert.equal(out.channels[0].feedback.enabled, false)
  assert.equal(out.channels[0].feedback.decay, 70, 'feedback settings survive, only the patch is cut')
  assert.deepEqual(out.master.inputs, [null])
}

// ── patchIntoFreeInput: a load claims a free slot, never steals one
{
  assert.deepEqual(patchIntoFreeInput({ inputs: [null, null, null] }, 2), [2, null, null], 'takes the first free slot')
  assert.equal(patchIntoFreeInput({ inputs: [2, null, null] }, 2), null, 'already patched → no change')
  assert.equal(patchIntoFreeInput({ inputs: [0, 1, 2] }, 3), null, 'no free slot → no change, nothing stolen')
  assert.deepEqual(patchIntoFreeInput({ inputs: [0, null, 2] }, 1), [0, 1, 2], 'fills the gap, leaves the rest')
}

console.log('patchGraph: all checks passed')
