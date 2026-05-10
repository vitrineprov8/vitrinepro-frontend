<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir vaga"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.title}&quot;? Esta ação não pode ser desfeita.`"
      confirm-label="Excluir vaga"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <div v-if="!authorized" class="db-section-header">
      <div>
        <h1 class="db-section-title">Acesso restrito</h1>
        <p class="db-section-subtitle">Esta área é apenas para administradores.</p>
      </div>
    </div>

    <template v-else>
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title">Vagas</h1>
          <p class="db-section-subtitle">Gerencie as vagas publicadas no site</p>
        </div>
        <a href="/dashboard/vagas/novo" class="btn btn-primary">+ Nova vaga</a>
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

      <div v-else-if="vagas.length === 0" class="empty-state">
        <p>Nenhuma vaga cadastrada ainda.</p>
        <a href="/dashboard/vagas/novo" class="btn btn-primary">Criar primeira vaga</a>
      </div>

      <div v-else class="db-list">
        <div v-for="v in vagas" :key="v.id" class="db-list-item">
          <div class="db-list-info">
            <div class="db-list-title">
              {{ v.title }}
              <span
                class="vaga-source-pill"
                :class="v.source === 'GUPY' ? 'src-gupy' : 'src-native'"
              >{{ v.source === 'GUPY' ? 'Gupy' : 'VitrinePro' }}</span>
            </div>
            <div class="db-list-meta">
              <span class="vaga-status-pill" :class="`s-${v.status}`">{{ statusLabel(v.status) }}</span>
              <span v-if="v.companyName">{{ v.companyName }}</span>
              <span v-if="v.location">{{ v.location }}</span>
              <span v-if="v.deadline">prazo: {{ formatDate(v.deadline) }}</span>
            </div>
          </div>

          <div class="db-list-actions">
            <a
              v-if="v.source === 'GUPY' && v.externalUrl"
              :href="v.externalUrl"
              target="_blank"
              rel="noopener"
              class="btn btn-ghost btn-sm"
              title="Abrir na Gupy"
            >Ver na Gupy ↗</a>
            <a
              v-else-if="v.status === 'PUBLISHED'"
              :href="`/vaga/${v.slug}`"
              target="_blank"
              class="btn btn-ghost btn-sm"
              title="Ver publicada"
            >Ver</a>
            <a :href="`/dashboard/vagas/${v.id}/candidatos`" class="btn btn-ghost btn-sm">Candidatos</a>
            <a :href="`/dashboard/vagas/${v.id}`" class="btn btn-secondary btn-sm">Editar</a>
            <button class="btn btn-danger btn-sm" @click="deleteTarget = v">Excluir</button>
          </div>
        </div>
      </div>

      <nav v-if="totalPages > 1" class="vagas-pagination">
        <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="goTo(page - 1)">Anterior</button>
        <span>Página {{ page }} de {{ totalPages }}</span>
        <button class="btn btn-ghost btn-sm" :disabled="page >= totalPages" @click="goTo(page + 1)">Próxima</button>
      </nav>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import { isAdmin } from '../../utils/auth';
import { deleteVaga, getAdminVagas } from '../../utils/api';
import type { Vaga, VagaStatus } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const authorized = ref(false);
const loading = ref(true);
const vagas = ref<Vaga[]>([]);
const page = ref(1);
const totalPages = ref(1);
const activeFilter = ref<VagaStatus | ''>('');
const deleteTarget = ref<Vaga | null>(null);
const deleting = ref(false);

const filters: { label: string; value: VagaStatus | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Publicadas', value: 'PUBLISHED' },
  { label: 'Rascunhos', value: 'DRAFT' },
  { label: 'Encerradas', value: 'CLOSED' },
];

async function load() {
  loading.value = true;
  try {
    const res = await getAdminVagas({
      page: page.value,
      limit: 15,
      status: activeFilter.value || undefined,
    });
    vagas.value = res.data;
    totalPages.value = res.lastPage;
  } catch {
    toast.value?.show('Erro ao carregar vagas', 'error');
  } finally {
    loading.value = false;
  }
}

function setFilter(val: VagaStatus | '') {
  activeFilter.value = val;
  page.value = 1;
  load();
}

function goTo(p: number) {
  page.value = p;
  load();
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const target = deleteTarget.value;
  try {
    await deleteVaga(target.id);
    toast.value?.show('Vaga excluída', 'success');
    load();
  } catch {
    toast.value?.show('Erro ao excluir vaga', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
  }
}

function statusLabel(s: VagaStatus): string {
  return ({ DRAFT: 'Rascunho', PUBLISHED: 'Publicada', CLOSED: 'Encerrada' } as const)[s];
}
function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR');
}

onMounted(() => {
  if (!isAdmin()) {
    authorized.value = false;
    loading.value = false;
    return;
  }
  authorized.value = true;
  load();
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.vaga-status-pill {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.s-DRAFT { background: #fef3c7; color: #92400e; }
.s-PUBLISHED { background: #dcfce7; color: #166534; }
.s-CLOSED { background: #fee2e2; color: #991b1b; }
.vaga-source-pill {
  margin-left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  vertical-align: middle;
}
.src-native { background: #e0e7ff; color: #3730a3; }
.src-gupy { background: #ede9fe; color: #5b21b6; }
.vagas-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: var(--text-secondary);
}
</style>
