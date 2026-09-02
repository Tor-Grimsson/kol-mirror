import { DISPLACEMENT_VARIANTS, COPIES_VARIANTS, MOVEMENT_VARIANTS, getDefaultParams } from '../../data/mirrorVariants'
import Divider from '../atoms/Divider'

function ParamRow({ label, value, isMapped }) {
  return (
    <div className="flex items-center justify-between" style={{ height: '20px' }}>
      <span className={`kol-helper-12 ${isMapped ? 'text-fg-96' : 'text-fg-32'}`}>{label}</span>
      <span className={`kol-helper-12 ${isMapped ? 'accentYellow' : 'text-fg-32'}`}>{String(value)}</span>
    </div>
  )
}

function HallColumn({ name, variants }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="kol-helper-12 text-fg-48 uppercase mb-4">{name}</div>
      <div className="flex flex-col gap-4">
        {variants.map((variant, i) => {
          const defaults = getDefaultParams(variant.controls)
          const intensityKeys = variant.intensityKeys || []

          return (
            <div key={variant.id}>
              {i > 0 && <Divider className="mb-4" />}
              <div className="flex flex-col gap-1">
                <div className="kol-helper-12 text-fg-96 mb-1">{variant.title}</div>
                <div className="px-3 flex flex-col gap-1">
                  {variant.controls
                    .filter(c => c.key !== 'animate')
                    .map(ctrl => (
                      <ParamRow
                        key={ctrl.key}
                        label={ctrl.label}
                        value={defaults[ctrl.key]}
                        isMapped={intensityKeys.includes(ctrl.key)}
                      />
                    ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function PresetsViewport() {
  return (
    <div className="absolute inset-0 overflow-y-auto p-4">
      <div className="flex gap-6">
        <HallColumn name="Displacement" variants={DISPLACEMENT_VARIANTS} />
        <HallColumn name="Movement" variants={MOVEMENT_VARIANTS} />
        <HallColumn name="Copies" variants={COPIES_VARIANTS} />
      </div>
    </div>
  )
}
