<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DashboardLayout from '../dashboard/DashboardLayout.vue';
import RadarVagas from './RadarVagas.vue';
import VagasSalvas from './VagasSalvas.vue';
import PerfilCompletionCard from '../dashboard/PerfilCompletionCard.vue';
import ApplicationsInline from '../dashboard/ApplicationsInline.vue';
import { getMyPlan, team } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';

type Tab = 'carreira' | 'radar' | 'salvas';

const tab = ref<Tab>('carreira');
const isHunter = ref(false);

function readTabFromUrl(): Tab {
  if (typeof window === 'undefined') return 'carreira';
  const t = new URLSearchParams(window.location.search).get('tab');
  if (t === 'salvas' || t === 'radar' || t === 'carreira') return t;
  return 'carreira';
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
  { id: 'carreira', label: 'Carreira' },
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
        <section v-if="tab === 'carreira'" class="pw-carreira">
          <div class="pw-hero">
            <h3>Sua carreira</h3>
            <p>Gerencie seu perfil, currículos, portfólio e localização em um só lugar.</p>
          </div>
          <div class="pw-career-shortcuts">
            <a href="/dashboard/curriculos" class="pw-shortcut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
              <span class="pw-shortcut-label">Currículos</span>
              <span class="pw-shortcut-desc">Faça upload e gerencie seus currículos</span>
            </a>
            <a href="/dashboard/portfolio" class="pw-shortcut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
              <span class="pw-shortcut-label">Publicações</span>
              <span class="pw-shortcut-desc">Projetos e artigos do seu portfólio</span>
            </a>
            <a href="/dashboard/perfil" class="pw-shortcut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
              <span class="pw-shortcut-label">Perfil</span>
              <span class="pw-shortcut-desc">Foto, bio, localização e redes sociais</span>
            </a>
            <a href="/dashboard/formacao" class="pw-shortcut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg>
              <span class="pw-shortcut-label">Formação</span>
              <span class="pw-shortcut-desc">Educação e certificações</span>
            </a>
            <a href="/dashboard/tags" class="pw-shortcut">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z"/></svg>
              <span class="pw-shortcut-label">Tags</span>
              <span class="pw-shortcut-desc">Habilidades e especialidades do perfil</span>
            </a>
          </div>
          <div class="pw-carreira-grid">
            <PerfilCompletionCard />
            <ApplicationsInline />
          </div>
        </section>
        <RadarVagas v-else-if="tab === 'radar'" :is-hunter="isHunter" />
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

.pw-carreira {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.pw-hero h3 {
  margin: 0 0 var(--spacing-xs);
  font-size: var(--text-xl);
  color: var(--text-primary);
}
.pw-hero p {
  margin: 0;
  color: var(--text-secondary);
}

.pw-career-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}
@media (max-width: 600px) {
  .pw-career-shortcuts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--spacing-sm);
  }
  .pw-shortcut { padding: var(--spacing-md); }
  .pw-shortcut-desc { display: none; }
}
.pw-shortcut {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.pw-shortcut:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}
.pw-shortcut svg { color: var(--primary); flex-shrink: 0; }
.pw-shortcut-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.pw-shortcut-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.pw-carreira-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: var(--spacing-lg);
  align-items: start;
}
@media (max-width: 900px) {
  .pw-carreira-grid {
    grid-template-columns: 1fr;
  }
}

</style>
