<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir item do portfólio"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.title}&quot;? Esta ação não pode ser desfeita.`"
      confirm-label="Excluir item"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Portfólio</h1>
        <p class="db-section-subtitle">Gerencie seus itens de portfólio</p>
      </div>
      <a href="/dashboard/portfolio/novo" class="btn btn-primary">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Novo item
      </a>
    </div>

    <div class="db-filter-bar">
      <button
        v-for="f in filters"
        :key="f.value"
        class="db-filter-btn"
        :class="{ active: activeFilter === f.value }"
        @click="setFilter(f.value)"
      >{{ f.label }}</button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <EmptyState
      v-else-if="items.length === 0"
      title="Nenhum item no portfólio"
      description="Adicione seus trabalhos e mostre o que você faz para o mundo."
      action-label="Criar primeiro item"
      action-href="/dashboard/portfolio/novo"
    />

    <div v-else class="db-list">
      <div v-for="item in items" :key="item.id" data-testid="portfolio-item" class="db-list-item">
        <img
          v-if="item.coverImageUrl"
          :src="item.coverImageUrl"
          :alt="item.title"
          class="db-list-thumb"
        />
        <div v-else class="db-list-thumb-placeholder">
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
        </div>

        <div class="db-list-info">
          <div class="db-list-title">{{ item.title }}</div>
          <div class="db-list-meta">
            <StatusBadge :status="item.status" />
            <span v-if="item.year">{{ item.year }}</span>
            <span v-if="item.clientName" class="db-list-meta-hide">{{ item.clientName }}</span>
            <span v-if="item.tags?.length" class="db-list-meta-hide">{{ item.tags.map(t => t.name).join(', ') }}</span>
          </div>
        </div>

        <div class="db-list-actions">
          <a v-if="item.status === 'PUBLISHED'" :href="`/portfolio/${item.slug}`" target="_blank" class="btn btn-ghost btn-sm" title="Ver publicado">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
          <button
            v-if="item.isService || item.serviceType != null"
            class="btn btn-ghost btn-sm db-featured-btn"
            :class="{ 'db-featured-btn--active': item.isFeatured }"
            :title="item.isFeatured ? 'Mais Contratado' : 'Definir como Mais Contratado'"
            :disabled="featuredLoading === item.id"
            @click="setFeatured(item)"
          >
            <span v-if="featuredLoading === item.id" class="spinner spinner-xs" />
            <span v-else>{{ item.isFeatured ? '★' : '☆' }}</span>
          </button>
          <a :href="`/dashboard/portfolio/${item.slug}`" data-testid="edit-portfolio-btn" class="btn btn-secondary btn-sm">Editar</a>
          <button class="btn btn-danger btn-sm" data-testid="delete-portfolio-btn" @click="deleteTarget = item">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>

    <Pagination :current-page="page" :total-pages="totalPages" @page-changed="changePage" />
  </DashboardLayout>
</template>

<style scoped>
.db-featured-btn {
  font-size: 1.1rem;
  line-height: 1;
  color: var(--text-muted, #9ca3af);
  padding: 0 0.35rem;
  transition: color 0.15s, transform 0.15s;
}
.db-featured-btn:hover:not(:disabled) {
  color: #f59e0b;
  transform: scale(1.15);
}
.db-featured-btn--active {
  color: #f59e0b;
}
.db-featured-btn:disabled {
  cursor: default;
  opacity: 0.6;
}
.spinner-xs {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import EmptyState from '../ui/EmptyState.vue';
import Pagination from '../ui/Pagination.vue';
import { getPortfolioItems, deletePortfolioItem, getFullProfile, updatePortfolioItem } from '../../utils/api';
import type { PortfolioItem } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const items = ref<PortfolioItem[]>([]);
const page = ref(1);
const totalPages = ref(1);
const activeFilter = ref('');
const deleteTarget = ref<PortfolioItem | null>(null);
const deleting = ref(false);
const featuredLoading = ref<string | null>(null);
let userId = '';

const filters = [
  { label: 'Todos', value: '' },
  { label: 'Publicados', value: 'PUBLISHED' },
  { label: 'Rascunhos', value: 'DRAFT' },
];

async function load(showSpinner = true) {
  if (!userId) return;
  if (showSpinner) loading.value = true;
  try {
    if (activeFilter.value === '') {
      const [drafts, published] = await Promise.all([
        getPortfolioItems({ page: 1, limit: 20, status: 'DRAFT', userId }),
        getPortfolioItems({ page: 1, limit: 20, status: 'PUBLISHED', userId }),
      ]);
      const merged = [
        ...drafts.data.map(p => ({ ...p, status: 'DRAFT' as const })),
        ...published.data.map(p => ({ ...p, status: 'PUBLISHED' as const })),
      ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      const perPage = 15;
      const start = (page.value - 1) * perPage;
      items.value = merged.slice(start, start + perPage);
      totalPages.value = Math.max(1, Math.ceil((drafts.total + published.total) / perPage));
    } else {
      const res = await getPortfolioItems({ page: page.value, limit: 15, status: activeFilter.value, userId });
      items.value = res.data.map(p => ({ ...p, status: activeFilter.value as 'DRAFT' | 'PUBLISHED' }));
      totalPages.value = res.lastPage;
    }
  } catch {
    toast.value?.show('Erro ao carregar portfólio', 'error');
  } finally {
    loading.value = false;
  }
}

function setFilter(val: string) {
  activeFilter.value = val;
  page.value = 1;
  load();
}

function changePage(p: number) {
  page.value = p;
  load();
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const target = deleteTarget.value;
  try {
    await deletePortfolioItem(target.id);
    toast.value?.show('Item excluído', 'success');
    load(false);
  } catch {
    toast.value?.show('Erro ao excluir item', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
  }
}

async function setFeatured(item: PortfolioItem) {
  if (featuredLoading.value) return;
  featuredLoading.value = item.id;
  try {
    await updatePortfolioItem(item.id, { isFeatured: true });
    items.value = items.value.map(i => ({
      ...i,
      isFeatured: (i.isService || i.serviceType != null) ? i.id === item.id : i.isFeatured,
    }));
    toast.value?.show('Serviço destacado como Mais Contratado', 'success');
  } catch {
    toast.value?.show('Erro ao destacar serviço', 'error');
  } finally {
    featuredLoading.value = null;
  }
}

onMounted(async () => {
  try {
    const profile = await getFullProfile();
    userId = profile.id;
    await load();
  } catch {
    toast.value?.show('Erro ao carregar dados', 'error');
    loading.value = false;
  }
});
</script>
