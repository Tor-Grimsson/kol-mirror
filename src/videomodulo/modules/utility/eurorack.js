// Eurorack grid constants
// Ratios derived from spec: 1HP = 5.08mm, 1U = 44.45mm, 3U = 133.35mm

export const TOTAL_HP = 104
export const MIN_HP = 2

// Row aspect ratios (width : height)
export const ASPECT = {
  '1u': '12 / 1',
  '3u': '4 / 1',
}

// Rail height in px — defines the dead zone at top/bottom of each module
export const RAIL_HEIGHT = 14

// Module content padding (inside the rail dead zone)
export const MODULE_PADDING = 12  // ~p-3

// HP to percentage of row width
export function hpToPercent(hp) {
  return (hp / TOTAL_HP) * 100
}
