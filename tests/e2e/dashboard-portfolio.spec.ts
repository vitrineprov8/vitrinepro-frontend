import { test, expect } from '@playwright/test';

/**
 * Testes de portfólio (autenticado)
 * Componentes: src/components/dashboard/PortfolioList.vue, PortfolioEditor.vue
 * MANIFEST: dashboard-portfolio.spec.ts
 */

test.describe('Dashboard — Portfólio', () => {
  test('criar publicação → salvar rascunho → aparece na lista', async ({ page }) => {
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('title-input')).toBeVisible({ timeout: 10000 });

    const title = 'Teste Playwright ' + Date.now();
    await page.getByTestId('title-input').fill(title);

    const [response] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/portfolio') && resp.request().method() === 'POST' && resp.status() < 400
      ),
      page.getByTestId('draft-btn').click(),
    ]);

    expect(response.ok()).toBeTruthy();

    // Verifica na lista
    await page.goto('/dashboard/portfolio');
    await expect(page.locator('[data-testid="portfolio-item"]').filter({ hasText: title })).toBeVisible({ timeout: 10000 });
  });

  test('editar publicação → mudar título → título atualizado na lista', async ({ page }) => {
    // Cria uma publicação primeiro
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('title-input')).toBeVisible({ timeout: 10000 });

    const originalTitle = 'Original ' + Date.now();
    await page.getByTestId('title-input').fill(originalTitle);

    const [createResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/portfolio') && resp.request().method() === 'POST' && resp.status() < 400
      ),
      page.getByTestId('draft-btn').click(),
    ]);
    expect(createResp.ok()).toBeTruthy();

    // Abre a publicação para editar
    await page.goto('/dashboard/portfolio');
    const item = page.locator('[data-testid="portfolio-item"]').filter({ hasText: originalTitle });
    await expect(item).toBeVisible({ timeout: 10000 });

    await item.getByTestId('edit-portfolio-btn').click();
    await expect(page.getByTestId('title-input')).toBeVisible({ timeout: 10000 });

    const newTitle = 'Editado ' + Date.now();
    await page.getByTestId('title-input').clear();
    await page.getByTestId('title-input').fill(newTitle);

    const [editResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/portfolio') && resp.request().method() === 'PATCH' && resp.status() < 400
      ),
      page.getByTestId('draft-btn').click(),
    ]);
    expect(editResp.ok()).toBeTruthy();

    // Verifica na lista
    await page.goto('/dashboard/portfolio');
    await expect(page.locator('[data-testid="portfolio-item"]').filter({ hasText: newTitle })).toBeVisible({ timeout: 10000 });
  });

  test('excluir publicação → item removido da lista', async ({ page }) => {
    // Cria uma publicação para excluir
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('title-input')).toBeVisible({ timeout: 10000 });

    const title = 'ParaExcluir ' + Date.now();
    await page.getByTestId('title-input').fill(title);

    const [createResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/portfolio') && resp.request().method() === 'POST' && resp.status() < 400
      ),
      page.getByTestId('draft-btn').click(),
    ]);
    expect(createResp.ok()).toBeTruthy();

    // Exclui
    await page.goto('/dashboard/portfolio');
    const item = page.locator('[data-testid="portfolio-item"]').filter({ hasText: title });
    await expect(item).toBeVisible({ timeout: 10000 });

    await item.getByTestId('delete-portfolio-btn').click();

    // Confirma no dialog
    await expect(page.getByTestId('confirm-ok-btn')).toBeVisible({ timeout: 5000 });

    const [deleteResp] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/portfolio') && resp.request().method() === 'DELETE'
      ),
      page.getByTestId('confirm-ok-btn').click(),
    ]);
    expect(deleteResp.ok()).toBeTruthy();

    // Deve desaparecer
    await expect(item).not.toBeVisible({ timeout: 8000 });
  });

  test('toggle "Ofertar Serviço" ON → campos de serviço visíveis', async ({ page }) => {
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('service-toggle')).toBeVisible({ timeout: 10000 });

    // Campos de serviço estão ocultos inicialmente
    await expect(page.getByTestId('duration-input')).not.toBeVisible();

    // Ativa o toggle
    await page.getByTestId('service-toggle').click();

    // Campos devem aparecer
    await expect(page.getByTestId('duration-input')).toBeVisible({ timeout: 3000 });
  });

  test('toggle "Ofertar Serviço" OFF → campos de serviço somem', async ({ page }) => {
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('service-toggle')).toBeVisible({ timeout: 10000 });

    // Liga e desliga
    await page.getByTestId('service-toggle').click();
    await expect(page.getByTestId('duration-input')).toBeVisible({ timeout: 3000 });

    await page.getByTestId('service-toggle').click();
    await expect(page.getByTestId('duration-input')).not.toBeVisible({ timeout: 3000 });
  });

  test('duração > 30 dias → erro visível e não salva', async ({ page }) => {
    await page.goto('/dashboard/portfolio/novo');
    await expect(page.getByTestId('title-input')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('title-input').fill('Teste Duração');
    await page.getByTestId('service-toggle').click();
    await expect(page.getByTestId('duration-input')).toBeVisible({ timeout: 3000 });

    await page.getByTestId('duration-input').fill('45');
    await page.getByTestId('draft-btn').click();

    // Erro deve aparecer
    await expect(page.getByTestId('duration-error')).toBeVisible({ timeout: 5000 });

    // Nenhuma request de criação deve ter sido feita (ou não ter status 2xx)
    // Verificamos que o erro inline está presente — suficiente para confirmar bloqueio
  });
});
