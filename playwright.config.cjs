const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:5173/mk-61/',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/mk-61/',
    reuseExistingServer: false,
    timeout: 10000,
  },
});