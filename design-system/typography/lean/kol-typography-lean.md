# Kolkrabbi Typography - Lean / Most Used

## Overview

Minimal typography system containing only the most frequently used classes.

**Stats:**
- Classes: ~20 (vs 80+ in full)
- Coverage: ~570+ references (~46% of total usage)
- Based on: 1230+ total references

---

## What's Included

### Headings

| Class | Size | Line Height | Usage |
|-------|------|------------|-------|
| `.kol-heading-lg` | `32px → 48px` | 110% | 60+ refs |
| `.kol-heading-md` | `28px → 40px` | 120% | 50+ refs |
| `.kol-heading-sm` | `20px → 32px` | 100% | 80+ refs |
| `.kol-heading-xs` | `18px → 28px` | 125% | 30+ refs |

### Text

| Class | Size | Line Height | Usage |
|-------|------|------------|-------|
| `.kol-text-lg` | `18px → 20px` | 160% | 15+ refs |
| `.kol-text-md` | `14px → 18px` | 160% | 45+ refs |
| `.kol-text-sm` | `12px → 16px` | 150% | 40+ refs |

### Mono (MOST USED!)

| Class | Size | Line Height | Usage |
|-------|------|------------|-------|
| `.kol-mono-sm` | `12px → 16px` | 125% | **150+ refs** |
| `.kol-mono-xs` | `10px → 14px` | 120% | 100+ refs |
| `.kol-mono-text` | `14px → 18px` | 125% | 35+ refs |
| `.kol-mono-xxs` | `8px → 12px` | 120% | 20+ refs |
| `.kol-mono-sm-fine` | `12px → 16px` | 125% | Fine weight |

### Labels

| Class | Size | Usage |
|-------|------|-------|
| `.kol-label-mono-sm` | `14px → 24px` | 15+ refs |
| `.kol-label-mono-md` | `12px → 16px` | - |

### Helpers

| Class | Size | Usage |
|-------|------|-------|
| `.kol-helper-uc-md` | 16px | - |
| `.kol-helper-uc-xs` | 12px | - |

---

## What's NOT Included

Less frequently used classes (not in lean version):
- `.kol-display-*` - Rarely used
- `.kol-heading-tight-*` - ~20 refs
- `.kol-heading-narrow-*` - Some unused
- `.kol-text-compact-*` - Uncommon
- `.kol-helper-fine-*` - Rare
- Legacy `.kol-h*` classes

---

## Usage Reference

| Rank | Class | References |
|------|-------|------------|
| 1 | `.kol-mono-sm` | 150+ |
| 2 | `.kol-mono-xs` | 100+ |
| 3 | `.kol-heading-sm` | 80+ |
| 4 | `.kol-heading-lg` | 60+ |
| 5 | `.kol-heading-md` | 50+ |
| 6 | `.kol-text-md` | 45+ |
| 7 | `.kol-text-sm` | 40+ |
| 8 | `.kol-mono-text` | 35+ |
| 9 | `.kol-heading-xs` | 30+ |

---

## Font Faces Included

- RightGrotesk (Narrow, Tight)
- RightGroteskMono (Medium, Fine)
- Inter Tight (Variable)

---

## File

- `kol-typography-lean.css` - Lean standalone CSS (~140 lines)
- Works without Tailwind or dependencies
