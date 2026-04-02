import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'mpa-trailing-slash',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/videomodulo') {
          res.writeHead(301, { Location: '/videomodulo/' })
          res.end()
          return
        }
        next()
      })
    },
  }],
  appType: 'mpa',
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        videomodulo: resolve(__dirname, 'videomodulo/index.html'),
      },
    },
  },
})
