# Button Classes Documentation

## Base Class

### `.kol-btn`
**Required base class for all buttons.**

```css
.kol-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--kol-radius-full);      /* 9999px - fully rounded */
  text-transform: uppercase;
  font-family: var(--kol-font-family-mono, monospace);
  font-weight: 470;
  font-size: 14px;
  line-height: 100%;
  letter-spacing: 0.03em;
  transition: background-color var(--kol-transition-base),
              color var(--kol-transition-base),
              border-color var(--kol-transition-base);
  cursor: pointer;
}
```

**Properties:**
- **Display:** `inline-flex` with center alignment
- **Border Radius:** Full (9999px)
- **Text:** Uppercase, mono font, 14px, 470 weight
- **Transition:** 200ms cubic-bezier(0.4, 0, 0.2, 1)

---

## Variant Classes

### `.kol-btn-primary`
**Main action button - inverted colors.**

**Default State:**
```css
background: var(--kol-surface-on-primary);    /* #121215 (light) / #FAFAFA (dark) */
color: var(--kol-surface-primary);            /* #FAFAFA (light) / #121215 (dark) */
border: 1px solid transparent;
```

**Hover State:**
```css
background-color: color-mix(in srgb, var(--kol-surface-on-primary) 20%, transparent);
color: var(--kol-surface-on-primary);
border-color: transparent;
```

**Usage:** Primary CTAs, submit buttons, main actions

---

### `.kol-btn-secondary`
**Secondary action button - subtle background.**

**Default State:**
```css
background: color-mix(in srgb, var(--kol-surface-on-primary) 4%, transparent);
color: var(--kol-surface-on-primary);
border: none;
```

**Hover State:**
```css
background-color: color-mix(in srgb, var(--kol-surface-on-primary) 20%, transparent);
color: var(--kol-surface-on-primary);
```

**Usage:** Secondary actions, cancel buttons, auxiliary actions

---

### `.kol-btn-accent`
**Accent button - teal CTA color.**

**Default State:**
```css
background: var(--kol-accent-primary);        /* #49A0A2 - Teal */
color: var(--kol-accent-on-primary);          /* #1E1E21 - Dark */
border: 1px solid transparent;
```

**Hover State:**
```css
background-color: var(--kol-accent-primary);  /* Stays teal */
color: var(--kol-surface-on-primary);         /* Text changes to primary color */
```

**Usage:** Special CTAs, promotional actions, highlights

---

### `.kol-btn-outline`
**Outlined button - transparent with border.**

**Default State:**
```css
background: transparent;
color: var(--kol-surface-on-primary);
border: 1px solid var(--kol-border-default);  /* 8% opacity */
```

**Hover State:**
```css
background-color: var(--kol-opacity-hex-08);  /* 8% opacity fill */
border-color: color-mix(in srgb, var(--kol-surface-on-primary) 25%, transparent);
color: var(--kol-surface-on-primary);
```

**Usage:** Tertiary actions, ghost buttons, low-emphasis actions

---

### `.kol-btn-control`
**Control button - for UI controls.**

**Default State:**
```css
background: transparent;
color: var(--kol-surface-on-primary);
border: 1px solid var(--kol-border-default);
```

**Hover State:**
```css
background-color: var(--kol-opacity-hex-08);
border-color: transparent;
color: var(--kol-surface-on-primary);
```

**Usage:** Form controls, toggles, selectors

---

### `.kol-btn-nav`
**Navigation button - minimal styling.**

**Default State:**
```css
background: transparent;
color: var(--kol-surface-on-primary);
border: none;
```

**Hover State:**
```css
background-color: var(--kol-opacity-hex-08);
```

**Usage:** Navigation elements, menu items, links

---

## Size Classes

### `.kol-btn-sm` (Small)
**Responsive padding:**
- **Mobile:** `6px 16px`
- **Tablet (≥768px):** `8px 20px`
- **Desktop (≥1024px):** `10px 24px`

### `.kol-btn-md` (Medium - Default)
**Responsive padding:**
- **Mobile:** `8px 20px`
- **Tablet (≥768px):** `12px 28px`
- **Desktop (≥1024px):** `14px 32px`

### `.kol-btn-lg` (Large)
**Responsive padding:**
- **Mobile:** `10px 24px`, `font-size: 18px`
- **Tablet (≥768px):** `14px 36px`
- **Desktop (≥1024px):** `16px 40px`

---

## State Modifiers

### Disabled State
**Classes:** `.kol-btn:disabled`, `.kol-btn[disabled]`

```css
opacity: var(--kol-opacity-disabled);  /* 0.5 */
cursor: not-allowed;
```

### `.kol-btn-normal-case`
**Removes uppercase text transformation.**

```css
text-transform: none;
```

**Usage:** When button text should be normal case (proper nouns, specific formatting)

### `.kol-btn-animate`
**Disables default hover states for custom icon animations.**

**Purpose:** When using icon swap animations, this class prevents the default hover background/color changes so only the icon animation is visible.

---

## Icon Animation System

### `.kol-icon-swap-container`
**Container for icon swap animations.**

```css
position: relative;
display: inline-flex;
overflow: hidden;
```

### `.kol-icon-default`
**Default state icon.**

```css
position: absolute;
transition: opacity var(--kol-transition-base),
            transform var(--kol-transition-base);
```

**Hover behavior:**
```css
.kol-btn:hover .kol-icon-default {
  opacity: 0;
  transform: translateY(-4px);
}
```

### `.kol-icon-hover`
**Hover state icon.**

```css
position: absolute;
opacity: 0;
transform: translateY(4px);
transition: opacity var(--kol-transition-base),
            transform var(--kol-transition-base);
```

**Hover behavior:**
```css
.kol-btn:hover .kol-icon-hover {
  opacity: 1;
  transform: translateY(0);
}
```

**How it works:**
1. Default icon slides up and fades out on hover
2. Hover icon slides up from below and fades in
3. Creates smooth swap animation

---

## Usage Examples

### Basic Button
```jsx
<button className="kol-btn kol-btn-primary kol-btn-md">
  Submit
</button>
```

### Button with Icon
```jsx
<button className="kol-btn kol-btn-secondary kol-btn-md">
  <Icon name="arrow-up" size={16} />
  Upload
</button>
```

### Button with Icon Swap Animation
```jsx
<button className="kol-btn kol-btn-accent kol-btn-md kol-btn-animate">
  <span className="kol-icon-swap-container">
    <Icon name="arrow-right" className="kol-icon-default" />
    <Icon name="arrow-right-filled" className="kol-icon-hover" />
  </span>
  Continue
</button>
```

### Disabled Button
```jsx
<button className="kol-btn kol-btn-primary kol-btn-md" disabled>
  Submit
</button>
```

### Normal Case Button
```jsx
<button className="kol-btn kol-btn-outline kol-btn-sm kol-btn-normal-case">
  Learn More
</button>
```

---

## Color Reference

### Light Mode Colors
- `--kol-surface-primary`: `#FAFAFA`
- `--kol-surface-on-primary`: `#121215`
- `--kol-surface-secondary`: `#F2F2F2`
- `--kol-accent-primary`: `#49A0A2` (Teal)
- `--kol-accent-on-primary`: `#1E1E21`
- `--kol-accent-primary-strong`: `#DB8000` (Orange - hover state)
- `--kol-border-default`: `color-mix(in srgb, #121215 8%, transparent)`

### Dark Mode Colors
- `--kol-surface-primary`: `#121215`
- `--kol-surface-on-primary`: `#FAFAFA`
- `--kol-surface-secondary`: `#19191D`
- Accent colors remain the same

---

## Class Combinations

**Every button needs:**
1. Base class: `.kol-btn`
2. Variant class: `.kol-btn-primary`, `.kol-btn-secondary`, etc.
3. Size class: `.kol-btn-sm`, `.kol-btn-md`, or `.kol-btn-lg`

**Optional modifiers:**
- `.kol-btn-normal-case` - Remove uppercase
- `.kol-btn-animate` - Enable icon animations only
- `.kol-mono-text` - Ensure mono font (applied by component)

**Example full class string:**
```
kol-btn kol-btn-primary kol-btn-md kol-mono-text
```

---

## Design Tokens Used

### Spacing
- `--kol-radius-full`: `9999px`

### Transitions
- `--kol-transition-base`: `200ms cubic-bezier(0.4, 0, 0.2, 1)`

### Opacity
- `--kol-opacity-disabled`: `0.5`
- `--kol-opacity-hex-08`: `8%` opacity value

### Typography
- `--kol-font-family-mono`: Monospace font stack
