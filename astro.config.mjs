import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://marketing-digital-pro.com',
  integrations: [
    react(),
    sitemap()
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    plugins: [
      tailwindcss()
    ],
    envPrefix: 'VITE_',
    build: {
      cssMinify: true,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'charts': ['recharts'],
            'motion': ['framer-motion'],
            'icons': ['lucide-react']
          }
        }
      }
    }
  }
});