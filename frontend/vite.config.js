import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    "src": "package.json",
    "use": "@vercel/static-build",
    "config": {
      "distDir": "dist"
    },
    rollupOptions: {
      external: ['react-router-dom'],
    },
    base: '/',
  },
});
