<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { team, profile, getErrorMessage } from '../../utils/api';
import type { AccessibleTeam, FullProfile } from '../../utils/api';

const props = defineProps<{
  user: FullProfile;
}>();

const emit = defineEmits<{
  contextChanged: [teamId: string | null];
}>();

const saving = ref(false);
const teams = ref<AccessibleTeam[]>([]);
const loadingTeam = ref(false);

const activeTeamId = computed(() => props.user.activeContextTeamId ?? null);

const contextLabel = computed(() => {
  if (!activeTeamId.value) return 'Pessoal';
  const t = teams.value.find(x => x.id === activeTeamId.value);
  return t?.name ?? 'Pessoal';
});

async function loadTeam() {
  loadingTeam.value = true;
  try {
    teams.value = await team.listAccessible();
  } catch {
    teams.value = [];
  } finally {
    loadingTeam.value = false;
  }
}

async function setContext(teamId: string | null) {
  if (saving.value) return;
  if (teamId === activeTeamId.value) return;
  saving.value = true;
  try {
    await profile.setActiveContext(teamId);
    emit('contextChanged', teamId);
  } catch (err) {
    // Silently revert — caller can show toast if needed
    console.error(getErrorMessage(err));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadTeam();
});
</script>

<template>
  <div class="ctx-switcher">
    <span class="ctx-label">Publicando como</span>
    <div v-if="loadingTeam" class="ctx-skeleton" />
    <div v-else class="ctx-btns">
      <button
        type="button"
        class="ctx-btn"
        :class="{ active: activeTeamId === null }"
        :disabled="saving"
        @click="setContext(null)"
      >
        Pessoal
      </button>
      <button
        v-for="t in teams"
        :key="t.id"
        type="button"
        class="ctx-btn"
        :class="{ active: activeTeamId === t.id }"
        :disabled="saving"
        :title="t.name"
        @click="setContext(t.id)"
      >
        {{ t.name }}
      </button>
    </div>
    <span v-if="saving" class="spinner spinner-sm ctx-spinner" />
  </div>
</template>

<style scoped>
.ctx-switcher {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.ctx-label {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
}

.ctx-skeleton {
  height: 28px;
  width: 120px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.ctx-btns {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  flex: 1;
}

.ctx-btn {
  flex: 1;
  padding: 4px 8px;
  border: none;
  background: none;
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ctx-btn.active {
  background: var(--secondary, #7c3aed);
  color: #fff;
  font-weight: 600;
}

.ctx-btn:not(.active):hover:not(:disabled) {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.ctx-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ctx-spinner {
  margin-left: auto;
}
</style>
