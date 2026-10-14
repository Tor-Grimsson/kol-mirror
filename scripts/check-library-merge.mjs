/**
 * check-library-merge — the one runnable check on the sign-in merge.
 *   node scripts/check-library-merge.mjs
 */
import assert from 'node:assert/strict'
import { mergeLibrary } from '../src/hooks/mergeLibrary.js'

const save = (id, savedAt) => ({ id, kind: 'patch', name: id, savedAt, data: {} })
const row = (spec, updatedAt = spec.savedAt, deleted = false) => ({ id: spec.id, spec, updatedAt, deleted })

// local-only save is kept and pushed; remote-only save lands locally
{
  const { next, pushes } = mergeLibrary([save('a', 1)], [row(save('b', 2))])
  assert.deepEqual(next.map((i) => i.id).sort(), ['a', 'b'])
  assert.deepEqual(pushes.map((i) => i.id), ['a'])
}
// a newer tombstone removes the local save; an older one does not
{
  assert.deepEqual(mergeLibrary([save('a', 1)], [row(save('a', 1), 5, true)]).next, [])
  const kept = mergeLibrary([save('a', 9)], [row(save('a', 1), 5, true)])
  assert.deepEqual(kept.next.map((i) => i.id), ['a'])
  assert.deepEqual(kept.pushes.map((i) => i.id), ['a'])
}
// a remote tombstone for something never saved here adds nothing
assert.deepEqual(mergeLibrary([], [row(save('z', 1), 2, true)]).next, [])
// same id on both sides: newest wins, nothing pushed
{
  const remote = { ...save('a', 7), name: 'remote' }
  const { next, pushes } = mergeLibrary([save('a', 3)], [row(remote)])
  assert.equal(next[0].name, 'remote')
  assert.equal(pushes.length, 0)
}

console.log('check-library-merge: ok')
