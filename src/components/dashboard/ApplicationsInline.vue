<template>
  <div class="ai-root">
    <div class="ai-header">
      <h3 class="ai-title">Minhas candidaturas</h3>
      <a href="/vagas" class="ai-link-all">Ver vagas abertas</a>
    </div>

    <div v-if="loading" class="ai-loading">
      <div class="spinner" />
    </div>

    <div v-else-if="apps.length === 0" class="ai-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
      </svg>
      <p>Voce ainda nao se candidatou a nenhuma vaga.</p>
      <a href="/vagas" class="btn btn-primary btn-sm">Explorar vagas</a>
    </div>

    <ul v-else class="ai-list">
      <li
        v-for="a in apps"
        :key="a.id"
        class="ai-card"
        :class="{ 'ai-card--clickable': !!a.vaga }"
        :role="a.vaga ? 'link' : undefined"
        :tabindex="a.vaga ? 0 : undefined"
        @click="a.vaga && openVaga(a.vaga.slug)"
        @keydown.enter="a.vaga && openVaga(a.vaga.slug)"
      >
        <div class="ai-card-body">
          <div class="ai-card-info">
            <strong class="ai-card-title">{{ a.vaga?.title ?? 'Vaga removida' }}</strong>
            <div class="ai-card-meta">
              <span v-if="a.vaga?.location" class="ai-card-loc">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                {{ a.vaga.location }}
              </span>
              <span class="ai-card-date">{{ formatDate(a.createdAt) }}</span>
            </div>
          </div>
          <div class="ai-card-right">
            <span class="ai-pill" :class="`ai-pill--${a.status}`">
              {{ statusLabel(a.status) }}
            </span>
            <svg v-if="a.vaga" class="ai-card-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M5 12h14M13 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
        <p v-if="a.message" class="ai-card-msg">{{ a.message }}</p>
      </li>
    </ul>

    <p v-if="errorMsg" class="ai-error">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getMyApplications } from '../../utils/api';
import type { ApplicationStatus, VagaApplication } from '../../utils/api';

const loading = ref(true);
const apps = ref<VagaApplication[]>([]);
const errorMsg = ref('');

async function load() {
  loading.value = true;
  errorMsg.value = '';
  try {
    apps.value = await getMyApplications();
  } catch {
    errorMsg.value = 'Erro ao carregar candidaturas. Tente novamente.';
  } finally {
    loading.value = false;
  }
}

function statusLabel(s: ApplicationStatus): string {
  const map: Record<ApplicationStatus, string> = {
    PENDING: 'Pendente',
    REVIEWED: 'Em analise',
    ACCEPTED: 'Aceito',
    REJECTED: 'Recusado',
  };
  return map[s] ?? s;
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function openVaga(slug: string) {
  window.open(`/vaga/${slug}`, '_blank', 'noopener');
}

onMounted(load);
</script>

<style scoped>
.ai-root {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.ai-title {
  margin: 0;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.ai-link-all {
  font-size: var(--text-xs);
  color: var(--primary);
  text-decoration: none;
  white-space: nowrap;
}
.ai-link-all:hover { text-decoration: underline; }

.ai-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.ai-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xl) var(--spacing-md);
  color: var(--text-secondary);
  text-align: center;
}

.ai-empty svg { color: var(--text-muted, #9ca3af); }
.ai-empty p { margin: 0; font-size: var(--text-sm); }

.ai-root { min-width: 0; }
.ai-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 0;
}

.ai-card {
  background: var(--bg-secondary, #f9fafb);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  transition: border-color var(--transition-fast), background var(--transition-fast);
  min-width: 0;
  overflow: hidden;
}

.ai-card--clickable { cursor: pointer; }
.ai-card--clickable:hover {
  border-color: var(--primary-light, #93c5fd);
  background: rgba(37, 99, 235, 0.02);
}
.ai-card--clickable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.ai-card-body {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.ai-card-info { flex: 1; min-width: 0; }

.ai-card-title {
  display: block;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ai-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: 2px;
  font-size: 11px;
  color: var(--text-secondary);
}

.ai-card-loc {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.ai-card-loc > svg { flex-shrink: 0; }

.ai-card-date {
  color: var(--text-muted, #9ca3af);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.ai-card-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.ai-card-arrow { color: var(--text-muted, #9ca3af); }

.ai-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.ai-pill--PENDING  { background: #fef3c7; color: #92400e; }
.ai-pill--REVIEWED { background: #dbeafe; color: #1e40af; }
.ai-pill--ACCEPTED { background: #dcfce7; color: #166534; }
.ai-pill--REJECTED { background: #fee2e2; color: #991b1b; }

.ai-card-msg {
  margin: var(--spacing-xs) 0 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}

.ai-error {
  font-size: var(--text-sm);
  color: #dc2626;
  text-align: center;
  margin: 0;
}

@media (max-width: 600px) {
  .ai-root { padding: var(--spacing-md); }
  .ai-title { font-size: var(--text-sm); }
  .ai-card { padding: var(--spacing-sm); }
  .ai-card-title { font-size: var(--text-xs); }
  .ai-card-body { flex-wrap: wrap; }
  .ai-pill { font-size: 10px; padding: 2px 8px; }
}
</style>
