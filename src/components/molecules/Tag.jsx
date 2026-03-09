export default function Tag({
  text,
  children,
  variant = 'default',
  className = '',
  onClick
}) {
  const baseClass = variant === 'inverse' ? 'control-unified-inverse' : 'tag-control'
  const content = children || text

  return (
    <div
      className={`cursor-pointer ${baseClass} whitespace-nowrap ${className}`}
      onClick={onClick}
    >
      <span>{content}</span>
    </div>
  )
}
