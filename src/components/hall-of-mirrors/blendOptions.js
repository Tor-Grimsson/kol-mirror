/**
 * The CSS blend modes, and their dropdown form.
 *
 * One list. It was declared twice — `CSS_BLEND_MODES` exported from
 * SymphonyMixer and a private copy of both in MasterModule — which is the
 * shape a third copy grows out of.
 */
export const CSS_BLEND_MODES = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

/* Title-cased for display: `color-dodge` → `Color Dodge`. */
export const BLEND_OPTIONS = CSS_BLEND_MODES.map((m) => ({
  value: m,
  label: m.charAt(0).toUpperCase() + m.slice(1).replace(/-./g, (s) => ' ' + s[1].toUpperCase()),
}))
