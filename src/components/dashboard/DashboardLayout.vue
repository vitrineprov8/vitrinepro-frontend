<template>
  <div class="db-layout">
    <!-- Sidebar desktop -->
    <aside class="db-sidebar">
      <div class="db-sidebar-logo">
        <a href="/" class="logo">
        <img src="/logo.png" alt="Logo VitrinePro" class="logo-image"  width="140" height="40" />
      </a>
      </div>

      <div class="db-sidebar-user" v-if="user">
        <div class="db-user-avatar">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.firstName" />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="db-user-info">
          <div class="db-user-name">{{ user.firstName }} {{ user.lastName }}</div>
          <div class="db-user-role">{{ user.profession || user.email }}</div>
        </div>
      </div>
      <div class="db-sidebar-user" v-else>
        <div class="db-user-avatar" style="background: var(--bg-tertiary);"></div>
        <div class="db-user-info">
          <div class="db-user-name" style="background: var(--bg-tertiary); height: 14px; border-radius: 4px; width: 120px;"></div>
        </div>
      </div>

      <nav class="db-nav">
        <div class="db-nav-section">Principal</div>
        <a v-for="item in navItems" :key="item.href"
          :href="item.href"
          class="db-nav-item"
          :class="{ active: isActive(item.href), disabled: item.disabled }"
        >
          <svg class="db-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" v-html="item.icon" />
          {{ item.label }}
          <span v-if="item.badge" class="db-nav-badge">{{ item.badge }}</span>
        </a>
      </nav>

      <div class="db-sidebar-footer">
        <a :href="`/perfil/${user?.username || ''}`" target="_blank" class="btn btn-secondary btn-sm" style="margin-bottom: var(--spacing-sm); display: flex; justify-content: center;" v-if="user?.username">
          Ver meu perfil
        </a>

        <!-- Visibility toggle -->
        <button
          class="db-visibility-toggle"
          :class="{ 'db-visibility-hidden': profileHidden }"
          :disabled="togglingVisibility"
          @click="toggleVisibility"
          :title="profileHidden ? 'Perfil oculto — clique para tornar público' : 'Perfil público — clique para ocultar'"
        >
          <svg v-if="profileHidden" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
          <svg v-else width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          <span v-if="togglingVisibility" class="spinner spinner-sm" style="margin-left: 4px;"></span>
          <span v-else>{{ profileHidden ? 'Perfil oculto' : 'Ocultar Perfil' }}</span>
        </button>

        <button class="db-logout-btn" @click="handleLogout">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
          Sair da conta
        </button>
      </div>

      <Toast ref="layoutToastRef" />
    </aside>

    <!-- Main content -->
    <main class="db-main">
      <slot />
    </main>

    <!-- Bottom nav mobile -->
    <nav class="db-bottom-nav" :class="{ 'keyboard-open': keyboardOpen }">
      <div class="db-bottom-nav-inner">
        <a v-for="item in mobileNavItems" :key="item.href"
          :href="item.href"
          class="db-bottom-nav-item"
          :class="{ active: isActive(item.href) }"
        >
          <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" v-html="item.icon" />
          <span>{{ item.label }}</span>
        </a>
        <button class="db-bottom-nav-item db-bottom-nav-logout" @click="handleLogout">
          <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          <span>Sair</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, provide } from 'vue';
import { isAdmin, isAuthenticated, logout } from '../../utils/auth';
import { getFullProfile, updateProfile } from '../../utils/api';
import type { FullProfile } from '../../utils/api';
import Toast from '../ui/Toast.vue';

const user = ref<FullProfile | null>(null);
provide('currentUser', user);

const togglingVisibility = ref(false);
const layoutToastRef = ref<InstanceType<typeof Toast> | null>(null);

const profileHidden = computed(() => user.value?.isVisible === false);

// Hide bottom nav when virtual keyboard is open
const keyboardOpen = ref(false);
let vpResizeHandler: (() => void) | null = null;

const initials = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName[0] ?? ''}${user.value.lastName[0] ?? ''}`.toUpperCase();
});

const adminMode = ref(false);

const baseNavItems = [
  { href: '/dashboard', label: 'Início', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />' },
  { href: '/dashboard/perfil', label: 'Perfil', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />' },
  { href: '/dashboard/portfolio', label: 'Portfólio', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />' },
  { href: '/dashboard/tags', label: 'Tags', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />' },
  { href: '/dashboard/curriculos', label: 'Currículos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />' },
  { href: '/dashboard/formacao', label: 'Formação', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />' },
  { href: '/dashboard/minhas-candidaturas', label: 'Minhas candidaturas', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />' },
  { href: '/dashboard/eventos', label: 'Eventos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />', disabled: true, badge: 'Em breve' },
];

const adminNavItem = {
  href: '/dashboard/vagas',
  label: 'Vagas (admin)',
  icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />',
};

const adminGupyNavItem = {
  href: '/dashboard/integracoes/gupy',
  label: 'Integrações Gupy',
  icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />',
};

const navItems = computed(() =>
  adminMode.value ? [...baseNavItems, adminNavItem, adminGupyNavItem] : baseNavItems,
);

const mobileNavItems = computed(() => [
  baseNavItems[0], // Início
  baseNavItems[1], // Perfil
  baseNavItems[2], // Portfólio
  baseNavItems[6], // Minhas candidaturas
  baseNavItems[4], // Currículos
]);

onBeforeUnmount(() => {
  if (typeof window !== 'undefined' && window.visualViewport && vpResizeHandler) {
    window.visualViewport.removeEventListener('resize', vpResizeHandler);
  }
});

function isActive(href: string) {
  if (typeof window === 'undefined') return false;
  if (href === '/dashboard') return window.location.pathname === '/dashboard';
  return window.location.pathname.startsWith(href);
}

async function toggleVisibility() {
  if (togglingVisibility.value) return;
  togglingVisibility.value = true;
  try {
    const newVisible = profileHidden.value; // if currently hidden, make visible
    const updated = await updateProfile({ isVisible: newVisible });
    user.value = updated;
    layoutToastRef.value?.show(
      newVisible ? 'Perfil agora está público.' : 'Perfil ocultado com sucesso.',
      'success'
    );
  } catch {
    layoutToastRef.value?.show('Erro ao alterar visibilidade. Tente novamente.', 'error');
  } finally {
    togglingVisibility.value = false;
  }
}

function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) logout();
}

onMounted(async () => {
  // Detect virtual keyboard via visualViewport API
  if (typeof window !== 'undefined' && window.visualViewport) {
    vpResizeHandler = () => {
      const ratio = window.visualViewport!.height / window.innerHeight;
      keyboardOpen.value = ratio < 0.75;
    };
    window.visualViewport.addEventListener('resize', vpResizeHandler);
  }

  if (!isAuthenticated()) {
    const redirect = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?redirect=${redirect}`;
    return;
  }
  adminMode.value = isAdmin();
  try {
    user.value = await getFullProfile();
  } catch (e: any) {
    if (e?.statusCode === 401) {
      logout();
    }
  }
});
</script>

<style scoped>
.db-visibility-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.db-visibility-toggle:hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.db-visibility-toggle.db-visibility-hidden {
  color: #f59e0b;
  border-color: #fde68a;
  background: #fffbeb;
}
.db-visibility-toggle.db-visibility-hidden:hover:not(:disabled) {
  background: #fef3c7;
}
.db-visibility-toggle:disabled {
  opacity: 0.7;
  cursor: default;
}
</style>
