<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <!-- Assign modal (TEAM/ENTERPRISE) -->
    <Modal
      v-if="isTeamOrEnterprise"
      :visible="showAssignModal"
      title="Atribuir responsável"
      @close="showAssignModal = false"
    >
      <div class="assign-modal-content">
        <div v-if="loadingMembers" class="assign-loading">
          <div class="spinner" />
        </div>
        <div v-else-if="teamMembers.length === 0" class="assign-empty">
          <p>Nenhum membro no time. <a href="/dashboard/recrutador?tab=publicar">Convidar membros →</a></p>
        </div>
        <div v-else class="assign-list">
          <button
            v-for="m in teamMembers"
            :key="m.id"
            class="assign-member-btn"
            :class="{ 'assign-member-btn--active': assignTarget?.assignedToId === m.userId }"
            :disabled="assigning"
            @click="doAssign(m.userId)"
          >
            <span class="assign-avatar">{{ initials(m.user?.name) }}</span>
            <span class="assign-name">{{ m.user?.name ?? m.user?.email ?? '—' }}</span>
            <span class="assign-role">{{ roleLabelShort(m.role) }}</span>
          </button>
        </div>
        <div v-if="assignTarget?.assignedToId" class="assign-remove">
          <button class="btn btn-ghost btn-sm" :disabled="assigning" @click="doAssign(null)">
            <span v-if="assigning" class="spinner spinner-sm" />
            Remover atribuição
          </button>
        </div>
      </div>
    </Modal>

    <!-- Delete confirm -->
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir vaga"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.title}&quot;? Esta ação não pode ser desfeita.`"
      confirm-label="Excluir vaga"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <!-- Publish confirm -->
    <ConfirmDialog
      :visible="showPublishConfirm"
      title="Publicar vaga"
      :message="publishConfirmMessage"
      confirm-label="Publicar vaga"
      :loading="publishing"
      @confirm="confirmPublish"
      @cancel="cancelPublishConfirm"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Minhas vagas</h1>

        <!-- Contador de vagas publicadas no ciclo -->
        <p v-if="usage" class="db-section-subtitle">
          <template v-if="usage.limit === -1">
            Vagas ilimitadas
            <span class="usage-info-icon" tabindex="0" :title="usageTooltip" aria-label="Informação sobre o contador de vagas">ⓘ</span>
          </template>
          <template v-else>
            <strong>Vagas publicadas este mês: {{ usage.used }} / {{ usage.limit }}</strong>
            <span class="usage-info-icon" tabindex="0" :title="usageTooltip" aria-label="Informação sobre o contador de vagas">ⓘ</span>
          </template>
        </p>
        <p v-else class="db-section-subtitle">Gerencie suas vagas publicadas</p>
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
            <!-- Cliente (visível para todos) -->
            <span v-if="v.company" class="db-list-meta-client">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
              {{ v.company.name }}
            </span>
          </div>
          <!-- Responsável (só para TEAM/ENTERPRISE) -->
          <div v-if="isTeamOrEnterprise" class="db-list-assigned">
            <span v-if="v.assignedTo" class="assigned-chip">
              <span class="assigned-avatar">{{ initials(v.assignedTo.name) }}</span>
              {{ v.assignedTo.name }}
            </span>
            <button
              class="btn btn-ghost btn-xs assigned-btn"
              @click.stop="openAssignModal(v)"
            >
              {{ v.assignedTo ? 'Alterar' : 'Atribuir responsável' }}
            </button>
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

          <!-- Ação dependente do status -->
          <button
            v-if="v.status === 'PUBLISHED'"
            class="btn btn-ghost btn-sm"
            title="Encerrar vaga"
            :disabled="unpublishingId === v.id"
            @click="requestUnpublish(v)"
          >
            <span v-if="unpublishingId === v.id" class="spinner spinner-sm" />
            <template v-else>Encerrar</template>
          </button>
          <button
            v-else-if="v.status === 'DRAFT'"
            class="btn btn-primary btn-sm"
            title="Publicar vaga"
            :disabled="isLimitReached && usage !== null"
            @click="requestPublish(v)"
          >
            Publicar
          </button>
          <button
            v-else-if="v.status === 'CLOSED'"
            class="btn btn-ghost btn-sm"
            title="Republicar vaga"
            :disabled="isLimitReached && usage !== null"
            @click="requestPublish(v)"
          >
            Republicar
          </button>

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
import { computed, onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import Modal from '../ui/Modal.vue';
import {
  deleteVaga,
  extractPlanLimitBody,
  formatPlanLimitMessage,
  getMyPlan,
  getMyVagaUsage,
  getMyVagas,
  isPlanLimitReachedError,
  publishVaga,
  unpublishVaga,
  team,
  vagasAssignment,
} from '../../utils/api';
import type { PlanTier, TeamMember, Vaga, VagaStatus, VagaUsage } from '../../utils/api';

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  RECRUITER: 'Recruiter',
  TEAM: 'Recruiter Team',
  ENTERPRISE: 'Recruiter Enterprise',
};

const USAGE_TOOLTIP =
  'O contador registra cada publicação no ciclo atual. Rascunhos não contam. ' +
  'Despublicar ou deletar uma vaga publicada não devolve o slot.';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const vagas = ref<Vaga[]>([]);
const page = ref(1);
const totalPages = ref(1);
const activeFilter = ref<VagaStatus | ''>('');
const deleteTarget = ref<Vaga | null>(null);
const deleting = ref(false);
const usage = ref<VagaUsage | null>(null);

// Publish state
const showPublishConfirm = ref(false);
const publishTarget = ref<Vaga | null>(null);
const publishing = ref(false);

// Unpublish state
const unpublishingId = ref<string | null>(null);

// Plan & team
const userPlan = ref<PlanTier>('FREE');
const isTeamOrEnterprise = computed(
  () => userPlan.value === 'TEAM' || userPlan.value === 'ENTERPRISE'
);

// Assign responsável
const showAssignModal = ref(false);
const assignTarget = ref<Vaga | null>(null);
const teamMembers = ref<TeamMember[]>([]);
const loadingMembers = ref(false);
const assigning = ref(false);

const usageTooltip = USAGE_TOOLTIP;

const isLimitReached = computed(() => {
  if (!usage.value) return false;
  if (usage.value.limit === -1) return false;
  return usage.value.used >= usage.value.limit;
});

const publishConfirmMessage = computed(() => {
  if (!usage.value) return 'Deseja publicar esta vaga?';
  const { used, limit, planTier } = usage.value;
  const planName = PLAN_NAMES[planTier] ?? planTier;

  if (limit === -1) {
    return `Você tem vagas ilimitadas no plano ${planName}. Deseja publicar esta vaga?`;
  }

  return (
    `Ao publicar esta vaga você vai usar 1 de ${limit} vaga${limit === 1 ? '' : 's'} do seu plano ${planName} neste mês ` +
    `(${used} já publicada${used === 1 ? '' : 's'}). ` +
    `Esse uso não é devolvido se você despublicar ou deletar a vaga depois. Deseja continuar?`
  );
});

const filters: { label: string; value: VagaStatus | '' }[] = [
  { label: 'Todas', value: '' },
  { label: 'Publicadas', value: 'PUBLISHED' },
  { label: 'Rascunhos', value: 'DRAFT' },
  { label: 'Encerradas', value: 'CLOSED' },
];

async function loadUsage() {
  try {
    usage.value = await getMyVagaUsage();
  } catch {
    // non-critical — contador fica oculto
  }
}

async function load() {
  loading.value = true;
  try {
    const res = await getMyVagas({ page: page.value, limit: 15, status: activeFilter.value || undefined });
    vagas.value = res.data;
    totalPages.value = res.lastPage;
  } catch {
    toast.value?.show('Erro ao carregar vagas', 'error');
  } finally {
    loading.value = false;
  }
}

function handleNovaVaga() {
  if (isLimitReached.value && usage.value !== null) {
    toast.value?.show('Limite de vagas atingido. Faça upgrade do plano para publicar mais.', 'error');
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

// ─── Delete ───────────────────────────────────────────────────────────────────

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const target = deleteTarget.value;
  try {
    await deleteVaga(target.id);
    toast.value?.show('Vaga excluída', 'success');
    await Promise.all([load(), loadUsage()]);
  } catch {
    toast.value?.show('Erro ao excluir vaga', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
  }
}

// ─── Publish ──────────────────────────────────────────────────────────────────

function requestPublish(v: Vaga) {
  publishTarget.value = v;
  showPublishConfirm.value = true;
}

function cancelPublishConfirm() {
  showPublishConfirm.value = false;
  publishTarget.value = null;
}

async function confirmPublish() {
  if (!publishTarget.value || publishing.value) return;
  publishing.value = true;
  const target = publishTarget.value;
  try {
    await publishVaga(target.id);
    toast.value?.show('Vaga publicada!', 'success');
    showPublishConfirm.value = false;
    publishTarget.value = null;
    await Promise.all([load(), loadUsage()]);
  } catch (err: unknown) {
    showPublishConfirm.value = false;
    publishTarget.value = null;

    if (isPlanLimitReachedError(err)) {
      const body = extractPlanLimitBody(err);
      if (body) {
        toast.value?.show(
          `${formatPlanLimitMessage(body)} Faça upgrade em Ver planos.`,
          'error'
        );
        await loadUsage();
        return;
      }
    }

    const e = err as { statusCode?: number; message?: string };
    if (e?.statusCode === 409) {
      toast.value?.show('Esta vaga já está publicada.', 'error');
      await load();
      return;
    }
    toast.value?.show(e?.message || 'Erro ao publicar vaga', 'error');
  } finally {
    publishing.value = false;
  }
}

// ─── Unpublish ────────────────────────────────────────────────────────────────

async function requestUnpublish(v: Vaga) {
  if (unpublishingId.value) return;
  unpublishingId.value = v.id;
  try {
    await unpublishVaga(v.id);
    toast.value?.show('Vaga encerrada', 'success');
    await Promise.all([load(), loadUsage()]);
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao encerrar vaga', 'error');
  } finally {
    unpublishingId.value = null;
  }
}

// ─── Assign ──────────────────────────────────────────────────────────────────

async function openAssignModal(v: Vaga) {
  assignTarget.value = v;
  showAssignModal.value = true;
  if (teamMembers.value.length === 0) {
    loadingMembers.value = true;
    try {
      teamMembers.value = await team.listMembers();
    } catch {
      toast.value?.show('Erro ao carregar membros do time', 'error');
    } finally {
      loadingMembers.value = false;
    }
  }
}

async function doAssign(userId: string | null) {
  if (assigning.value || !assignTarget.value) return;
  assigning.value = true;
  const target = assignTarget.value;
  try {
    const updated = await vagasAssignment.assign(target.id, userId);
    const idx = vagas.value.findIndex((v) => v.id === target.id);
    if (idx !== -1) vagas.value[idx] = updated;
    // Also update assignTarget so UI reflects the new state
    assignTarget.value = updated;
    toast.value?.show(userId ? 'Responsável atribuído' : 'Atribuição removida', 'success');
    if (!userId) showAssignModal.value = false;
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao atribuir responsável', 'error');
  } finally {
    assigning.value = false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusLabel(s: VagaStatus): string {
  return ({ DRAFT: 'Rascunho', PUBLISHED: 'Publicada', CLOSED: 'Encerrada' } as const)[s];
}
function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR');
}

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

function roleLabelShort(role: string): string {
  return ({ OWNER: 'Proprietário', MANAGER: 'Gerente', RECRUITER: 'Recrutador' } as Record<string, string>)[role] ?? role;
}

onMounted(async () => {
  load();
  loadUsage();
  // Load plan (non-blocking)
  try {
    const info = await getMyPlan();
    userPlan.value = info.plan;
  } catch {
    // non-critical
  }
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
.usage-info-icon {
  display: inline-block;
  margin-left: 0.35rem;
  cursor: help;
  color: var(--text-secondary);
  font-style: normal;
  font-size: 0.85rem;
}

/* Cliente e Responsável */
.db-list-meta-client {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.db-list-assigned {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 4px;
  flex-wrap: wrap;
}

.assigned-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--bg-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
}

.assigned-avatar {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--primary-light, #dbeafe);
  color: var(--primary);
  font-size: 9px;
  font-weight: 700;
  align-items: center;
  justify-content: center;
}

.assigned-btn {
  font-size: 11px;
  padding: 2px 8px;
}

.btn-xs {
  padding: 3px 8px !important;
  font-size: 11px !important;
}

/* Assign modal */
.assign-modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.assign-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

.assign-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-xl);
  font-size: var(--text-sm);
}

.assign-empty a {
  color: var(--primary);
}

.assign-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assign-member-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.assign-member-btn:hover {
  border-color: var(--primary-light);
  background: var(--bg-secondary);
}

.assign-member-btn--active {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.04);
}

.assign-member-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.assign-avatar {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-light, #dbeafe);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assign-name {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-primary);
}

.assign-role {
  font-size: 11px;
  color: var(--text-secondary);
}

.assign-remove {
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .candidates-label {
    display: none;
  }
}
</style>
