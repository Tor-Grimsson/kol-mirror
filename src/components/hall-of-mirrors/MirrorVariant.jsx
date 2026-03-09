import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const MirrorVariant = ({
  title,
  children,
  baseFrequency = 0.01,
  numOctaves = 2,
  scale = 20,
  seed = 0,
  animate = false,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  description = '',
  onImageUpload
}) => {
  const filterRef = useRef(null)
  const filterId = `distortion-${title.replace(/\s+/g, '-').toLowerCase()}`
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (!filterRef.current) return

    const turbulence = filterRef.current.querySelector('feTurbulence')
    if (!turbulence) return

    if (!animate) {
      gsap.killTweensOf(turbulence)
      turbulence.setAttribute('baseFrequency', String(baseFrequency))
      return
    }

    const tween = gsap.to(turbulence, {
      attr: { baseFrequency: baseFrequency * 1.5 },
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    return () => tween.kill()
  }, [animate, baseFrequency])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div
          className="kol-helper-s text-fg-64 cursor-help"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          {title}
        </div>
        <div className="flex gap-2">
          <div
            className={`kol-helper-xs cursor-pointer select-none ${isEnabled ? 'accentYellow' : 'text-fg-64'} hover:text-fg-96`}
            onClick={onToggleEnabled}
          >
            [{isEnabled ? 'ON' : 'OFF'}]
          </div>
          <div
            className={`kol-helper-xs cursor-pointer select-none ${isSelected ? 'accentYellowStrong' : 'text-fg-64'} hover:text-fg-96`}
            onClick={onToggleSelect}
          >
            [{isSelected ? 'SELECT' : 'UNSELECT'}]
          </div>
        </div>
      </div>

      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id={filterId} ref={filterRef}>
          <feTurbulence
            type="turbulence"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={seed}
            result="turbulence"
          />
          <feDisplacementMap
            in2="turbulence"
            in="SourceGraphic"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <div
        className="relative aspect-[4/3] overflow-hidden border border-fg-08"
        style={{ borderRadius: '4px' }}
      >
        {showInfo && (
          <div className="absolute top-0 left-0 right-0 kol-helper-xs textAbsoluteWhite p-3 space-y-1 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--kol-surface-primary) 60%, transparent)' }}>
            <div><strong>Base Frequency:</strong> {baseFrequency} - {baseFrequency < 0.01 ? 'Large, slow waves' : baseFrequency < 0.02 ? 'Medium waves' : 'Small, tight waves'}</div>
            <div><strong>Octaves:</strong> {numOctaves} - {numOctaves === 1 ? 'Simple pattern' : numOctaves === 2 ? 'Moderate detail' : numOctaves === 3 ? 'Complex detail' : 'Very intricate'}</div>
            <div><strong>Scale:</strong> {scale} - {scale < 20 ? 'Subtle displacement' : scale < 40 ? 'Moderate displacement' : 'Heavy displacement'}</div>
            {description && <div className="pt-1 border-t border-fg-08 mt-2">{description}</div>}
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <div style={{
            transform: 'scale(1.3)',
            width: '100%',
            height: '100%',
            filter: isEnabled ? `url(#${filterId})` : 'none'
          }}>
            {children}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="kol-helper-xs text-fg-48 font-mono">
          baseFrequency: {baseFrequency} | octaves: {numOctaves} | scale: {scale}
        </div>
        <label className="kol-helper-s textAbsoluteWhite cursor-pointer hover:opacity-80">
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
          [UPLOAD]
        </label>
      </div>
    </div>
  )
}

export default MirrorVariant
