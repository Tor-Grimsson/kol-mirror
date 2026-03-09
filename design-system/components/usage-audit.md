# Component Usage Audit

## Overview

This audit covers **atoms + molecules only** (excludes larger components like Hero, CollectionGrid, Cards, etc.)

## App Groups

| Group | Routes | Description |
|-------|--------|-------------|
| `general` | Everything not in other groups | Home, Prints, Demo, Studio |
| `foundry` | /foundry/* | Font foundry |
| `cms+collection` | Stack, Work, Collections | Blog/content + products |
| `workshop` | /workshop/* | Workshop/tools |

---

# Atoms + Molecules Imports

## By Group

### General
| Component | Imports |
|-----------|---------|
| Icon | 37 |
| Divider | 21 |
| Button | 20 |
| SectionToggle | 14 |
| SectionLabel | 10 |
| Pill | 9 |
| Slider | 8 |
| Table | 6 |
| Tag | 5 |
| ButtonGroup | 5 |
| ThemeToggleButton | 4 |
| Dropdown | 4 |
| Input | 3 |
| LinkWithIcon | 3 |

### Foundry
| Component | Imports |
|-----------|---------|
| Divider | 8 |
| Pill | 3 |
| Button | 3 |
| Table | 3 |
| SectionLabel | 2 |
| Icon | 2 |
| ButtonGroup | 2 |
| Dropdown | 1 |
| Slider | 1 |
| Tag | 1 |

### Workshop
| Component | Imports |
|-----------|---------|
| Icon | 13 |
| SectionToggle | 12 |
| Divider | 3 |
| Tag | 1 |
| LinkWithIcon | 1 |
| SectionLabel | 1 |
| Pill | 1 |
| Button | 1 |
| Checkbox | 1 |

### CMS + Collection
| Component | Imports |
|-----------|---------|
| Pill | 1 |

---

## Combined Ranking

| Rank | Component | Total | General | Foundry | Workshop | CMS+Coll |
|------|-----------|-------|---------|---------|----------|----------|
| 1 | Icon | 37 | 37 | 2 | 13 | 0 |
| 2 | Divider | 21 | 21 | 8 | 3 | 0 |
| 3 | Button | 20 | 20 | 3 | 1 | 0 |
| 4 | SectionToggle | 14 | 14 | 0 | 12 | 0 |
| 5 | SectionLabel | 10 | 10 | 2 | 1 | 0 |
| 6 | Pill | 9 | 9 | 3 | 1 | 1 |
| 7 | Slider | 8 | 8 | 1 | 0 | 0 |
| 8 | Table | 6 | 6 | 3 | 0 | 0 |
| 9 | Tag | 5 | 5 | 1 | 1 | 0 |
| 10 | ButtonGroup | 5 | 5 | 2 | 0 | 0 |
| 11 | ThemeToggleButton | 4 | 4 | 0 | 0 | 0 |
| 12 | Dropdown | 4 | 4 | 1 | 0 | 0 |
| 13 | Input | 3 | 3 | 0 | 0 | 0 |
| 14 | LinkWithIcon | 3 | 3 | 0 | 1 | 0 |
| 15 | Checkbox | 2 | 2 | 0 | 1 | 0 |

---

# CSS Classes (Summary)

| Category | Most Used | Usage |
|----------|-----------|-------|
| Input | `.input` | 1584 |
| Tag/Pill | `.tag` | 1130 |
| Toggle | `.toggle` | 181 |
| Control | `control-bar` | 85 |
| Section | `.sections` | 88 |
| Button | `.btn-*` | ~50 total |
| Card | `.feature-card` | 14 |

---

# shadcn/ui Comparison

shadcn/ui most used: Button, Input, Card, Dialog, Dropdown, Select, Checkbox, Avatar, Tabs, Form, Toast

## Gap Analysis

| shadcn | Kol Has | Usage |
|--------|---------|-------|
| Button | ✅ Icon/Button | 20+37 |
| Input | ✅ | 1584 CSS |
| Card | ✅ | 57 CSS |
| Dialog/Modal | ❌ | - |
| Dropdown | ✅ | 4 imports |
| Select | ⚠️ | Partial |
| Checkbox | ✅ | 2 imports |
| Avatar | ❌ | - |
| Tabs | ⚠️ | Partial |
| Toast | ❌ | - |
| Sheet/Drawer | ❌ | - |

---

# Source Files

- **React**: `packages/ui/src/atoms/` (41) + `molecules/` (18)
- **CSS**: `packages/ui/css/components.css` (~84 classes)
