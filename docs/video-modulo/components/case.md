# Case & Panel System

## Eurorack Grid

- **104 HP** total width per row
- **1 HP** = smallest unit of horizontal measure
- **2 HP** = minimum module width
- Widths set via `HP(n)` which converts to percentage: `(hp / 104) * 100`

## Row Heights (aspect ratio based)

| Row | Aspect Ratio | Meaning |
|-----|-------------|---------|
| 1U  | 12 : 1      | ~1/3 the height of 3U |
| 3U  | 4 : 1       | Standard module row |

Rows use `aspect-ratio` CSS — they scale to any screen width while maintaining correct proportions. No fixed pixel heights.

## Rails

- 104 threaded holes per rail, one per HP
- Rail height: 14px
- Two rails per row: top and bottom
- Rails sit at **z-index 1**, behind modules (z-index 2)
- Background (empty case interior) at z-index 0
- Rails are visible in empty HP slots, hidden behind module panels

## Module Panels

Panels span the **full row height** including the rail zones. The panel face covers the rails — screws go through the panel into the rail.

### Dead Zone

The top and bottom 12px (`p-3`) of each panel overlap the rails. This is where screw holes go. No controls, no content.

### Safe Zone

Everything between the screw rows. This is where knobs, jacks, screens, labels go. The `Module.jsx` wrapper handles this — children render inside the safe zone automatically.

### Screw Holes

- 4 per panel: 2 top, 2 bottom
- Positioned in the dead zone (rail overlap area)
- 6px diameter, dark inset circles

## Case Frame

- Side panels: `bg-opacity-hex-12`, 24px wide, rounded corners (4px)
- Side panels extend 3px above and below the row area
- 2px gap between rows (real-world tolerance)
- 2px padding between side panels and module area

## Constants

All values defined in `src/videomodulo/modules/utility/eurorack.js`:

```js
TOTAL_HP = 104        // HP per row
MIN_HP = 2            // smallest module
RAIL_HEIGHT = 14      // px
MODULE_PADDING = 12   // px — dead zone (p-3)
ASPECT['1u'] = '12 / 1'
ASPECT['3u'] = '4 / 1'
hpToPercent(hp)       // HP → CSS percentage
```

## Component Hierarchy

```
VideoModulo.jsx           — page (bg, centering)
  └─ Case                 — rack frame (side panels, row container)
       └─ RackRow          — single row (rails, background, aspect ratio)
            └─ HP(n) div   — width slot
                 └─ Module — front panel (screws, dead zone, safe zone)
                      └─ children — module content
```

## References

- Eurorack spec: [midisoft.de/EuroRackDimensions](https://www.midisoft.de/EuroRackDimensions/EuroRack_Dimensions.html)
- Intellijel 7U Performance Case used as visual reference
