<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { team, profile, getErrorMessage } from '../../utils/api';
import type { AccessibleTeam } from '../../utils/api';

type ActiveContext = 'profissional' | 'hunter-pessoal' | 'hunter-time';

// ── State ──────────────────────────────────────────────────────────────────────
const open = ref(false);
const loading = ref(false);
const teams = ref<AccessibleTeam[]>([]);
const settingContext = ref(false);

// ── Active context from URL pathname ─────────────────────────────────────────
const pathname = ref(typeof window !== 'undefined' ? window.location.pathname : '');

function updatePathname() {
  pathname.value = window.location.pathname;
}

const activeContext = computed<ActiveContext>(() => {
  if (pathname.value.startsWith('/dashboard/hunter/time/')) return 'hunter-time';
  if (pathname.value.startsWith('/dashboard/hunter/pessoal')) return 'hunter-pessoal';
  return 'profissional';
});

const activeTeamId = computed<string | null>(() => {
  const m = pathname.value.match(/^\/dashboard\/hunter\/time\/([^/]+)/);
  return m ? m[1]! : null;
});

const activeLabel = computed<string>(() => {
  if (activeContext.value === 'profissional') return 'Profissional';
  if (activeContext.value === 'hunter-pessoal') return 'Hunter Pessoal';
  if (activeContext.value === 'hunter-time' && activeTeamId.value) {
    const t = teams.value.find((x) => x.id === activeTeamId.value);
    return t ? t.name : 'Hunter (Time)';
  }
  return 'Hunter';
});

// ── Toggle dropdown ───────────────────────────────────────────────────────────
function toggleOpen() {
  open.value = !open.value;
}

function closeDropdown() {
  open.value = false;
}

// ── Navigation ────────────────────────────────────────────────────────────────
async function navigateTo(
  context: 'profissional' | 'hunter-pessoal' | 'hunter-time',
  teamId?: string
) {
  if (settingContext.value) return;
  closeDropdown();

  // Synchronise backend activeContextTeamId before navigating
  settingContext.value = true;
  try {
    if (context === 'hunter-time' && teamId) {
      await profile.setActiveContext(teamId);
      window.location.href = `/dashboard/hunter/time/${teamId}`;
    } else {
      await profile.setActiveContext(null);
      if (context === 'profissional') {
        window.location.href = '/dashboard/profissional';
      } else {
        window.location.href = '/dashboard/hunter/pessoal';
      }
    }
  } catch (err) {
    // Non-critical — navigate anyway; backend will resync on load
    console.error(getErrorMessage(err));
    if (context === 'hunter-time' && teamId) {
      window.location.href = `/dashboard/hunter/time/${teamId}`;
    } else if (context === 'profissional') {
      window.location.href = '/dashboard/profissional';
    } else {
      window.location.href = '/dashboard/hunter/pessoal';
    }
  } finally {
    settingContext.value = false;
  }
}

// ── Click outside ─────────────────────────────────────────────────────────────
const rootEl = ref<HTMLElement | null>(null);

function onDocClick(e: MouseEvent) {
  if (!open.value) return;
  const el = rootEl.value;
  if (el && !el.contains(e.target as Node)) {
    closeDropdown();
  }
}

// ── Data loading ──────────────────────────────────────────────────────────────
async function loadTeams() {
  loading.value = true;
  try {
    teams.value = await team.listAccessible();
  } catch {
    teams.value = [];
  } finally {
    loading.value = false;
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadTeams();
  window.addEventListener('popstate', updatePathname);
  window.addEventListener('vp:nav-changed', updatePathname);
  document.addEventListener('mousedown', onDocClick);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', updatePathname);
  window.removeEventListener('vp:nav-changed', updatePathname);
  document.removeEventListener('mousedown', onDocClick);
});
</script>

<template>
  <div class="ctx-dropdown" ref="rootEl">
    <button
      type="button"
      class="ctx-dropdown-trigger"
      :class="{ 'ctx-dropdown-trigger--open': open }"
      :disabled="settingContext"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggleOpen"
    >
      <span class="ctx-dropdown-icon">
        <svg v-if="activeContext === 'profissional'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
        </svg>
      </span>
      <span class="ctx-dropdown-label">{{ activeLabel }}</span>
      <span v-if="settingContext" class="spinner spinner-sm ctx-spinner" />
      <svg v-else class="ctx-dropdown-chevron" :class="{ 'rotated': open }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <div v-if="open" class="ctx-dropdown-menu" role="listbox" :aria-label="'Selecionar contexto'">
      <!-- Profissional -->
      <button
        type="button"
        class="ctx-dropdown-item"
        :class="{ active: activeContext === 'profissional' }"
        role="option"
        :aria-selected="activeContext === 'profissional'"
        @click="navigateTo('profissional')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
        <span>Profissional</span>
        <span v-if="activeContext === 'profissional'" class="ctx-dropdown-check">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      </button>

      <!-- Hunter Pessoal -->
      <button
        type="button"
        class="ctx-dropdown-item"
        :class="{ active: activeContext === 'hunter-pessoal' }"
        role="option"
        :aria-selected="activeContext === 'hunter-pessoal'"
        @click="navigateTo('hunter-pessoal')"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
        </svg>
        <span>Hunter Pessoal</span>
        <span v-if="activeContext === 'hunter-pessoal'" class="ctx-dropdown-check">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
        </span>
      </button>

      <!-- Times -->
      <template v-if="loading">
        <div class="ctx-dropdown-skeleton" />
      </template>
      <template v-else-if="teams.length > 0">
        <div class="ctx-dropdown-separator" />
        <div class="ctx-dropdown-section-label">Times</div>
        <button
          v-for="t in teams"
          :key="t.id"
          type="button"
          class="ctx-dropdown-item"
          :class="{ active: activeContext === 'hunter-time' && activeTeamId === t.id }"
          role="option"
          :aria-selected="activeContext === 'hunter-time' && activeTeamId === t.id"
          @click="navigateTo('hunter-time', t.id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
          <span class="ctx-dropdown-item-text">{{ t.name }}</span>
          <span v-if="activeContext === 'hunter-time' && activeTeamId === t.id" class="ctx-dropdown-check">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.ctx-dropdown {
  position: relative;
}

.ctx-dropdown-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
  white-space: nowrap;
  max-width: 180px;
}

.ctx-dropdown-trigger:hover:not(:disabled) {
  border-color: var(--primary-light, var(--primary));
  background: var(--bg-secondary);
}

.ctx-dropdown-trigger--open {
  border-color: var(--primary);
  background: var(--bg-secondary);
}

.ctx-dropdown-trigger:disabled {
  opacity: 0.7;
  cursor: default;
}

.ctx-dropdown-icon {
  display: flex;
  align-items: center;
  color: var(--primary);
  flex-shrink: 0;
}

.ctx-dropdown-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ctx-dropdown-chevron {
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.ctx-dropdown-chevron.rotated {
  transform: rotate(180deg);
}

.ctx-spinner {
  flex-shrink: 0;
}

.ctx-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 50;
  min-width: 200px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 4px;
  animation: ctx-fade 120ms ease-out both;
}

@keyframes ctx-fade {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ctx-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: none;
  border-radius: var(--radius-sm);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  text-align: left;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.ctx-dropdown-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.ctx-dropdown-item.active {
  color: var(--primary);
  background: rgba(37, 99, 235, 0.06);
  font-weight: 600;
}

.ctx-dropdown-item svg {
  flex-shrink: 0;
  color: inherit;
}

.ctx-dropdown-item-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ctx-dropdown-check {
  display: flex;
  align-items: center;
  color: var(--primary);
  flex-shrink: 0;
}

.ctx-dropdown-separator {
  border: none;
  border-top: 1px solid var(--border-light, var(--border));
  margin: 4px 0;
}

.ctx-dropdown-section-label {
  padding: 4px 10px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.ctx-dropdown-skeleton {
  height: 32px;
  margin: 4px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  animation: ctx-pulse 1.2s ease-in-out infinite;
}

@keyframes ctx-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
