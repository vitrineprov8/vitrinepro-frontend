<script setup lang="ts">
import { ref } from 'vue';
import { loginWithCredentials, getErrorMessage } from '../utils/api';
import { saveToken, redirectAfterLogin } from '../utils/auth';

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

async function handleSubmit() {
  // Limpar erro anterior
  error.value = '';

  // Validação básica
  if (!email.value || !password.value) {
    error.value = 'Por favor, preencha todos os campos';
    return;
  }

  try {
    isLoading.value = true;

    // Fazer login
    const response = await loginWithCredentials(email.value, password.value);

    // Salvar token
    saveToken(response.access_token);

    // Redirecionar para dashboard ou página anterior
    redirectAfterLogin();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <div v-if="error" class="form-error" role="alert">
      {{ error }}
    </div>

    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <input
        id="email"
        v-model="email"
        data-testid="email-input"
        type="email"
        class="form-input"
        placeholder="seu@email.com"
        required
        autocomplete="email"
        :disabled="isLoading"
      />
    </div>

    <div class="form-group">
      <label for="password" class="form-label">Senha</label>
      <input
        id="password"
        v-model="password"
        data-testid="password-input"
        type="password"
        class="form-input"
        placeholder="••••••••"
        required
        autocomplete="current-password"
        :disabled="isLoading"
      />
    </div>

    <button
      type="submit"
      data-testid="login-btn"
      class="form-submit"
      :disabled="isLoading"
      :class="{ 'btn-loading': isLoading }"
    >
      {{ isLoading ? 'Entrando...' : 'Entrar' }}
    </button>

    <div class="form-footer">
      <a href="/signup" class="form-link">
        Não tem conta? <strong>Cadastre-se</strong>
      </a>
    </div>
  </form>
</template>

<style scoped>
.auth-form {
  width: 100%;
}

.form-error {
  padding: 0.875rem;
  background-color: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: var(--radius-md);
  color: #dc2626;
  font-size: var(--text-sm);
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem;
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  transition: all var(--transition-fast);
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: var(--text-light);
}

.form-submit {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: 0.5rem;
}

.form-submit:hover:not(:disabled) {
  background-color: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.form-submit:active:not(:disabled) {
  transform: translateY(0);
}

.form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  position: relative;
}

.btn-loading::after {
  content: '';
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.form-link {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.form-link:hover {
  color: var(--primary);
}

.form-link strong {
  color: var(--primary);
  font-weight: 600;
}
</style>
