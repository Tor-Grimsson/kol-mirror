# MirrorLibraryOnAppPreset — CatalogLibrary onto the DS `app` card

**Staged:** 2026-10-23 · from a kol-ds-ui session
**Change:** bump kol-component 0.291.0 · kol-shell 0.75.0; `CatalogLibrary.jsx` on `CatalogPage preset="app"` with `verbs.remove` + `menuItems` (Export, Thumb)

---

## What shipped

kol-component **0.291.0** · kol-shell **0.75.0** (CatalogAppVariant, filed by kol-fxr, closed 2026-10-23):

- `ContentCard` / `ContentRow` **`variant="app"`** — the `file` card and row with an app library's parts slotted: download on the cover, a cog over a trash in the plate, Rename · Duplicate · Delete on the cog and on right-click. Rename prompts and Delete confirms through `useModal` (the shell's `ModalProvider`). A verb you do not pass is not drawn.
- **`CatalogPage preset="app"`** — `app` card + row, 3 list columns, and the page's ONE menu mounted for you (`AppItemMenuProvider`). No `useContextMenu`, no menu element in the page.
- `toCard` returns, besides `key` · `title` · `onClick`:

| key | type | what it does |
|---|---|---|
| `verbs` | `{ rename?(name), duplicate?(), remove?() }` | raw writes — the DS asks the dialog first |
| `download` | `() => void` | the cover's download control |
| `menuItems` | node | extra menu rows after the three (`MenuDropdownItem`s) |
| `date` | ms or string | ms → ISO day `YYYY-MM-DD` |
| `size` | bytes or string | bytes → `formatSize` |
| `media` | src or node | src → a cover image; none → the image placeholder |
| `tone` | string | default `secondary` |

Reference: kol-ds-ui `apps/catalog` (Variants → Preset **App**) and the showcase CatalogPage `app` variant.

## The change here

1. Bump `@kolkrabbi/kol-component` → 0.291.0 and `@kolkrabbi/kol-shell` → 0.75.0 (mirror is on ^0.290.0 · 0.74.0).
2. `CatalogLibrary.jsx` (`toCard`, L62–L80): `preset="app"` on the CatalogPage. Swap the grey Export / Thumb / Remove buttons for `verbs: { remove }` (add `rename` / `duplicate` if mirror has those writes) and `menuItems` holding Export and Thumb as `MenuDropdownItem`s. Pass `date` · `size` · `media` the same way.

## Definition of done
- [ ] The library draws the `app` card and row; trash confirms, Export and Thumb are in the cog / right-click menu
- [ ] No grey action buttons left on the card

---

## Resolution — 2026-10-23 · 🟢 `closed`

**Taken on the MBP, the same day.** Verified on screen at `/library` (Patches view) on a task-scoped dev server.

- [x] kol-component **0.291.0** · kol-shell **0.75.0** installed (`package.json`).
- [x] `src/components/CatalogLibrary.jsx` returns `preset: 'app'`; a saved entry passes `date` (its `savedAt`), `verbs: { remove }` (user files only — a shipped preset gets none) and `menuItems` holding Export and Thumb (Thumb on user patches only) as `MenuDropdownItem`s. No `rename` / `duplicate` — the library store has no such writes.
- [x] The library draws the `app` card: a user save showed the cog over the trash and its date; the cog opened Delete · Export · Thumb; the trash asked *Delete “…”?*, and confirming removed the entry. Presets show the cog (Export) and no trash.
- [x] No grey Export / Thumb / Remove buttons left on any card (DOM count 0). No console errors.

Screenshots: `_tmp/2026-10-23-app-preset/`.
