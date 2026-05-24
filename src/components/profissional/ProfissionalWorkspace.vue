<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DashboardLayout from '../dashboard/DashboardLayout.vue';
import RadarVagas from './RadarVagas.vue';
import VagasSalvas from './VagasSalvas.vue';
import { getMyPlan, team } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';

type Tab = 'radar' | 'salvas';

const tab = ref<Tab>('radar');
const isHunter = ref(false);

function readTabFromUrl(): Tab {
  if (typeof window === 'undefined') return 'radar';
  const t = new URLSearchParams(window.location.search).get('tab');
  if (t === 'salvas') return t;
  return 'radar';
}

function setTab(t: Tab) {
  tab.value = t;
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', t);
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new Event('vp:nav-changed'));
  }
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'radar', label: 'Radar de Vagas' },
  { id: 'salvas', label: 'Vagas Salvas' },
];

async function loadHunterStatus() {
  if (!isAuthenticated()) return;
  try {
    const [info, teams] = await Promise.all([
      getMyPlan(),
      team.listAccessible().catch(() => []),
    ]);
    const tier = info?.plan;
    const paid = tier === 'RECRUITER' || tier === 'TEAM' || tier === 'ENTERPRISE';
    isHunter.value = paid || teams.length > 0;
  } catch {
    isHunter.value = false;
  }
}

onMounted(() => {
  tab.value = readTabFromUrl();
  loadHunterStatus();
});
</script>

<template>
  <DashboardLayout>
    <div class="profissional-workspace">
      <nav class="pw-tabs" role="tablist">
        <button
          v-for="t in TABS"
          :key="t.id"
          type="button"
          role="tab"
          class="pw-tab"
          :class="{ active: tab === t.id }"
          :aria-selected="tab === t.id"
          @click="setTab(t.id)"
        >
          {{ t.label }}
        </button>
      </nav>

      <div class="pw-content">
        <RadarVagas v-if="tab === 'radar'" :is-hunter="isHunter" />
        <VagasSalvas v-else-if="tab === 'salvas'" />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.profissional-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pw-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  gap: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.pw-tab {
  padding: 0.625rem 1.25rem;
  border: none;
  background: none;
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.pw-tab:hover {
  color: var(--text-primary);
}

.pw-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}

.pw-content {
  /* Tab content container */
}

</style>
