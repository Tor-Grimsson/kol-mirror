/**
 * Badge — status / categorization indicator
 *
 * Converted from Badge.tsx (shadcn/CVA) → plain JSX with kol- CSS variables.
 * CSS classes live in components.css under 2-LABELS → Badges.
 */

const VARIANT_MAP = {
  default: 'badge-default',
  secondary: 'badge-secondary',
  destructive: 'badge-destructive',
  outline: 'badge-outline',
  success: 'badge-success',
  warning: 'badge-warning',
  critical: 'badge-critical',
  info: 'badge-info'
}

const SIZE_MAP = {
  sm: 'badge-sm',
  md: 'badge-md',
  lg: 'badge-lg'
}

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) => {
  const variantClass = VARIANT_MAP[variant] || VARIANT_MAP.default
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div
      className={`badge ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Badge
