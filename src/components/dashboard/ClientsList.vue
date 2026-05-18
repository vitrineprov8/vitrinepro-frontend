<template>
  <div class="cl-root">
    <Toast ref="toast" />

    <!-- Confirm excluir -->
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir cliente"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.name}&quot;? Esta ação não pode ser desfeita.`"
      confirm-label="Excluir cliente"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Editor modal -->
    <ClientEditorModal
      :visible="showEditor"
      :company="editorCompany"
      @close="closeEditor"
      @saved="onSaved"
    />

    <!-- Header -->
    <div class="cl-header">
      <div>
        <h3 class="cl-title">Clientes</h3>
        <p class="cl-subtitle">Empresas para as quais você recruta.</p>
      </div>
      <button v-if="canManage" class="btn btn-primary" @click="openCreate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Novo cliente
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="cl-loading">
      <div class="spinner spinner-lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="clients.length === 0" class="cl-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="cl-empty-icon">
        <path d="M3.75 21h16.5M4.5 3h15l-1.5 9H6L4.5 3zM12 12v9" />
        <path d="M8.25 21v-4.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
      <p v-if="canManage">Nenhum cliente cadastrado ainda.</p>
      <p v-else>Nenhum cliente atribuído a você ainda.</p>
      <button v-if="canManage" class="btn btn-primary" @click="openCreate">Adicionar primeiro cliente</button>
    </div>

    <!-- Grid de clientes -->
    <div v-else class="cl-grid">
      <div
        v-for="c in clients"
        :key="c.id"
        class="cl-card"
        @click="canManage ? openEdit(c) : null"
      >
        <!-- Logo -->
        <div class="cl-card-logo">
          <img v-if="c.logoUrl" :src="c.logoUrl" :alt="c.name" class="cl-logo-img" />
          <span v-else class="cl-logo-initials">{{ initials(c.name) }}</span>
        </div>

        <!-- Info -->
        <div class="cl-card-info">
          <div class="cl-card-name">{{ c.name }}</div>
          <div v-if="c.industry" class="cl-card-industry">{{ c.industry }}</div>
          <div v-if="c.description" class="cl-card-desc">{{ truncate(c.description, 80) }}</div>
        </div>

        <!-- Ações -->
        <div v-if="canManage" class="cl-card-actions" @click.stop>
          <button
            class="btn btn-ghost btn-sm"
            title="Editar cliente"
            @click="openEdit(c)"
          >
            Editar
          </button>
          <button
            class="btn btn-danger btn-sm"
            title="Excluir cliente"
            @click="deleteTarget = c"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import ClientEditorModal from './ClientEditorModal.vue';
import { companies, getMyPlan } from '../../utils/api';
import type { Company, TeamRole } from '../../utils/api';

const myTeamRole = ref<TeamRole | null>(null);
const canManage = computed(() => myTeamRole.value === null || myTeamRole.value === 'OWNER' || myTeamRole.value === 'MANAGER');

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const clients = ref<Company[]>([]);

// Editor state
const showEditor = ref(false);
const editorCompany = ref<Company | null>(null);

// Delete state
const deleteTarget = ref<Company | null>(null);
const deleting = ref(false);

async function load() {
  loading.value = true;
  try {
    clients.value = await companies.list();
  } catch {
    toast.value?.show('Erro ao carregar clientes', 'error');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editorCompany.value = null;
  showEditor.value = true;
}

function openEdit(c: Company) {
  editorCompany.value = c;
  showEditor.value = true;
}

function closeEditor() {
  showEditor.value = false;
  editorCompany.value = null;
}

function onSaved(saved: Company) {
  const idx = clients.value.findIndex((c) => c.id === saved.id);
  if (idx !== -1) {
    clients.value[idx] = saved;
  } else {
    clients.value.push(saved);
  }
  toast.value?.show(editorCompany.value ? 'Cliente atualizado!' : 'Cliente criado!', 'success');
  closeEditor();
}

async function confirmDelete() {
  if (!deleteTarget.value || deleting.value) return;
  deleting.value = true;
  const target = deleteTarget.value;
  try {
    await companies.remove(target.id);
    clients.value = clients.value.filter((c) => c.id !== target.id);
    toast.value?.show('Cliente excluído', 'success');
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao excluir cliente', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
  }
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

onMounted(async () => {
  try {
    const info = await getMyPlan();
    myTeamRole.value = info.teamRole ?? null;
  } catch {
    myTeamRole.value = null;
  }
  load();
});
</script>

<style scoped>
.cl-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.cl-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.cl-title {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.cl-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.cl-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-2xl);
}

.cl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl);
  text-align: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
  color: var(--text-secondary);
}

.cl-empty-icon {
  opacity: 0.4;
}

.cl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-md);
}

.cl-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.cl-card:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}

.cl-card-logo {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  overflow: hidden;
  background: var(--primary-light, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cl-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cl-logo-initials {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--primary);
}

.cl-card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cl-card-name {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.cl-card-industry {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
}

.cl-card-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-top: 4px;
}

.cl-card-actions {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: flex-end;
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
}
</style>
