const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  timeout: 60_000,
  retries: 1,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testDir: './tests', testMatch: /auth\.setup\.js/ },
    { name: 'login', testDir: './tests', testMatch: /login\.spec\.js/ },
    {
      name: 'app',
      testDir: './tests',
      testMatch: /app\.spec\.js/,
      dependencies: ['setup'],
      use: { storageState: '.auth/admin.json' },
    },
  ],
});
