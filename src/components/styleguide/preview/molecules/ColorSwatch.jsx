import { useMemo, useRef, useEffect, useState } from 'react'

const ColorSwatch = ({ name, token, foreground, description }) => {
  const style = useMemo(() => ({ backgroundColor: `var(${token})` }), [token])
  const labelStyle = {
    color: foreground ? `var(${foreground})` : 'var(--kol-surface-on-primary)'
  }
  const swatchRef = useRef(null)
  const [hexValue, setHexValue] = useState('')

  useEffect(() => {
    if (swatchRef.current) {
      const computedColor = window.getComputedStyle(swatchRef.current).backgroundColor
      // Convert rgb/rgba to hex
      const rgba = computedColor.match(/[\d.]+/g)
      if (rgba) {
        const hex = '#' + rgba.slice(0, 3).map(x => {
          const hex = parseInt(x).toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('')

        // Check for alpha/opacity
        if (rgba[3] && parseFloat(rgba[3]) < 1) {
          const opacity = Math.round(parseFloat(rgba[3]) * 100)
          setHexValue(`${hex} @ ${opacity}%`)
        } else {
          setHexValue(hex)
        }
      }
    }
  }, [token])

  return (
    <div
      className="surface-panel flex flex-col gap-3 rounded-2xl border p-4 transition-colors"
      style={{ borderColor: 'var(--kol-border-default)' }}
    >
      <div ref={swatchRef} className="h-24 w-full rounded-xl" style={style} />
      <div className="space-y-1" style={labelStyle}>
        <div className="kol-label">
          {name} {hexValue && <span className="opacity-60 font-normal">({hexValue})</span>}
        </div>
        <div className="text-xs opacity-70">token: {token}</div>
        {description ? <p className="text-xs opacity-60">{description}</p> : null}
      </div>
    </div>
  )
}

export default ColorSwatch
