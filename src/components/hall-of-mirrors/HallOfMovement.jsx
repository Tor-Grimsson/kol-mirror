import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import MovementControlsPanel from './MovementControlsPanel'

const MovementVariant = ({
  variantId,
  title,
  isEnabled,
  isSelected,
  onToggleEnabled,
  onToggleSelect,
  speed,
  amount,
  easingStrength,
  type = 'scale'
}) => {
  const imgRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    if (!isEnabled || !imgRef.current) {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
      return
    }

    let easing
    if (easingStrength < 0.8) {
      easing = 'sine.inOut'
    } else if (easingStrength < 4) {
      easing = `power${easingStrength.toFixed(1)}.inOut`
    } else {
      easing = 'expo.inOut'
    }

    const tl = gsap.timeline({ repeat: -1, yoyo: true })

    if (type === 'scale') {
      tl.to(imgRef.current, {
        scale: amount,
        duration: speed,
        ease: easing,
        transformOrigin: 'center center'
      })
    } else if (type === 'stretch') {
      tl.to(imgRef.current, {
        scaleX: amount,
        scaleY: 1.1,
        duration: speed,
        ease: easing,
        transformOrigin: 'center center'
      })
    } else if (type === 'harmonica') {
      tl.to(imgRef.current, {
        scaleX: amount,
        duration: speed,
        ease: easing,
        transformOrigin: 'center center'
      })
    }

    timelineRef.current = tl

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
    }
  }, [isEnabled, speed, amount, easingStrength, type])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="kol-helper-s text-fg-64">{title}</div>
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
      <div
        className="relative aspect-[4/3] overflow-hidden border border-fg-08 bg-surface-absolute-split"
        style={{ borderRadius: '4px' }}
      >
        <img
          ref={imgRef}
          src="/images/stack-hero-800.jpg"
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="kol-helper-xs text-fg-48 font-mono">
          {isEnabled ? `${type === 'harmonica' ? 'X' : type === 'stretch' ? 'X/Y' : 'Scale'}: ${amount.toFixed(2)}` : '—'}
        </div>
      </div>
    </div>
  )
}

export default function HallOfMovement({ onBack }) {
  const [variantEnabled, setVariantEnabled] = useState({
    'breathing-scale': false,
    'breathing-stretch': false,
    'breathing-harmonica': false
  })

  const [selectedVariant, setSelectedVariant] = useState('breathing-harmonica')

  const [speed, setSpeed] = useState(2.5)
  const [amount, setAmount] = useState(1.3)
  const [easingStrength, setEasingStrength] = useState(2)

  const handleToggleEnabled = (variantId) => {
    setVariantEnabled(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }))
  }

  const handleToggleSelect = (variantId) => {
    if (selectedVariant === variantId) {
      setSelectedVariant(null)
    } else {
      setSelectedVariant(variantId)
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6" onClick={onBack}>
            [BACK]
          </div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Movement</h1>
          <p className="kol-helper-s text-fg-64 mt-2">GSAP-powered transformations: moving, bending, stretching. Exploring variable font animations and text morphing for performance comparison.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MovementVariant
            variantId="breathing-scale"
            title="Breathing Scale"
            type="scale"
            isEnabled={variantEnabled['breathing-scale']}
            isSelected={selectedVariant === 'breathing-scale'}
            onToggleEnabled={() => handleToggleEnabled('breathing-scale')}
            onToggleSelect={() => handleToggleSelect('breathing-scale')}
            speed={speed}
            amount={amount}
            easingStrength={easingStrength}
          />

          <MovementVariant
            variantId="breathing-stretch"
            title="Breathing Stretch"
            type="stretch"
            isEnabled={variantEnabled['breathing-stretch']}
            isSelected={selectedVariant === 'breathing-stretch'}
            onToggleEnabled={() => handleToggleEnabled('breathing-stretch')}
            onToggleSelect={() => handleToggleSelect('breathing-stretch')}
            speed={speed}
            amount={amount}
            easingStrength={easingStrength}
          />

          <MovementVariant
            variantId="breathing-harmonica"
            title="Breathing Harmonica"
            type="harmonica"
            isEnabled={variantEnabled['breathing-harmonica']}
            isSelected={selectedVariant === 'breathing-harmonica'}
            onToggleEnabled={() => handleToggleEnabled('breathing-harmonica')}
            onToggleSelect={() => handleToggleSelect('breathing-harmonica')}
            speed={speed}
            amount={amount}
            easingStrength={easingStrength}
          />

          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 opacity-40">
              <div className="flex items-center justify-between">
                <div className="kol-helper-s text-fg-32">—</div>
                <div className="flex gap-2">
                  <div className="kol-helper-xs text-fg-32">[OFF]</div>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden border border-fg-08 bg-surface-secondary" style={{ borderRadius: '4px' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="kol-helper-s text-fg-32">Available slot</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="kol-helper-xs text-fg-32 font-mono">—</div>
              </div>
            </div>
          ))}
        </div>

        {selectedVariant && (
          <div className="fixed right-8 bottom-8 z-50 w-80">
            <MovementControlsPanel
              enabled={variantEnabled[selectedVariant]}
              onEnabledChange={(value) => setVariantEnabled(prev => ({ ...prev, [selectedVariant]: value }))}
              speed={speed}
              onSpeedChange={setSpeed}
              amount={amount}
              onAmountChange={setAmount}
              easingStrength={easingStrength}
              onEasingStrengthChange={setEasingStrength}
            />
          </div>
        )}

        <div className="rounded border border-fg-08 bg-surface-secondary p-6 space-y-4">
          <h2 className="kol-heading-sm">Planned GSAP Variants</h2>
          <ul className="kol-helper-s text-fg-64 space-y-2 list-disc pl-6">
            <li><strong>Variable Font Animations:</strong> Morphing text through weight, width, slant, and optical size axes</li>
            <li><strong>Text Scramble & Morph:</strong> Character-level transformations and transitions</li>
            <li><strong>3D Transforms:</strong> Perspective shifts, rotations, and depth effects</li>
            <li><strong>Elastic Stretching:</strong> Physics-based deformations with spring animations</li>
            <li><strong>Stagger Waves:</strong> Coordinated movement across multiple elements</li>
            <li><strong>Glitch Text:</strong> Pure CSS/GSAP digital corruption effects</li>
            <li><strong>Path Morphing:</strong> SVG path animations and shape transformations</li>
            <li><strong>Kinetic Typography:</strong> Responsive text that reacts to scroll or cursor</li>
            <li><strong>Text Reveal:</strong> Split text animations with custom easing</li>
          </ul>
          <div className="kol-helper-xs text-fg-48 font-mono pt-4">
            Goal: Compare variable font animation performance vs video playback
          </div>
        </div>
      </div>
    </div>
  )
}
