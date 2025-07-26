import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://zh-love.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  
  // Output configuration - Changed to static for better React support
  output: 'static',
  
  // Server configuration for development
  server: {
    port: 4321,
    host: true,
  },
  
  // Vite configuration
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_URL': JSON.stringify(process.env.PUBLIC_API_URL || 'http://localhost:8000'),
    },
    server: {
      proxy: {
        '/backend': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/backend/, ''),
        },
      },
    },
  },
  
  // Image optimization
  image: {
    domains: ['zh-love.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https', 
        hostname: '**.googleapis.com',
      },
    ],
  },
  
  // Markdown configuration
  markdown: {
    shikiConfig: {
      theme: 'dark-plus',
      wrap: true,
    },
  },
  
  // Redirects for language handling
  redirects: {
    '/': '/ar',
    '/login': '/ar/login',
    '/register': '/ar/register',
    '/forum': '/ar/forum',
    '/tournaments': '/ar/tournaments',
    '/clans': '/ar/clans',
    '/rankings': '/ar/rankings',
    '/replays': '/ar/replays',
    '/streamers': '/ar/streamers',
  },
}); 