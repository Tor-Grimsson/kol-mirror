import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'

const MovementVariant = ({
  title,
  imageSrc,
  isEnabled,
  speed,
  amount,
  easing = 'sine.inOut',
  easingStrength,
  type = 'scale',
  transformOrigin = 'center center',
  timeScale = 1,
  className = '',
  externalImgRef,
}) => {
  const imgRef = useRef(null)
  const timelineRef = useRef(null)

  // Build/rebuild timeline when params change
  useEffect(() => {
    if (!imgRef.current) return

    const target = imgRef.current

    if (timelineRef.current) {
      timelineRef.current.kill()
      timelineRef.current = null
    }

    const ease = easing || 'sine.inOut'

    const tl = gsap.timeline({ repeat: -1, yoyo: true, paused: !isEnabled })

    if (type === 'scale') {
      tl.to(target, { scale: amount, duration: speed, ease, transformOrigin })
    } else if (type === 'stretch') {
      tl.to(target, { scaleX: amount, scaleY: 1.1, duration: speed, ease, transformOrigin })
    } else if (type === 'harmonica') {
      tl.to(target, { scaleX: amount, duration: speed, ease, transformOrigin })
    }

    // When paused, seek to midpoint so sliders have visible effect
    if (!isEnabled) {
      tl.seek(speed / 2)
    }

    timelineRef.current = tl

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill()
        timelineRef.current = null
      }
    }
  }, [speed, amount, easing, type, transformOrigin])

  // Pause/resume without rebuilding — keeps current frame
  useEffect(() => {
    if (!timelineRef.current) return
    if (isEnabled) {
      timelineRef.current.play()
    } else {
      timelineRef.current.pause()
    }
  }, [isEnabled])

  // Live speed control via timeScale
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(Math.max(0.01, timeScale))
    }
  }, [timeScale])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <img
        ref={(el) => { imgRef.current = el; if (externalImgRef) externalImgRef.current = el }}
        src={imageSrc}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

export default MovementVariant
