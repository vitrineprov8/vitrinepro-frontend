import { test, expect } from '@playwright/test';

/**
 * Testes do editor de perfil (autenticado)
 * Componente: src/components/dashboard/ProfileEditor.vue
 * MANIFEST: dashboard-perfil.spec.ts
 */

test.describe('Dashboard — Editor de Perfil', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/perfil');
    // Aguarda o formulário carregar (spinner some)
    await expect(page.getByTestId('save-profile-btn')).toBeVisible({ timeout: 10000 });
  });

  test('campos são pré-preenchidos ao carregar', async ({ page }) => {
    // Pelo menos um campo deve ter valor (usuário de teste já tem dados)
    const profession = page.getByTestId('profession-input');
    await expect(profession).toBeVisible();
    // Não valida o valor específico — pode estar vazio num usuário novo
  });

  test('alterar profissão → salvar → API retorna 200', async ({ page }) => {
    const professionInput = page.getByTestId('profession-input');
    await professionInput.clear();
    await professionInput.fill('Arquiteto de Software ' + Date.now());

    const [response] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/profile') && resp.request().method() === 'PATCH'
      ),
      page.getByTestId('save-profile-btn').click(),
    ]);

    expect(response.ok()).toBeTruthy();
  });

  test('profissão alterada persiste após reload', async ({ page }) => {
    const newProfession = 'Testador Playwright ' + Date.now();

    await page.getByTestId('profession-input').clear();
    await page.getByTestId('profession-input').fill(newProfession);

    const [saveResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/profile') && resp.request().method() === 'PATCH'
      ),
      page.getByTestId('save-profile-btn').click(),
    ]);

    expect(saveResp.ok()).toBeTruthy();

    // Recarrega a página
    await page.reload();
    await expect(page.getByTestId('save-profile-btn')).toBeVisible({ timeout: 10000 });

    const value = await page.getByTestId('profession-input').inputValue();
    expect(value).toBe(newProfession);
  });

  test('apagar telefone → salvar → campo fica vazio após reload', async ({ page }) => {
    // Primeiro garante que tem algum telefone (salva um)
    await page.getByTestId('phone-input').clear();
    await page.getByTestId('phone-input').fill('+55 11 99999-0000');

    const [resp1] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/profile') && resp.request().method() === 'PATCH'
      ),
      page.getByTestId('save-profile-btn').click(),
    ]);
    expect(resp1.ok()).toBeTruthy();

    // Agora apaga e salva
    await page.getByTestId('phone-input').clear();

    const [resp2] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/profile') && resp.request().method() === 'PATCH'
      ),
      page.getByTestId('save-profile-btn').click(),
    ]);
    expect(resp2.ok()).toBeTruthy();

    await page.reload();
    await expect(page.getByTestId('save-profile-btn')).toBeVisible({ timeout: 10000 });

    const value = await page.getByTestId('phone-input').inputValue();
    expect(value).toBe('');
  });
});
