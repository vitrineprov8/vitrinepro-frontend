<template>
  <Modal :visible="open" title="Convites pendentes" @close="onClose">
    <div v-if="invites.length === 0" class="pim-empty">
      Sem convites pendentes no momento.
    </div>
    <ul v-else class="pim-list">
      <li v-for="inv in invites" :key="inv.id" class="pim-item">
        <div class="pim-info">
          <strong class="pim-team">{{ inv.team?.name ?? 'Time' }}</strong>
          <span class="pim-role">Função: {{ roleLabel(inv.role) }}</span>
        </div>
        <div class="pim-actions">
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

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="onClose">Fechar</button>
    </template>
  </Modal>
  <Toast ref="toast" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import Toast from '../ui/Toast.vue';
import { team } from '../../utils/api';
import type { TeamMember, TeamRole } from '../../utils/api';

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ close: []; accepted: [] }>();

const open = ref(props.visible);
const invites = ref<TeamMember[]>([]);
const busy = ref<Record<string, boolean>>({});
const toast = ref<InstanceType<typeof Toast>>();

const ROLE_LABEL: Record<TeamRole, string> = {
  OWNER: 'Proprietário',
  MANAGER: 'Gerente',
  RECRUITER: 'Recrutador',
};

function roleLabel(r: TeamRole) {
  return ROLE_LABEL[r] ?? r;
}

async function loadInvites() {
  try {
    invites.value = await team.listPendingInvites();
  } catch {
    invites.value = [];
  }
}

async function accept(inv: TeamMember) {
  if (busy.value[inv.id]) return;
  busy.value = { ...busy.value, [inv.id]: true };
  try {
    await team.acceptInvite(inv.id);
    toast.value?.show('Convite aceito.', 'success');
    invites.value = invites.value.filter((i) => i.id !== inv.id);
    emit('accepted');
    if (invites.value.length === 0) onClose();
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
    if (invites.value.length === 0) onClose();
  } catch (err) {
    const e = err as { message?: string };
    toast.value?.show(e?.message ?? 'Erro ao recusar convite.', 'error');
  } finally {
    busy.value = { ...busy.value, [inv.id]: false };
  }
}

function onClose() {
  open.value = false;
  emit('close');
}

watch(
  () => props.visible,
  (v) => {
    open.value = v;
    if (v) loadInvites();
  },
  { immediate: true },
);
</script>

<style scoped>
.pim-empty {
  padding: var(--spacing-md);
  text-align: center;
  color: var(--text-secondary);
}
.pim-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.pim-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}
.pim-info { display: flex; flex-direction: column; gap: 2px; }
.pim-team { font-size: var(--text-sm); color: var(--text-primary); }
.pim-role { font-size: 0.75rem; color: var(--text-secondary); }
.pim-actions { display: flex; gap: var(--spacing-xs); flex-shrink: 0; }
@media (max-width: 600px) {
  .pim-item { flex-direction: column; align-items: stretch; }
  .pim-actions { justify-content: flex-end; }
}
</style>
