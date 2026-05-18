<template>
  <Modal :visible="visible" title="Configurar etapas do pipeline" @close="onCancel">
    <div class="psm-body">
      <p class="psm-hint">
        Arraste para reordenar, renomeie as etapas e adicione ou remova conforme necessário.
        A etapa de rejeição é fixa e sempre fica no final.
      </p>

      <ul class="psm-list" role="list" aria-label="Etapas do pipeline">
        <li
          v-for="(stage, idx) in editableStages"
          :key="stage.id"
          class="psm-item"
          :class="{ 'psm-item--drag-over': dragOverIdx === idx }"
          draggable="true"
          @dragstart="onDragStart(idx)"
          @dragenter.prevent="dragOverIdx = idx"
          @dragover.prevent="dragOverIdx = idx"
          @dragleave="onDragLeave(idx)"
          @drop.prevent="onDrop(idx)"
          @dragend="onDragEnd"
        >
          <span class="psm-handle" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="5" r="1" fill="currentColor" stroke="none"/>
              <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
              <circle cx="9" cy="19" r="1" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="5" r="1" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="19" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </span>

          <input
            v-model="stage.label"
            class="psm-input"
            type="text"
            :aria-label="`Nome da etapa ${idx + 1}`"
            maxlength="60"
            @input="onLabelInput(stage)"
          />

          <button
            class="psm-remove"
            type="button"
            :aria-label="`Remover etapa ${stage.label}`"
            title="Remover etapa"
            @click="requestRemove(idx)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </li>

        <!-- Rejected stage — locked, always last -->
        <li class="psm-item psm-item--locked" aria-label="Etapa de rejeição (fixa)">
          <span class="psm-handle psm-handle--locked" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            v-model="rejectedStage.label"
            class="psm-input"
            type="text"
            aria-label="Nome da etapa de rejeição"
            maxlength="60"
          />
          <span class="psm-locked-badge">Fixa</span>
        </li>
      </ul>

      <button class="psm-add" type="button" @click="addStage">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Adicionar etapa
      </button>

      <p v-if="validationError" class="psm-error" role="alert">{{ validationError }}</p>
    </div>

    <template #footer>
      <button class="btn btn-secondary" type="button" :disabled="saving" @click="onCancel">
        Cancelar
      </button>
      <button class="btn btn-primary" type="button" :disabled="saving" @click="onSave">
        <span v-if="saving" class="spinner spinner-sm" />
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </template>
  </Modal>

  <ConfirmDialog
    :visible="confirmRemoveIdx !== null"
    title="Remover etapa"
    :message="`Deseja remover a etapa &quot;${confirmRemoveLabel}&quot;? Candidatos nesta etapa não serão movidos automaticamente.`"
    confirm-label="Remover"
    @confirm="doRemove"
    @cancel="confirmRemoveIdx = null"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import { pipelineTemplates, type PipelineStage } from '../../utils/api';

const props = defineProps<{
  visible: boolean;
  stages: PipelineStage[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'saved', stages: PipelineStage[]): void;
  (e: 'cancel'): void;
}>();

// ── State ──────────────────────────────────────────────────────────────────

const saving = ref(false);
const validationError = ref<string | null>(null);

// Editable (non-rejected) stages
const editableStages = ref<PipelineStage[]>([]);
// The single rejected stage
const rejectedStage = ref<PipelineStage>({ id: 'rejected', label: 'Rejeitado', order: 999, isRejected: true });

// Drag state
const draggingIdx = ref<number | null>(null);
const dragOverIdx = ref<number | null>(null);

// Confirm remove state
const confirmRemoveIdx = ref<number | null>(null);
const confirmRemoveLabel = computed(() =>
  confirmRemoveIdx.value !== null ? (editableStages.value[confirmRemoveIdx.value]?.label ?? '') : ''
);

// ── Watchers ───────────────────────────────────────────────────────────────

watch(
  () => props.visible,
  (open) => {
    if (!open) return;
    // Deep-copy stages from prop so we don't mutate parent
    const allStages = [...props.stages].sort((a, b) => a.order - b.order);
    const rejected = allStages.find((s) => s.isRejected);
    const normal = allStages.filter((s) => !s.isRejected);
    editableStages.value = normal.map((s) => ({ ...s }));
    rejectedStage.value = rejected ? { ...rejected } : { id: 'rejected', label: 'Rejeitado', order: 999, isRejected: true };
    validationError.value = null;
    confirmRemoveIdx.value = null;
  },
);

// ── Drag & drop reorder ────────────────────────────────────────────────────

function onDragStart(idx: number) {
  draggingIdx.value = idx;
}

function onDragLeave(idx: number) {
  if (dragOverIdx.value === idx) dragOverIdx.value = null;
}

function onDragEnd() {
  draggingIdx.value = null;
  dragOverIdx.value = null;
}

function onDrop(targetIdx: number) {
  const fromIdx = draggingIdx.value;
  if (fromIdx === null || fromIdx === targetIdx) {
    dragOverIdx.value = null;
    return;
  }
  const list = [...editableStages.value];
  const [moved] = list.splice(fromIdx, 1);
  list.splice(targetIdx, 0, moved!);
  editableStages.value = list;
  dragOverIdx.value = null;
}

// ── Stage mutations ────────────────────────────────────────────────────────

function onLabelInput(stage: PipelineStage) {
  // Derive a stable id from label only when the stage was just created (id starts with '__new')
  if (stage.id.startsWith('__new')) {
    stage.id = slugify(stage.label) || stage.id;
  }
}

function slugify(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

function addStage() {
  const newOrder = editableStages.value.length;
  editableStages.value.push({
    id: `__new_${Date.now()}`,
    label: '',
    order: newOrder,
    isRejected: false,
  });
}

function requestRemove(idx: number) {
  confirmRemoveIdx.value = idx;
}

function doRemove() {
  if (confirmRemoveIdx.value === null) return;
  editableStages.value.splice(confirmRemoveIdx.value, 1);
  confirmRemoveIdx.value = null;
}

// ── Save ───────────────────────────────────────────────────────────────────

async function onSave() {
  if (saving.value) return;

  validationError.value = null;

  // Validate: at least 1 non-rejected stage
  if (editableStages.value.length === 0) {
    validationError.value = 'O pipeline precisa ter pelo menos uma etapa além da rejeição.';
    return;
  }

  // Validate: no empty labels
  const hasEmpty = editableStages.value.some((s) => !s.label.trim());
  if (hasEmpty) {
    validationError.value = 'Todas as etapas precisam ter um nome.';
    return;
  }

  // Validate: rejected label not empty
  if (!rejectedStage.value.label.trim()) {
    validationError.value = 'A etapa de rejeição precisa ter um nome.';
    return;
  }

  // Build ordered stages with correct `order` values
  const finalStages: PipelineStage[] = [
    ...editableStages.value.map((s, i) => ({
      ...s,
      id: s.id.startsWith('__new') ? (slugify(s.label) || `etapa_${i + 1}`) : s.id,
      label: s.label.trim(),
      order: i,
      isRejected: false,
    })),
    { ...rejectedStage.value, label: rejectedStage.value.label.trim(), order: editableStages.value.length, isRejected: true },
  ];

  saving.value = true;
  try {
    const updated = await pipelineTemplates.updateMine(finalStages);
    emit('saved', updated.stages);
    emit('update:visible', false);
  } catch {
    validationError.value = 'Erro ao salvar as etapas. Tente novamente.';
  } finally {
    saving.value = false;
  }
}

function onCancel() {
  emit('cancel');
  emit('update:visible', false);
}
</script>

<style scoped>
.psm-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.psm-hint {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: var(--leading-relaxed);
}

.psm-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.psm-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), background var(--transition-fast);
  cursor: grab;
}
.psm-item:active { cursor: grabbing; }
.psm-item--drag-over {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.06);
}
.psm-item--locked {
  cursor: default;
  background: var(--bg-tertiary);
  border-style: dashed;
  border-color: var(--border);
  opacity: 0.8;
}

.psm-handle {
  color: var(--text-light);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  cursor: grab;
}
.psm-handle--locked {
  cursor: default;
  color: var(--text-light);
  opacity: 0.6;
}

.psm-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
}
.psm-item--locked .psm-input {
  color: var(--text-secondary);
}

.psm-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-light);
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: color var(--transition-fast), background var(--transition-fast);
}
.psm-remove:hover {
  color: var(--status-rejected-text);
  background: var(--status-rejected-bg);
}

.psm-locked-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-light);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.psm-add {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px dashed var(--border-dark);
  background: none;
  color: var(--primary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  align-self: flex-start;
}
.psm-add:hover {
  background: rgba(37, 99, 235, 0.06);
  border-color: var(--primary);
}

.psm-error {
  font-size: var(--text-sm);
  color: var(--status-rejected-text);
  background: var(--status-rejected-bg);
  border: 1px solid var(--status-rejected-text);
  border-radius: var(--radius-md);
  padding: 8px 12px;
  margin: 0;
}
</style>
