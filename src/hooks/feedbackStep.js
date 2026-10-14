/**
 * feedbackStep — one frame into a channel's feedback accumulation. Pure Canvas-2D
 * calls on `ctx`, no React, so `scripts/check-feedback.mjs` runs it against a
 * recording context.
 *
 * `decay` 0–100 is HOW FAST THE TRAIL DIES. Every piece of copy already says so
 * — the walkthrough ("high decay = short trails"), the catalogue ("Decay — how
 * fast the trail dies"), `TrailUnit`'s own docstring — and `decay` is in the
 * persisted channel shape (default 80), so the meaning is not up for renaming.
 *
 * With a = decay / 100 the buffer becomes  a·frame + (1 − a)·buffer,  in COLOUR
 * and in ALPHA. The alpha half is the fix (2026-10-13). Drawing the frame at
 * alpha a over the buffer gave that lerp only where the frame was opaque; where
 * the frame is transparent — every vector source on a transparent ground — the
 * old pixels were never touched, so at low decay a ghost sat there for ever and
 * at high decay it never left either. `destination-out` at alpha a first fades
 * the WHOLE buffer by (1 − a); then the frame lands at a. For an opaque frame
 * the result is what it always was. The old comment ("lower alpha = faster
 * fade of accumulated content") described the opposite of the code and is gone.
 */
export function feedbackStep(ctx, frame, w, h, decay) {
  const a = Math.min(1, Math.max(0, (decay ?? 80) / 100))
  ctx.globalCompositeOperation = 'destination-out'
  ctx.globalAlpha = a
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, w, h)
  ctx.globalCompositeOperation = 'source-over'
  try {
    ctx.drawImage(frame, 0, 0, w, h)
  } catch { /* frame not ready */ }
  ctx.globalAlpha = 1
}
