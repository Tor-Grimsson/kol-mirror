// pnpm icons — copies Mirror's set out of kol-icons (kol-ds-ui docs/operations/07-apps-tier/10-save-to-home-screen.md § 3). Run after every kol-icons bump.
import { cpSync, mkdirSync } from 'node:fs'
const ID = 'mirror' // the app's identity folder
const SET = `node_modules/@kolkrabbi/kol-icons/src/kol-icon-set-identity/${ID}`
for (const d of ['public/touch-icons', 'public/svg', 'public/og']) mkdirSync(d, { recursive: true })
for (const f of ['apple-touch-icon-dark.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png']) cpSync(`${SET}/${f}`, `public/touch-icons/${f}`)
cpSync(`${SET}/${ID}-favicon.svg`, 'public/svg/favicon.svg')
cpSync(`${SET}/og.png`, `public/og/${ID}.png`)
