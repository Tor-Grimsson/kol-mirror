import { SourceTab, ResolutionTab } from './SourceUnit'
import FxUnit from './FxUnit'
import TrailUnit from './TrailUnit'
import RecorderUnit from './RecorderUnit'

/* taxonomy-ok: composes the channel units */

/**
 * ChannelModules — the SECOND arrangement of the channel's units.
 *
 * The fat card stacks Source · FX · Trail · Recorder inside one box behind a
 * tab bar; this puts each on the desk as its own module, the way a rack does.
 * Same components, same channel state, no second model — forking the state
 * would drift within a week, forking only the arrangement costs nothing and is
 * reversible with a toggle.
 *
 * Deliberately NOT a copy of the card's markup: if a unit's contents change,
 * both layouts change together, because there is only one of each unit.
 */
function Module({ title, children, width = 320 }) {
  return (
    <div className="shrink-0 pr-4">
      <div className="flex flex-col" style={{ width }}>
        <div className="flex items-center justify-between kol-helper-12 mx-2 px-3 border border-fg-08 border-b-0 shrink-0 bg-surface-tertiary" style={{ borderRadius: '4px 4px 0 0', height: 29 }}>
          <span className="text-fg-96">{title}</span>
        </div>
        <div className="mx-2 p-4 bg-surface-secondary border border-fg-08" style={{ borderRadius: 4, minHeight: 0, overflowY: 'auto', maxHeight: 420 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ChannelModules({ index, channel, onChannelUpdate, onMediaChange, onRecalc, recorder, DEFAULT_SVG_SRC }) {
  const n = index + 1
  const params = channel.params || {}
  return (
    <>
      <Module title={`Ch ${n} · Source`}>
        <SourceTab
          customImageSrc={channel.customImageSrc}
          customImageName={channel.customImageName}
          vectorColor={channel.vectorColor}
          vectorPadding={channel.vectorPadding}
          loadMode={channel.loadMode}
          onMediaChange={onMediaChange}
          DEFAULT_SVG_SRC={DEFAULT_SVG_SRC}
        />
      </Module>

      <Module title={`Ch ${n} · Resolution`}>
        <ResolutionTab
          rasterTierOverride={channel.rasterTierOverride}
          onRasterTierOverrideChange={(v) => onChannelUpdate(index, { rasterTierOverride: v })}
          rasterTheme={channel.rasterTheme}
          onRasterThemeChange={(v) => onChannelUpdate(index, { rasterTheme: v })}
          onMediaChange={onMediaChange}
          onRecalc={onRecalc}
        />
      </Module>

      <Module title={`Ch ${n} · FX`}>
        <FxUnit
          fx={channel.fx || []}
          onFxChange={(v) => onChannelUpdate(index, { fx: v })}
          enabled={channel.enabled}
          blendMode={channel.blendMode}
          onBlendModeChange={(v) => onChannelUpdate(index, { blendMode: v })}
          vectorColor={channel.vectorColor}
          onVectorColorChange={(v) => onChannelUpdate(index, { vectorColor: v })}
          backgroundColor={channel.backgroundColor}
          onBackgroundColorChange={(v) => onChannelUpdate(index, { backgroundColor: v })}
          rasterTheme={channel.rasterTheme}
          onRasterThemeChange={(v) => onChannelUpdate(index, { rasterTheme: v })}
          feedback={params.feedback}
          onFeedbackChange={(fb) => onChannelUpdate(index, { feedback: fb })}
        />
      </Module>

      <Module title={`Ch ${n} · Trail`} width={240}>
        <TrailUnit
          feedback={channel.feedback}
          onFeedbackChange={(fb) => onChannelUpdate(index, { feedback: fb })}
        />
      </Module>

      {recorder && (
        <Module title={`Ch ${n} · Recorder`}>
          <RecorderUnit {...recorder} />
        </Module>
      )}
    </>
  )
}
