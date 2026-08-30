// Deep import via the local patch (patches/@kolkrabbi__kol-framework.patch):
// the framework barrel drags the kol-component barrel into the bundle.
import ThemeToggle from '@kolkrabbi/kol-framework/src/ThemeToggle.jsx'

/**
 * ThemeToggleButton — thin wrapper over the DS ThemeToggle (glyph-roll).
 * Kept so the existing importer (the studio sidebar footer) keeps
 * resolving; new code should use the DS ThemeToggle directly.
 * Old hand-rolled implementation: _tmp/2026-08-12-ds-adoption/.
 */
export default function ThemeToggleButton({ className = '' }) {
  return <ThemeToggle label={false} className={className} />
}
