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
    <UpgradePlanModal
      :visible="showUpgradeModal"
      :current-plan="planInfo?.plan ?? 'FREE'"
      :limit="planInfo?.vagasLimit ?? 0"
      @close="showUpgradeModal = false"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Minhas vagas</h1>
        <p class="db-section-subtitle" v-if="planInfo">
          <template v-if="planInfo.vagasLimit === 0">
            Plano gratuito — <a href="/dashboard/planos" class="link-upgrade">assine para criar vagas</a>
          </template>
          <template v-else>
            {{ planInfo.vagasUsed }} / {{ planInfo.vagasLimit }} vagas usadas
          </template>
        </p>
        <p class="db-section-subtitle" v-else>Gerencie suas vagas publicadas</p>
      </div>
      <button class="btn btn-primary" @click="handleNovaVaga">+ Nova vaga</button>
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
      <button class="btn btn-primary" @click="handleNovaVaga">Criar primeira vaga</button>
    </div>

    <div v-else class="db-list">
      <div
        v-for="v in vagas"
        :key="v.id"
        class="db-list-item db-list-clickable"
        role="link"
        tabindex="0"
        @click="goToEdit(v.id)"
        @keydown.enter="goToEdit(v.id)"
      >
        <div class="db-list-info">
          <div class="db-list-title">{{ v.title }}</div>
          <div class="db-list-meta">
            <span class="vaga-status-pill" :class="`s-${v.status}`">{{ statusLabel(v.status) }}</span>
            <span v-if="v.location" class="db-list-meta-hide">{{ v.location }}</span>
            <span v-if="v.deadline" class="db-list-meta-hide">prazo: {{ formatDate(v.deadline) }}</span>
          </div>
        </div>

        <div class="db-list-actions" @click.stop>
          <a
            v-if="v.status === 'PUBLISHED'"
            :href="`/vaga/${v.slug}`"
            target="_blank"
            class="btn btn-ghost btn-sm"
            title="Ver publicada"
          >
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
          <a :href="`/dashboard/vagas/${v.id}/candidatos`" class="btn btn-ghost btn-sm" title="Ver candidatos">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
            <span class="candidates-label">Candidatos</span>
            <span class="candidates-badge" :class="{ 'is-zero': !v.applicationsCount }">{{ v.applicationsCount ?? 0 }}</span>
          </a>
          <a :href="`/dashboard/vagas/${v.id}`" class="btn btn-secondary btn-sm">Editar</a>
          <button class="btn btn-danger btn-sm" @click="deleteTarget = v" title="Excluir vaga">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>

    <nav v-if="totalPages > 1" class="vagas-pagination">
      <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="goTo(page - 1)">Anterior</button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button class="btn btn-ghost btn-sm" :disabled="page >= totalPages" @click="goTo(page + 1)">Próxima</button>
    </nav>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import UpgradePlanModal from './UpgradePlanModal.vue';
import { deleteVaga, getMyPlan, getMyVagas } from '../../utils/api';
import type { MyPlanInfo, Vaga, VagaStatus } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const vagas = ref<Vaga[]>([]);
const page = ref(1);
const totalPages = ref(1);
const activeFilter = ref<VagaStatus | ''>('');
const deleteTarget = ref<Vaga | null>(null);
const deleting = ref(false);
const planInfo = ref<MyPlanInfo | null>(null);
const showUpgradeModal = ref(false);

const filters: { label: string; value: VagaStatus | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Publicadas', value: 'PUBLISHED' },
  { label: 'Rascunhos', value: 'DRAFT' },
  { label: 'Encerradas', value: 'CLOSED' },
];

async function load() {
  loading.value = true;
  try {
    const [res, plan] = await Promise.all([
      getMyVagas({ page: page.value, limit: 15, status: activeFilter.value || undefined }),
      planInfo.value ? Promise.resolve(planInfo.value) : getMyPlan(),
    ]);
    vagas.value = res.data;
    totalPages.value = res.lastPage;
    planInfo.value = plan;
  } catch {
    toast.value?.show('Erro ao carregar vagas', 'error');
  } finally {
    loading.value = false;
  }
}

function handleNovaVaga() {
  if (planInfo.value && planInfo.value.vagasUsed >= planInfo.value.vagasLimit) {
    showUpgradeModal.value = true;
    return;
  }
  window.location.href = '/dashboard/vagas/novo';
}

function goToEdit(id: string) {
  window.location.href = `/dashboard/vagas/${id}`;
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
.vagas-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  color: var(--text-secondary);
}
.link-upgrade {
  color: var(--primary);
  text-decoration: underline;
}
.candidates-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  padding: 0 0.4rem;
  margin-left: 0.4rem;
  border-radius: 999px;
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1;
}
.candidates-badge.is-zero {
  background: var(--bg-muted, #e5e7eb);
  color: var(--text-secondary, #6b7280);
}
.candidates-label {
  margin-left: 0.25rem;
}
@media (max-width: 640px) {
  .candidates-label {
    display: none;
  }
}
</style>
