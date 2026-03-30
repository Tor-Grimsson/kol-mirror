import { DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS, findVariant } from '../../data/mirrorVariants'
import ChannelLayer from './ChannelLayer'

function getHallForVariant(variantId) {
  if (DISPLACEMENT_VARIANTS.some(v => v.id === variantId)) return 'displacement'
  if (COPIES_VARIANTS.some(v => v.id === variantId)) return 'copies'
  if (MOVEMENT_VARIANTS.some(v => v.id === variantId)) return 'movement'
  return null
}

export default function ArchiveViewport({ state }) {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-surface-primary">
      <div className="p-4 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.archiveSlots.map((slot, index) => (
            <div key={index} className={`flex flex-col gap-4 ${slot ? '' : 'opacity-40'}`}>
              <div className="flex items-center justify-between">
                <div className="kol-helper-s text-fg-32">
                  [M{index + 1}]{slot && (() => { const hall = getHallForVariant(slot.variantId); const v = findVariant(slot.variantId); return hall ? ` ${hall.charAt(0).toUpperCase() + hall.slice(1)}: ${v?.title || slot.variantId} [USR]` : '' })()}
                </div>
                {slot ? (
                  <button
                    className="kol-helper-xs text-fg-32 hover:text-fg-64 transition-colors cursor-pointer"
                    onClick={() => state.clearArchiveSlot(index)}
                  >
                    [CLEAR]
                  </button>
                ) : (
                  <div className="kol-helper-xs text-fg-32">[EMPTY]</div>
                )}
              </div>

              <div
                className="relative aspect-[4/3] overflow-hidden border border-fg-08 bg-surface-secondary"
                style={{ borderRadius: '4px' }}
              >
                {slot ? (
                  <ChannelLayer
                    channel={{ ...slot, params: { ...slot.params, animate: false, bgAnimate: false }, enabled: true, intensity: 100, boosted: false, speed: 100, opacity: 100 }}
                    channelIndex={index}
                    imageSrc="/thumbnails/stripe-base.png"
                    rasterSrc="/thumbnails/stripe-base.png"
                    isAnimating={false}
                    rawParams
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="kol-helper-s text-fg-32">No saved experiment</div>
                  </div>
                )}
              </div>

              {slot ? (
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="kol-helper-xs text-fg-48 hover:text-fg-96 transition-colors cursor-pointer"
                    onClick={() => state.loadSlotToHall(index)}
                  >
                    [LOAD]
                  </button>
                  <button
                    className="kol-helper-xs text-fg-32 hover:text-fg-64 transition-colors cursor-pointer"
                    onClick={() => state.loadSlotToHall(index)}
                  >
                    [RELOAD]
                  </button>
                </div>
              ) : (
                <div className="kol-helper-xs text-fg-32 text-right">&mdash;</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
