import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      configPath: './wrangler.toml',
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Handle client-side routing
    middlewareMode: false,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
    },
  },
  // Configure dev server to handle client-side routing
  appType: 'mpa',
})
