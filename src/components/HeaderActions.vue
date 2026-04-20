<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { isAuthenticated, logout, getUserFromToken } from '../utils/auth';

const isAuth = ref(false);
const userName = ref('');
const isLoading = ref(true);

onMounted(() => {
  // Verificar se está autenticado
  isAuth.value = isAuthenticated();

  if (isAuth.value) {
    // Obter dados do usuário do token
    const user = getUserFromToken();
    if (user && user.email) {
      // Pegar o primeiro nome do email ou usar "Usuário"
      userName.value = user.email.split('@')[0];
    }
  }

  isLoading.value = false;
});

function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) {
    logout();
  }
}
</script>

<template>
  <div v-if="!isLoading" class="header-actions">
    <!-- Usuário autenticado -->
    <template v-if="isAuth">
      <a href="/dashboard" class="btn-dashboard">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>{{ userName || 'Minha Conta' }}</span>
      </a>
      <button @click="handleLogout" class="btn-logout-link">
        Sair
      </button>
    </template>

    <!-- Usuário não autenticado -->
    <template v-else>
      <a href="/login" class="btn-login">Entrar</a>
      <a href="/signup" class="btn-signup">Cadastre-se Grátis</a>
    </template>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.btn-login {
  color: var(--text-primary);
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  transition: color var(--transition-fast);
  white-space: nowrap;
}

.btn-login:hover {
  color: var(--primary);
}

.btn-dashboard {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  transition: all var(--transition-fast);
  border-radius: var(--radius-md);
  white-space: nowrap;
}

.btn-dashboard:hover {
  color: var(--primary);
  background-color: var(--bg-secondary);
}

.btn-dashboard svg {
  width: 16px;
  height: 16px;
}

.btn-logout-link {
  color: var(--text-secondary);
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-md);
  text-decoration: none;
  transition: color var(--transition-fast);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-base);
  font-family: var(--font-sans);
  white-space: nowrap;
}

.btn-logout-link:hover {
  color: #dc2626;
}

.btn-signup {
  background-color: var(--accent);
  color: var(--text-primary);
  font-weight: 700;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  text-decoration: none;
  transition: background-color var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
}

.btn-signup:hover {
  background-color: var(--accent-dark);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 1024px) {
  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-login,
  .btn-dashboard,
  .btn-logout-link,
  .btn-signup {
    width: 100%;
    text-align: center;
    padding: var(--spacing-md);
    justify-content: center;
  }
}
</style>
