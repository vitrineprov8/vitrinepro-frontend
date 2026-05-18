<template>
  <div class="tml-root">
    <Toast ref="toast" />

    <!-- Confirm remover membro -->
    <ConfirmDialog
      :visible="!!removeTarget"
      title="Remover membro"
      :message="`Tem certeza que deseja remover ${displayName(removeTarget)} do time?`"
      confirm-label="Remover"
      :loading="removing"
      @confirm="confirmRemove"
      @cancel="removeTarget = null"
    />

    <!-- Modal de convite -->
    <Modal :visible="showInviteModal" title="Convidar membro" @close="closeInviteModal">
      <form class="tml-invite-form" @submit.prevent="submitInvite">
        <label class="tml-field">
          <span class="tml-label">E-mail *</span>
          <input
            v-model="inviteForm.email"
            type="email"
            required
            placeholder="colaborador@email.com"
            class="tml-input"
            :disabled="inviting"
          />
        </label>
        <label class="tml-field">
          <span class="tml-label">Perfil *</span>
          <select v-model="inviteForm.role" class="tml-input" :disabled="inviting">
            <option value="MANAGER">Gerente</option>
            <option value="RECRUITER">Recrutador</option>
          </select>
        </label>
        <p class="tml-role-hint">
          <strong>Gerente</strong>: pode convidar membros e gerenciar vagas.<br />
          <strong>Recrutador</strong>: pode visualizar e trabalhar nas vagas atribuídas.
        </p>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" :disabled="inviting" @click="closeInviteModal">
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" :disabled="inviting" @click="submitInvite">
          <span v-if="inviting" class="spinner spinner-sm" />
          {{ inviting ? 'Convidando...' : 'Enviar convite' }}
        </button>
      </template>
    </Modal>

    <!-- Header -->
    <div class="tml-header">
      <div>
        <h3 class="tml-title">Meu Time</h3>
        <p class="tml-subtitle">Gerencie os membros da sua equipe de recrutamento.</p>
      </div>
      <button v-if="canManage" class="btn btn-primary" @click="openInviteModal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Novo membro
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tml-loading">
      <div class="spinner spinner-lg" />
    </div>

    <!-- Empty -->
    <div v-else-if="members.length === 0" class="tml-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="tml-empty-icon">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <p>Nenhum membro no time ainda.</p>
      <button v-if="canManage" class="btn btn-primary" @click="openInviteModal">Convidar primeiro membro</button>
    </div>

    <!-- Lista de membros -->
    <div v-else class="tml-list">
      <div v-for="m in members" :key="m.id" class="tml-member">
        <!-- Avatar -->
        <div class="tml-avatar" :title="displayName(m)">
          <img v-if="m.user?.avatarUrl" :src="m.user.avatarUrl" :alt="displayName(m)" class="tml-avatar-img" />
          <span v-else class="tml-avatar-initials">{{ initials(displayName(m)) }}</span>
        </div>

        <!-- Info -->
        <div class="tml-info">
          <div class="tml-name">{{ displayName(m) }}</div>
          <div class="tml-email">{{ displayEmail(m) }}</div>
          <div class="tml-badges">
            <span class="tml-role-badge" :class="`role-${m.role}`">{{ roleLabel(m.role) }}</span>
            <span class="tml-status-badge" :class="`status-${m.status}`">{{ statusLabel(m.status) }}</span>
          </div>
        </div>

        <!-- Ações (não permitidas para OWNER nem para RECRUITER vendo) -->
        <div v-if="m.role !== 'OWNER' && canManage" class="tml-actions" @click.stop>
          <!-- Alterar role -->
          <select
            class="tml-role-select"
            :value="m.role"
            :disabled="updatingId === m.id"
            @change="changeRole(m, ($event.target as HTMLSelectElement).value as 'MANAGER' | 'RECRUITER')"
          >
            <option value="MANAGER">Gerente</option>
            <option value="RECRUITER">Recrutador</option>
          </select>

          <!-- Remover -->
          <button
            class="btn btn-danger btn-sm"
            :disabled="updatingId === m.id || removing"
            :title="`Remover ${displayName(m)}`"
            @click="removeTarget = m"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        </div>

        <!-- Badge especial para OWNER -->
        <div v-else class="tml-owner-badge">Proprietário</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Toast from '../ui/Toast.vue';
import Modal from '../ui/Modal.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import {
  team,
  isPlanLimitReachedError,
  ApiException,
  getMyPlan,
} from '../../utils/api';
import type { TeamMember, TeamRole } from '../../utils/api';

const myTeamRole = ref<TeamRole | null>(null);
const canManage = computed(
  () => myTeamRole.value === null || myTeamRole.value === 'OWNER' || myTeamRole.value === 'MANAGER',
);

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const members = ref<TeamMember[]>([]);

// Invite state
const showInviteModal = ref(false);
const inviting = ref(false);
const inviteForm = ref({ email: '', role: 'RECRUITER' as 'MANAGER' | 'RECRUITER' });

// Remove state
const removeTarget = ref<TeamMember | null>(null);
const removing = ref(false);

// Update role state
const updatingId = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    members.value = await team.listMembers();
  } catch {
    toast.value?.show('Erro ao carregar membros do time', 'error');
  } finally {
    loading.value = false;
  }
}

function openInviteModal() {
  inviteForm.value = { email: '', role: 'RECRUITER' };
  showInviteModal.value = true;
}

function closeInviteModal() {
  if (inviting.value) return;
  showInviteModal.value = false;
}

async function submitInvite() {
  if (inviting.value) return;
  if (!inviteForm.value.email.trim()) {
    toast.value?.show('Informe o e-mail do convidado', 'error');
    return;
  }
  inviting.value = true;
  try {
    const newMember = await team.invite({
      email: inviteForm.value.email.trim(),
      role: inviteForm.value.role,
    });
    members.value.push(newMember);
    toast.value?.show('Convite enviado com sucesso!', 'success');
    showInviteModal.value = false;
  } catch (err: unknown) {
    if (err instanceof ApiException && err.statusCode === 403) {
      // Tenta extrair detalhes de limite de seat
      const body = err.body;
      const planName = typeof body?.['planName'] === 'string' ? body['planName'] : '';
      const limit = typeof body?.['limit'] === 'number' ? body['limit'] : '';
      if (limit !== '') {
        toast.value?.show(
          `Limite de ${limit} acesso${limit === 1 ? '' : 's'} atingido no seu plano${planName ? ` ${planName}` : ''}. Faça upgrade para convidar mais membros.`,
          'error'
        );
      } else {
        toast.value?.show('Limite de membros atingido no seu plano. Faça upgrade para convidar mais.', 'error');
      }
      return;
    }
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao enviar convite', 'error');
  } finally {
    inviting.value = false;
  }
}

async function changeRole(m: TeamMember, newRole: 'MANAGER' | 'RECRUITER') {
  if (updatingId.value) return;
  updatingId.value = m.id;
  try {
    const updated = await team.updateMember(m.id, { role: newRole });
    const idx = members.value.findIndex((x) => x.id === m.id);
    if (idx !== -1) members.value[idx] = updated;
    toast.value?.show('Perfil atualizado', 'success');
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao alterar perfil', 'error');
  } finally {
    updatingId.value = null;
  }
}

async function confirmRemove() {
  if (!removeTarget.value || removing.value) return;
  removing.value = true;
  const target = removeTarget.value;
  try {
    await team.removeMember(target.id);
    members.value = members.value.filter((m) => m.id !== target.id);
    toast.value?.show('Membro removido do time', 'success');
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao remover membro', 'error');
  } finally {
    removeTarget.value = null;
    removing.value = false;
  }
}

function displayName(m: TeamMember | null): string {
  if (!m) return 'este membro';
  if (m.user) {
    const full = [m.user.firstName, m.user.lastName].filter(Boolean).join(' ').trim();
    if (full) return full;
    if (m.user.name) return m.user.name;
    if (m.user.email) return m.user.email;
  }
  if (m.invitedEmail) return m.invitedEmail;
  return '—';
}

function displayEmail(m: TeamMember): string {
  return m.user?.email ?? m.invitedEmail ?? '—';
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

function roleLabel(role: TeamRole): string {
  const map: Record<TeamRole, string> = {
    OWNER: 'Proprietário',
    MANAGER: 'Gerente',
    RECRUITER: 'Recrutador',
  };
  return map[role] ?? role;
}

function statusLabel(status: string): string {
  return status === 'ACTIVE' ? 'Ativo' : 'Pendente';
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
.tml-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.tml-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.tml-title {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.tml-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tml-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-2xl);
}

.tml-empty {
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

.tml-empty-icon {
  color: var(--text-tertiary, var(--text-secondary));
  opacity: 0.5;
}

.tml-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.tml-member {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.tml-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  background: var(--primary-light, #dbeafe);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tml-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tml-avatar-initials {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--primary);
}

.tml-info {
  flex: 1;
  min-width: 0;
}

.tml-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tml-email {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tml-badges {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: 4px;
  flex-wrap: wrap;
}

.tml-role-badge,
.tml-status-badge {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}

.role-OWNER { background: #ede9fe; color: #6d28d9; }
.role-MANAGER { background: #dbeafe; color: #1d4ed8; }
.role-RECRUITER { background: #f0fdf4; color: #15803d; }

.status-ACTIVE { background: #dcfce7; color: #166534; }
.status-PENDING { background: #fef3c7; color: #92400e; }

.tml-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.tml-role-select {
  padding: 5px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  font-family: var(--font-sans);
}

.tml-owner-badge {
  flex-shrink: 0;
  padding: 4px 12px;
  background: #ede9fe;
  color: #6d28d9;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

/* Invite form */
.tml-invite-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.tml-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.tml-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.tml-input {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.tml-input:focus {
  outline: none;
  border-color: var(--primary);
}

.tml-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tml-role-hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

@media (max-width: 640px) {
  .tml-member {
    flex-wrap: wrap;
  }
  .tml-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
