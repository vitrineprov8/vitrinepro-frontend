import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Testes de currículos (autenticado)
 * Componente: src/components/dashboard/CVManager.vue
 * MANIFEST: dashboard-curriculos.spec.ts
 */

test.describe('Dashboard — Currículos', () => {
  let tempPdfPath: string;

  test.beforeAll(async () => {
    // Cria um PDF mínimo válido para upload
    tempPdfPath = path.join(os.tmpdir(), 'curriculo-teste.pdf');
    fs.writeFileSync(tempPdfPath,
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 2\n0000000000 65535 f \ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n9\n%%EOF\n'
    );
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/curriculos');
    await page.waitForLoadState('networkidle');
  });

  test('upload de PDF com rótulo → aparece na lista', async ({ page }) => {
    const countBefore = await page.getByTestId('cv-item').count();
    const rotulo = 'CV Teste ' + Date.now();

    // 1. Preenche o rótulo (campo obrigatório)
    await page.getByPlaceholder(/rótulo|Ex: Currículo/i).fill(rotulo);

    // 2. Seleciona o arquivo PDF
    await page.getByTestId('cv-upload-input').setInputFiles(tempPdfPath);

    // 3. Aguarda a API de upload e clica no botão submit
    const [response] = await Promise.all([
      page.waitForResponse(resp =>
        resp.url().includes('/cv') && resp.request().method() === 'POST' && resp.status() < 400
      ),
      page.getByRole('button', { name: /fazer upload|enviar|upload/i }).click(),
    ]);

    expect(response.ok()).toBeTruthy();

    // 4. O item aparece na lista
    await expect(page.getByTestId('cv-item')).toHaveCount(countBefore + 1, { timeout: 10000 });
    await expect(page.locator('[data-testid="cv-item"]').filter({ hasText: rotulo })).toBeVisible();
  });

  test('excluir currículo → removido da lista', async ({ page }) => {
    // Garante que há pelo menos 1 item
    let count = await page.getByTestId('cv-item').count();

    if (count === 0) {
      const rotulo = 'CV Para Excluir ' + Date.now();
      await page.getByPlaceholder(/rótulo|Ex: Currículo/i).fill(rotulo);
      await page.getByTestId('cv-upload-input').setInputFiles(tempPdfPath);

      await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/cv') && resp.request().method() === 'POST'),
        page.getByRole('button', { name: /fazer upload|enviar|upload/i }).click(),
      ]);

      await expect(page.getByTestId('cv-item')).toHaveCount(1, { timeout: 10000 });
      count = 1;
    }

    // Exclui o primeiro item
    await page.getByTestId('cv-item').first().getByTestId('cv-delete-btn').click();
    await expect(page.getByTestId('confirm-ok-btn')).toBeVisible({ timeout: 5000 });

    const [delResp] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/cv') && resp.request().method() === 'DELETE'),
      page.getByTestId('confirm-ok-btn').click(),
    ]);

    expect(delResp.ok()).toBeTruthy();
    await expect(page.getByTestId('cv-item')).toHaveCount(count - 1, { timeout: 8000 });
  });
});
