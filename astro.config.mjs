import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel/serverless'; // o edge, según tu preferencia

export default defineConfig({
  site: 'https://marketing-digital-pro.com',
  integrations: [
    react(),
    sitemap()
  ],
  server: {
		host: true
	},
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    server: {
			hmr: {
				clientPort: 4321
			},
			watch: {
				usePolling: true
			},
			host: true,
			strictPort: true,
			allowedHosts: ['vercel.app','.loca.lt', 'localhost']
		},
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
  },
  adapter: vercel({}),
});