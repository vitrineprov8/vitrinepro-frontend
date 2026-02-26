<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir projeto"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.title}&quot;? Esta ação não pode ser desfeita.`"
      confirm-label="Excluir projeto"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Projetos</h1>
        <p class="db-section-subtitle">Gerencie seu portfólio de projetos</p>
      </div>
      <a href="/dashboard/projetos/novo" class="btn btn-primary">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Novo projeto
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
      v-else-if="projects.length === 0"
      title="Nenhum projeto ainda"
      description="Adicione seus projetos e mostre seu trabalho para o mundo."
      action-label="Criar primeiro projeto"
      action-href="/dashboard/projetos/novo"
    />

    <div v-else class="db-list">
      <div v-for="project in projects" :key="project.id" class="db-list-item">
        <img
          v-if="project.coverImageUrl"
          :src="project.coverImageUrl"
          :alt="project.title"
          class="db-list-thumb"
        />
        <div v-else class="db-list-thumb-placeholder">
          <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>
        </div>

        <div class="db-list-info">
          <div class="db-list-title">{{ project.title }}</div>
          <div class="db-list-meta">
            <StatusBadge :status="project.status" />
            <StatusBadge v-if="project.projectStatus" :status="project.projectStatus" class="db-list-meta-hide" />
            <span v-if="project.year">{{ project.year }}</span>
            <span v-if="project.clientName" class="db-list-meta-hide">{{ project.clientName }}</span>
            <span v-if="project.tags.length" class="db-list-meta-hide">{{ project.tags.map(t => t.name).join(', ') }}</span>
          </div>
        </div>

        <div class="db-list-actions">
          <a :href="`/projeto/${project.slug}`" target="_blank" class="btn btn-ghost btn-sm" title="Ver publicado">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
          <a :href="`/dashboard/projetos/${project.slug}`" class="btn btn-secondary btn-sm">Editar</a>
          <button class="btn btn-danger btn-sm" @click="deleteTarget = project">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>

    <Pagination :current-page="page" :total-pages="totalPages" @page-changed="changePage" />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import EmptyState from '../ui/EmptyState.vue';
import Pagination from '../ui/Pagination.vue';
import { getProjects, deleteProject, getFullProfile } from '../../utils/api';
import type { Project } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const projects = ref<Project[]>([]);
const page = ref(1);
const totalPages = ref(1);
const activeFilter = ref('');
const deleteTarget = ref<Project | null>(null);
const deleting = ref(false);
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
        getProjects({ page: 1, limit: 20, status: 'DRAFT', userId }),
        getProjects({ page: 1, limit: 20, status: 'PUBLISHED', userId }),
      ]);
      const merged = [
        ...drafts.data.map(p => ({ ...p, status: 'DRAFT' as const })),
        ...published.data.map(p => ({ ...p, status: 'PUBLISHED' as const })),
      ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      const perPage = 15;
      const start = (page.value - 1) * perPage;
      projects.value = merged.slice(start, start + perPage);
      totalPages.value = Math.max(1, Math.ceil((drafts.total + published.total) / perPage));
    } else {
      const res = await getProjects({ page: page.value, limit: 15, status: activeFilter.value, userId });
      projects.value = res.data.map(p => ({ ...p, status: activeFilter.value as 'DRAFT' | 'PUBLISHED' }));
      totalPages.value = res.lastPage;
    }
  } catch {
    toast.value?.show('Erro ao carregar projetos', 'error');
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
    await deleteProject(target.id);
    deleteTarget.value = null;
    toast.value?.show('Projeto excluído', 'success');
    load(false);
  } catch {
    deleteTarget.value = null;
    toast.value?.show('Erro ao excluir projeto', 'error');
  } finally {
    deleting.value = false;
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
