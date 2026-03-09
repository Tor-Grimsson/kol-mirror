import DesCard from './DesCard'
import SurfacePreviewGrid from './SurfacePreviewGrid'

const sampleText = {
  // Display group
  'display-lg': 'KOLKRABBI DISPLAY',
  'display-section': 'KOLKRABBI SECTION',
  'display-section-sm': 'KOLKRABBI SECTION SMALL',
  'display-subsection': 'KOLKRABBI SUBSECTION',
  // Heading group
  'heading-xl': 'Kolkrabbi Heading XL',
  'heading-lg': 'Kolkrabbi Heading LG',
  'heading-md': 'Kolkrabbi Heading MD',
  'heading-sm': 'KOLKRABBI HEADING SM',
  // Text group
  'text-lg': 'Larger text for introductory paragraphs and feature copy.',
  'text-md': 'Text copy demonstrates spacing and legibility.',
  'text-md-rg': 'Text copy with Right Grotesk Narrow for tighter layouts.',
  'text-sm': 'Supporting copy with smaller size.',
  // Mono group
  'mono-text': 'Monospace text for technical content.',
  'mono-text-fine': 'Monospace text fine variant (weight 300).',
  'mono-sm': 'Compact mono details for chips and inline code.',
  'mono-sm-fine': 'Compact mono fine variant (weight 300).',
  'mono-xs': 'Monospace metadata text',
  'mono-xxs': 'Ultra-small mono',
  // Label group
  'label-mono-sm': 'UI LABEL MONO',
  'label-mono-md': 'COMPACT LABEL',
  'label-mono-xs': 'TINY LABEL',
  'label-compact-lg': 'LARGE LABEL',
  'label-compact-md': 'SECTION LABEL',
  // Helper group
  'helper-xl': 'HELPER XL',
  'helper-lg': 'HELPER LG',
  'helper-md': 'HELPER MD',
  'helper-s': 'HELPER S',
  'helper-xs': 'HELPER XS',
  'helper-xxs': 'HELPER XXS'
}

const resolveFontFamily = (fontKey) => {
  switch (fontKey) {
    case 'Right Grotesk Tight':
      return 'var(--kol-font-family-rgrot-tight)'
    case 'Right Grotesk Narrow':
      return 'var(--kol-font-family-rgrot-narrow)'
    case 'Right Grotesk Mono':
      return 'var(--kol-font-family-mono)'
    case 'Inter Tight':
      return 'var(--kol-font-family-body)'
    default:
      return 'inherit'
  }
}

const TypeSample = ({ className, label, usage, font, id, breakpoints = [] }) => {
  const renderPreview = () => (
    <div className="space-y-6">
      {breakpoints.map((bp, index) => (
        <div key={index} className="space-y-2">
          {/* Stamp in the exact breakpoint styles inline */}
          <div
            className="text-auto"
            style={{
              fontFamily: resolveFontFamily(bp.fontFamily),
              fontSize: bp.size,
              lineHeight: bp.lineHeight,
              fontStretch: bp.fontStretch || 'normal',
              fontWeight: bp.fontWeight || 'normal',
              textTransform: bp.textTransform || 'none',
              letterSpacing: bp.letterSpacing || 'normal'
            }}
          >
            {sampleText[id] ?? 'Sample text'}
          </div>
          <div className="kol-mono-xs opacity-60">
            {bp.name} • {bp.size} • {bp.lineHeight}
          </div>
        </div>
      ))}
      <div className="kol-mono-xs opacity-40 pt-2 border-t border-auto">
        Class: {className}
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <DesCard
        name={label}
        description={usage}
        code={`class: ${className}${font ? ` • ${font}` : ''}`}
      />

      <SurfacePreviewGrid layout="stacked">
        <SurfacePreviewGrid.Surface label="Default surface">
          {renderPreview()}
        </SurfacePreviewGrid.Surface>
      </SurfacePreviewGrid>

      {breakpoints.length > 0 && (
        <div className="grid grid-cols-1 gap-4 border-t border-auto pt-4 text-auto md:grid-cols-3">
          {breakpoints.map((bp, index) => (
            <div key={index} className="space-y-1">
              <div className="kol-mono-xs font-medium">
                {bp.name}{bp.range !== 'all' && bp.range ? ` (${bp.range})` : ''}
              </div>
              <div className="kol-mono-xs opacity-70 space-y-0.5 pl-3">
                <div>• Size: {bp.size}</div>
                <div>• Line Height: {bp.lineHeight}</div>
                <div>• Font: {bp.fontFamily}</div>
                {bp.fontStretch && <div>• Stretch: {bp.fontStretch}</div>}
                {bp.fontWeight && <div>• Weight: {bp.fontWeight}</div>}
                {bp.textTransform && <div>• Transform: {bp.textTransform}</div>}
                {bp.letterSpacing && <div>• Tracking: {bp.letterSpacing}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TypeSample
