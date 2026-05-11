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
        <div class="db-user-avatar" :class="myPlan ? `ring-${myPlan.plan.toLowerCase()}` : ''">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.firstName" />
          <span v-else>{{ initials }}</span>
        </div>
        <div class="db-user-info">
          <div class="db-user-name">{{ user.firstName }} {{ user.lastName }}</div>
          <div class="db-user-role">{{ user.profession || user.email }}</div>
          <div v-if="myPlan" class="db-plan-row" :class="{ 'expanded': planExpiryOpen }">
            <button
              type="button"
              class="db-plan-badge"
              :class="`plan-${myPlan.plan.toLowerCase()}`"
              :title="myPlan.planStatus === 'ACTIVE' && myPlan.planExpiresAt ? `Válido até ${formatPlanExpiry(myPlan.planExpiresAt)}` : ''"
              @click="planExpiryOpen = !planExpiryOpen"
            >
              Plano: {{ PLAN_NAMES[myPlan.plan] }}
            </button>
            <span v-if="myPlan.planStatus === 'ACTIVE' && myPlan.planExpiresAt" class="db-plan-expires">
              até {{ formatPlanExpiry(myPlan.planExpiresAt) }}
            </span>
          </div>
        </div>
      </div>
      <div class="db-sidebar-user" v-else>
        <div class="db-user-avatar" style="background: var(--bg-tertiary);"></div>
        <div class="db-user-info">
          <div class="db-user-name" style="background: var(--bg-tertiary); height: 14px; border-radius: 4px; width: 120px;"></div>
        </div>
      </div>

      <nav class="db-nav">
        <template v-for="group in navGroups" :key="group.label">
          <div class="db-nav-section">{{ group.label }}</div>
          <a v-for="item in group.items" :key="item.href"
            :href="item.href"
            class="db-nav-item"
            :class="{ active: isActive(item.href), disabled: item.disabled }"
          >
            <svg class="db-nav-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" v-html="item.icon" />
            {{ item.label }}
            <span v-if="item.badge" class="db-nav-badge">{{ item.badge }}</span>
          </a>
        </template>
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
        <button class="db-bottom-nav-item" :class="{ active: moreOpen }" @click="moreOpen = true">
          <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
          </svg>
          <span>Mais</span>
        </button>
      </div>
    </nav>

    <!-- Mobile drawer "Mais" -->
    <div v-if="moreOpen" class="db-drawer-overlay" @click.self="moreOpen = false">
      <div class="db-drawer">
        <div class="db-drawer-header">
          <span>Menu</span>
          <button class="db-drawer-close" aria-label="Fechar" @click="moreOpen = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="db-drawer-body">
          <template v-for="group in navGroups" :key="group.label">
            <div class="db-drawer-section">{{ group.label }}</div>
            <a v-for="item in group.items" :key="item.href"
              :href="item.href"
              class="db-drawer-item"
              :class="{ active: isActive(item.href), disabled: item.disabled }"
              @click="moreOpen = false"
            >
              <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" v-html="item.icon" />
              <span class="db-drawer-item-label">{{ item.label }}</span>
              <span v-if="item.badge" class="db-nav-badge">{{ item.badge }}</span>
            </a>
          </template>
        </div>
        <div class="db-drawer-footer">
          <button class="db-drawer-logout" @click="handleLogout">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, provide } from 'vue';
import { isAdmin, isAuthenticated, logout } from '../../utils/auth';
import { getFullProfile, getMyPlan, updateProfile } from '../../utils/api';
import type { FullProfile, MyPlanInfo, PlanTier } from '../../utils/api';
import Toast from '../ui/Toast.vue';

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  PERSONAL: 'Personal',
  HUNTER: 'Hunter',
  EMPRESARIAL: 'Empresarial',
};

function formatPlanExpiry(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const user = ref<FullProfile | null>(null);
const myPlan = ref<MyPlanInfo | null>(null);
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
const planExpiryOpen = ref(false);

const VAGAS_ICON = '<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  disabled?: boolean;
  badge?: string;
}

const inicioItem: NavItem = { href: '/dashboard', label: 'Início', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />' };
const perfilItem: NavItem = { href: '/dashboard/perfil', label: 'Perfil', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />' };
const portfolioItem: NavItem = { href: '/dashboard/portfolio', label: 'Portfólio', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />' };
const tagsItem: NavItem = { href: '/dashboard/tags', label: 'Tags', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />' };
const curriculosItem: NavItem = { href: '/dashboard/curriculos', label: 'Currículos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />' };
const formacaoItem: NavItem = { href: '/dashboard/formacao', label: 'Formação', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />' };
const candidaturasItem: NavItem = { href: '/dashboard/minhas-candidaturas', label: 'Candidaturas', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />' };
const vagasItem: NavItem = { href: '/dashboard/vagas', label: 'Vagas', icon: VAGAS_ICON };
const planosItem: NavItem = { href: '/dashboard/planos', label: 'Planos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />' };
const eventosItem: NavItem = { href: '/dashboard/eventos', label: 'Eventos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />', disabled: true, badge: 'Em breve' };

const adminCuponsNavItem: NavItem = {
  href: '/dashboard/admin/cupons',
  label: 'Validar cupons',
  icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z" />',
};

const navGroups = computed<{ label: string; items: NavItem[] }[]>(() => {
  const groups = [
    {
      label: 'Meu Perfil',
      items: [inicioItem, perfilItem, portfolioItem, tagsItem, curriculosItem, formacaoItem],
    },
    {
      label: 'Carreira',
      items: [candidaturasItem, vagasItem, planosItem, eventosItem],
    },
  ];
  if (adminMode.value) {
    groups.push({ label: 'Administração', items: [adminCuponsNavItem] });
  }
  return groups;
});

const mobileNavItems = computed<NavItem[]>(() => [
  inicioItem,
  perfilItem,
  portfolioItem,
  candidaturasItem,
]);

const moreOpen = ref(false);

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
    [user.value, myPlan.value] = await Promise.all([
      getFullProfile(),
      getMyPlan(),
    ]);
  } catch (e: unknown) {
    const err = e as { statusCode?: number };
    if (err?.statusCode === 401) {
      logout();
    }
  }
});
</script>

<style scoped>
.db-plan-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
}
.db-plan-badge {
  display: inline-flex;
  align-self: flex-start;
  padding: 2px 8px;
  border: none;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
  cursor: pointer;
  font-family: inherit;
}
.plan-free {
  background: var(--bg-tertiary, #f3f4f6);
  color: var(--text-secondary, #6b7280);
}
.plan-personal {
  background: #eff6ff;
  color: var(--primary, #2563eb);
}
.plan-hunter {
  background: #f3e8ff;
  color: #7c3aed;
}
.plan-empresarial {
  background: #fef3c7;
  color: #b45309;
}
.db-plan-expires {
  display: none;
  font-size: 0.6rem;
  font-weight: 400;
  color: var(--text-secondary, #6b7280);
}
.db-plan-row:hover .db-plan-expires,
.db-plan-row.expanded .db-plan-expires {
  display: inline;
}
/* Avatar ring colored by plan */
.db-user-avatar.ring-personal {
  box-shadow: 0 0 0 2px var(--bg-primary, #fff), 0 0 0 4px var(--primary, #2563eb);
}
.db-user-avatar.ring-hunter {
  box-shadow: 0 0 0 2px var(--bg-primary, #fff), 0 0 0 4px #7c3aed;
}
.db-user-avatar.ring-empresarial {
  box-shadow: 0 0 0 2px var(--bg-primary, #fff), 0 0 0 4px #f59e0b;
}
.db-user-avatar.ring-free {
  box-shadow: 0 0 0 2px var(--bg-primary, #fff), 0 0 0 4px var(--border, #e5e7eb);
}
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

/* ─── MOBILE DRAWER "MAIS" ─────────────────────────────────────────────── */
.db-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: db-drawer-fade 180ms ease-out both;
}
.db-drawer {
  background: var(--bg-primary, #fff);
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: db-drawer-slide 220ms ease-out both;
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.db-drawer-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--spacing-md) + 6px) var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  font-weight: 600;
  font-size: var(--text-base);
  color: var(--text-primary);
}
.db-drawer-header::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: var(--border);
}
.db-drawer-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.db-drawer-close:hover {
  background: var(--bg-secondary);
}
.db-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-sm) 0;
}
.db-drawer-section {
  padding: var(--spacing-md) var(--spacing-lg) var(--spacing-xs);
  margin-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
}
.db-drawer-section:first-child {
  margin-top: 0;
  border-top: none;
  padding-top: var(--spacing-xs);
}
.db-drawer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--text-base);
  font-weight: 500;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.db-drawer-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
.db-drawer-item.active {
  color: var(--primary);
  background: #eff6ff;
  font-weight: 600;
}
.db-drawer-item.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.db-drawer-item svg {
  flex-shrink: 0;
}
.db-drawer-item-label {
  flex: 1;
}
.db-drawer-footer {
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-light);
}
.db-drawer-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md);
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
.db-drawer-logout:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}
@keyframes db-drawer-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes db-drawer-slide {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
</style>
