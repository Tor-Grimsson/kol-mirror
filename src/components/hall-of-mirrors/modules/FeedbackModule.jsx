import { useState } from 'react'
import TrailUnit from '../TrailUnit'
import { ModuleTab } from './ModuleFrame'

/**
 * FeedbackModule — per-channel frame feedback as a FRONT PANEL.
 *
 * The desk's own `TrailUnit` (the FB tab of a channel's FX rack) in the panel
 * frame `FxModule` and `PatchModule` draw — header, body, IN/OUT foot. Nothing
 * is re-declared: Decay, Mix and Freeze are the unit's, and `applyFeedback`
 * (`useFrameBuffer.js`) is still the only thing that runs them.
 *
 * It is a catalogue PART with a front, not a registry module: feedback is a tab
 * on a channel strip (user ruling 2026-09-02), so it is not placeable on
 * `/create` and does not appear under Modules. It has this face so `/mixer/:id`
 * can show the real control instead of "No standalone front yet".
 *
 * Self-held when no `onFeedbackChange` is passed — a design surface has no
 * channel to write to, and a knob that does not move is a picture of a knob.
 *
 * @param {Object}   feedback          `{ enabled, decay, mix, freeze }`
 * @param {Function} onFeedbackChange  omit and the panel keeps its own state
 * @param {string}   channelName       what it sits under, for the OUT row
 */
const DEFAULT = { enabled: false, decay: 80, mix: 50, freeze: false }

export default function FeedbackModule({ feedback, onFeedbackChange, channelName }) {
  const [local, setLocal] = useState(feedback ?? DEFAULT)
  const fb = onFeedbackChange ? (feedback ?? DEFAULT) : local
  const set = onFeedbackChange ?? setLocal

  return (
    <div className="flex flex-col shrink-0" style={{ width: 320, ...{ height: '100%', maxHeight: '100%' } }}>
      <ModuleTab>
        <span className="text-fg-96">Feedback</span>
        <span className="kol-helper-10 text-fg-32">{fb.freeze ? 'frozen' : fb.enabled ? `${Math.round(fb.decay ?? 80)}% decay` : 'off'}</span>
      </ModuleTab>
      <div className="flex flex-col flex-1 bg-surface-secondary border border-fg-08" style={{ borderRadius: 4, minHeight: 0 }}>

        <div className="flex flex-col p-3 kol-helper-12">
          <TrailUnit feedback={fb} onFeedbackChange={set} />
        </div>

        <div className="flex flex-col gap-1 px-3 py-2 border-t border-fg-08 kol-helper-10" style={{ marginTop: 'auto' }}>
          <div className="flex items-center justify-between">
            <span className="text-fg-32">IN</span>
            <span className="text-fg-64">the channel’s own previous frame</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-fg-32">OUT</span>
            <span className="text-fg-64">{channelName ? `under ${channelName}` : 'under the channel'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
