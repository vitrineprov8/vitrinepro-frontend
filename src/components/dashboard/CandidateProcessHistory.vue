<template>
  <div class="cph-root">
    <Toast ref="toast" />

    <div class="cph-section-header">
      <span class="cph-section-label">Notas e observacoes</span>
      <button
        v-if="visibleStages.length > 0"
        type="button"
        class="cph-add-btn"
        @click="toggleAddForm"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Adicionar nota
      </button>
    </div>

    <Transition name="cph-collapse">
      <div v-if="addFormOpen" class="cph-add-form">
        <label class="cph-field-label" for="cph-add-stage">Etapa do pipeline</label>
        <select id="cph-add-stage" v-model="addStage" class="cph-select">
          <option value="">Selecione a etapa</option>
          <option v-for="s in visibleStages" :key="`add-${s.id}`" :value="s.id">{{ s.label }}</option>
        </select>

        <label class="cph-field-label" for="cph-add-obs">Observacao</label>
        <textarea
          id="cph-add-obs"
          v-model="addObs"
          rows="3"
          placeholder="Escreva sua observacao..."
          class="cph-textarea"
        />

        <div class="cph-add-row">
          <div class="cph-add-nota-block">
            <label class="cph-field-label" for="cph-add-nota">Nota (1-10)</label>
            <input
              id="cph-add-nota"
              v-model.number="addNota"
              type="number"
              min="1"
              max="10"
              step="0.1"
              class="cph-nota-input"
              placeholder="—"
            />
          </div>
          <div class="cph-add-actions">
            <button type="button" class="cph-add-btn cph-add-btn--ghost" @click="cancelAdd">Cancelar</button>
            <button
              type="button"
              class="cph-add-btn cph-add-btn--primary"
              :disabled="!canSubmit || savingAdd"
              @click="submitAdd"
            >
              {{ savingAdd ? 'Salvando...' : 'Salvar nota' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="entries.length > 0" class="cph-overview">
      <div class="cph-overview-head-row">
        <span class="cph-overview-label">Historico ({{ entries.length }})</span>
        <span v-if="averageScore != null" class="cph-overview-avg">
          Media: <strong>{{ averageScore.toFixed(1) }}</strong>
        </span>
      </div>
      <ul class="cph-entry-list">
        <li v-for="(ev, idx) in entries" :key="`ev-${idx}-${ev.createdAt}`" class="cph-entry">
          <div class="cph-entry-head">
            <span class="cph-entry-stage">{{ stageLabel(ev.stage) }}</span>
            <span class="cph-entry-date">{{ formatDate(ev.createdAt) }}</span>
            <span v-if="ev.nota != null" class="cph-entry-nota">{{ Number(ev.nota).toFixed(1) }}</span>
          </div>
          <p v-if="ev.observacoes" class="cph-entry-obs">{{ ev.observacoes }}</p>
        </li>
      </ul>
    </div>

    <div v-else-if="!loading" class="cph-empty">
      Nenhuma nota adicionada ainda.
    </div>

    <div v-if="loading" class="cph-loading">
      <div class="spinner spinner-sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { applications, type PipelineStage } from '../../utils/api';
import Toast from '../ui/Toast.vue';

const props = defineProps<{
  applicationId: string;
  stages: PipelineStage[];
}>();

const emit = defineEmits<{
  (e: 'aggregate-score', value: number | null): void;
}>();

const toast = ref<InstanceType<typeof Toast>>();

interface NoteEntry {
  stage: string;
  observacoes: string;
  nota: number | null;
  createdAt: string;
}

const entries = ref<NoteEntry[]>([]);
const loading = ref(false);

const visibleStages = computed(() =>
  props.stages.filter((s) => !s.isRejected).sort((a, b) => a.order - b.order)
);

function stageLabel(id: string): string {
  return props.stages.find((s) => s.id === id)?.label ?? id;
}

function storageKey(appId: string): string {
  return `vp:cph-entries:${appId}`;
}

function loadEntries() {
  if (typeof window === 'undefined' || !props.applicationId) return;
  try {
    const raw = window.localStorage.getItem(storageKey(props.applicationId));
    entries.value = raw ? (JSON.parse(raw) as NoteEntry[]) : [];
  } catch {
    entries.value = [];
  }
}

function persistEntries() {
  if (typeof window === 'undefined' || !props.applicationId) return;
  try {
    window.localStorage.setItem(storageKey(props.applicationId), JSON.stringify(entries.value));
  } catch {
    // ignore quota errors
  }
}

const averageScore = computed<number | null>(() => {
  const scores = entries.value
    .map((e) => e.nota)
    .filter((n): n is number => n != null && !Number.isNaN(n));
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10) / 10;
});

watch(averageScore, (val) => emit('aggregate-score', val));

// ─── Add form ─────────────────────────────────────────────────────────────────

const addFormOpen = ref(false);
const addStage = ref('');
const addObs = ref('');
const addNota = ref<number | string>('');
const savingAdd = ref(false);

const canSubmit = computed(() => {
  if (!addStage.value) return false;
  const hasObs = addObs.value.trim().length > 0;
  const hasNota = addNota.value !== '' && addNota.value != null;
  return hasObs || hasNota;
});

function toggleAddForm() {
  addFormOpen.value = !addFormOpen.value;
  if (!addFormOpen.value) resetAddForm();
}

function resetAddForm() {
  addStage.value = '';
  addObs.value = '';
  addNota.value = '';
}

function cancelAdd() {
  resetAddForm();
  addFormOpen.value = false;
}

async function submitAdd() {
  if (!canSubmit.value || savingAdd.value) return;
  savingAdd.value = true;
  const notaNum = addNota.value === '' || addNota.value == null ? null : Number(addNota.value);
  const entry: NoteEntry = {
    stage: addStage.value,
    observacoes: addObs.value.trim(),
    nota: notaNum,
    createdAt: new Date().toISOString(),
  };
  const isRealApp = !props.applicationId.startsWith('mock-');
  try {
    if (isRealApp) {
      await applications.updateStageNotes(props.applicationId, addStage.value, {
        observacoes: entry.observacoes || null,
        nota: notaNum,
      });
    }
    entries.value = [entry, ...entries.value];
    persistEntries();
    toast.value?.show(`Nota adicionada em "${stageLabel(entry.stage)}"`, 'success');
    cancelAdd();
  } catch {
    entries.value = [entry, ...entries.value];
    persistEntries();
    toast.value?.show('Nota salva localmente (sem servidor)', 'success');
    cancelAdd();
  } finally {
    savingAdd.value = false;
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

watch(
  () => props.applicationId,
  () => {
    entries.value = [];
    addFormOpen.value = false;
    resetAddForm();
    if (props.applicationId) loadEntries();
  },
  { immediate: true }
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.cph-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.cph-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-bottom: 2px;
}

.cph-section-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--text-light);
}

.cph-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

.cph-empty {
  font-size: var(--text-sm);
  color: var(--text-light);
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}

/* Botao + estilos compartilhados */
.cph-add-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-sans);
  border-radius: var(--radius-md);
  border: 1px solid var(--primary);
  background: var(--bg-primary);
  color: var(--primary);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.cph-add-btn:hover { background: var(--bg-secondary); }
.cph-add-btn--primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.cph-add-btn--primary:hover:not(:disabled) { background: var(--primary-dark); }
.cph-add-btn--primary:disabled { opacity: 0.5; cursor: default; }
.cph-add-btn--ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: var(--border);
}

/* Formulario */
.cph-add-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border: 1.5px solid var(--primary);
  border-radius: var(--radius-md);
}
.cph-field-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.cph-select,
.cph-textarea {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 7px 9px;
  box-sizing: border-box;
}
.cph-textarea { resize: vertical; line-height: 1.5; }
.cph-select:focus, .cph-textarea:focus { outline: none; border-color: var(--primary); }

.cph-nota-input {
  width: 80px;
  padding: 6px 8px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
  color: var(--primary);
  background: var(--bg-primary);
  font-family: var(--font-sans);
  -moz-appearance: textfield;
}
.cph-nota-input::-webkit-outer-spin-button,
.cph-nota-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cph-nota-input:focus { outline: none; border-color: var(--primary); }

.cph-add-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.cph-add-nota-block { display: flex; flex-direction: column; gap: 4px; }
.cph-add-actions { display: flex; gap: 6px; }

/* Historico (lista de entries) */
.cph-overview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cph-overview-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}
.cph-overview-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--text-light);
}
.cph-overview-avg {
  font-size: 11px;
  color: var(--text-secondary);
}
.cph-overview-avg strong {
  color: var(--primary);
  font-size: var(--text-sm);
}

.cph-entry-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cph-entry {
  padding: 8px 10px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: var(--radius-md);
}
.cph-entry-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.cph-entry-stage {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  background: var(--status-active-bg, rgba(37,99,235,0.1));
  color: var(--status-active-text, var(--primary));
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.cph-entry-date {
  font-size: 11px;
  color: var(--text-light);
}
.cph-entry-nota {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  background: var(--bg-secondary);
  padding: 2px 9px;
  border-radius: var(--radius-full);
}
.cph-entry-obs {
  font-size: var(--text-sm);
  color: var(--text-primary);
  margin: 6px 0 0;
  line-height: 1.45;
  white-space: pre-wrap;
}

/* Collapse transition */
.cph-collapse-enter-active,
.cph-collapse-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.cph-collapse-enter-from,
.cph-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
