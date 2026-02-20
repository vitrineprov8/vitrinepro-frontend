<template>
  <div class="db-layout">
    <!-- Sidebar desktop -->
    <aside class="db-sidebar">
      <div class="db-sidebar-logo">
        <a href="/dashboard">VitrinePro</a>
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
        <button class="db-logout-btn" @click="handleLogout">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>
          Sair da conta
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="db-main">
      <slot />
    </main>

    <!-- Bottom nav mobile -->
    <nav class="db-bottom-nav">
      <div class="db-bottom-nav-inner">
        <a v-for="item in mobileNavItems" :key="item.href"
          :href="item.href"
          class="db-bottom-nav-item"
          :class="{ active: isActive(item.href) }"
        >
          <svg width="22" height="22" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" v-html="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue';
import { isAuthenticated, logout } from '../../utils/auth';
import { getFullProfile } from '../../utils/api';
import type { FullProfile } from '../../utils/api';

const user = ref<FullProfile | null>(null);
provide('currentUser', user);

const initials = computed(() => {
  if (!user.value) return '';
  return `${user.value.firstName[0] ?? ''}${user.value.lastName[0] ?? ''}`.toUpperCase();
});

const navItems = [
  { href: '/dashboard', label: 'Início', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />' },
  { href: '/dashboard/perfil', label: 'Perfil', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />' },
  { href: '/dashboard/artigos', label: 'Artigos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />' },
  { href: '/dashboard/projetos', label: 'Projetos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />' },
  { href: '/dashboard/tags', label: 'Tags', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />' },
  { href: '/dashboard/curriculos', label: 'Currículos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />' },
  { href: '/dashboard/formacao', label: 'Formação', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />' },
  { href: '/dashboard/eventos', label: 'Eventos', icon: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />', disabled: true, badge: 'Em breve' },
];

const mobileNavItems = [
  navItems[0], // Início
  navItems[1], // Perfil
  navItems[2], // Artigos
  navItems[3], // Projetos
  navItems[4], // Tags
];

function isActive(href: string) {
  if (typeof window === 'undefined') return false;
  if (href === '/dashboard') return window.location.pathname === '/dashboard';
  return window.location.pathname.startsWith(href);
}

function handleLogout() {
  if (confirm('Tem certeza que deseja sair?')) logout();
}

onMounted(async () => {
  if (!isAuthenticated()) {
    const redirect = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?redirect=${redirect}`;
    return;
  }
  try {
    user.value = await getFullProfile();
  } catch (e: any) {
    if (e?.statusCode === 401) {
      logout();
    }
  }
});
</script>
