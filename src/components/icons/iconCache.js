/* The local glyph cache, in its own module.
 *
 * It lives apart from `Icon.jsx` because that file only exports a component:
 * a constant or a helper beside it makes react-refresh refuse the file, which
 * is the same trap `decks.jsx` hit on 2026-08-28. The glob is the ONE source of
 * truth for what mirror ships — `ICONS` in ./index.js is a hand-written list
 * and has drifted from disk (`nav-studio`, `dith-radial`), so anything deciding
 * whether a glyph renders must ask here, not there. */
const svgModules = import.meta.glob('./svg/**/*.svg', { eager: true, query: '?raw', import: 'default' })

export const ICON_CACHE = Object.entries(svgModules).reduce((acc, [path, svgContent]) => {
  const iconName = (path.split('/').pop() || '').replace('.svg', '')
  acc[iconName] = svgContent
  return acc
}, {})

/** Does mirror ship this glyph? True means it renders. */
export const hasLocalIcon = (name) => Object.hasOwn(ICON_CACHE, name)
