<template>
  <div v-if="invites.length > 0" class="pic-card">
    <Toast ref="toast" />
    <div class="pic-header">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      <h4 class="pic-title">Você tem convites pendentes</h4>
    </div>
    <ul class="pic-list">
      <li v-for="inv in invites" :key="inv.id" class="pic-item">
        <div class="pic-info">
          <strong class="pic-team">{{ inv.team?.name ?? 'Time' }}</strong>
          <span class="pic-role">Função: {{ roleLabel(inv.role) }}</span>
        </div>
        <div class="pic-actions">
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            :disabled="busy[inv.id]"
            @click="reject(inv)"
          >
            Recusar
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="busy[inv.id]"
            @click="accept(inv)"
          >
            <span v-if="busy[inv.id]" class="spinner spinner-sm" />
            Aceitar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Toast from '../ui/Toast.vue';
import { team } from '../../utils/api';
import type { TeamMember, TeamRole } from '../../utils/api';

const emit = defineEmits<{ changed: [] }>();

const invites = ref<TeamMember[]>([]);
const busy = ref<Record<string, boolean>>({});
const toast = ref<InstanceType<typeof Toast>>();

const ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: 'Proprietário',
  MANAGER: 'Gerente',
  RECRUITER: 'Recrutador',
};
function roleLabel(r: TeamRole) { return ROLE_LABEL[r] ?? r; }

async function load() {
  try { invites.value = await team.listPendingInvites(); }
  catch { invites.value = []; }
}

async function accept(inv: TeamMember) {
  if (busy.value[inv.id]) return;
  busy.value = { ...busy.value, [inv.id]: true };
  try {
    await team.acceptInvite(inv.id);
    invites.value = invites.value.filter((i) => i.id !== inv.id);
    toast.value?.show('Convite aceito.', 'success');
    emit('changed');
  } catch (err) {
    const e = err as { message?: string };
    toast.value?.show(e?.message ?? 'Erro ao aceitar convite.', 'error');
  } finally {
    busy.value = { ...busy.value, [inv.id]: false };
  }
}

async function reject(inv: TeamMember) {
  if (busy.value[inv.id]) return;
  busy.value = { ...busy.value, [inv.id]: true };
  try {
    await team.rejectInvite(inv.id);
    invites.value = invites.value.filter((i) => i.id !== inv.id);
    toast.value?.show('Convite recusado.', 'success');
    emit('changed');
  } catch (err) {
    const e = err as { message?: string };
    toast.value?.show(e?.message ?? 'Erro ao recusar convite.', 'error');
  } finally {
    busy.value = { ...busy.value, [inv.id]: false };
  }
}

onMounted(load);
defineExpose({ reload: load });
</script>

<style scoped>
.pic-card {
  border: 1px solid #fde68a;
  background: #fffbeb;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.pic-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #92400e;
}
.pic-title { margin: 0; font-size: var(--text-base); font-weight: 700; }
.pic-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--spacing-sm); }
.pic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.pic-info { display: flex; flex-direction: column; gap: 2px; }
.pic-team { font-size: var(--text-sm); color: var(--text-primary); }
.pic-role { font-size: 0.75rem; color: var(--text-secondary); }
.pic-actions { display: flex; gap: var(--spacing-xs); flex-shrink: 0; }
@media (max-width: 600px) {
  .pic-item { flex-direction: column; align-items: stretch; }
  .pic-actions { justify-content: flex-end; }
}
</style>
