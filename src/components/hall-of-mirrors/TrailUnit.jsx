import Slider from '../atoms/Slider'
import { Icon } from '../icons'

/**
 * TrailUnit — per-channel feedback: the picture drawn back over itself.
 *
 * Split out of the FX rack (2026-08-27). Feedback is TEMPORAL — it reads the
 * last frame, not this one — which puts it in the same family as slitscan and
 * motion trails rather than with colour and blend. Grouping it by which tab bar
 * it happened to sit under hid that.
 *
 * decay = how fast the accumulated picture gives way to the new frame (high
 * decay is a SHORT trail); mix = how much of it reaches the output; freeze
 * holds the buffer so the trail stops taking new frames without losing what it
 * has.
 */
export default function TrailUnit({ feedback, onFeedbackChange }) {
  return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2" style={{ height: '24px' }}>
          <div
            className={`w-3 h-3 rounded-full cursor-pointer shrink-0 ${feedback?.enabled ? 'bg-[#e74c3c]' : 'bg-fg-24'}`}
            onClick={() => onFeedbackChange({ ...feedback, enabled: !feedback?.enabled })}
          />
          <span className="text-fg-96">Feedback</span>
          <div className="flex-1" />
          <span
            className={`cursor-pointer select-none ${feedback?.freeze ? 'text-[#2dd4bf]' : 'text-fg-32'}`}
            onClick={() => onFeedbackChange({ ...feedback, freeze: !feedback?.freeze })}
          >
            {feedback?.freeze ? 'FROZEN' : 'FREEZE'}
          </span>
        </div>
        <Slider
          label="Decay"
          min={0}
          max={100}
          step={1}
          value={feedback?.decay ?? 80}
          onChange={(v) => onFeedbackChange({ ...feedback, decay: v })}
          formatValue={(v) => `${Math.round(v)}%`}
          className="w-full"
          variant="minimal"
        />
        <Slider
          label="Mix"
          min={0}
          max={100}
          step={1}
          value={feedback?.mix ?? 50}
          onChange={(v) => onFeedbackChange({ ...feedback, mix: v })}
          formatValue={(v) => `${Math.round(v)}%`}
          className="w-full"
          variant="minimal"
        />
      </div>
  )
}
