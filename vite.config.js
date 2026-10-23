import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { THEME_BOOT_SCRIPT } from '@kolkrabbi/kol-framework/src/theme.js'
import { devFavicon, loaderApp } from '@kolkrabbi/kol-framework/vite'

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
  plugins: [react(), tailwindcss(), devFavicon({ label: 'W', ground: '#49A0A2', ink: '#000000' }), themeBoot, loaderApp({ graphic: 'public/svg/wordmark.svg', size: 332 })],
  // THE RAW-SOURCE KOL PACKAGES ARE NOT PRE-BUNDLED. They publish JSX, and two
  // things in them break under the dep optimizer: kol-icons builds its registry
  // via `import.meta.glob(...svg)`, which only expands when Vite source-transforms
  // the file (pre-bundled, every icon resolves to "not found" — the rail's
  // ThemeToggle rendered blank); and since kol-component 0.240.0 `PdfPage.jsx`
  // does `import('pdfjs-dist/…?url')`, which the optimizer reads as a literal
  // filename and fails the whole dev start (2026-10-13, this repo's bump to
  // 0.257.0: `vite --force` died in "dependency optimization"; fxr hit it
  // 2026-10-07). Excluded, they ride the plugin pipeline like app source. Their
  // CJS deps then skip the optimizer's interop, so those are pre-bundled by
  // name — fxr's and kol-website's shape.
  optimizeDeps: {
    exclude: [
      '@kolkrabbi/kol-icons',
      '@kolkrabbi/kol-component',
      '@kolkrabbi/kol-framework',
      '@kolkrabbi/kol-brand',
      '@kolkrabbi/kol-shell',
      '@kolkrabbi/kol-theme',
      '@kolkrabbi/kol-hardware',
    ],
    include: [
      '@kolkrabbi/kol-component > react-syntax-highlighter',
      '@kolkrabbi/kol-component > embla-carousel-react',
    ],
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
