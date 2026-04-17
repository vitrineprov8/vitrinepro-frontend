import { test as setup } from '@playwright/test';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('autenticar usuário de teste', async ({ page, request }) => {
  const backendUrl = process.env.TEST_BACKEND_URL ?? 'http://localhost:3000';
  const email = process.env.TEST_USER_EMAIL ?? '';
  const password = process.env.TEST_USER_PASSWORD ?? '';

  // Login via API — mais rápido que preencher o formulário
  const resp = await request.post(`${backendUrl}/auth/login`, {
    data: { email, password },
  });

  if (!resp.ok()) {
    throw new Error(
      `Login falhou (${resp.status()}). Verifique TEST_USER_EMAIL e TEST_USER_PASSWORD no .env.test e garanta que o usuário existe no backend.`
    );
  }

  const body = await resp.json();
  const token: string = body.access_token ?? body.token ?? body.accessToken;

  if (!token) {
    throw new Error(`Resposta do login não contém token. Body: ${JSON.stringify(body)}`);
  }

  // Injeta o token no localStorage e salva o storageState
  await page.goto('/');
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.context().storageState({ path: AUTH_FILE });
});
