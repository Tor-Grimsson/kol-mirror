import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import SymphonyMixer from './SymphonyMixer'

export default function HallOfSymphony({ onBack }) {
  const letter1Ref = useRef(null)
  const letter2Ref = useRef(null)
  const containerRef = useRef(null)
  const displacementFilterRef = useRef(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mixer state - Displacement channel
  const [displacementValue, setDisplacementValue] = useState(0)
  const [displacementEnabled, setDisplacementEnabled] = useState(false)
  const [displacementBoosted, setDisplacementBoosted] = useState(false)
  const [displacementRandomness, setDisplacementRandomness] = useState(0)

  // Mixer state - Movement channel
  const [movementValue, setMovementValue] = useState(0)
  const [movementEnabled, setMovementEnabled] = useState(false)
  const [movementBoosted, setMovementBoosted] = useState(false)
  const [movementRandomness, setMovementRandomness] = useState(0)

  // Mixer state - Copies channel
  const [copiesValue, setCopiesValue] = useState(0)
  const [copiesEnabled, setCopiesEnabled] = useState(false)
  const [copiesBoosted, setCopiesBoosted] = useState(false)
  const [copiesRandomness, setCopiesRandomness] = useState(0)

  const [mixerLayout, setMixerLayout] = useState('row')

  // Canvas info hover state
  const [showCanvasInfo, setShowCanvasInfo] = useState(false)

  // Nine variants dropdown state
  const [openNineDropdown, setOpenNineDropdown] = useState(null)

  // Snapped settings from Hall of Movement
  const baseSpeed = 2.5
  const baseAmount = 1.3
  const easingStrength = 2.0

  const movementMultiplier = movementBoosted ? 2 : 1
  const speed = baseSpeed / ((movementValue / 100) * movementMultiplier || 1)
  const amount = 1 + ((baseAmount - 1) * (movementValue / 100) * movementMultiplier)

  useEffect(() => {
    if (!isAnimating || !movementEnabled || !letter1Ref.current || !letter2Ref.current) {
      if (letter1Ref.current) gsap.killTweensOf(letter1Ref.current)
      if (letter2Ref.current) gsap.killTweensOf(letter2Ref.current)
      return
    }

    const randomFactor = 1 + (Math.random() - 0.5) * (movementRandomness / 10)
    const effectiveSpeed = speed * randomFactor
    const effectiveAmount = amount * randomFactor

    let easing
    if (easingStrength < 0.8) {
      easing = 'sine.inOut'
    } else if (easingStrength < 4) {
      easing = `power${easingStrength.toFixed(1)}.inOut`
    } else {
      easing = 'expo.inOut'
    }

    const tl1 = gsap.timeline({ repeat: -1, yoyo: true })
    const tl2 = gsap.timeline({ repeat: -1, yoyo: true, delay: effectiveSpeed / 2 })

    tl1.to(letter1Ref.current, {
      scale: effectiveAmount,
      duration: effectiveSpeed,
      ease: easing,
      transformOrigin: 'center center'
    })

    tl2.to(letter2Ref.current, {
      scale: effectiveAmount,
      duration: effectiveSpeed,
      ease: easing,
      transformOrigin: 'center center'
    })

    return () => {
      tl1.kill()
      tl2.kill()
    }
  }, [isAnimating, movementEnabled, movementValue, movementBoosted, movementRandomness, speed, amount, easingStrength])

  // Calculate displacement filter parameters
  const displacementMultiplier = displacementBoosted ? 2 : 1
  const baseFrequency = (displacementValue / 100) * 0.049 + 0.001
  const displacementScale = 50 * (displacementValue / 100) * displacementMultiplier
  const turbulenceSeed = Math.floor(displacementRandomness * 10)
  const octaves = 1 + Math.floor(displacementRandomness / 3)

  useEffect(() => {
    if (!isAnimating || !displacementEnabled || !displacementFilterRef.current) return

    const turbulence = displacementFilterRef.current.querySelector('feTurbulence')
    if (!turbulence) return

    const targetFrequency = baseFrequency * 1.5

    gsap.to(turbulence, {
      attr: { baseFrequency: targetFrequency },
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    return () => {
      gsap.killTweensOf(turbulence)
    }
  }, [isAnimating, displacementEnabled, baseFrequency])

  const nineVariants = {
    displacement: [
      { id: 'liquid-surface', name: 'Liquid Surface' },
      { id: 'frosted-glass', name: 'Frosted Glass' },
      { id: 'turbulent-water', name: 'Turbulent Water' },
      { id: 'chromatic-shift', name: 'Chromatic Shift' },
      { id: 'ripple-effect', name: 'Ripple Effect' },
      { id: 'heat-distortion', name: 'Heat Distortion' },
      { id: 'fabric-wave', name: 'Fabric Wave' },
      { id: 'glass-refraction', name: 'Glass Refraction' },
      { id: 'slot-9', name: 'Slot 9' }
    ],
    movement: [
      { id: 'breathing-scale', name: 'Breathing Scale' },
      { id: 'stretch', name: 'Stretch' },
      { id: 'harmonica', name: 'Harmonica' },
      { id: 'slot-4', name: 'Slot 4' },
      { id: 'slot-5', name: 'Slot 5' },
      { id: 'slot-6', name: 'Slot 6' },
      { id: 'slot-7', name: 'Slot 7' },
      { id: 'slot-8', name: 'Slot 8' },
      { id: 'slot-9', name: 'Slot 9' }
    ],
    copies: [
      { id: 'slot-1', name: 'Slot 1' },
      { id: 'slot-2', name: 'Slot 2' },
      { id: 'slot-3', name: 'Slot 3' },
      { id: 'slot-4', name: 'Slot 4' },
      { id: 'slot-5', name: 'Slot 5' },
      { id: 'slot-6', name: 'Slot 6' },
      { id: 'slot-7', name: 'Slot 7' },
      { id: 'slot-8', name: 'Slot 8' },
      { id: 'slot-9', name: 'Slot 9' }
    ]
  }

  const handleLoadPreset = ({ channel, source }) => {
    if (source === 'nine') {
      setOpenNineDropdown(channel)
    }
  }

  const handleSelectVariant = (channel, variantId) => {
    const presets = {
      displacement: {
        'liquid-surface': { value: 30, boosted: false, randomness: 3 },
        'frosted-glass': { value: 15, boosted: false, randomness: 1 },
        'turbulent-water': { value: 50, boosted: true, randomness: 7 },
        'chromatic-shift': { value: 25, boosted: false, randomness: 5 },
        'ripple-effect': { value: 40, boosted: false, randomness: 4 },
        'heat-distortion': { value: 35, boosted: false, randomness: 8 },
        'fabric-wave': { value: 45, boosted: false, randomness: 6 },
        'glass-refraction': { value: 20, boosted: false, randomness: 2 },
        'slot-9': { value: 60, boosted: true, randomness: 9 }
      },
      movement: {
        'breathing-scale': { value: 50, boosted: false, randomness: 3 },
        'stretch': { value: 70, boosted: false, randomness: 5 },
        'harmonica': { value: 80, boosted: true, randomness: 7 },
        'slot-4': { value: 40, boosted: false, randomness: 2 },
        'slot-5': { value: 60, boosted: false, randomness: 4 },
        'slot-6': { value: 90, boosted: true, randomness: 8 },
        'slot-7': { value: 30, boosted: false, randomness: 1 },
        'slot-8': { value: 75, boosted: false, randomness: 6 },
        'slot-9': { value: 100, boosted: true, randomness: 10 }
      },
      copies: {
        'slot-1': { value: 30, boosted: false, randomness: 2 },
        'slot-2': { value: 50, boosted: false, randomness: 5 },
        'slot-3': { value: 70, boosted: true, randomness: 7 },
        'slot-4': { value: 40, boosted: false, randomness: 3 },
        'slot-5': { value: 60, boosted: false, randomness: 4 },
        'slot-6': { value: 80, boosted: true, randomness: 8 },
        'slot-7': { value: 35, boosted: false, randomness: 1 },
        'slot-8': { value: 90, boosted: false, randomness: 9 },
        'slot-9': { value: 100, boosted: true, randomness: 10 }
      }
    }

    const preset = presets[channel]?.[variantId]
    if (!preset) return

    if (channel === 'displacement') {
      setDisplacementValue(preset.value)
      setDisplacementBoosted(preset.boosted)
      setDisplacementRandomness(preset.randomness)
      setDisplacementEnabled(true)
    } else if (channel === 'movement') {
      setMovementValue(preset.value)
      setMovementBoosted(preset.boosted)
      setMovementRandomness(preset.randomness)
      setMovementEnabled(true)
    } else if (channel === 'copies') {
      setCopiesValue(preset.value)
      setCopiesBoosted(preset.boosted)
      setCopiesRandomness(preset.randomness)
      setCopiesEnabled(true)
    }

    setIsAnimating(true)
    setOpenNineDropdown(null)
  }

  return (
    <div ref={containerRef} className="min-h-screen w-full bg-surface-primary p-12">
      <div className="mx-auto max-w-7xl space-y-12 uppercase">
        <div>
          <div className="kol-helper-xs cursor-pointer text-fg-64 hover:text-fg-96 mb-6 normal-case" onClick={onBack}>
            [BACK]
          </div>
          <h1 className="kol-heading-sm text-fg-96">Hall of Symphony</h1>
        </div>

        <div className="flex justify-center relative">
          <div className="flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <div
                className="kol-helper-s text-fg-64 cursor-help"
                onMouseEnter={() => setShowCanvasInfo(true)}
                onMouseLeave={() => setShowCanvasInfo(false)}
              >
                Symphony Features
              </div>
              <div className="flex gap-2">
                <div
                  className={`kol-helper-xs cursor-pointer select-none ${isAnimating ? 'accentYellow' : 'text-fg-64'} hover:text-fg-96`}
                  onClick={() => setIsAnimating(!isAnimating)}
                >
                  [{isAnimating ? 'ON' : 'OFF'}]
                </div>
                <div className="kol-helper-xs text-fg-48">[FPS: —]</div>
              </div>
            </div>
            <div
              className="relative overflow-hidden border border-fg-08 bg-surface-absolute-split"
              style={{
                width: '1024px',
                height: '600px',
                borderRadius: '4px'
              }}
            >
              {showCanvasInfo && (
                <div className="absolute top-0 left-0 right-0 kol-helper-xs textAbsoluteWhite p-3 space-y-1 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--kol-surface-primary) 60%, transparent)' }}>
                  <div><strong>Live Mixer:</strong> Combine effects from Displacement, Movement, and Copies in real-time</div>
                  <div><strong>Performance:</strong> Monitor FPS, CPU usage, and memory consumption during effect composition</div>
                  <div><strong>Benchmark:</strong> Compare SVG, GSAP, and PixiJS efficiency side-by-side to prevent thermal throttling</div>
                </div>
              )}
              <div className="absolute inset-0 flex flex-row items-center justify-center gap-8 text-auto">
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                  <defs>
                    <filter id="displacement-filter" ref={displacementFilterRef} x="-50%" y="-50%" width="200%" height="200%">
                      <feTurbulence
                        type="turbulence"
                        baseFrequency={baseFrequency}
                        numOctaves={octaves}
                        seed={turbulenceSeed}
                        result="turbulence"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="turbulence"
                        scale={displacementScale}
                        xChannelSelector="R"
                        yChannelSelector="G"
                      />
                    </filter>
                  </defs>
                </svg>

                <svg
                  ref={letter1Ref}
                  width="67"
                  height="96"
                  viewBox="0 0 67 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    height: '400px',
                    width: 'auto',
                    filter: displacementEnabled ? 'url(#displacement-filter)' : 'none'
                  }}
                >
                  <path d="M0 93.8427V92.2248C13.2809 92.2248 17.2584 90.3371 17.2584 81.7079V34.4495H0V32.8315C13.2809 32.8315 17.2584 30.9439 17.2584 22.3147V14.2922C17.2584 5.66297 13.2809 3.77533 0 3.77533V2.15735H36.6742C53.3933 2.15735 66.9438 23.4607 66.9438 48.8764C66.9438 74.0899 53.5955 93.8427 37.0786 93.8427H0ZM25.3483 92.2248H34.7865C48.0674 92.2248 58.8539 72.6742 58.8539 48.3371C58.8539 43.4832 58.4494 38.8989 57.6404 34.4495H42.6067C29.3258 34.4495 25.3483 36.3371 25.3483 44.9663V92.2248ZM25.3483 32.8315H57.3034C53.8652 15.9776 44.9663 3.77533 34.4494 3.77533H25.3483V32.8315Z" fill="currentColor"/>
                </svg>

                <svg
                  ref={letter2Ref}
                  width="47"
                  height="96"
                  viewBox="0 0 47 96"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    height: '400px',
                    width: 'auto',
                    filter: displacementEnabled ? 'url(#displacement-filter)' : 'none'
                  }}
                >
                  <path d="M6.26966 2.69663C10.0449 1.82022 11.7978 0 16.9213 0C36.5393 0 46.7191 26.3596 46.7191 54.0674C46.7191 82.5843 35.9326 96 23.191 96C10.9888 96 0 83.7978 0 62.4944C0 42.0674 9.57303 30.6067 20.9663 26.5618L1.55056 26.6292L6.26966 2.69663ZM5.32584 24.4719L40.0449 24.809C37.2135 14.2921 31.8876 5.93258 24.4045 3.64045C15.7079 1.01124 9.16854 7.61798 5.32584 24.4719ZM5.79775 72.1348C5.79775 79.0112 7.01124 89.3258 14.6966 91.7528C24.9438 94.9888 36.7416 80.8989 40.9213 61.2135C43.2809 49.9551 43.0787 37.2135 40.4494 26.427L29.9326 26.4944C18.4719 27.7753 5.79775 49.2809 5.79775 72.1348Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="kol-helper-xs text-fg-48 font-mono">1024×600px</div>
              <div className="kol-helper-xs text-fg-48 font-mono">
                {isAnimating ? `${speed.toFixed(1)}s | ${amount.toFixed(2)}x | ${easingStrength.toFixed(1)}` : 'CPU: — | MEM: —'}
              </div>
            </div>
          </div>
        </div>

        <div className="fixed right-8 bottom-8 z-50" style={{ width: mixerLayout === 'row' ? '900px' : '400px' }}>
          <SymphonyMixer
            displacementValue={displacementValue}
            onDisplacementChange={setDisplacementValue}
            displacementEnabled={displacementEnabled}
            onDisplacementEnabledChange={setDisplacementEnabled}
            displacementBoosted={displacementBoosted}
            onDisplacementBoostChange={setDisplacementBoosted}
            displacementRandomness={displacementRandomness}
            onDisplacementRandomnessChange={setDisplacementRandomness}
            movementValue={movementValue}
            onMovementChange={setMovementValue}
            movementEnabled={movementEnabled}
            onMovementEnabledChange={setMovementEnabled}
            movementBoosted={movementBoosted}
            onMovementBoostChange={setMovementBoosted}
            movementRandomness={movementRandomness}
            onMovementRandomnessChange={setMovementRandomness}
            copiesValue={copiesValue}
            onCopiesChange={setCopiesValue}
            copiesEnabled={copiesEnabled}
            onCopiesEnabledChange={setCopiesEnabled}
            copiesBoosted={copiesBoosted}
            onCopiesBoostChange={setCopiesBoosted}
            copiesRandomness={copiesRandomness}
            onCopiesRandomnessChange={setCopiesRandomness}
            onLoadPreset={handleLoadPreset}
            layout={mixerLayout}
            onLayoutChange={setMixerLayout}
            nineVariants={nineVariants}
            openNineDropdown={openNineDropdown}
            onSelectVariant={handleSelectVariant}
            onCloseDropdown={() => setOpenNineDropdown(null)}
          />
        </div>
      </div>
    </div>
  )
}
