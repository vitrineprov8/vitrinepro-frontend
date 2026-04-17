import { test, expect } from '@playwright/test';

/**
 * Testes de tags (autenticado)
 * Componente: src/components/dashboard/TagManager.vue
 * MANIFEST: dashboard-tags.spec.ts
 */

test.describe('Dashboard — Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/tags');
    await page.waitForLoadState('networkidle');
  });

  test('criar nova tag → aparece na lista', async ({ page }) => {
    const tagName = 'Tag' + Math.floor(Math.random() * 100000);
    const countBefore = await page.getByTestId('tag-item').count();

    await page.getByTestId('tag-input').fill(tagName);
    await page.getByTestId('tag-save-btn').click();

    await expect(page.getByTestId('tag-item')).toHaveCount(countBefore + 1, { timeout: 8000 });
    await expect(page.locator('[data-testid="tag-item"]').filter({ hasText: tagName })).toBeVisible();
  });

  test('excluir tag → removida da lista', async ({ page }) => {
    // Cria uma tag para excluir
    const tagName = 'Del' + Math.floor(Math.random() * 100000);
    await page.getByTestId('tag-input').fill(tagName);
    await page.getByTestId('tag-save-btn').click();

    const item = page.locator('[data-testid="tag-item"]').filter({ hasText: tagName });
    await expect(item).toBeVisible({ timeout: 8000 });

    await item.getByTestId('tag-delete-btn').click();

    // Pode ter confirm dialog
    const confirmBtn = page.getByTestId('confirm-ok-btn');
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click();
    }

    await expect(item).not.toBeVisible({ timeout: 8000 });
  });

  test('campo de tag fica vazio após criar', async ({ page }) => {
    await page.getByTestId('tag-input').fill('Limpa' + Math.floor(Math.random() * 100000));
    await page.getByTestId('tag-save-btn').click();

    // Campo deve limpar após salvar
    await expect(page.getByTestId('tag-input')).toHaveValue('', { timeout: 5000 });
  });
});
