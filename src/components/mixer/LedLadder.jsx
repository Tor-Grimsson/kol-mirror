/**
 * LedLadder — a dotted LED level column, the meter on the user's reference
 * sheet (`_tmp/2026-08-28-panel-references/`, the 6-channel mixer strip and the
 * VU meters). Unlit segments stay visible as dark dots, which is the half that
 * makes a real meter read as one: you can see the headroom you are not using.
 *
 * `level` is 0–100. The top fifth is the overload zone and lights red, the way
 * a VU's scale goes red past 0dB. `peak` holds the highest recent segment for a
 * beat so a transient is visible at all — a bare bar chart misses every spike.
 */
const SEGMENTS = 18

export default function LedLadder({ level = 0, peak = 0, width = 7, height = 96 }) {
  const gap = 2
  const seg = (height - gap * (SEGMENTS - 1)) / SEGMENTS
  const lit = Math.round((Math.max(0, Math.min(100, level)) / 100) * SEGMENTS)
  const peakSeg = Math.round((Math.max(0, Math.min(100, peak)) / 100) * SEGMENTS)
  return (
    <div
      className="flex flex-col-reverse shrink-0"
      style={{ width, height, gap, padding: 2, borderRadius: 1, background: '#0b0b0c' }}
    >
      {Array.from({ length: SEGMENTS }, (_, i) => {
        const hot = i >= SEGMENTS - 3
        const on = i < lit
        const isPeak = i === peakSeg - 1 && peakSeg > lit
        return (
          <span
            key={i}
            style={{
              height: seg,
              borderRadius: 0.5,
              background: on || isPeak
                ? (hot ? '#e0431f' : '#e8901c')
                : 'rgb(255 255 255 / 0.055)',
            }}
          />
        )
      })}
    </div>
  )
}
