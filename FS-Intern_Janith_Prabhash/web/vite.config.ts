import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Use base path for GitHub Pages when GITHUB_PAGES env is true
  base: process.env.GITHUB_PAGES === 'true' ? '/Task-Nebula/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});
