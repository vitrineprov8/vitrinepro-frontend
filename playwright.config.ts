import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,        // sequencial para não conflitar com dados de teste
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
  },

  projects: [
    // Setup: faz login uma vez e salva o estado
    {
      name: 'setup',
      testMatch: /setup\/auth\.setup\.ts/,
      testDir: './tests',
    },

    // Testes públicos (sem auth)
    {
      name: 'public',
      testMatch: /e2e\/(login|vitrine|perfil)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Testes autenticados (dashboard)
    {
      name: 'dashboard',
      testMatch: /e2e\/dashboard-.+\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
    },
  ],

  // Sobe o dev server automaticamente se não estiver rodando
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: true,  // usa o server existente se já estiver rodando
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
