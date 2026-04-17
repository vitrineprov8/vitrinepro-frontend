import { test, expect } from '@playwright/test';

/**
 * Testes de login
 * Componentes: src/components/landing/AuthForm.vue (ou similar), src/utils/auth.ts
 * MANIFEST: login.spec.ts
 */

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    // Garante sem token antes de cada teste
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('token'));
  });

  test('página /dashboard sem token redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('credenciais inválidas → mensagem de erro visível', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email-input').fill('errado@email.com');
    await page.getByTestId('password-input').fill('senhaErrada123');
    await page.getByTestId('login-btn').click();
    // Aguarda toast ou mensagem de erro
    const error = page.getByTestId('toast').or(page.getByRole('alert'));
    await expect(error).toBeVisible({ timeout: 8000 });
  });

  test('credenciais corretas → redireciona para /dashboard', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';

    await page.goto('/login');
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-btn').click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test('após login, token está no localStorage', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL ?? '';
    const password = process.env.TEST_USER_PASSWORD ?? '';

    await page.goto('/login');
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(password);
    await page.getByTestId('login-btn').click();

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
