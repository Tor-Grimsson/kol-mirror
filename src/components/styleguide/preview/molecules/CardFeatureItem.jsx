import { Icon } from '@kol/ui/atoms'
import { Link } from 'react-router-dom'

const CardFeatureItem = ({ title, icon, visual, description, backgroundColor = 'bg-surface-on-inverse', href, imageAspectRatio = 'auto', imagePosition = 'center' }) => {
  // Check if visual is an SVG URL (for currentColor support)
  const isSvgUrl = typeof visual === 'string' && visual.endsWith('.svg')

  // Aspect ratio class mapping
  const aspectClasses = {
    'auto': '',
    '9/6': 'aspect-[9/6]',
    '10/6': 'aspect-[10/6]',
    '16/9': 'aspect-video',
    '1/1': 'aspect-square'
  }
  const aspectClass = aspectClasses[imageAspectRatio] || ''

  const CardContent = (
    <>
      {/* Header */}
      <div className="w-full flex items-center justify-between gap-2">
        <h3 className="kol-helper-uc-md text-auto text-[16px]">{title}</h3>
        {icon && <Icon name={icon} size={16} className="flex-shrink-0 text-auto" />}
      </div>

      {/* Visual */}
      <div className={`w-full flex-1 flex items-center justify-center overflow-hidden ${aspectClass}`}>
        {visual ? (
          typeof visual === 'string' ? (
            isSvgUrl ? (
              // SVG with currentColor support using mask-image
              <div
                className="w-full h-full bg-current rounded"
                style={{
                  maskImage: `url(${visual})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: `url(${visual})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center'
                }}
              />
            ) : (
              <img src={visual} alt={title} className="w-full h-full object-cover rounded" style={{ objectPosition: imagePosition }} />
            )
          ) : (
            visual
          )
        ) : (
          <Icon name={icon} size={96} className="text-auto" />
        )}
      </div>

      {/* Description */}
      <p className="kol-mono-xs text-auto opacity-50">{description}</p>
    </>
  )

  const baseClasses = `w-full flex-1 h-[304px] md:h-72 p-4 md:p-6 gap-4 ${backgroundColor} rounded border flex flex-col justify-between items-start overflow-hidden`

  if (href) {
    const isExternal = href.startsWith('http') || href.startsWith('mailto')

    if (isExternal) {
      return (
        <a
          href={href}
          className={`${baseClasses} border-auto hover:border-fg-32 transition-all duration-300`}
          target="_blank"
          rel="noreferrer noopener"
        >
          {CardContent}
        </a>
      )
    }

    return (
      <Link
        to={href}
        className={`${baseClasses} border-auto hover:border-fg-24 transition-all duration-300`}
      >
        {CardContent}
      </Link>
    )
  }

  return (
    <div className={`${baseClasses} border-auto`}>
      {CardContent}
    </div>
  )
}

export default CardFeatureItem
