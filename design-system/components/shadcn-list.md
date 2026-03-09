# shadcn/ui Components


## Most Used (Priority Order)

| Rank | Component | States |
|------|-----------|--------|
| 1 | Button | 15+ (5 variants × 3 sizes + disabled) |
| 2 | Card | 3 (default, bordered, elevated) |
| 3 | Input | 4 (default, focused, active, disabled) |
| 4 | Dialog | 3 (closed, open, animated) |
| 5 | Select | 3 (closed, open, disabled) |
| 6 | Table | 3 (default, sortable, selectable) |
| 7 | Dropdown Menu | 2 (open, nested) |
| 8 | Tabs | 2 (default, active) |
| 9 | Checkbox | 3 (unchecked, checked, indeterminate) |
| 10 | Toast | 4 (types) + dismiss |
| 11 | Avatar | 5 (default, fallback, 4 sizes) |
| 12 | Badge | 3+ (variants + custom) |
| 13 | Popover | 2 (closed, open) |
| 14 | Sheet | 3 (closed, open, position) |
| 15 | Form Field | 3 (default, error, disabled) |

---

## Comparison: Kol vs shadcn

| shadcn | Kol Has | Kol Usage |
|--------|---------|-----------|
| Button | ✅ | 20 |
| Card | ✅ | 57 CSS |
| Input | ✅ | 1584 CSS |
| Dialog | ❌ | - |
| Select | ⚠️ Partial | - |
| Table | ✅ | 6 |
| Dropdown Menu | ✅ | 4 |
| Tabs | ⚠️ Partial | - |
| Checkbox | ✅ | 2 |
| Toast | ❌ | - |
| Avatar | ❌ | - |
| Badge | ✅ (Tag) | 1130 CSS |
| Popover | ❌ | - |
| Sheet/Drawer | ❌ | - |
| Form | ⚠️ Partial | - |

---

## All Available Components (80+)

### Form Components
- **Input** - Single-line text entry field
   - default - on load
   - focused - highlight
   - active - typing
   - disabled - not selectable
- **Textarea** - Multi-line text entry
   - default - on load
   - focused - highlight
   - active - typing
   - disabled - not selectable
   - resize - user resizable
- **Input OTP** - One-time password input with separate digits
   - default - empty slots
   - focused - active slot
   - filled - digit entered
   - disabled - not selectable
- **Native Select** - Native dropdown select
   - default - closed
   - open - dropdown visible
   - disabled - not selectable
- **Checkbox** - Binary selection
   - unchecked - not selected
   - checked - selected
   - indeterminate - mixed state
   - disabled - not selectable
- **Radio Group** - Single selection from options
   - default - nothing selected
   - selected - option chosen
   - disabled - not selectable
- **Switch** - Toggle on/off for settings
   - off - toggle false
   - on - toggle true
   - disabled - not selectable
- **Toggle** - Binary button toggle
   - off - unselected
   - on - selected
   - disabled - not selectable
- **Toggle Group** - Group of toggle buttons
   - default - nothing selected (single)
   - selected - option selected
   - multiple - multiple selection enabled
- **Slider** - Range slider for values
   - default - at min/max
   - dragging - user adjusting
   - disabled - not adjustable
- **Progress** - Linear progress indicator
   - indeterminate - loading animation
   - determinate - percentage shown
- **Calendar** - Date picker calendar view
   - default - current month
   - selected - date chosen
   - range - date range mode
   - disabled - dates not selectable
- **Date Picker** - Date selection with popup
   - closed - picker hidden
   - open - calendar visible
   - selected - date chosen
- **Form Field** - Wrapper with validation
   - default - empty
   - filled - has value
   - error - validation failed
   - disabled - not editable
- **Label** - Accessible label
   - default - normal
   - disabled - for disabled input

### Layout Components
- **Card** - Content container
   - default - standard
   - bordered - with border
   - elevated - with shadow
- **Accordion** - Collapsible sections
   - closed - content hidden
   - open - content visible
   - disabled - not toggleable
- **Collapsible** - Expandable content
   - collapsed - hidden
   - expanded - visible
- **Resizable** - Resizable panel
   - default - initial size
   - resizing - user dragging
- **Scroll Area** - Styled scrollable
   - default - scrollable
   - scrollbar hidden - minimal mode
- **Separator** - Visual divider
   - default - horizontal
   - vertical - rotated
- **Aspect Ratio** - Enforce ratio
   - 16:9, 4:3, 1:1, etc.
- **Empty** - Empty state
   - default - no content
   - with description - has message
- **Skeleton** - Loading placeholder
   - default - animating
   - static - no animation

### Navigation
- **Navigation Menu** - Dropdown nav
   - default - collapsed
   - open - dropdown visible
   - active - current page
- **Menu Bar** - Horizontal menu
   - default - closed
   - open - submenu visible
- **Breadcrumb** - Path navigation
   - default - all items
   - collapsed - ellipsis
- **Pagination** - Page navigation
   - default - page 1
   - active - current page
   - disabled - at bounds
- **Tabs** - Content panels
   - default - first tab active
   - active - selected tab
   - disabled - not selectable

### Overlays
- **Dialog** - Modal window
   - closed - hidden
   - open - visible
   - animated - opening/closing
- **Popover** - Floating content
   - closed - hidden
   - open - visible
   - hover - mouse over
- **Dropdown Menu** - Action menu
   - closed - hidden
   - open - visible
   - nested - submenu
- **Context Menu** - Right-click menu
   - closed - hidden
   - open - visible at cursor
- **Sheet (Drawer)** - Slide-in panel
   - closed - hidden
   - open - visible
   - position - top/right/bottom/left
- **Tooltip** - Hover info
   - hidden - default
   - visible - on hover
- **Hover Card** - Card on hover
   - hidden - default
   - visible - on hover
- **Toast / Sonner** - Notification
   - default - appearing
   - visible - shown
   - dismissed - removed
   - types - success/error/warning/info

### Data Display
- **Table** - Tabular data
   - default - standard rows
   - sortable - column headers clickable
   - selectable - rows checkable
- **Data Table** - Advanced table
   - default - all data
   - sorted - column ordered
   - filtered - rows reduced
   - paginated - page view
- **Avatar** - User image
   - default - image loaded
   - fallback - initials shown
   - sizes - sm/md/lg/xl
- **Badge** - Status indicator
   - default - standard
   - variant - secondary/destructive
   - custom - with props
- **Typography** - Text components
   - headings - h1-h6
   - body - p, span
   - muted - secondary text
- **Kbd** - Keyboard key
   - default - standard key
   - meta - cmd/ctrl shown
- **Chart** - Data viz
   - default - rendered
   - loading - skeleton
   - empty - no data

### Feedback
- **Alert** - Inline message
   - default - info
   - success - green
   - warning - yellow
   - error - red
- **Alert Dialog** - Modal alert
   - closed - hidden
   - open - visible
   - confirmed - action taken
   - cancelled - dismissed
- **Spinner** - Loading indicator
   - default - spinning
   - size - sm/md/lg
- **Toast / Sonner** - Notification
   - default - appearing
   - visible - shown
   - dismissed - removed
   - types - success/error/warning/info

### Other
- **Button** - Clickable trigger
   - default - standard
   - hover - mouse over
   - active - pressed
   - disabled - not clickable
   - loading - with spinner
- **Button Group** - Related buttons
   - default - standalone
   - grouped - connected
   - vertical - stacked
- **Carousel** - Image slider
   - default - first slide
   - active - current slide
   - autoplay - auto-advance
- **Command** - Command palette
   - closed - hidden
   - open - visible
   - searching - filter active
- **Combobox** - Autocomplete
   - default - closed
   - open - dropdown visible
   - selected - option chosen
- **Sidebar** - Collapsible sidebar
   - expanded - full width
   - collapsed - icon only
   - mobile - bottom nav

---
