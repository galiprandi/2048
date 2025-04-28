import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '2048 Game',
        short_name: '2048',
        description: 'A mobile-first 2048 game built with React and Vite',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png', // path relative to public directory
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png', // path relative to public directory
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
