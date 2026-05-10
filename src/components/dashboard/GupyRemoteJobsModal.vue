<template>
  <Modal
    :visible="visible"
    :title="`Vagas em ${config?.displayName ?? ''}`"
    @close="onClose"
  >
    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else-if="loadError" class="form-error">
      {{ loadError }}
      <button class="btn btn-ghost btn-sm" @click="load">Tentar novamente</button>
    </div>

    <div v-else>
      <div class="rj-toolbar">
        <input
          v-model="filter"
          type="text"
          class="rj-search"
          placeholder="Filtrar por título, departamento, cidade…"
        />
        <span class="rj-count">
          {{ filteredJobs.length }} de {{ jobs.length }} vagas
        </span>
      </div>

      <div class="rj-bulk">
        <label class="rj-check-row">
          <input
            type="checkbox"
            :checked="allSelectableChecked"
            :indeterminate.prop="someSelected && !allSelectableChecked"
            @change="toggleAll"
          />
          <span>Selecionar todas as importáveis ({{ importableCount }})</span>
        </label>
        <span class="rj-count">{{ selected.size }} selecionadas</span>
      </div>

      <div v-if="filteredJobs.length === 0" class="empty-state">
        <p>Nenhuma vaga encontrada.</p>
      </div>

      <ul v-else class="rj-list">
        <li
          v-for="j in filteredJobs"
          :key="j.id"
          class="rj-item"
          :class="{ 'rj-imported': j.alreadyImported }"
        >
          <label class="rj-check-row">
            <input
              type="checkbox"
              :disabled="j.alreadyImported"
              :checked="selected.has(j.id)"
              @change="toggle(j.id)"
            />
            <div class="rj-item-info">
              <div class="rj-item-title">{{ j.title }}</div>
              <div class="rj-item-meta">
                <span v-if="j.department">{{ j.department }}</span>
                <span v-if="j.city">📍 {{ j.city }}<span v-if="j.state">/{{ j.state }}</span></span>
                <span v-if="j.workplaceType">{{ workplaceLabel(j.workplaceType) }}</span>
              </div>
              <div v-if="j.alreadyImported" class="rj-imported-badge">
                Já importada
                <span v-if="j.importedStatus" class="rj-status">({{ statusLabel(j.importedStatus) }})</span>
              </div>
            </div>
          </label>
        </li>
      </ul>
    </div>

    <template #footer>
      <button class="btn btn-ghost" :disabled="importing" @click="onClose">Fechar</button>
      <button
        class="btn btn-primary"
        :disabled="importing || selected.size === 0 || loading"
        @click="confirmImport"
      >
        <span v-if="importing" class="spinner spinner-sm"></span>
        Importar {{ selected.size > 0 ? `(${selected.size})` : '' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import {
  getGupyRemoteJobs,
  importGupyJobs,
} from '../../utils/api';
import type { GupyConfig, GupyRemoteJob, VagaStatus } from '../../utils/api';

const props = defineProps<{ visible: boolean; config: GupyConfig | null }>();
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'imported', summary: { imported: number; skipped: number; failed: number }): void;
}>();

const loading = ref(false);
const importing = ref(false);
const loadError = ref('');
const jobs = ref<GupyRemoteJob[]>([]);
const filter = ref('');
const selected = ref<Set<number>>(new Set());

const filteredJobs = computed(() => {
  const term = filter.value.trim().toLowerCase();
  if (!term) return jobs.value;
  return jobs.value.filter((j) => {
    return (
      j.title.toLowerCase().includes(term) ||
      (j.department || '').toLowerCase().includes(term) ||
      (j.city || '').toLowerCase().includes(term) ||
      (j.state || '').toLowerCase().includes(term)
    );
  });
});

const importableCount = computed(
  () => filteredJobs.value.filter((j) => !j.alreadyImported).length,
);
const allSelectableChecked = computed(() => {
  const importable = filteredJobs.value.filter((j) => !j.alreadyImported);
  return importable.length > 0 && importable.every((j) => selected.value.has(j.id));
});
const someSelected = computed(() => selected.value.size > 0);

watch(
  () => [props.visible, props.config?.id],
  ([vis]) => {
    if (vis && props.config) load();
    if (!vis) {
      selected.value = new Set();
      filter.value = '';
      jobs.value = [];
      loadError.value = '';
    }
  },
);

async function load() {
  if (!props.config) return;
  loading.value = true;
  loadError.value = '';
  selected.value = new Set();
  try {
    const res = await getGupyRemoteJobs(props.config.id);
    jobs.value = res.jobs;
  } catch (e: any) {
    loadError.value = e?.message || 'Erro ao carregar vagas Gupy.';
  } finally {
    loading.value = false;
  }
}

function toggle(id: number) {
  const next = new Set(selected.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selected.value = next;
}

function toggleAll() {
  const importable = filteredJobs.value.filter((j) => !j.alreadyImported);
  if (allSelectableChecked.value) {
    const next = new Set(selected.value);
    importable.forEach((j) => next.delete(j.id));
    selected.value = next;
  } else {
    const next = new Set(selected.value);
    importable.forEach((j) => next.add(j.id));
    selected.value = next;
  }
}

async function confirmImport() {
  if (!props.config || selected.value.size === 0) return;
  if (selected.value.size > 50) {
    loadError.value = 'Importe no máximo 50 vagas por vez.';
    return;
  }
  importing.value = true;
  loadError.value = '';
  try {
    const result = await importGupyJobs(
      props.config.id,
      Array.from(selected.value),
    );
    emit('imported', {
      imported: result.imported,
      skipped: result.skipped,
      failed: result.failed,
    });
  } catch (e: any) {
    loadError.value = e?.message || 'Erro ao importar vagas.';
  } finally {
    importing.value = false;
  }
}

function onClose() {
  if (importing.value) return;
  emit('close');
}

function workplaceLabel(t: string): string {
  if (t === 'remote') return 'Remoto';
  if (t === 'hybrid') return 'Híbrido';
  if (t === 'on-site') return 'Presencial';
  return t;
}

function statusLabel(s: VagaStatus): string {
  return ({ DRAFT: 'Rascunho', PUBLISHED: 'Publicada', CLOSED: 'Encerrada' } as const)[s];
}
</script>

<style scoped>
.rj-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.rj-search {
  flex: 1;
  padding: 0.55rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
}
.rj-count {
  color: var(--text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
}
.rj-bulk {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  margin-bottom: 0.75rem;
}
.rj-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 50vh;
  overflow-y: auto;
}
.rj-item {
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.6rem 0.8rem;
  background: white;
}
.rj-item.rj-imported {
  background: #f9fafb;
  opacity: 0.85;
}
.rj-check-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  cursor: pointer;
}
.rj-check-row input[type='checkbox'] {
  margin-top: 0.25rem;
  flex-shrink: 0;
}
.rj-item-info {
  flex: 1;
  min-width: 0;
}
.rj-item-title {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}
.rj-item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.rj-imported-badge {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #5b21b6;
  background: #ede9fe;
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
}
.rj-status {
  color: #6b7280;
}
.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-secondary);
}
.form-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
</style>
