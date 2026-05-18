<template>
  <div class="cp-root">
    <header class="cp-header">
      <div class="cp-vaga-info">
        <div class="cp-vaga-title">{{ vagaTitle }}</div>
        <div class="cp-vaga-sub">{{ subline }}</div>
      </div>
      <div class="cp-actions">
        <div class="cp-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            v-model="query"
            type="text"
            placeholder="Buscar candidato..."
            aria-label="Buscar candidato"
          />
        </div>
        <button class="cp-link" type="button" @click="showRejected = !showRejected">
          {{ showRejected ? 'Ocultar' : 'Ver' }} perfis rejeitados ({{ rejectedCount }})
        </button>
        <button
          class="cp-btn-settings"
          type="button"
          :disabled="loadingStages"
          aria-label="Configurar etapas do pipeline"
          @click="settingsOpen = true"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Configurar etapas
        </button>
      </div>
    </header>

    <!-- Mobile-only stage selector (horizontally scrollable pills) -->
    <nav class="cp-stage-pills" role="tablist" aria-label="Etapas do pipeline">
      <button
        v-for="stage in visibleStages"
        :key="stage.id"
        type="button"
        role="tab"
        :aria-selected="stage.id === activeStageId"
        class="cp-pill"
        :class="{ 'cp-pill--active': stage.id === activeStageId }"
        @click="activeStageId = stage.id"
      >
        <span class="cp-pill-label">{{ stage.label }}</span>
        <span class="cp-pill-count">{{ groupedBy(stage.id).length }}</span>
      </button>
    </nav>

    <div class="cp-scroller">
      <div class="cp-columns" :style="{ gridTemplateColumns: `repeat(${visibleStages.length}, 260px)` }">
        <section
          v-for="stage in visibleStages"
          :key="stage.id"
          class="cp-col"
          :class="{ 'cp-col--drag-over': dragOverStage === stage.id }"
          :data-active="stage.id === activeStageId ? 'true' : 'false'"
          role="region"
          :aria-label="`Coluna ${stage.label}: ${groupedBy(stage.id).length} candidatos`"
          @dragenter.prevent="dragOverStage = stage.id"
          @dragover.prevent="dragOverStage = stage.id"
          @dragleave="onDragLeave(stage.id)"
          @drop.prevent="onDrop(stage)"
        >
          <header class="cp-col-head">
            <span class="cp-col-title">{{ stage.label }}</span>
            <span class="cp-col-count" :class="{ 'cp-col-count--active': stage.id === 'para_analisar' }">
              {{ groupedBy(stage.id).length }}
            </span>
          </header>

          <div class="cp-col-body">
            <CandidateCard
              v-for="c in groupedBy(stage.id)"
              :key="c.id"
              :candidate="c"
              :draggable="true"
              @open="onOpen"
              @drag-start="onDragStart"
              @drag-end="onDragEnd"
            />
            <div v-if="groupedBy(stage.id).length === 0" class="cp-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4"><path d="M12 5v14M5 12h14"/></svg>
              <span>Nenhum candidato</span>
            </div>
          </div>
        </section>
      </div>
    </div>

    <transition name="cp-toast">
      <div v-if="toast" class="cp-toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        {{ toast }}
        <button class="cp-toast-undo" type="button" @click="undo">Desfazer</button>
      </div>
    </transition>

    <CandidateDrawer
      :candidate="selectedCandidate"
      :stages="allStages"
      :vaga-title="vagaTitle"
      :recruiter-name="recruiterName"
      @close="selectedCandidate = null"
      @advance="advanceStage"
      @reject="rejectCandidate"
    />

    <PipelineSettingsModal
      v-model:visible="settingsOpen"
      :stages="allStages"
      @saved="onStagesSaved"
      @cancel="settingsOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import CandidateCard from './CandidateCard.vue';
import CandidateDrawer from './CandidateDrawer.vue';
import PipelineSettingsModal from './PipelineSettingsModal.vue';
import {
  STAGE_LABELS,
  VISIBLE_STAGES,
  type MockCandidate,
  type PipelineStage as MockPipelineStageId,
} from '../../data/mock-recrutador';
import { pipelineTemplates, updateApplicationStatus, type PipelineStage } from '../../utils/api';

const props = defineProps<{
  vagaTitle: string;
  subline?: string;
  candidates: MockCandidate[];
  recruiterName?: string;
}>();

// ── Pipeline stages ──────────────────────────────────────────────────────────

/** Fallback stages built from mock constants (used when API is unreachable) */
function buildFallbackStages(): PipelineStage[] {
  const all: MockPipelineStageId[] = [...VISIBLE_STAGES, 'rejeitado'];
  return all.map((id, i) => ({
    id,
    label: STAGE_LABELS[id],
    order: i,
    isRejected: id === 'rejeitado',
  }));
}

const allStages = ref<PipelineStage[]>(buildFallbackStages());
const loadingStages = ref(false);

/** Stages shown as columns — non-rejected by default, plus rejected when toggled on */
const visibleStages = computed(() => {
  const sorted = allStages.value.slice().sort((a, b) => a.order - b.order);
  return showRejected.value ? sorted : sorted.filter((s) => !s.isRejected);
});

onMounted(async () => {
  loadingStages.value = true;
  try {
    const template = await pipelineTemplates.getMine();
    allStages.value = template.stages.slice().sort((a, b) => a.order - b.order);
  } catch {
    // Keep mock fallback; silently degrade on network error
  } finally {
    loadingStages.value = false;
  }
});

// ── Candidates ───────────────────────────────────────────────────────────────

// Note: MockCandidate.stage is typed as the mock union string, which aligns
// with PipelineStage.id (both are plain strings at runtime).
const items = ref<MockCandidate[]>([...props.candidates]);

const query = ref('');
const showRejected = ref(false);
const activeStageId = ref<string>('');

// Keep activeStageId valid: default to first visible stage, reset if current stage disappears
watch(
  visibleStages,
  (stages) => {
    if (!stages.length) return;
    if (!activeStageId.value || !stages.some((s) => s.id === activeStageId.value)) {
      activeStageId.value = stages[0]!.id;
    }
  },
  { immediate: true }
);
const dragOverStage = ref<string | null>(null);
const draggingId = ref<string | null>(null);
const selectedCandidate = ref<MockCandidate | null>(null);
const toast = ref<string | null>(null);
const lastMove = ref<{ id: string; from: string } | null>(null);
const settingsOpen = ref(false);

const rejectedCount = computed(() =>
  items.value.filter((c) => {
    const stage = allStages.value.find((s) => s.id === c.stage);
    return stage?.isRejected ?? c.stage === 'rejeitado';
  }).length
);

function groupedBy(stageId: string): MockCandidate[] {
  return items.value
    .filter((c) => c.stage === stageId)
    .filter((c) => {
      if (!query.value.trim()) return true;
      const q = query.value.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
}

// ── Drag & drop ──────────────────────────────────────────────────────────────

function onDragStart(c: MockCandidate) {
  draggingId.value = c.id;
}
function onDragEnd() {
  draggingId.value = null;
  dragOverStage.value = null;
}
function onDragLeave(stageId: string) {
  if (dragOverStage.value === stageId) dragOverStage.value = null;
}
async function onDrop(stage: PipelineStage) {
  if (!draggingId.value) return;
  const cand = items.value.find((c) => c.id === draggingId.value);
  if (!cand || cand.stage === stage.id) {
    dragOverStage.value = null;
    return;
  }
  const from = cand.stage;
  // Optimistic update
  cand.stage = stage.id;
  lastMove.value = { id: cand.id, from };
  flashToast(`${cand.fullName} → ${stage.label}`);
  dragOverStage.value = null;

  try {
    await updateApplicationStatus(cand.id, stage.id, stage.isRejected ?? false);
  } catch {
    // Roll back on API error
    const target = items.value.find((c) => c.id === cand.id);
    if (target) target.stage = from;
    lastMove.value = null;
    flashToast('Erro ao mover candidato. Tente novamente.');
  }
}

// ── Actions ──────────────────────────────────────────────────────────────────

function onOpen(c: MockCandidate) {
  selectedCandidate.value = c;
}

function advanceStage(c: MockCandidate) {
  const sorted = visibleStages.value;
  const idx = sorted.findIndex((s) => s.id === c.stage);
  if (idx === -1 || idx >= sorted.length - 1) return;
  const target = items.value.find((x) => x.id === c.id);
  if (!target) return;
  const nextStage = sorted[idx + 1];
  if (!nextStage) return;
  const from = target.stage;
  target.stage = nextStage.id;
  lastMove.value = { id: target.id, from };
  flashToast(`${target.fullName} → ${nextStage.label}`);
  selectedCandidate.value = target;

  updateApplicationStatus(target.id, nextStage.id, nextStage.isRejected ?? false).catch(() => {
    const rollback = items.value.find((x) => x.id === target.id);
    if (rollback) rollback.stage = from;
    lastMove.value = null;
  });
}

function rejectCandidate(c: MockCandidate) {
  const rejectedStage = allStages.value.find((s) => s.isRejected);
  if (!rejectedStage) return;
  const target = items.value.find((x) => x.id === c.id);
  if (!target) return;
  const from = target.stage;
  target.stage = rejectedStage.id;
  lastMove.value = { id: target.id, from };
  flashToast(`${target.fullName} rejeitado`);
  selectedCandidate.value = null;

  updateApplicationStatus(target.id, rejectedStage.id, true).catch(() => {
    const rollback = items.value.find((x) => x.id === target.id);
    if (rollback) rollback.stage = from;
    lastMove.value = null;
  });
}

function flashToast(msg: string) {
  toast.value = msg;
  setTimeout(() => { toast.value = null; }, 4000);
}

function undo() {
  if (!lastMove.value) return;
  const target = items.value.find((x) => x.id === lastMove.value!.id);
  if (target) {
    target.stage = lastMove.value.from;
    flashToast('Movimento desfeito');
  }
  lastMove.value = null;
}

// ── Settings modal ────────────────────────────────────────────────────────────

function onStagesSaved(newStages: PipelineStage[]) {
  allStages.value = newStages.slice().sort((a, b) => a.order - b.order);
  settingsOpen.value = false;
}
</script>

<style scoped>
.cp-root {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.cp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.cp-vaga-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}
.cp-vaga-sub {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 2px;
}
.cp-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.cp-search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-light);
}
.cp-search input {
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  min-width: 180px;
}
.cp-link {
  border: none;
  background: none;
  color: var(--primary);
  font-size: var(--text-sm);
  cursor: pointer;
  font-family: var(--font-sans);
}
.cp-link:hover { text-decoration: underline; }

.cp-btn-settings {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition-fast), color var(--transition-fast), background var(--transition-fast);
}
.cp-btn-settings:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(37, 99, 235, 0.04);
}
.cp-btn-settings:disabled {
  opacity: 0.5;
  cursor: default;
}

.cp-scroller {
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
}
.cp-columns {
  display: grid;
  gap: var(--spacing-md);
}
.cp-col {
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  min-height: 320px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  border: 2px dashed transparent;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.cp-col--drag-over {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.05);
}
.cp-col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}
.cp-col-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.cp-col-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.cp-col-count--active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}
.cp-col-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
}
.cp-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xl) var(--spacing-sm);
  border: 1px dashed var(--border-dark);
  border-radius: var(--radius-md);
  color: var(--text-light);
  font-size: var(--text-xs);
  background: var(--bg-primary);
}

.cp-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: var(--text-primary);
  color: #ffffff;
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-popover);
}
.cp-toast-undo {
  background: transparent;
  border: none;
  color: #93c5fd;
  cursor: pointer;
  font-weight: 600;
  font-family: var(--font-sans);
  padding: 2px 8px;
  text-decoration: underline;
}
.cp-toast-enter-active, .cp-toast-leave-active {
  transition: opacity var(--transition-base), transform var(--transition-base);
}
.cp-toast-enter-from, .cp-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 12px);
}

/* Stage pills (mobile-only stage selector) */
.cp-stage-pills { display: none; }
.cp-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.cp-pill-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}
.cp-pill--active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}
.cp-pill--active .cp-pill-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

@media (max-width: 768px) {
  .cp-header { gap: var(--spacing-xs); }
  .cp-vaga-title { font-size: var(--text-base); }
  .cp-actions {
    width: 100%;
    gap: 8px;
  }
  .cp-search {
    flex: 1 1 100%;
    order: -1;
  }
  .cp-search input { min-width: 0; width: 100%; }
  .cp-link, .cp-btn-settings { font-size: 12px; padding: 6px 10px; }

  .cp-stage-pills {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 4px 4px 8px;
    margin: 0 calc(var(--spacing-sm) * -1);
    padding-left: var(--spacing-sm);
    padding-right: var(--spacing-sm);
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
  }
  .cp-stage-pills::-webkit-scrollbar { display: none; }
  .cp-pill { scroll-snap-align: start; }

  .cp-scroller {
    overflow: visible;
    padding-bottom: 0;
  }
  .cp-columns {
    display: block !important;
    grid-template-columns: none !important;
  }
  .cp-col {
    display: none;
    background: transparent;
    padding: 0;
    min-height: 240px;
    border: none;
  }
  .cp-col[data-active="true"] {
    display: flex;
  }
  .cp-col-head {
    padding: 0 0 var(--spacing-xs);
    border-bottom: 1px solid var(--border);
  }
  .cp-col-title { font-size: var(--text-base); }
  .cp-empty {
    background: var(--bg-tertiary);
    padding: var(--spacing-lg) var(--spacing-md);
  }
  .cp-toast {
    left: 12px;
    right: 12px;
    bottom: 12px;
    transform: none;
    width: auto;
  }
  .cp-toast-enter-from, .cp-toast-leave-to {
    opacity: 0;
    transform: translateY(12px);
  }
}
</style>
