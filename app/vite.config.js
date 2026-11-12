import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api-mgm': {
        target: 'https://servis.mgm.gov.tr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-mgm/, ''),
        headers: {
          Referer: 'https://www.mgm.gov.tr',
          Origin: 'https://www.mgm.gov.tr',
        },
        secure: false,
      },
    },
  },
})
