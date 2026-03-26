import { useState } from 'react'

/**
 * Shared frame for all variant components in hall views.
 * Provides title, toggles, canvas container, fallback image, info overlay, stats, and upload.
 */
export default function VariantFrame({
  title,
  isEnabled = true,
  isSelected = false,
  onToggleEnabled,
  onToggleSelect,
  onImageUpload,
  imageSrc,
  info,
  stats,
  aspect = '4/3',
  children,
  canvasProps,
}) {
  const [showInfo, setShowInfo] = useState(false)

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
        className="relative overflow-hidden border border-fg-08"
        style={{ borderRadius: '4px', aspectRatio: aspect }}
        {...canvasProps}
      >
        {showInfo && info && (
          <div
            className="absolute top-0 left-0 right-0 kol-helper-xs textAbsoluteWhite p-3 space-y-1 z-10"
            style={{ backgroundColor: 'color-mix(in srgb, var(--kol-surface-primary) 60%, transparent)' }}
          >
            {info}
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none" style={{ display: isEnabled ? 'block' : 'none' }}>
          {children}
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ display: !isEnabled ? 'block' : 'none' }}>
          <img src={imageSrc} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="kol-helper-xs text-fg-48 font-mono">
          {stats}
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
