/**
 * check-feedback — the one runnable check on `feedbackStep`.
 *
 * Fails if the step stops being  a·frame + (1 − a)·buffer  in alpha as well as
 * colour: the buffer must be faded by `destination-out` at a BEFORE the frame
 * lands at a under `source-over`, and alpha must be back at 1 afterwards. A
 * recording context, no canvas — the invariant is the call sequence.
 *
 *   node scripts/check-feedback.mjs
 */
import assert from 'node:assert/strict'
import { feedbackStep } from '../src/hooks/feedbackStep.js'

function record() {
  const ops = []
  const ctx = {
    globalCompositeOperation: 'source-over',
    globalAlpha: 1,
    fillStyle: '#000',
    fillRect: (...a) => ops.push(['fillRect', ctx.globalCompositeOperation, ctx.globalAlpha, ...a]),
    drawImage: (...a) => ops.push(['drawImage', ctx.globalCompositeOperation, ctx.globalAlpha, ...a.slice(1)]),
  }
  return { ctx, ops }
}

const FRAME = { width: 4, height: 3 }

// decay 80 → a 0.8: fade the buffer by 0.8 (destination-out), then the frame at 0.8
{
  const { ctx, ops } = record()
  feedbackStep(ctx, FRAME, 4, 3, 80)
  assert.deepEqual(ops, [
    ['fillRect', 'destination-out', 0.8, 0, 0, 4, 3],
    ['drawImage', 'source-over', 0.8, 0, 0, 4, 3],
  ])
  assert.equal(ctx.globalAlpha, 1, 'alpha restored')
  assert.equal(ctx.globalCompositeOperation, 'source-over', 'op restored')
}

// the clamp: decay outside 0–100 and an absent decay (the channel default, 80)
{
  const { ctx, ops } = record()
  feedbackStep(ctx, FRAME, 4, 3, 250)
  assert.equal(ops[0][2], 1)
  feedbackStep(ctx, FRAME, 4, 3, -5)
  assert.equal(ops[2][2], 0)
  feedbackStep(ctx, FRAME, 4, 3, undefined)
  assert.equal(ops[4][2], 0.8)
}

// a frame that is not ready must not leave the context mid-state
{
  const { ctx } = record()
  ctx.drawImage = () => { throw new Error('not ready') }
  feedbackStep(ctx, FRAME, 4, 3, 50)
  assert.equal(ctx.globalAlpha, 1)
}

console.log('check-feedback: ok')
