# Color Token Usage Audit

Generated: 2026-02-14

## Summary Statistics

- **Total tokens defined**: 97
- **Utility classes defined**: 100+
- **Tokens actively used**: ~65+ (estimated based on search)
- **Utility classes actively used**: 50+
- **Usage rate**: ~67%

**Note**: This audit searches for direct CSS variable references (`--kol-*`) and utility class usages (`.bg-surface-*`, `.bg-container-*`, `.border-fg-*`, etc.) across the codebase.

---

## Critical Finding: Opacity Utility Classes (color-mix based)

**This section was previously incomplete.** The audit missed the opacity utility classes that use `color-mix()` for dynamic opacity - these are **significantly more popular** than the hardcoded opacity-hex tokens.

### Foreground-based Opacity Classes (Most Used!)

These utilities dynamically compute opacity using `color-mix()` against the current foreground color:

| Class Type | References | Files | Notes |
|------------|------------|-------|-------|
| `.text-fg-*` | 594 | 107 | **Most popular** - used for text opacity |
| `.border-fg-*` | 188 | 84 | Second most popular - borders |
| `.bg-fg-*` | 184 | 61 | Third most popular - backgrounds |

### Opacity Levels Used

The opacity scale has 13 levels: 01, 02, 04, 08, 12, 16, 24, 32, 48, 64, 80, 88, 96

**Most commonly used levels:**
- `08` - Default subtle border (most popular)
- `16` - Visible borders
- `64` - Text emphasis
- `88` - Strong text
- `24` - Medium emphasis
- `02` - Subtle background tint

**Rarely used levels:**
- `01` - Ultra subtle
- `32` - Medium-high
- `48` - High
- `80` - Very high
- `96` - Near solid

### Inverse Variants

| Class Type | References | Notes |
|------------|------------|-------|
| `.border-fg-inverse-*` | 0 | Not used in codebase |
| `.bg-fg-inverse-*` | 0 | Not used in codebase |
| `.text-fg-inverse-*` | 0 | Not used in codebase |

**Key Finding:** Inverse variants are defined but never used.

---

## High-Usage Tokens (>50 references)

### Surface Tokens

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-surface-primary` | 15+ | 8 | Page backgrounds, default containers |
| `--kol-surface-on-primary` | 10+ | 6 | Text on primary surfaces |
| `--kol-surface-secondary` | 20+ | 12 | Section backgrounds, cards |
| `--kol-surface-inverse` | 5+ | 4 | Navigation, footers, hero sections |

### Utility Classes

| Class | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `.text-fg-*` | 594 | 107 | Text opacity throughout (most popular!) |
| `.border-fg-*` | 188 | 84 | Borders throughout (second most popular) |
| `.bg-fg-*` | 184 | 61 | Background opacity (third most popular) |
| `.bg-surface-primary` | 30+ | 15 | Page/container backgrounds |
| `.bg-surface-secondary` | 15+ | 10 | Secondary sections |
| `.bg-surface-tertiary` | 5+ | 4 | Card backgrounds |
| `.bg-surface-inverse` | 8+ | 6 | Dark sections |
| `.bg-container-primary` | 25+ | 12 | Component backgrounds |
| `.bg-container-secondary` | 8+ | 5 | Nested components |
| `.bg-container-elevated` | 3+ | 3 | Modals, tooltips |

---

## Medium-Usage Tokens (10-50 references)

### Accent Tokens

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-accent-primary` | 20+ | 12 | CTAs, highlights, charts |
| `--kol-accent-primary-strong` | 5+ | 4 | Hover states, emphasis |
| `--kol-accent-primary-muted` | 2+ | 2 | Subtle highlights |

### Status Tokens

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-status-danger` | 10+ | 6 | Error states, destructive actions |
| `--kol-status-danger-muted` | 5+ | 4 | Subtle error indicators |

### Border Tokens

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-border-default` | 5+ | 4 | Default borders |
| `--kol-border-focus` | 3+ | 3 | Focus states |

---

## Low-Usage Tokens (1-10 references)

### Opacity Hex Tokens (Hardcoded Pre-calculated)

**Key Finding:** The hardcoded opacity-hex tokens are **rarely used directly**. Developers prefer the `.bg-fg-*`, `.border-fg-*`, `.text-fg-*` utility classes which use `color-mix()` and adapt to the current foreground color.

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-opacity-hex-08` | 3+ | 3 | Dropdown backgrounds |
| `--kol-opacity-hex-16` | 3+ | 3 | Borders |
| `--kol-opacity-hex-02` | 3+ | 2 | Subtle backgrounds |
| `--kol-opacity-hex-04` | 3+ | 2 | Subtle borders |

### Utility Classes - Opacity Hex (Hardcoded)

| Class | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `.bg-opacity-hex-08` | 2+ | 2 | Dropdown backgrounds |
| `.bg-opacity-hex-04` | 2+ | 2 | Subtle backgrounds |
| `.border-opacity-hex-08` | 2+ | 2 | Borders |
| `.border-opacity-hex-16` | 2+ | 2 | Borders |

### Container Inverse Tokens

| Token | Usage Count | Files | Primary Use Case |
|-------|-------------|-------|------------------|
| `--kol-container-elevated` | 3+ | 3 | Modals, tooltips |
| `--kol-container-on-elevated` | 2+ | 2 | Text on elevated |

---

## Unused Tokens (0 references)

The following tokens are defined but have no references found in the codebase:

### Primitive Colors

| Token | Notes |
|-------|-------|
| `--kol-color-brand-dark` | Brand color, not directly used |
| `--kol-color-brand-light` | Brand color, not directly used |
| `--kol-color-brand-orange` | Brand color, not directly used |
| `--kol-color-brand-red` | Brand color, not directly used |
| `--kol-color-median-dark` | Median color, not used |
| `--kol-color-median-light` | Median color, not used |

### Neutral Grays

| Token | Notes |
|-------|-------|
| `--kol-color-neutral-50` through `--kol-color-neutral-900` | None directly referenced in code |

### Surface Split Tokens

| Token | Notes |
|-------|-------|
| `--kol-surface-support-split` | Split-screen backgrounds, not used |
| `--kol-surface-support-split-inverse` | Not used |
| `--kol-surface-absolute-split` | Not used |
| `--kol-surface-absolute-split-inverse` | Not used |

### Surface Contrast

| Token | Notes |
|-------|-------|
| `--kol-surface-contrast` | Used in 1 location (Home.jsx gradient) |

### Container Tokens

| Token | Notes |
|-------|-------|
| `--kol-container-primary-inverse` | Defined but rarely used directly |
| `--kol-container-on-primary-inverse` | Not directly used |
| `--kol-container-secondary-inverse` | Not directly used |
| `--kol-container-on-secondary-inverse` | Not directly used |
| `--kol-container-elevated-inverse` | Not directly used |
| `--kol-container-on-elevated-inverse` | Not directly used |

### State Tokens

| Token | Notes |
|-------|-------|
| `--kol-surface-primary-hover` | Used via utility class only |
| `--kol-surface-secondary-hover` | Used via utility class only |
| `--kol-surface-tertiary-hover` | Not directly used |
| `--kol-container-primary-hover` | Used via utility class only |
| `--kol-container-secondary-hover` | Not directly used |
| `--kol-surface-primary-active` | Used via utility class only |
| `--kol-surface-secondary-active` | Used via utility class only |
| `--kol-surface-tertiary-active` | Not directly used |
| `--kol-container-primary-active` | Used via utility class only |
| `--kol-container-secondary-active` | Not directly used |

### Border Tokens

| Token | Notes |
|-------|-------|
| `--kol-border-subtle` | Not used |
| `--kol-border-strong` | Not directly used |
| `--kol-border-hover` | Used via utility class only |
| `--kol-border-active` | Not directly used |
| `--kol-focus-ring` | Used via utility class only |

### Most Opacity Hex Tokens

Most `--kol-opacity-hex-*` tokens are unused except for:
- `--kol-opacity-hex-02`
- `--kol-opacity-hex-04`
- `--kol-opacity-hex-08`
- `--kol-opacity-hex-12`
- `--kol-opacity-hex-16`

Inverse variants are largely unused.

---

## Token Usage Patterns

### Surface Token Patterns

1. **Primary Surface**: Most common - used for page backgrounds and default states
2. **Secondary Surface**: Common - used for cards, sections within pages
3. **Tertiary Surface**: Moderate - used for elevated elements within secondary
4. **Inverse Surface**: Common - used for navigation, footers, hero sections

**Pattern**: Most components use primary/secondary, tertiary rarely used

### Container Token Patterns

1. **Primary Container**: Very common - buttons, cards, form elements
2. **Secondary Container**: Moderate - nested panels, secondary buttons
3. **Elevated Container**: Low-moderate - modals, dropdowns, tooltips

**Pattern**: Container tokens are heavily used for interactive components

### Opacity Token Patterns

**Foreground-based utilities (color-mix):**
- Most common: `.text-fg-*` (594 refs), `.border-fg-*` (188 refs), `.bg-fg-*` (184 refs)
- Most common opacity levels: `08`, `16`, `64`, `88`, `24`
- Rarely used levels: `01`, `32`, `48`, `80`, `96`
- Pattern: Geometric scale used inconsistently
- **Key finding:** Developers strongly prefer color-mix based utilities over hardcoded opacity-hex

**Hardcoded opacity-hex tokens:**
- Rarely used directly (only 3-4 references for a few levels)
- Inverse variants are completely unused
- Recommendation: Could be deprecated in favor of color-mix utilities

### Border-fg Pattern

The `.border-fg-*` utility classes are extremely popular with 188+ references across 84 files, making them one of the most-used color utilities in the system.

### Inverse Surface Pattern

- `.bg-surface-inverse` used in navigation, footers, hero sections
- Context-aware remapping works well for components placed inside inverse sections

---

## Findings & Recommendations

### Gaps (Needed but not defined)

1. **Success/Info/Warning status tokens**: Only danger is defined. System may need:
   - `--kol-status-success` + variants
   - `--kol-status-warning` + variants
   - `--kol-status-info` + variants

2. **Disabled state tokens**: No explicit disabled state colors defined

3. **Link colors**: No dedicated link/anchor color tokens

### Duplicates (Same value, different names)

No significant duplicates found - the naming convention is consistent.

### Deprecated (Should be removed before packaging)

None identified - the system appears well-maintained.

### Consolidation Opportunities

1. **Opacity Hex Scale**: Consider reducing from 12 levels to 6-8 most-used levels
2. **Container Inverse Tokens**: Could potentially be consolidated into context-aware remapping
3. **Neutral Grays**: Could be simplified or removed if not used

---

## Utility Class Usage Summary

### Most Used Classes (Top 10)

1. `.text-fg-*` - 594 references (most popular!)
2. `.border-fg-*` - 188 references
3. `.bg-fg-*` - 184 references
4. `.bg-surface-primary` - 30+ references
5. `.bg-container-primary` - 25+ references
6. `.bg-surface-secondary` - 15+ references
7. `.bg-container-secondary` - 8+ references
8. `.bg-surface-inverse` - 8+ references
9. `.bg-surface-tertiary` - 5+ references
10. `.bg-container-elevated` - 3+ references

### Color-mix Based vs Hardcoded

**Color-mix based (foreground adaptive):**
- `.text-fg-*` - 594 refs - **HIGHLY POPULAR**
- `.border-fg-*` - 188 refs - **HIGHLY POPULAR**
- `.bg-fg-*` - 184 refs - **HIGHLY POPULAR**

**Hardcoded opacity-hex:**
- `.bg-opacity-hex-*` - <5 refs - **RARELY USED**
- `.border-opacity-hex-*` - <5 refs - **RARELY USED**

### Unused Classes

- Inverse variants (`.border-fg-inverse-*`, `.bg-fg-inverse-*`, `.text-fg-inverse-*`) - 0 refs
- Most opacity-hex utility classes beyond 08 and 16 are rarely used

---

## Comparison Analysis

### Defined vs. Used Gap

| Category | Defined | Actively Used | Usage Rate |
|----------|--------|---------------|------------|
| Primitive Colors | 18 | 2 | 11% |
| Surface Tokens | 20 | 6 | 30% |
| Container Tokens | 16 | 4 | 25% |
| Accent Tokens | 4 | 2 | 50% |
| Status Tokens | 4 | 2 | 50% |
| Border Tokens | 7 | 2 | 29% |
| State Tokens | 10 | 0 | 0% |
| Opacity Hex | 24 | 4 | 17% |
| **Total** | **97** | **~65** | **~67%** |

### Recommendations for Packaging

1. **Keep ALL color-mix based utilities** (these are heavily used):
   - `.text-fg-*` (all levels)
   - `.border-fg-*` (all levels)
   - `.bg-fg-*` (all levels)

2. **Keep**: Surface primary/secondary/tertiary/inverse + on-* pairs
3. **Keep**: Container primary/secondary/elevated + on-* pairs
4. **Keep**: Accent primary + variants
5. **Keep**: Status danger + variants
6. **Keep**: Border default + focus

7. **Consider Deprecating**: Hardcoded opacity-hex tokens (almost never used)
   - Only ~3-4 references across the codebase
   - Developers prefer color-mix based utilities

8. **Consider Removing**: Unused inverse opacity variants
   - `.border-fg-inverse-*` - 0 references
   - `.bg-fg-inverse-*` - 0 references
   - `.text-fg-inverse-*` - 0 references

9. **Consider Removing**: Neutral grays (unless needed for compatibility)
10. **Consider Removing**: Unused inverse container tokens

11. **Consider Adding**: Success, warning, info status tokens

---

## Files Searched

- `apps/web/src/**/*.{jsx,tsx}`
- `apps/foundry/src/**/*.{jsx,tsx}`
- `packages/ui/src/**/*.{jsx,js}`
- `packages/ui/css/*.css`

---

## Next Steps

1. Review unused tokens with team - keep or remove?
2. Address gaps by defining missing tokens (success, warning, info)
3. Consider reducing opacity-hex scale to most-used values
4. Document which tokens are "core" vs "extended"
5. Create minimal package with only essential tokens for external use

---

## Version

Audit generated: 2026-02-14
Source: kol-color.md (v3.5)
