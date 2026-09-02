import Slider from '../../atoms/Slider'
import { Icon } from '../../icons'
import { CANVAS_FX_DEFS } from '../../../hooks/useCanvasFx'

/**
 * FxModule — ONE effect as a self-contained front panel.
 *
 * User's definition, 2026-09-02: *"a module is self contained unit i can load
 * into the channel strip"*, and then: *"i also need a self contained fx module
 * that I can load into for example the pixi effects and stuff like that"*.
 *
 * So this is one unit from `CANVAS_FX_DEFS` — RGB Split, Slitscan, Analog TV,
 * the ten of them — drawn as a panel with its own params, its own enable, its
 * own IN and OUT. It is not the FX RACK (`FxUnit`, the channel's COLOR/BLEND/
 * FX/FB tabs); the rack is a tab strip on a channel and this is a module you
 * place.
 *
 * kol-monitor's shape, which is the reference: a registry entry there is
 * `{ component, hp, u, category, label, controls: [...] }` and the component
 * declares `inputs` / `outputs` / `process`. Mirror's equivalent is `defId` →
 * `CANVAS_FX_DEFS` for the controls (they are already declared, with min / max
 * / step / default per param) and the channel's `canvasFx` chain for the
 * process. Nothing is re-declared here — the def IS the contract.
 *
 * @param {string}   defId    a `CANVAS_FX_DEFS` id
 * @param {Object}   params   current values; the def's defaults fill the gaps
 * @param {Function} onParamChange (key, value) => void
 * @param {boolean}  enabled
 * @param {Function} onToggle
 * @param {Function} onRemove  omit and no remove control renders
 * @param {number}   position  1-based place in the channel's chain, for the
 *                             header. OMIT IT for a module standing on the
 *                             create desk — it is not in a chain, and the badge
 *                             sat under the desk's own remove ✕ (2026-09-02).
 * @param {string}   channelName  what it is patched into, for the OUT row
 */
export default function FxModule({
  defId,
  params = {},
  onParamChange,
  enabled = true,
  onToggle,
  onRemove,
  position,
  channelName,
}) {
  const def = CANVAS_FX_DEFS.find((d) => d.id === defId)
  if (!def) return null

  const entries = Object.entries(def.params || {})

  return (
    <div
      className="flex flex-col shrink-0 bg-surface-secondary border border-fg-08"
      style={{ width: '320px', borderRadius: '4px' }}
    >
      {/* header on the desk's own contract: name left, state right, 29px —
          `PatchModule`'s row and the channel strip's */}
      <div className="flex items-center justify-between kol-helper-12 px-3 border-b border-fg-08 shrink-0" style={{ height: '29px' }}>
        <span className="flex items-center gap-2">
          <span
            className="cursor-pointer flex"
            onClick={onToggle}
            title={enabled ? 'Bypass' : 'Enable'}
            style={{
              width: 8, height: 8, borderRadius: '50%', flex: 'none',
              backgroundColor: enabled ? 'var(--kol-accent-primary)' : 'var(--kol-fg-12)',
            }}
          />
          <span className={enabled ? 'text-fg-96' : 'text-fg-32'}>{def.label}</span>
        </span>
        <span className="flex items-center gap-2">
          {position != null && <span className="kol-helper-10 text-fg-32">#{position}</span>}
          {onRemove && (
            <span className="cursor-pointer text-fg-32 hover:text-fg-96 flex" onClick={onRemove} title="Remove">
              <Icon name="x" size={12} />
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3" style={{ opacity: enabled ? 1 : 0.4 }}>
        {/* THE PARAMS ARE THE DEF'S. Every unit declares min / max / step /
            default, so a new FX unit added to `CANVAS_FX_DEFS` gets a working
            panel with no edit here — the same reason `VariantControls` reads
            `mirrorVariants`. A binary param (min 0, max 1) renders as a state
            row rather than a one-notch fader. */}
        {entries.length === 0 && (
          <span className="kol-helper-12 text-fg-32">No parameters — it is on or off</span>
        )}
        {entries.map(([key, spec]) => {
          const value = params[key] ?? spec.default
          const binary = spec.min === 0 && spec.max === 1 && spec.step === 1
          if (binary) {
            return (
              <div key={key} className="flex items-center justify-between kol-helper-12" style={{ height: 24 }}>
                <span className="text-fg-64">{key}</span>
                <span
                  className="cursor-pointer select-none accentYellow"
                  onClick={() => onParamChange?.(key, value ? 0 : 1)}
                >
                  [{value ? 'ON' : 'OFF'}]
                </span>
              </div>
            )
          }
          return (
            <div key={key} className="flex items-center" style={{ height: 24 }}>
              <Slider
                label={key}
                min={spec.min}
                max={spec.max}
                step={spec.step}
                value={value}
                onChange={(v) => onParamChange?.(key, v)}
                variant="minimal"
                className="w-full"
              />
            </div>
          )
        })}
      </div>

      {/* IN / OUT. An FX unit sits INSIDE a channel's chain — its input is the
          frame the unit before it produced, its output the frame the next one
          takes. That is a real signal path and worth stating on the panel, even
          though the cable is the chain's order rather than a drawn one. */}
      {/* the IN/OUT footer sits at the BOTTOM of the panel, not under the last
          knob — the desk gives every module a fixed height, so an FX unit with
          two params has blank panel between its controls and its jacks. That is
          what the hardware looks like. */}
      <div className="flex flex-col gap-1 px-3 py-2 border-t border-fg-08 kol-helper-10" style={{ marginTop: 'auto' }}>
        <div className="flex items-center justify-between">
          <span className="text-fg-32">IN</span>
          <span className="text-fg-64">{position > 1 ? `chain #${position - 1}` : 'channel frame'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fg-32">OUT</span>
          <span className="text-fg-64">{channelName || 'next in chain'}</span>
        </div>
      </div>
    </div>
  )
}
