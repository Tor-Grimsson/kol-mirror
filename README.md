# Mirror

A video distortion instrument in the browser. Three halls of distortion, a mixer, routing, feedback and a tape deck — played on a desk of modules. Part of the Kolkrabbi apps, built on the KOL design system.

Live: https://mirror.kolkrabbi.io

## Run it

```sh
pnpm install
pnpm dev
```

pnpm only — `yarn` or `npm install` writes a competing lockfile. Node 22 (`.nvmrc`).

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Serve the production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Node tests (`src/**/*.test.mjs`) |
| `pnpm icons` | Touch icons + share card from `public/svg/` |
| `pnpm generate-previews` | Variant / generator / FX preview PNGs via `/dev/capture` |
| `pnpm generate-patch-thumbs` | Patch card thumbnails |
| `pnpm api:dev` · `api:deploy` | The library API (Cloudflare Worker + D1, `api/`) |

## Stack

React 19 · Vite 8 · Tailwind CSS 4 · PixiJS 8 · GSAP 3 · React Router 7 · `@kolkrabbi/*` (shell, components, hardware, theme, icons).

## Where things are

- `docs/` — the docs vault. Start at `docs/INDEX.md`; why Mirror is the way it is lives in `docs/documentation/05-blueprint/`.
- `.kol/llm-context/ARCHITECTURE.md` — the load-bearing decisions.
- `src/App.jsx` — every route; the studio itself is `src/pages/MirrorPlayground.jsx`.
