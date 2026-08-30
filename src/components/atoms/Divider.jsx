import DSDivider from '@kolkrabbi/kol-component/atoms/Divider'

/**
 * Divider — thin adapter over the DS Divider (@kolkrabbi/kol-component).
 *
 * Horizontal is the DS component untouched. Vertical is mirror's own, and
 * deliberately so: the DS re-ruled `variant="vertical"` to `align-self: center`
 * at a fixed 16px — "the rule is centred on what it separates, not stretched to
 * the row" — which is right for a toolbar separating type. Mirror's seven
 * vertical rules separate FULL-HEIGHT MIXER COLUMNS (channel strips, routing
 * matrix bays, master sends), so they stretch. Passing `height` per call site
 * cannot express "as tall as the flex line".
 *
 * Same seam as `atoms/Button`: DS behaviour, one documented local divergence.
 */
const Divider = ({ variant = 'horizontal', className = '', opacity = '08', inverse = false, ...props }) => {
  if (variant !== 'vertical') {
    return <DSDivider className={className} opacity={opacity} inverse={inverse} {...props} />
  }
  const opacityClass = inverse ? `bg-fg-inverse-${opacity}` : `bg-fg-${opacity}`
  return (
    <div className={`self-stretch flex justify-center items-center ${className}`.trim()}>
      <div className={opacityClass} style={{ width: '1px', height: '100%' }} />
    </div>
  )
}

export default Divider
