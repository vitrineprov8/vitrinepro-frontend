<script setup lang="ts">
import { ref, computed } from 'vue';
import { registerUser, getErrorMessage } from '../utils/api';
import { saveToken, redirectAfterLogin } from '../utils/auth';

const isCompany = ref(false);

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');

// Company fields
const companyName = ref('');
const companyIndustry = ref('');

const error = ref('');
const isLoading = ref(false);

const INDUSTRIES = [
  { value: 'Tecnologia', label: 'Tecnologia' },
  { value: 'Comercio', label: 'Comércio' },
  { value: 'Saude', label: 'Saúde' },
  { value: 'Educacao', label: 'Educação' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Outros', label: 'Outros' },
];

const passwordsMatch = computed(() => {
  if (!confirmPassword.value) return true;
  return password.value === confirmPassword.value;
});

const passwordStrength = computed(() => {
  const pwd = password.value;
  if (!pwd) return '';
  if (pwd.length < 8) return 'Mínimo 8 caracteres';
  return '';
});

async function handleSubmit() {
  error.value = '';

  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Por favor, preencha todos os campos';
    return;
  }

  if (isCompany.value && !companyName.value.trim()) {
    error.value = 'Informe o nome da empresa';
    return;
  }

  if (password.value.length < 8) {
    error.value = 'A senha deve ter no mínimo 8 caracteres';
    return;
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'As senhas não coincidem';
    return;
  }

  try {
    isLoading.value = true;

    const response = await registerUser(
      email.value,
      firstName.value,
      lastName.value,
      password.value,
      isCompany.value
        ? {
            isCompany: true,
            companyName: companyName.value.trim(),
            companyIndustry: companyIndustry.value || undefined,
          }
        : undefined
    );

    saveToken(response.access_token);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('vp:just-logged-in', '1');
    }
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

    <!-- Toggle Empresa / Candidato -->
    <div class="company-toggle-row">
      <button
        type="button"
        class="toggle-btn"
        :class="{ active: !isCompany }"
        @click="isCompany = false"
      >
        Candidato
      </button>
      <button
        type="button"
        class="toggle-btn"
        :class="{ active: isCompany }"
        @click="isCompany = true"
      >
        Empresa
      </button>
    </div>

    <!-- Company fields (shown when isCompany = true) -->
    <template v-if="isCompany">
      <div class="form-group">
        <label for="companyName" class="form-label">Nome da empresa <span class="required">*</span></label>
        <input
          id="companyName"
          v-model="companyName"
          type="text"
          class="form-input"
          placeholder="Ex: Acme Ltda"
          required
          :disabled="isLoading"
        />
      </div>
      <div class="form-group">
        <label for="companyIndustry" class="form-label">Setor</label>
        <select id="companyIndustry" v-model="companyIndustry" class="form-input" :disabled="isLoading">
          <option value="">Selecione o setor</option>
          <option v-for="ind in INDUSTRIES" :key="ind.value" :value="ind.value">{{ ind.label }}</option>
        </select>
      </div>
    </template>

    <!-- Responsible person fields (always shown, re-labeled for empresa) -->
    <div class="form-row">
      <div class="form-group">
        <label for="firstName" class="form-label">{{ isCompany ? 'Nome do responsável' : 'Nome' }}</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          class="form-input"
          placeholder="João"
          required
          autocomplete="given-name"
          :disabled="isLoading"
        />
      </div>

      <div class="form-group">
        <label for="lastName" class="form-label">{{ isCompany ? 'Sobrenome do responsável' : 'Sobrenome' }}</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          class="form-input"
          placeholder="Silva"
          required
          autocomplete="family-name"
          :disabled="isLoading"
        />
      </div>
    </div>

    <div class="form-group">
      <label for="email" class="form-label">Email</label>
      <input
        id="email"
        v-model="email"
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
        type="password"
        class="form-input"
        :class="{ 'input-error': passwordStrength && password }"
        placeholder="••••••••"
        required
        minlength="8"
        autocomplete="new-password"
        :disabled="isLoading"
      />
      <span v-if="passwordStrength" class="input-hint error-hint">
        {{ passwordStrength }}
      </span>
    </div>

    <div class="form-group">
      <label for="confirmPassword" class="form-label">Confirmar Senha</label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        class="form-input"
        :class="{ 'input-error': !passwordsMatch }"
        placeholder="••••••••"
        required
        autocomplete="new-password"
        :disabled="isLoading"
      />
      <span v-if="!passwordsMatch" class="input-hint error-hint">
        As senhas não coincidem
      </span>
    </div>

    <button
      type="submit"
      class="form-submit"
      :disabled="isLoading || !passwordsMatch || !!passwordStrength"
      :class="{ 'btn-loading': isLoading }"
    >
      {{ isLoading ? 'Criando conta...' : 'Criar Conta' }}
    </button>

    <div class="form-footer">
      <a href="/login" class="form-link">
        Já tem conta? <strong>Entrar</strong>
      </a>
    </div>
  </form>
</template>

<style scoped>
.auth-form {
  width: 100%;
}

/* Empresa / Profissional toggle */
.company-toggle-row {
  display: flex;
  border: 1px solid var(--border-dark);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  background: none;
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.toggle-btn.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

.toggle-btn:not(.active):hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.required {
  color: #ef4444;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
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

.form-input.input-error {
  border-color: #dc2626;
}

.form-input.input-error:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input:disabled {
  background-color: var(--bg-secondary);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: var(--text-light);
}

.input-hint {
  display: block;
  font-size: var(--text-xs);
  margin-top: 0.375rem;
  color: var(--text-light);
}

.input-hint.error-hint {
  color: #dc2626;
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
