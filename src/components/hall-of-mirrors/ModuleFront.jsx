import { Channel } from './SymphonyMixer'
import MasterModule from './MasterModule'
import RoutingMatrix from './RoutingMatrix'
import PlaybackModule from './PlaybackModule'
import ChannelModules from './ChannelModules'
import GeneratorModule from './modules/GeneratorModule'
import PatchModule from './modules/PatchModule'
import RecorderUnit from './RecorderUnit'
import FxUnit from './FxUnit'
import FxModule from './modules/FxModule'
import InputModule from './modules/InputModule'
import { GENERATOR_VARIANTS } from '../../data/mirrorVariants'
import { findVariant } from '../../data/mirrorVariants'

/**
 * ModuleFront — a desk module's real front, by id, LIVE.
 *
 * This lived read-only on `/mixer` (retired to `_tmp/2026-09-01-mixer-coverflow/`
 * with the Coverflow) and comes back live for `/create` (user, 2026-09-01):
 * the mixer's modules are *"1 a channel module 2 a mixer module 3 matrix
 * module 4 playback/clock 5 generator"*, and designing a mixer means placing
 * THOSE, the way monitor's create page places rack modules. Each id maps to
 * the same component the studio's desk renders, driven by the same state.
 *
 * `MIXER_MODULES` (data/mixerModules.js) is the catalogue; this is the
 * renderer. A module the desk has no standalone front for returns null and
 * the page draws its footprint instead — a fake front is worse than none.
 *
 * @param {string}   id         a MIXER_MODULES id
 * @param {number}   index      which channel, for `id === 'channel'`
 * @param {Object}   channel    that channel's state
 * @param {Object[]} channels   every channel on the desk (the matrix and master read them)
 * @param {Object}   master     the desk's master
 * @param {Function} onChannelUpdate  (index, patch) => void
 * @param {Function} onMasterChange   (patch) => void
 * @param {Function} onEdit     the channel's own edit affordance
 * @param {Function} onRemove   the channel's own remove affordance
 */
const noop = () => {}
/* PatchModule calls `api.save` / `api.load` / `api.clear` — the desk's verbs.
   A design surface has no patch store to write to, so they are no-ops and the
   panel renders as the specimen it is here. */
const PATCH_NOOP = { save: noop, load: noop, clear: noop }

export default function ModuleFront({ id, index = 0, channel, channels = [], master, onChannelUpdate = noop, onMasterChange = noop, onEdit, onRemove, front }) {
  /* `front` is the registry's descriptor — `{ kind, id }` on a MODULE_REGISTRY
     entry (2026-09-02). It is the loadable-unit path; the `id` switch below is
     the desk's own furniture. Monitor's registry maps `component` directly;
     mirror resolves through here because a variant's "panel" is a loaded
     channel strip rather than a component of its own. */
  if (front) {
    if (front.kind === 'fx') {
      return (
        <FxModule
          defId={front.id}
          params={channel?.canvasFx?.find((f) => f.type === front.id)?.params}
          onParamChange={noop}
          enabled
        />
      )
    }
    if (front.kind === 'generator') {
      return <GeneratorModule initialId={front.id} />
    }
    if (front.kind === 'variant') {
      /* the strip, carrying that variant — what "loaded into a channel" looks
         like. `findVariant` gives the controls its PARAMS shelf renders. */
      const def = findVariant(front.id)
      return (
        <Channel
          channelId={`front-${front.id}`}
          loadedName={def ? `${def.title}` : front.id}
          defaultName={front.id}
          value={channel?.intensity}
          opacity={channel?.opacity}
          params={channel?.params}
          controls={def?.controls || []}
          enabled
          boosted={false}
          items={[]}
          fx={[]}
        />
      )
    }
    /* kind 'desk' falls through to the switch below */
    id = front.id
  }
  switch (id) {
    case 'input':
      return <InputModule channels={channels} onChannelUpdate={onChannelUpdate} />
    case 'channel':
      return (
        <Channel
          channelId={`ch-${index}`}
          loadedName={channel?.name}
          defaultName={`Channel ${index + 1}`}
          value={channel?.intensity}
          opacity={channel?.opacity}
          params={channel?.params}
          controls={channel?.variantId ? findVariant(channel.variantId)?.controls || [] : []}
          enabled={!!channel?.enabled}
          boosted={!!channel?.boosted}
          items={[]}
          fx={channel?.fx || []}
          onEdit={onEdit}
          onRemove={onRemove}
          onChannelUpdate={(patch) => onChannelUpdate(index, patch)}
          onOpacityChange={(v) => onChannelUpdate(index, { opacity: v })}
        />
      )
    case 'master':
      return <MasterModule master={master} onMasterChange={onMasterChange} channels={channels} onChannelUpdate={onChannelUpdate} />
    case 'routing':
      return <RoutingMatrix channels={channels} onChannelUpdate={onChannelUpdate} master={master} onMasterChange={onMasterChange} />
    case 'playback':
      return <PlaybackModule />
    /* THREE THAT ALREADY HAD FRONTS and were simply never mapped (user,
       2026-09-02: "what about all the incomplete modules? did we just decide
       not to do them?"). Each is the desk's own component, driven read-only
       off an empty channel here — the same treatment `channel` and `master`
       get. `api` / the recorder handlers are the DESK's; on a design surface
       they are no-ops, which is why `/create` shows the panel and the studio
       owns the behaviour. */
    case 'patch':
      return <PatchModule api={PATCH_NOOP} master={master} channels={channels} />
    case 'recorder':
      return (
        <RecorderUnit
          recState={null}
          recPaused={false}
          recSlots={channel?.recSlots || [null, null, null, null]}
          activeRecSlot={channel?.activeRecSlot ?? null}
          playhead={0}
          onSeek={noop}
          onRecPauseToggle={noop}
          onArmRecording={noop}
          onStartRecording={noop}
          onStopRecording={noop}
          onDisarmRecording={noop}
          onSaveRecToSlot={noop}
        />
      )
    case 'canvas-fx':
      return (
        <FxUnit
          fx={channel?.canvasFx || []}
          onFxChange={noop}
          enabled={false}
          renderCost={0}
          blendMode={channel?.blendMode || 'normal'}
          onBlendModeChange={noop}
          vectorColor={channel?.vectorColor || 'currentColor'}
          onVectorColorChange={noop}
          backgroundColor={channel?.backgroundColor || 'transparent'}
          onBackgroundColorChange={noop}
          rasterTheme={channel?.rasterTheme || 'dark'}
          onRasterThemeChange={noop}
          feedback={channel?.feedback}
          onFeedbackChange={noop}
        />
      )
    case 'generator-module':
      /* self-contained — owns its generator, params, quality and preview */
      return <GeneratorModule />
    case 'generators':
    case 'field':
      return <ChannelModules index={index} channel={channel || channels[0]} onChannelUpdate={(patch) => onChannelUpdate(index, patch)} onMediaChange={noop} onRecalc={noop} />
    default:
      return null
  }
}
