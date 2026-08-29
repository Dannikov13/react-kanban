import path from 'path';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },

    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/coverage/**',
      '**/test-results/**',
      '**/e2e/**',
    ],
  },
});
