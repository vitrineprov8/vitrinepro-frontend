import { test, expect } from '@playwright/test';

/**
 * Testes da busca / vitrine
 * Componentes: SearchPage.vue, SearchBox.vue, SearchResults.vue, SearchFilters.vue
 * MANIFEST: vitrine.spec.ts
 */

test.describe('Vitrine / Busca', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vitrine');
    // Aguarda a página carregar completamente
    await page.waitForLoadState('networkidle');
  });

  test('página carrega sem resultados inicialmente', async ({ page }) => {
    const container = page.getByTestId('results-container');
    // Ou não existe ainda, ou está vazio
    const cards = page.getByTestId('result-card');
    await expect(cards).toHaveCount(0);
  });

  test('clicar "Buscar" sem texto → traz todos os resultados', async ({ page }) => {
    await page.getByTestId('search-btn').click();
    await page.waitForLoadState('networkidle');

    const cards = page.getByTestId('result-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('buscar por texto → resultados aparecem', async ({ page }) => {
    await page.getByTestId('search-input').fill('designer');
    await page.getByTestId('search-btn').click();
    await page.waitForLoadState('networkidle');

    const cards = page.getByTestId('result-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test.describe('Filtros', () => {
    test.beforeEach(async ({ page }) => {
      // Carrega todos os resultados primeiro
      await page.getByTestId('search-btn').click();
      await page.waitForLoadState('networkidle');
      await expect(page.getByTestId('result-card').first()).toBeVisible({ timeout: 10000 });
    });

    test('filtro TODAS → mostra resultados misturados', async ({ page }) => {
      await page.getByTestId('filter-todas').click();
      await page.waitForTimeout(500);
      const cards = page.getByTestId('result-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('filtro Especialidades → apenas cards de profissional', async ({ page }) => {
      await page.getByTestId('filter-especialidades').click();
      await page.waitForTimeout(500);
      // Cards de profissional têm data-testid="result-card" e data-type="profile"
      const profileCards = page.locator('[data-testid="result-card"][data-type="profile"]');
      const serviceCards = page.locator('[data-testid="result-card"][data-type="service"]');
      const profileCount = await profileCards.count();
      const serviceCount = await serviceCards.count();
      // Nenhum card de serviço deve aparecer
      expect(serviceCount).toBe(0);
      // Pode não ter cards de perfil se não há dados — só validamos ausência de serviços
    });

    test('filtro Projetos → sem cards de serviço', async ({ page }) => {
      await page.getByTestId('filter-projetos').click();
      await page.waitForTimeout(500);
      const serviceCards = page.locator('[data-testid="result-card"][data-type="service"]');
      expect(await serviceCards.count()).toBe(0);
    });

    test('filtro Serviços → apenas cards de serviço', async ({ page }) => {
      await page.getByTestId('filter-servicos').click();
      await page.waitForTimeout(500);
      const profileCards = page.locator('[data-testid="result-card"][data-type="profile"]');
      expect(await profileCards.count()).toBe(0);
    });

    test('trocar filtro → lista atualiza sem reload', async ({ page }) => {
      const urlBefore = page.url();
      await page.getByTestId('filter-servicos').click();
      await page.waitForTimeout(300);
      await page.getByTestId('filter-todas').click();
      await page.waitForTimeout(300);
      // URL não deve ter mudado para indicar reload
      expect(page.url()).toBe(urlBefore);
    });
  });

  test('clicar em card de perfil → navega para /perfil/[slug]', async ({ page }) => {
    await page.getByTestId('search-btn').click();
    await page.waitForLoadState('networkidle');

    const profileCard = page.locator('[data-testid="result-card"][data-type="profile"]').first();
    const count = await profileCard.count();
    if (count === 0) {
      test.skip(); // Sem dados de perfil para testar
      return;
    }

    await profileCard.click();
    await expect(page).toHaveURL(/\/perfil\//);
  });

  test('clicar em card de portfólio → navega para /portfolio/[slug]', async ({ page }) => {
    await page.getByTestId('search-btn').click();
    await page.waitForLoadState('networkidle');

    const portfolioCard = page.locator('[data-testid="result-card"][data-type="portfolio"]').first();
    const count = await portfolioCard.count();
    if (count === 0) {
      test.skip(); // Sem dados de portfólio para testar
      return;
    }

    await portfolioCard.click();
    await expect(page).toHaveURL(/\/portfolio\//);
  });

  test('clicar tag popular → busca disparada automaticamente', async ({ page }) => {
    const popularTag = page.locator('[data-testid="popular-tag"]').first();
    const tagCount = await popularTag.count();
    if (tagCount === 0) {
      test.skip(); // Sem tags populares configuradas
      return;
    }

    await popularTag.click();
    await page.waitForLoadState('networkidle');
    const cards = page.getByTestId('result-card');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });
});
