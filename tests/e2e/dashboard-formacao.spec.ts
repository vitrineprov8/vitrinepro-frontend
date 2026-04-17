import { test, expect } from '@playwright/test';

/**
 * Testes de formação acadêmica (autenticado)
 * Componente: src/components/dashboard/EducationManager.vue
 * MANIFEST: dashboard-formacao.spec.ts
 */

test.describe('Dashboard — Formação Acadêmica', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/formacao');
    await page.waitForLoadState('networkidle');
  });

  test('clicar "Adicionar formação" → modal abre', async ({ page }) => {
    await page.getByTestId('add-education-btn').click();
    // O modal deve ficar visível
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });
  });

  test('salvar sem preencher campos → modal permanece aberto', async ({ page }) => {
    await page.getByTestId('add-education-btn').click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });

    // Tenta salvar sem preencher nada
    await page.getByTestId('save-education-btn').click();

    // CRÍTICO: modal NÃO deve fechar quando há erro
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 3000 });
  });

  test('preencher todos os campos → salvar → item aparece na lista', async ({ page }) => {
    await page.getByTestId('add-education-btn').click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });

    // Preenche o formulário
    await page.locator('select').first().selectOption('GRADUATE');
    await page.getByPlaceholder('Nome da instituição').fill('Universidade Teste');
    await page.getByPlaceholder(/bacharelado/i).fill('Ciências da Computação ' + Date.now());
    // Data de início
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.first().fill('2020-01-01');

    const [saveResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/education') && resp.request().method() === 'POST' && resp.status() < 400
      ),
      page.getByTestId('save-education-btn').click(),
    ]);
    expect(saveResp.ok()).toBeTruthy();

    // Modal fecha após sucesso
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 8000 });

    // Item aparece na lista
    await expect(page.getByTestId('edu-item').first()).toBeVisible({ timeout: 8000 });
  });

  test('excluir item de formação → confirmação → item removido', async ({ page }) => {
    // Primeiro verifica se há itens, ou cria um
    const items = page.getByTestId('edu-item');
    let count = await items.count();

    if (count === 0) {
      // Cria um item primeiro
      await page.getByTestId('add-education-btn').click();
      await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 5000 });
      await page.locator('select').first().selectOption('COURSE');
      await page.getByPlaceholder('Nome da instituição').fill('Instituto Teste');
      await page.getByPlaceholder(/bacharelado/i).fill('Curso Para Excluir');
      await page.locator('input[type="date"]').first().fill('2022-03-01');
      const [createResp] = await Promise.all([
        page.waitForResponse(resp =>
          resp.url().includes('/education') && resp.request().method() === 'POST' && resp.status() < 400
        ),
        page.getByTestId('save-education-btn').click(),
      ]);
      expect(createResp.ok()).toBeTruthy();
      await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 8000 });
      count = 1;
    }

    // Exclui o primeiro item
    const firstItem = items.first();
    await firstItem.getByTestId('edu-delete-btn').click();

    // Dialog de confirmação
    await expect(page.getByTestId('confirm-ok-btn')).toBeVisible({ timeout: 5000 });

    const [deleteResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/education') && resp.request().method() === 'DELETE'
      ),
      page.getByTestId('confirm-ok-btn').click(),
    ]);
    expect(deleteResp.ok()).toBeTruthy();

    const newCount = await page.getByTestId('edu-item').count();
    expect(newCount).toBe(count - 1);
  });
});
