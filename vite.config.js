import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { THEME_BOOT_SCRIPT } from '@kolkrabbi/kol-framework/src/theme.js'

/* The no-flash theme boot — kol-framework's own snippet (0.28.0), inlined
   before the app script so the stored choice stamps data-theme pre-paint.
   Replaces the hand-written boot that lived in main.jsx (ShellHomeSystemAdoption). */
const themeBoot = {
  name: 'kol-theme-boot',
  transformIndexHtml(html) {
    return html.replace(/<!-- kol-theme-boot[^>]*-->/, `<script>${THEME_BOOT_SCRIPT}</script>`)
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), themeBoot],
  // kol-icons resolves its glyphs with `import.meta.glob` over its own
  // kol-icon-set-v1/ folder. Pre-bundling the package skips that transform, so
  // the map comes back empty and every <Icon> logs "not found in icon set" —
  // which is why the rail's ThemeToggle rendered blank. Excluding it from
  // optimizeDeps leaves the glob for Vite to expand from source.
  optimizeDeps: {
    exclude: ['@kolkrabbi/kol-icons'],
  },
  server: {
    host: true,
    /* R2 media, same-origin. `r2.kolkrabbi.io` serves the files correctly but
       sends NO Access-Control-Allow-Origin, so a cross-origin fetch taints any
       canvas it is drawn into — and this app's whole job is reading those
       pixels back (slitscan, trails, canvas FX all call getImageData). Proxying
       makes the bytes same-origin, which sidesteps CORS entirely.
       `changeOrigin` is required or the CDN sees a localhost Host header.
       `/media/` is kol-media-client's DEFAULT proxyPath, so its `proxied()`
       helper works here with no configuration. Confirmed with kol-r2b2
       (2026-08-27): the bucket has no CORS policy at all, adding one is their
       call and pending their user; the two B2 hosts already send it and need no
       proxy. Keep this even once R2 gets the header — it also gives us cache
       control and survives a host change. */
    proxy: {
      '/media': {
        target: 'https://r2.kolkrabbi.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/media/, ''),
      },
    },
  },
})
