<template>
  <DashboardLayout>
    <div>
      <!-- Welcome -->
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title" v-if="user">Olá, {{ user.firstName }} 👋</h1>
          <h1 class="db-section-title" v-else>Carregando...</h1>
          <p class="db-section-subtitle">Bem-vindo ao seu painel de controle</p>
        </div>
        <a v-if="user?.username" :href="`/perfil/${user.username}`" target="_blank" class="btn btn-secondary">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          Ver perfil público
        </a>
      </div>

      <!-- Quick actions -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Ações rápidas</div>
        <div class="db-quick-actions-grid">
          <a href="/dashboard/portfolio/novo" class="btn btn-primary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Novo item
          </a>
          <a href="/dashboard/perfil" class="btn btn-secondary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
            Editar Perfil
          </a>
          <a href="/dashboard/curriculos" class="btn btn-secondary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            Upload CV
          </a>
        </div>
      </div>

      <!-- Recent portfolio items -->
      <div class="db-card">
        <div class="db-card-title" style="display: flex; justify-content: space-between; align-items: center;">
          Itens recentes
          <a href="/dashboard/portfolio" style="font-size: var(--text-xs); color: var(--primary); text-decoration: none; font-weight: 400;">Ver todos →</a>
        </div>
        <div v-if="loadingItems" class="loading-center"><div class="spinner spinner-md" /></div>
        <div v-else-if="recentItems.length === 0" style="color: var(--text-secondary); font-size: var(--text-sm);">Nenhum item no portfólio ainda.</div>
        <div v-else class="db-list">
          <div v-for="item in recentItems" :key="item.id" class="db-list-item" style="padding: var(--spacing-sm) var(--spacing-md);">
            <div class="db-list-thumb" v-if="item.coverImageUrl">
              <img :src="item.coverImageUrl" :alt="item.title" />
            </div>
            <div class="db-list-info">
              <div class="db-list-title">{{ item.title }}</div>
              <div class="db-list-meta">
                <StatusBadge :status="item.status" />
                <span>{{ formatDate(item.updatedAt || item.createdAt) }}</span>
                <span v-if="item.tags?.length" style="display:flex;gap:4px;flex-wrap:wrap">
                  <span v-for="tag in item.tags.slice(0,2)" :key="tag.id" style="background:var(--bg-tertiary);border-radius:4px;padding:1px 6px;font-size:11px;color:var(--text-secondary)">{{ tag.name }}</span>
                </span>
              </div>
            </div>
            <div class="db-list-actions">
              <a
                v-if="item.status === 'PUBLISHED'"
                :href="`/portfolio/${item.slug}`"
                target="_blank"
                class="btn btn-ghost btn-sm"
                title="Ver publicado"
              >
                <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
              <a :href="`/dashboard/portfolio/${item.slug}`" class="btn btn-ghost btn-sm">Editar</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import { getPortfolioItems, getFullProfile } from '../../utils/api';
import type { PortfolioItem, FullProfile } from '../../utils/api';

const user = ref<FullProfile | null>(null);
const recentItems = ref<PortfolioItem[]>([]);
const loadingItems = ref(true);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  try {
    user.value = await getFullProfile();
    const userId = user.value.id;

    const [drafts, published] = await Promise.all([
      getPortfolioItems({ limit: 10, status: 'DRAFT', userId }),
      getPortfolioItems({ limit: 10, status: 'PUBLISHED', userId }),
    ]);

    const all = [
      ...drafts.data.map(i => ({ ...i, status: 'DRAFT' as const })),
      ...published.data.map(i => ({ ...i, status: 'PUBLISHED' as const })),
    ].sort((a, b) =>
      new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
    recentItems.value = all.slice(0, 5);
  } catch {
    // silently ignore
  } finally {
    loadingItems.value = false;
  }
});
</script>
