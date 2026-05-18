<template>
  <div class="poc-card">
    <div class="poc-header">
      <h4 class="poc-title">Pipeline geral</h4>
      <span class="poc-hint">{{ hintText }}</span>
    </div>

    <div v-if="loading" class="poc-loading" aria-busy="true" aria-label="Carregando pipeline">
      <div v-for="i in 5" :key="i" class="poc-skeleton-row">
        <div class="poc-skeleton-label"></div>
        <div class="poc-skeleton-bar"></div>
        <div class="poc-skeleton-count"></div>
      </div>
    </div>

    <div v-else-if="error" class="poc-error" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <div v-else-if="rows.length === 0" class="poc-empty">
      Nenhuma candidatura encontrada.
    </div>

    <ul v-else class="poc-list" aria-label="Candidaturas por etapa">
      <li v-for="row in rows" :key="row.stageId" class="poc-row">
        <span class="poc-stage-label" :title="row.label">{{ row.label }}</span>
        <div class="poc-bar-wrap" role="progressbar" :aria-valuenow="row.count" :aria-valuemax="maxCount" :aria-label="`${row.label}: ${row.count}`">
          <div
            class="poc-bar-fill"
            :style="{ width: maxCount > 0 ? `${(row.count / maxCount) * 100}%` : '0%' }"
          ></div>
        </div>
        <span class="poc-count">{{ row.count }}</span>
      </li>
    </ul>

    <div class="poc-footer">
      <span class="poc-footer-link poc-footer-link--placeholder" aria-disabled="true">
        Ver detalhes (em breve)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getMyVagas, getVagaApplications, pipelineTemplates } from '../../utils/api';
import type { PipelineStage, VagaApplicationAdminView } from '../../utils/api';

// TODO: substituir por endpoint server-side aggregado quando disponível.
// Por ora agrega client-side as 10 vagas mais recentes com applicationsCount > 0.

interface PipelineRow {
  stageId: string;
  label: string;
  count: number;
}

const loading = ref(false);
const error = ref<string | null>(null);
const rows = ref<PipelineRow[]>([]);
const vagasAggregated = ref(0);

const hintText = computed(() =>
  vagasAggregated.value > 0
    ? `Agregado das ${vagasAggregated.value} vagas mais recentes`
    : ''
);

const maxCount = computed(() =>
  rows.value.reduce((m, r) => Math.max(m, r.count), 0)
);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    // 1. Busca template de stages
    let stages: PipelineStage[] = [];
    try {
      const template = await pipelineTemplates.getMine();
      stages = template.stages.filter((s) => !s.isRejected).sort((a, b) => a.order - b.order);
    } catch {
      // fallback para stages padrão se endpoint falhar
      stages = [
        { id: 'para_analisar', label: 'Para analisar', order: 0 },
        { id: 'analisados', label: 'Analisados', order: 1 },
        { id: 'abordados', label: 'Abordados', order: 2 },
        { id: 'entrev_recrutador', label: 'Entrev. recrutador', order: 3 },
        { id: 'entrev_rh', label: 'Entrev. RH', order: 4 },
        { id: 'entrev_gestor', label: 'Entrev. gestor', order: 5 },
        { id: 'entrev_final', label: 'Entrev. final', order: 6 },
      ];
    }

    // 2. Busca lista de vagas (10 mais recentes com candidates)
    const vagasPage = await getMyVagas({ limit: 10, status: 'PUBLISHED' });
    const vagasWithCandidates = vagasPage.data.filter(
      (v) => (v.applicationsCount ?? 0) > 0
    );
    vagasAggregated.value = vagasWithCandidates.length;

    if (vagasWithCandidates.length === 0) {
      rows.value = [];
      return;
    }

    // 3. Fetch paralelo das aplicações de cada vaga
    const applicationsByVaga = await Promise.allSettled(
      vagasWithCandidates.map((v) => getVagaApplications(v.id))
    );

    // 4. Agrega por stage
    const countMap: Record<string, number> = {};
    for (const result of applicationsByVaga) {
      if (result.status !== 'fulfilled') continue;
      for (const app of result.value as VagaApplicationAdminView[]) {
        if (app.isRejected) continue;
        const stage = app.pipelineStage ?? 'para_analisar';
        countMap[stage] = (countMap[stage] ?? 0) + 1;
      }
    }

    rows.value = stages
      .map((s) => ({ stageId: s.id, label: s.label, count: countMap[s.id] ?? 0 }))
      .filter((r) => r.count > 0 || stages.length <= 5);
  } catch (err) {
    error.value = 'Não foi possível carregar o pipeline. Tente novamente.';
    console.error('[PipelineOverviewCard]', err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.poc-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.poc-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.poc-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

.poc-hint {
  font-size: 11px;
  color: var(--text-light);
}

/* Skeleton loader */
.poc-loading { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.poc-skeleton-row { display: flex; align-items: center; gap: var(--spacing-sm); }
.poc-skeleton-label {
  flex: 0 0 100px;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: poc-pulse 1.4s ease-in-out infinite;
}
.poc-skeleton-bar {
  flex: 1;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: poc-pulse 1.4s ease-in-out infinite;
  animation-delay: 0.1s;
}
.poc-skeleton-count {
  flex: 0 0 28px;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: poc-pulse 1.4s ease-in-out infinite;
  animation-delay: 0.2s;
}
@keyframes poc-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Error */
.poc-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--age-critical-text);
  padding: var(--spacing-sm);
  background: var(--status-error-bg, #fef2f2);
  border-radius: var(--radius-sm);
}

.poc-empty {
  font-size: var(--text-xs);
  color: var(--text-light);
  text-align: center;
  padding: var(--spacing-md) 0;
}

/* List */
.poc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.poc-row {
  display: grid;
  grid-template-columns: 110px 1fr 32px;
  align-items: center;
  gap: var(--spacing-xs);
}

.poc-stage-label {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poc-bar-wrap {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.poc-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
  min-width: 4px;
}

.poc-count {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: right;
}

/* Footer */
.poc-footer {
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border);
}

.poc-footer-link {
  font-size: var(--text-xs);
  color: var(--text-light);
  cursor: not-allowed;
  text-decoration: none;
  display: inline-block;
}

.poc-footer-link--placeholder {
  opacity: 0.6;
  font-style: italic;
}
</style>
