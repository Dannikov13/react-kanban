import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { testDatabaseURL } from './e2e/test-config.js';

const baseURL = 'http://127.0.0.1:5174';
const apiURL = 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './e2e',
  // Drag-and-drop saves the whole board; shared-database tests must not race.
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: [['list'], ['html', { open: 'never' }]],

  globalSetup: './e2e/global-setup.ts',

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  webServer: [
    {
      command: 'node --import tsx src/server.ts',
      cwd: fileURLToPath(new URL('./server', import.meta.url)),
      url: `${apiURL}/api/health`,
      reuseExistingServer: false,
      env: {
        DATABASE_URL: testDatabaseURL,
        PORT: '3001',
        CORS_ORIGIN: baseURL,
      },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      url: baseURL,
      reuseExistingServer: false,
      env: {
        API_PROXY_TARGET: apiURL,
        VITE_API_BASE_URL: '',
      },
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
