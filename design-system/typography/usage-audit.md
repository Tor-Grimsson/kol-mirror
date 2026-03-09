# Typography Usage Audit

Generated: 2026-02-14

## Summary Statistics

- **Total classes defined:** 80+
- **Total references:** 1230+
- **Files using:** 177
- **Usage rate:** High (heavily used throughout codebase)

---

## Most Used Typography Classes

| Class | References | Files | Primary Use |
|-------|------------|-------|-------------|
| `.kol-mono-sm` | 150+ | 50+ | Data displays, metadata |
| `.kol-mono-xs` | 100+ | 40+ | Labels, small metadata |
| `.kol-heading-sm` | 80+ | 30+ | Card titles |
| `.kol-heading-lg` | 60+ | 25+ | Section headings |
| `.kol-heading-md` | 50+ | 20+ | Subsection headings |
| `.kol-text-md` | 45+ | 20+ | Body text |
| `.kol-text-sm` | 40+ | 18+ | Captions |
| `.kol-mono-text` | 35+ | 15+ | Code/data |
| `.kol-heading-xs` | 30+ | 15+ | Small headings |
| `.kol-label-*` | 25+ | 12+ | Labels, tags |

---

## Usage by Category

### Display Classes
| Class | References | Notes |
|-------|------------|-------|
| `.kol-display-lg` | 5 | Hero headlines |
| `.kol-display-section` | 3 | Section intros |
| `.kol-display-subsection` | 2 | Dense layouts |

### Heading Classes
| Class | References | Notes |
|-------|------------|-------|
| `.kol-heading-sm` | 80+ | Most popular heading |
| `.kol-heading-lg` | 60+ | Common |
| `.kol-heading-md` | 50+ | Common |
| `.kol-heading-xs` | 30+ | Small headings |
| `.kol-heading-tight-*` | 20+ | Used in cards |

### Text Classes
| Class | References | Notes |
|-------|------------|-------|
| `.kol-text-md` | 45+ | Primary body text |
| `.kol-text-sm` | 40+ | Captions |
| `.kol-text-lg` | 15+ | Hero copy |

### Mono Classes
| Class | References | Notes |
|-------|------------|-------|
| `.kol-mono-sm` | 150+ | **Most popular!** |
| `.kol-mono-xs` | 100+ | Labels |
| `.kol-mono-text` | 35+ | Code |
| `.kol-mono-xxs` | 20+ | Dense data |

### Label Classes
| Class | References | Notes |
|-------|------------|-------|
| `.kol-label-mono-sm` | 15+ | Pill chips |
| `.kol-label-compact-md` | 10+ | Section labels |

---

## Unused Classes

Based on search, these classes have minimal/no usage:
- `.kol-display-section-sm` - Rarely used
- `.kol-heading-display` - Legacy
- `.kol-heading-narrow-*` - Some variants unused
- `.kol-text-compact-*` - Uncommon
- `.kol-label-compact-lg` - Rare

---

## Comparison with Color System

| Metric | Colors | Typography |
|--------|--------|------------|
| Total classes | 100+ | 80+ |
| Total refs | 966 | 1230 |
| Usage rate | 67% | High |
| Unused classes | ~40% | ~15% |

Typography is more consistently used than colors.

---

## Recommendations

1. **Keep all** - Typography system is well-used
2. **Consider** - Removing rare `.kol-heading-narrow-*` variants
3. **Consider** - Consolidating `.kol-h*` legacy aliases

---

## Files Searched

- `apps/web/src/**/*.{jsx,tsx}`
- `apps/foundry/src/**/*.{jsx,tsx}`
- `packages/ui/src/**/*.{jsx,js}`

---

## Version

Audit generated: 2026-02-14
