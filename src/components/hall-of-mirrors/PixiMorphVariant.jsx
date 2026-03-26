import { useEffect, useRef, useState } from 'react'
import { Application, Assets, TilingSprite } from 'pixi.js'

export default function PixiMorphVariant({
  title,
  imageSrc,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  onImageUpload,
  animate = false,
  scaleIntensity = 2,
  speed = 1,
  waveform = 'sine',
  shiftDirection = 'diagonal',
  wrapMode = 'clamp-to-edge'
}) {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const tilingRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const countRef = useRef(0)
  const scaleIntensityRef = useRef(scaleIntensity)
  const waveformRef = useRef(waveform)
  const shiftDirectionRef = useRef(shiftDirection)
  const wrapModeRef = useRef(wrapMode)
  const [showInfo, setShowInfo] = useState(false)

  // Keep refs updated
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    scaleIntensityRef.current = scaleIntensity
  }, [scaleIntensity])

  useEffect(() => {
    waveformRef.current = waveform
  }, [waveform])

  useEffect(() => {
    shiftDirectionRef.current = shiftDirection
  }, [shiftDirection])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    enabledRef.current = isEnabled
  }, [isEnabled])

  useEffect(() => {
    wrapModeRef.current = wrapMode
    if (tilingRef.current?.texture?.source?.style) {
      tilingRef.current.texture.source.style.addressMode = wrapMode
      tilingRef.current.texture.source.style.update()
    }
  }, [wrapMode])

  useEffect(() => {
    if (!canvasRef.current || appRef.current) return

    const initPixi = async () => {
      try {
        const canvasWrapper = canvasRef.current?.parentElement
        const imageContainer = canvasWrapper?.parentElement

        if (!imageContainer) {
          console.error('PixiJS Morph: No image container found')
          return
        }

        const width = imageContainer.clientWidth
        const height = imageContainer.clientHeight

        if (width === 0 || height === 0) {
          console.warn('PixiJS Morph: Container has zero dimensions')
          return
        }

        // Create Pixi Application
        const app = new Application()
        appRef.current = app

        await app.init({
          canvas: canvasRef.current,
          width: width,
          height: height,
          backgroundColor: 0x1a1a1a,
          resolution: window.devicePixelRatio || 1,
          autoDensity: true
        })

        const texture = await Assets.load(imageSrc)
        texture.source.style.addressMode = wrapModeRef.current || 'clamp-to-edge'
        texture.source.style.update()

        // Create tiling sprite
        const tilingSprite = new TilingSprite({
          texture,
          width: width,
          height: height
        })

        // Initial scale
        tilingSprite.tileScale.x = scaleIntensity
        tilingSprite.tileScale.y = scaleIntensity

        app.stage.addChild(tilingSprite)
        tilingRef.current = tilingSprite

        // Animation loop - morphing scale + shift
        const wave = (t) => {
          const w = waveformRef.current
          if (w === 'triangle') return Math.asin(Math.sin(t)) * (2 / Math.PI)
          if (w === 'square') return Math.sign(Math.sin(t))
          if (w === 'sawtooth') return 2 * (t / (2 * Math.PI) - Math.floor(0.5 + t / (2 * Math.PI)))
          return Math.sin(t) // sine (default)
        }

        app.ticker.add(() => {
          if (!tilingRef.current) return
          const si = scaleIntensityRef.current

          if (animateRef.current && enabledRef.current) {
            countRef.current += 0.005 * speedRef.current

            tilingRef.current.tileScale.x = si + wave(countRef.current)
            tilingRef.current.tileScale.y = si + wave(countRef.current + Math.PI / 2)

            const s = speedRef.current * 0.5
            const d = shiftDirectionRef.current
            if (d === 'horizontal') {
              tilingRef.current.tilePosition.x += s
            } else if (d === 'vertical') {
              tilingRef.current.tilePosition.y += s
            } else if (d === 'diagonal') {
              tilingRef.current.tilePosition.x += s
              tilingRef.current.tilePosition.y += s
            }
          } else {
            // Static: apply intensity directly so sliders have visible effect
            tilingRef.current.tileScale.x = si
            tilingRef.current.tileScale.y = si
          }
        })
      } catch (error) {
        console.error('PixiJS Morph initialization error:', error)
      }
    }

    const timer = setTimeout(() => {
      initPixi()
    }, 100)

    return () => {
      clearTimeout(timer)
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true })
        appRef.current = null
        tilingRef.current = null
      }
    }
  }, [])

  // Pause/resume — ticker checks refs, no reset needed

  // Update scale intensity
  useEffect(() => {
    if (tilingRef.current && !animateRef.current) {
      tilingRef.current.tileScale.x = scaleIntensity
      tilingRef.current.tileScale.y = scaleIntensity
    }
  }, [scaleIntensity])

  // Reload texture when image changes
  useEffect(() => {
    if (!appRef.current || !imageSrc) return

    ;(async () => {
      try {
        const texture = await Assets.load(imageSrc)
        if (tilingRef.current) {
          tilingRef.current.texture = texture
        }
      } catch (error) {
        console.error('Error loading new image:', error)
      }
    })()
  }, [imageSrc])

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

      <div
        className="relative aspect-[4/3] overflow-hidden border border-fg-08"
        style={{ borderRadius: '4px' }}
      >
        {showInfo && (
          <div className="absolute top-0 left-0 right-0 kol-helper-xs textAbsoluteWhite p-3 space-y-1 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--kol-surface-primary) 60%, transparent)' }}>
            <div><strong>Scale Intensity:</strong> {scaleIntensity.toFixed(1)} - {scaleIntensity < 1.5 ? 'Subtle morph' : scaleIntensity < 2.5 ? 'Medium morph' : 'Intense morph'}</div>
            <div><strong>Speed:</strong> {speed.toFixed(1)} - {speed < 1.5 ? 'Slow pulse' : speed < 3 ? 'Medium pulse' : 'Fast pulse'}</div>
            <div><strong>Effect:</strong> TilingSprite with sin/cos scale animation and diagonal shift creates organic morphing pattern</div>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ display: isEnabled ? 'block' : 'none' }}>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ display: !isEnabled ? 'block' : 'none' }}>
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="kol-helper-xs text-fg-48 font-mono">
          intensity: {scaleIntensity.toFixed(1)} | speed: {speed.toFixed(1)}
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
