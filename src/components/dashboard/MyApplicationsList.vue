<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Minhas candidaturas</h1>
        <p class="db-section-subtitle">Histórico das vagas em que você se candidatou</p>
      </div>
      <a href="/vagas" class="btn btn-secondary btn-sm">Ver vagas abertas</a>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else-if="apps.length === 0" class="empty-state">
      <p>Você ainda não se candidatou a nenhuma vaga.</p>
      <a href="/vagas" class="btn btn-primary">Ver vagas abertas</a>
    </div>

    <ul v-else class="apps-list">
      <li
        v-for="a in apps"
        :key="a.id"
        class="apps-card"
        :class="{ 'apps-card-clickable': !!a.vaga }"
        :role="a.vaga ? 'link' : undefined"
        :tabindex="a.vaga ? 0 : undefined"
        @click="a.vaga && openVaga(a.vaga.slug)"
        @keydown.enter="a.vaga && openVaga(a.vaga.slug)"
      >
        <div class="apps-card-head">
          <div>
            <strong v-if="a.vaga">{{ a.vaga.title }}</strong>
            <strong v-else>Vaga removida</strong>
            <div class="apps-card-meta">
              <span v-if="a.vaga?.location">📍 {{ a.vaga.location }}</span>
              <span class="apps-date">enviada em {{ formatDate(a.createdAt) }}</span>
            </div>
          </div>
          <span class="status-pill" :class="`s-${a.status}`">
            {{ statusLabel(a.status) }}
          </span>
        </div>
        <p v-if="a.message" class="apps-message">{{ a.message }}</p>
      </li>
    </ul>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import { getMyApplications } from '../../utils/api';
import type { ApplicationStatus, VagaApplication } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const apps = ref<VagaApplication[]>([]);

async function load() {
  loading.value = true;
  try {
    apps.value = await getMyApplications();
  } catch {
    toast.value?.show('Erro ao carregar candidaturas', 'error');
  } finally {
    loading.value = false;
  }
}

function statusLabel(s: ApplicationStatus): string {
  return ({
    PENDING: 'Pendente',
    REVIEWED: 'Em análise',
    ACCEPTED: 'Aceito',
    REJECTED: 'Recusado',
  } as const)[s];
}
function formatDate(s: string): string {
  return new Date(s).toLocaleString('pt-BR');
}
function openVaga(slug: string) {
  window.open(`/vaga/${slug}`, '_blank', 'noopener');
}

onMounted(load);
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
.apps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.apps-card {
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  transition: background 150ms, border-color 150ms, box-shadow 150ms, transform 150ms;
}
.apps-card-clickable {
  cursor: pointer;
}
.apps-card-clickable:hover {
  background: var(--bg-secondary);
  border-color: var(--border-dark);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.apps-card-clickable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.apps-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.apps-card-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.apps-date {
  color: var(--text-muted, #9ca3af);
}
.apps-message {
  margin: 0;
  white-space: pre-line;
  color: var(--text-secondary);
  font-size: 0.95rem;
}
.status-pill {
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}
.s-PENDING { background: #fef3c7; color: #92400e; }
.s-REVIEWED { background: #dbeafe; color: #1e40af; }
.s-ACCEPTED { background: #dcfce7; color: #166534; }
.s-REJECTED { background: #fee2e2; color: #991b1b; }
</style>
