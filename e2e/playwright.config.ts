import { defineConfig, devices } from '@playwright/test'

const BACKEND_PORT = Number(process.env.E2E_BACKEND_PORT ?? 3001)
const FRONTEND_PORT = Number(process.env.E2E_FRONTEND_PORT ?? 5101)
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`
const SHUTDOWN = { signal: 'SIGTERM' as const, timeout: 5000 }
const INCLUDE_EVIDENCE = process.env.E2E_INCLUDE_EVIDENCE === 'true'

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  testIgnore: INCLUDE_EVIDENCE ? undefined : '**/qa-evidence.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: 'list',
  outputDir: './test-results',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run dev --prefix ../backend',
      url: `${BACKEND_URL}/health`,
      name: 'backend',
      env: { PORT: String(BACKEND_PORT) },
      timeout: 60000,
      reuseExistingServer: false,
      gracefulShutdown: SHUTDOWN,
    },
    {
      command: `npm run dev --prefix ../frontend -- --host 127.0.0.1 --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_URL,
      name: 'frontend',
      env: { VITE_API_URL: BACKEND_URL },
      timeout: 60000,
      reuseExistingServer: false,
      gracefulShutdown: SHUTDOWN,
    },
  ],
})
