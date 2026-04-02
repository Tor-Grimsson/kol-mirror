// Icon loader — loads SVGs from ./svg/ by name

const svgModules = import.meta.glob('./svg/**/*.svg', { eager: true, query: '?raw', import: 'default' })

const ICON_CACHE = Object.entries(svgModules).reduce((acc, [path, svgContent]) => {
  const fileName = path.split('/').pop() || ''
  const iconName = fileName.replace('.svg', '')
  acc[iconName] = svgContent
  return acc
}, {})

const normalizeSize = (value) => {
  if (typeof value === 'number') return `${value}px`
  if (typeof value === 'string') return value
  return '16px'
}

const applySizeToMarkup = (markup, sizeValue) => {
  let updated = markup
  if (/width="/i.test(updated)) {
    updated = updated.replace(/width="[^"]*"/i, `width="${sizeValue}"`)
  } else {
    updated = updated.replace('<svg', `<svg width="${sizeValue}"`)
  }
  if (/height="/i.test(updated)) {
    updated = updated.replace(/height="[^"]*"/i, `height="${sizeValue}"`)
  } else {
    updated = updated.replace('<svg', `<svg height="${sizeValue}"`)
  }
  return updated
}

export default function Icon({ name, size = 16, className = '', style = {} }) {
  const svgMarkup = ICON_CACHE[name]

  if (!svgMarkup) {
    console.warn(`Icon "${name}" not found in videomodulo/icons/svg/`)
    return null
  }

  const dimension = normalizeSize(size)
  const sizedMarkup = applySizeToMarkup(svgMarkup, dimension)

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: dimension,
        height: dimension,
        lineHeight: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: sizedMarkup }}
    />
  )
}
