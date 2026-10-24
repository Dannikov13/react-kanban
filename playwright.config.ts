import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173';
const port = new URL(baseURL).port || '5173';

export default defineConfig({
  testDir: './e2e',

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: true,
    env: {
      API_PROXY_TARGET: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
