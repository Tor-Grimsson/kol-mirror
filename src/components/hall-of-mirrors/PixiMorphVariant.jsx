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
  speed = 1
}) {
  const canvasRef = useRef(null)
  const appRef = useRef(null)
  const tilingRef = useRef(null)
  const speedRef = useRef(speed)
  const animateRef = useRef(animate)
  const enabledRef = useRef(isEnabled)
  const countRef = useRef(0)
  const [showInfo, setShowInfo] = useState(false)

  // Keep refs updated
  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  useEffect(() => {
    enabledRef.current = isEnabled
  }, [isEnabled])

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

        // Animation loop - morphing scale with sin/cos + diagonal shift
        app.ticker.add(() => {
          if (tilingRef.current && animateRef.current && enabledRef.current) {
            countRef.current += 0.005 * speedRef.current

            // Morphing scale using sin and cos (like the example)
            tilingRef.current.tileScale.x = scaleIntensity + Math.sin(countRef.current)
            tilingRef.current.tileScale.y = scaleIntensity + Math.cos(countRef.current)

            // Diagonal shift
            tilingRef.current.tilePosition.x += speedRef.current * 0.5
            tilingRef.current.tilePosition.y += speedRef.current * 0.5
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

  // Reset when disabled
  useEffect(() => {
    if (tilingRef.current && !isEnabled) {
      tilingRef.current.tilePosition.x = 0
      tilingRef.current.tilePosition.y = 0
      countRef.current = 0
    }
  }, [isEnabled])

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
