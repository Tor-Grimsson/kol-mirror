# Icons

A comprehensive icon library with 221 icons across 16 categories.

## Usage

```jsx
import { Icon } from './7-icons'

<Icon name="arrow-up" size={24} />
```

## Icon Registry

All available icons organized by category. Icons marked with `[-g]` were AI-generated. Icons marked with `[-s]` should have stroke variants.

### Navigation (22)
- arrow-down [-g] [-s]
- arrow-up [-s]
- arrow-left [-s]
- arrow-right [-s]
- arrow-expand
- arrow-downright
- arrow-cross
- chevron-down [-s]
- chevron-left [-s]
- chevron-right [-s]
- chevron-up [-s]
- caret-down
- caret-left [-g]
- caret-right [-g]
- caret-up [-g]
- external-link
- menu [-g]
- x [-g]
- control-arrow-back [-s]
- control-arrow-end
- control-arrow-forward [-s]
- control-arrow-start

### Actions & Controls (27)
- check [-s]
- copy
- cross [-s]
- download
- edit
- filter
- maximize [-g]
- minimize [-g]
- minus [-s]
- move
- plus [-s]
- redo [-g]
- refresh [-g]
- rotate
- rotate-left
- rotate-right
- save
- search [-s]
- settings-01 [-s]
- settings-02 [-s]
- share [-g]
- snap
- trash
- undo [-g]
- upload
- zoom-in [-g]
- zoom-out [-g]

### Files & Documents (16)
- add-file
- attachment
- book-open
- bookmark
- clipboard-1
- clipboard-2
- file [-s]
- file-image [-g]
- file-text [-g]
- file-video [-g]
- folder-01 [-s]
- folder-02 [-s]
- folder-open [-g]
- journal
- manual-empty
- page

### Communication (9)
- alarm-bell
- dual-opponent
- in-going
- interactive
- mail [-g]
- message-circle [-g]
- message-square [-g]
- phone [-g]
- send [-g]

### User & Authentication (16)
- flag
- heart-1 [-s]
- heart-2 [-s]
- key [-g]
- lock [-g]
- log-in [-g]
- log-out [-g]
- shield [-g]
- social-facebook
- social-linkedin
- social-twitter
- star [-s]
- unlock [-g]
- user [-s]
- user-plus [-g]
- users [-g]

### Status & Feedback (9)
- alert-circle [-g]
- alert-triangle [-g]
- check-circle [-g]
- eye-off
- eye-on
- help-circle [-g]
- info [-g]
- loader [-g]
- x-circle [-g]

### Media (21)
- camera [-g]
- camera-off [-g]
- control-pause [-s]
- control-play [-s]
- fast-forward [-g]
- image [-g]
- mic [-g]
- mic-off [-g]
- repeat [-g]
- repeat-1 [-g]
- rewind [-g]
- shuffle [-g]
- skip-back [-g]
- skip-forward [-g]
- stop [-s]
- video [-g]
- video-off [-g]
- volume [-g]
- volume-1 [-g]
- volume-2 [-g]
- volume-x [-g]

### Time & Calendar (9)
- calendar [-g]
- calendar-check [-g]
- calendar-days [-g]
- clock
- clock-alert [-g]
- clock-rotate-left [-g]
- history [-g]
- stopwatch
- timer [-g]

### Layout & UI (21)
- columns [-g]
- component
- grid-01 [-s]
- grid-02 [-s]
- grid-03 [-s]
- grid-04 [-s]
- grid-05 [-s]
- grid-06 [-s]
- layers
- layout [-s]
- layout-01 [-s]
- layout-02 [-s]
- layout-03 [-s]
- list-01 [-s]
- list-02 [-s]
- more-horizontal
- more-vertical
- panel-left [-g]
- panel-right [-g]
- row
- sidebar [-g]

### Editing & Content (18)
- align-center [-g]
- align-left [-g]
- align-right [-g]
- bold [-g]
- brush [-s]
- color
- flip-y
- italic [-g]
- list-ordered [-g]
- list-unordered [-g]
- pen [-s]
- pencil [-s]
- text-01
- text-02
- type-01
- type-02
- type-03
- underline [-g]

### System & Tools (15)
- atomic-atom
- atomic-lifeform
- atomic-molecule
- atomic-organism
- battery [-g]
- code [-g]
- database [-g]
- frequency
- library
- power [-g]
- roadmap
- server
- terminal [-g]
- wifi [-g]
- wifi-off [-g]

### Theme & Display (5)
- contrast
- monitor [-g]
- moon [-g]
- sun [-g]
- theme-toggle

### E-commerce & Shopping (8)
- credit-card [-g]
- dollar-sign [-g]
- gift [-g]
- package [-g]
- receipt [-g]
- shopping-bag [-g]
- shopping-cart [-g]
- tag [-g]

### Stats & Data Visualization (15)
- stat-abacus
- stat-chart-a
- stat-chart-b
- stat-chart-c
- stat-crown
- stat-cycle
- stat-donut
- stat-medalion
- stat-pie
- stat-pie-c
- stat-rocket
- stat-stat
- stat-winner
- trending-down
- trending-up

### Shapes & Geometric (6)
- circle [-s]
- cone
- diamond [-s]
- triangle [-s]
- wave
- wheel

### Miscellaneous (9)
- align-auto
- bolt
- bucket
- foundation
- home-1
- home-2
- instance
- location
- pills

## Technical Details

- **Total Icons:** 221
- **Generated Icons:** 95 (marked with [-g])
- **Stroke Variant Recommended:** 47 (marked with [-s])
- **Format:** SVG (24×24 viewBox)
- **Style:** Fill-based rendering with `currentColor`
- **Stroke Weight:** 2px (as filled paths)
- **Loading:** Dynamic via `import.meta.glob`

## File Structure

```
7-icons/
├── Icon.jsx                    # Icon component
├── index.js                    # Exports + icon registry
├── README.md                   # This file
└── svg/                        # SVG files organized by category
    ├── 01-navigation/
    ├── 02-actions-controls/
    ├── 03-files-documents/
    ├── 04-communication/
    ├── 05-user-authentication/
    ├── 06-status-feedback/
    ├── 07-media/
    ├── 08-time-calendar/
    ├── 09-layout-ui/
    ├── 10-editing-content/
    ├── 11-system-tools/
    ├── 12-theme-display/
    ├── 13-ecommerce-shopping/
    ├── 14-stats-data-visualization/
    ├── 15-shapes-geometric/
    └── 16-miscellaneous/
```
