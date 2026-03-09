# 2.0.0 Design System: Overview

**Version:** 1.0.0
**Date:** 2025-11-03
**Status:** Active
**Content Type:** implementation
**Category:** design-system

---

## Overview

The kolkrabbi design system is a comprehensive, scalable visual language built on semantic design tokens, atomic design methodology, and modern web standards. It provides a unified approach to design and development, ensuring consistency across all applications and platforms.

### Chapter Index

| Number | Title | Focus |
|--------|-------|-------|
| `2.0.0` | Design System Overview (this doc) | Principles + governance |
| `2.1.0` / `2.1.1` | Colors & Cheat Sheet | Token architecture + quick lookup |
| `2.2.0` / `2.2.1` | Typography Stack | Type scales + cheat sheet |
| `7.6.2` | Kolkrabbi Text Reference | Marketing/studio copy deck |
| `2.3.0` / `2.3.1` / `2.3.2` | CSS Architecture | Layering, utilities, improvements |
| `2.4.0-2.4.4` | Prose Systems | Index + Stack wrappers + Documentation + Málrómur specs |

---

## Design Philosophy

### Core Principles

**1. Semantic Tokens First**
- Design decisions captured in tokens
- Tokens drive all visual decisions
- No hardcoded values in components
- Tokens are the single source of truth

**2. Atomic Design Methodology**
- Atoms → Molecules → Organisms → Templates → Pages
- Reusable components at every level
- Progressive complexity
- Clear component boundaries

**3. Accessibility by Default**
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast requirements

**4. Performance Minded**
- Lightweight CSS
- Optimized bundle sizes
- Minimal JavaScript overhead
- Progressive enhancement

**5. Developer Experience**
- Simple, intuitive API
- Comprehensive documentation
- Type-safe props (TypeScript)
- Easy to override and extend

**6. Specialized Agent Expertise**
- Four specialized Kol agents provide expert guidance
- kol-color: Color system architecture and WCAG compliance
- kol-type: Typography system and type scale management
- kol-div: Page structure and responsive layout patterns
- kol-docs: Documentation standards and system maintenance
- Agents ensure consistency across design system implementation

---

## System Architecture

### Design Tokens

**Tokens are the foundation:**
```
Design Tokens
    ↓
CSS Custom Properties
    ↓
Utility Classes
    ↓
Components
```

**Token Categories:**

1. **Color Tokens** (2.1.x)
   - Semantic color names
   - Light/dark mode support
   - State variations (hover, active, focus)
   - Surface and elevation tokens

2. **Typography Tokens** (2.2.x)
   - Font families
   - Font sizes (scale)
   - Font weights
   - Line heights
   - Letter spacing

3. **Spacing Tokens** (2.3.x) *[planned]*
   - Spacing scale (4px, 8px, 16px...)
   - Layout spacing
   - Component padding/margins

4. **Motion Tokens** (2.4.x) *[planned]*
   - Animation durations
   - Easing functions
   - Motion patterns

5. **Border Radius Tokens** (2.5.x) *[planned]*
   - Small, medium, large radii
   - Full radius for pills

6. **Shadow Tokens** (2.5.x) *[planned]*
   - Elevation levels
   - Surface shadows
   - Focus rings

### Component Hierarchy

**Atoms (3.1.x):**
- Basic building blocks
- No dependencies on other components
- Examples: Button, Input, Icon, Tag, Avatar

**Molecules (3.2.x):**
- Simple combinations of atoms
- Have a single, clear purpose
- Examples: Card, Badge, Dropdown, Form Field

**Organisms (3.3.x):**
- Complex, distinct sections
- Multiple atoms/molecules working together
- Examples: Navigation, Data Table, Hero Section

**Templates (4.x.x):**
- Page-level layouts
- Composition of organisms
- Examples: Home page template, Work detail template

**Pages:**
- Complete, specific instances
- Real content and data
- Examples: Home page, Work portfolio page

---

## Token Structure

### CSS Custom Properties

**All tokens are defined as CSS custom properties:**

```css
:root {
  /* Colors */
  --kol-color-primary: hsl(221 83% 53%);
  --kol-color-text-primary: hsl(222 47% 11%);
  --kol-color-background: hsl(0 0% 100%);

  /* Typography */
  --kol-font-family-primary: 'Inter', system-ui, sans-serif;
  --kol-font-size-body: 1rem; /* 16px */
  --kol-font-weight-regular: 400;
  --kol-line-height-normal: 1.5;

  /* Spacing */
  --kol-spacing-xs: 0.25rem; /* 4px */
  --kol-spacing-sm: 0.5rem;  /* 8px */
  --kol-spacing-md: 1rem;    /* 16px */
  --kol-spacing-lg: 1.5rem;  /* 24px */

  /* Border Radius */
  --kol-radius-sm: 0.25rem;  /* 4px */
  --kol-radius-md: 0.5rem;   /* 8px */
  --kol-radius-full: 9999px;

  /* Motion */
  --kol-motion-duration-fast: 150ms;
  --kol-motion-duration-normal: 300ms;
  --kol-motion-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Usage in Components

**JavaScript:**
```javascript
// Use tokens in component logic
const buttonStyles = {
  backgroundColor: 'var(--kol-color-primary)',
  padding: 'var(--kol-spacing-sm) var(--kol-spacing-md)',
  borderRadius: 'var(--kol-radius-sm)'
}
```

**CSS:**
```css
.button {
  background-color: var(--kol-color-primary);
  padding: var(--kol-spacing-sm) var(--kol-spacing-md);
  border-radius: var(--kol-radius-sm);
}
```

**JSX:**
```jsx
<div
  style={{
    backgroundColor: 'var(--kol-color-primary)',
    padding: 'var(--kol-spacing-md)'
  }}
>
  Button content
</div>
```

---

## Design System Scope

### What's Included

**✅ Design Tokens:**
- Color system (semantic tokens)
- Typography system (scales and families)
- Spacing system (scale and utilities)
- Border radius and shadows
- Motion and animation tokens

**✅ Components:**
- Atoms: Button, Input, Icon, Tag, Avatar
- Molecules: Card, Badge, Dropdown, Form Field
- Organisms: Navigation, Data Table, Hero
- Complete component library

**✅ Utilities:**
- CSS utility classes
- Helper functions
- Layout utilities
- Spacing utilities

**✅ Guidelines:**
- Component usage guidelines
- Accessibility requirements
- Best practices
- Do's and don'ts

**✅ Documentation:**
- Component docs with examples
- Design rationale
- Implementation guides
- Interactive demos

### What's NOT Included

**❌ Application Logic:**
- Business logic
- State management
- Data fetching
- Routing

**❌ Content Strategy:**
- Copy guidelines
- Brand voice
- Marketing content
- SEO strategy

**❌ Brand Guidelines:**
- Logo usage
- Brand colors
- Brand voice
- Marketing assets

**❌ Platform-Specific:**
- Native mobile components
- Desktop app components
- Backend API design

**Note:** Design system focuses on UI and visual design. Application-specific concerns live in apps.

---

## Theming

### Light/Dark Mode

**Design tokens support both themes:**

```css
/* Light theme (default) */
:root {
  --kol-color-background: hsl(0 0% 100%);
  --kol-color-text-primary: hsl(222 47% 11%);
  --kol-color-surface-primary: hsl(0 0% 100%);
}

/* Dark theme */
[data-theme="dark"] {
  --kol-color-background: hsl(222 47% 11%);
  --kol-color-text-primary: hsl(210 40% 98%);
  --kol-color-surface-primary: hsl(222 47% 15%);
}
```

**Component automatically adapts:**
```css
.button {
  background-color: var(--kol-color-primary);
  color: var(--kol-color-text-on-primary);
  /* Automatically works in light and dark */
}
```

### Custom Themes

**Create custom themes by overriding tokens:**

```css
/* Custom brand theme */
[data-theme="brand"] {
  --kol-color-primary: hsl(280 75% 50%);
  --kol-color-accent: hsl(320 75% 60%);
  --kol-color-surface: hsl(280 20% 95%);
}
```

**Apply to component:**
```jsx
<div data-theme="brand">
  <Button>Custom theme button</Button>
</div>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum
- All tokens meet contrast requirements

**Keyboard Navigation:**
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order
- Skip links for navigation

**Screen Readers:**
- Semantic HTML elements
- Proper ARIA labels
- Descriptive alt text
- Status announcements

**Color Independence:**
- Never rely on color alone
- Use icons, patterns, text
- Provide multiple indicators

### Accessibility Tokens

```css
/* High contrast mode support */
@media (prefers-contrast: more) {
  :root {
    --kol-color-primary: hsl(0 0% 0%);
    --kol-color-background: hsl(0 0% 100%);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --kol-motion-duration-fast: 0ms;
    --kol-motion-duration-normal: 0ms;
  }
}
```

---

## Implementation

### Usage in Applications

**1. Import design system:**
```javascript
// In React component
import { Button, Card } from '@kol/ui'
import '@kol/ui/css/theme.css'
```

**2. Use components:**
```jsx
function MyComponent() {
  return (
    <Card>
      <Button variant="primary">
        Get Started
      </Button>
    </Card>
  )
}
```

**3. Override tokens (if needed):**
```css
/* Custom app styles */
:root {
  --kol-color-primary: your-brand-color;
}
```

### Development Workflow

**1. Design tokens are source of truth:**
- Designers define tokens in Figma
- Tokens exported to code
- Tokens become CSS custom properties

**2. Components consume tokens:**
- No hardcoded values
- Use `var(--kol-token-name)`
- Automatic theming support

**3. Applications use components:**
- Import from `@kol/ui`
- Compose together
- Minimal custom CSS needed

---

## Token Naming Convention

### Syntax

```
--kol-[category]-[semantic-name]-[variant]

Examples:
--kol-color-primary           (color, semantic)
--kol-color-primary-hover     (color, state variant)
--kol-font-size-body          (typography, semantic)
--kol-spacing-md              (spacing, scale)
--kol-radius-sm               (radius, scale)
```

### Categories

- `color` - Color tokens
- `font` - Typography tokens
- `spacing` - Spacing tokens
- `radius` - Border radius tokens
- `shadow` - Shadow tokens
- `motion` - Animation tokens

### Semantic vs Scale Names

**Semantic tokens (use these):**
- `--kol-color-primary` (not `--kol-color-blue-500`)
- `--kol-color-text-primary` (not `--kol-color-gray-900`)
- `--kol-color-surface-primary` (not `--kol-color-white`)

**Scale tokens (rarely use directly):**
- `--kol-color-blue-500` - Raw color value
- `--kol-color-gray-900` - Raw gray value

**Rule:** Use semantic tokens in components. Scale tokens are for token creation.

---

## Component Props

### Standard Props

**All components accept:**

```typescript
// All components
className?: string  // Additional CSS classes
style?: object      // Inline styles

// Interactive components
onClick?: (event) => void
onFocus?: (event) => void
onBlur?: (event) => void

// Visual components
variant?: 'primary' | 'secondary' | 'tertiary'
size?: 'sm' | 'md' | 'lg'
isDisabled?: boolean
```

### Variant Convention

**Consistent across all components:**

```jsx
// Button variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
<Button variant="ghost">Ghost</Button>

// Card variants
<Card variant="elevated">Elevated</Card>
<Card variant="outlined">Outlined</Card>
<Card variant="filled">Filled</Card>
```

### Size Convention

**Standard sizes across components:**

```jsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

<Input size="sm" />
<Input size="md" />
<Input size="lg" />
```

---

## Utilities

### CSS Utilities

**Layout:**
```html
<div class="kol-flex kol-justify-between kol-items-center">
  <!-- Flexbox layout -->
</div>
```

**Spacing:**
```html
<div class="kol-mt-md kol-mb-lg">
  <!-- Margin utilities -->
</div>

<div class="kol-p-md">
  <!-- Padding utilities -->
</div>
```

**Typography:**
```html
<h1 class="kol-text-h1">Heading</h1>
<p class="kol-text-body">Body text</p>
```

### JavaScript Utilities

**Helper functions:**
```javascript
import { cx, mergeStyles } from '@kol/ui/utils'

// Class name merging
const className = cx('base-class', {
  'active': isActive,
  'disabled': isDisabled
})

// Style merging
const styles = mergeStyles(baseStyles, customStyles)
```

---

## Quality Assurance

### Component Testing

**Unit tests:**
- Component logic
- Props handling
- Event handling
- State management

**Visual regression tests:**
- Compare screenshots
- Catch visual changes
- Ensure consistency

**Accessibility tests:**
- Automated a11y scanning
- Keyboard navigation
- Screen reader testing

### Documentation Testing

**Code examples:**
- All examples run without errors
- Tested in CI/CD
- Snippets are copy-pasteable

**Interactive demos:**
- Live code examples
- Props playground
- Theme switcher

---

## Related Documentation

**Design Tokens:**
- [2.1.0 Design System: Color System](2.1.0-design-system-color-system.md) - Color tokens and utilities
- [2.2.0 Design System: Typography](2.2.0-design-system-typography.md) - Type scales and usage
- [2.3.0 Design System: Spacing](2.3.0-design-system-spacing.md) - Spacing scale and utilities

**Components:**
- [3.0.0 Components: Overview](3.0.0-components-overview.md) - Component architecture
- [3.1.0 Components: Atoms](3.1.0-components-atoms.md) - Basic building blocks
- [3.2.0 Components: Molecules](3.2.0-components-molecules.md) - Combined components

**Foundation:**
- [1.0.0 Foundation: Repository Structure](1.0.0-foundation-repository-structure.md) - Project organization
- [1.1.0 Foundation: Build System](1.1.0-foundation-build-system.md) - Build pipeline

---

## Next Steps

**Current Priority:**
1. ✅ Design system overview (this doc)
2. ✅ Build system documentation
3. 🔄 Complete color system (2.1.0)
4. 🔄 Document typography (2.2.0)
5. 📅 Add spacing system (2.3.0)
6. 📅 Build component library (3.x.x)

**Roadmap:**
- Q1 2025: Complete all design tokens
- Q2 2025: Build complete component library
- Q3 2025: Add accessibility testing suite
- Q4 2025: Launch design system v1.0

---

**Last Updated:** 2025-11-03
**Next Review:** 2025-12-03
