import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 45_000,
  // On CI, failures also become annotations on the pull request, so they can
  // be read without opening the job log.
  reporter: process.env.CI
    ? [['list'], ['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4178',
    browserName: 'chromium',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4178 --strictPort',
    url: 'http://127.0.0.1:4178',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
