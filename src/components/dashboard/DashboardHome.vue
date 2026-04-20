<template>
  <DashboardLayout>
    <div>
      <!-- ── Header ─────────────────────────────────────────────────── -->
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title" v-if="profile">Olá, {{ profile.firstName }} 👋</h1>
          <h1 class="db-section-title" v-else>Carregando...</h1>
          <p class="db-section-subtitle">Bem-vindo ao seu painel de controle</p>
        </div>
        <a
          v-if="profile?.username"
          :href="`/perfil/${profile.username}`"
          target="_blank"
          class="btn btn-primary dh-view-profile-btn"
        >
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          Ver Perfil Público
        </a>
      </div>

      <!-- ── Loading skeleton ───────────────────────────────────────── -->
      <div v-if="loading" class="dh-skeleton-wrapper">
        <div class="db-card dh-skeleton-card">
          <div class="dh-skeleton dh-skeleton-title"></div>
          <div class="dh-skeleton dh-skeleton-bar"></div>
          <div class="dh-skeleton dh-skeleton-input"></div>
        </div>
      </div>

      <!-- ── Onboarding wizard ──────────────────────────────────────── -->
      <div v-else-if="!wizardComplete" class="db-card dh-wizard-card">
        <div class="dh-wizard-heading">
          <span class="dh-wizard-icon">✨</span>
          Vamos deixar seu perfil incrível
        </div>

        <!-- Progress bar — desktop -->
        <div class="dh-progress-bar" aria-label="Progresso do onboarding">
          <button
            v-for="(step, idx) in steps"
            :key="idx"
            class="dh-progress-segment"
            :class="{
              'dh-seg-done': stepComplete(idx),
              'dh-seg-current': !stepComplete(idx) && idx === currentStep,
              'dh-seg-pending': !stepComplete(idx) && idx !== currentStep,
            }"
            :title="step.label"
            :aria-label="`Passo ${idx + 1}: ${step.label}`"
            @click="goToStep(idx)"
            :disabled="!stepComplete(idx) && idx > currentStep"
          ></button>
        </div>

        <!-- Progress counter — mobile -->
        <div class="dh-progress-counter">
          {{ currentStep + 1 }} / {{ steps.length }}
        </div>

        <!-- Step body -->
        <div class="dh-wizard-body">
          <div class="dh-wizard-step-label">
            <span class="dh-step-icon">{{ steps[currentStep].icon }}</span>
            <span class="dh-step-text">{{ steps[currentStep].label }}</span>
          </div>

          <!-- City select step (step 2) -->
          <template v-if="currentStep === 2">
            <div class="dh-wizard-input-row">
              <div style="flex: 1; min-width: 200px;">
                <CitySelect
                  v-model="citySelectValue"
                  placeholder="Buscar cidade..."
                />
              </div>
              <button
                class="btn btn-primary dh-wizard-btn-continue"
                :disabled="saving || !citySelectValue"
                @click="saveAndAdvance"
              >
                <span v-if="saving" class="spinner spinner-sm"></span>
                <span v-else>Continuar</span>
              </button>
              <button
                class="dh-wizard-btn-skip"
                :disabled="saving"
                @click="skipStep"
              >
                Pular
              </button>
            </div>
          </template>

          <!-- Text / Tel input steps (0-1) -->
          <template v-else-if="currentStep < 3">
            <div class="dh-wizard-input-row">
              <input
                ref="stepInputRef"
                v-model="stepValue"
                :type="steps[currentStep].inputType"
                :placeholder="steps[currentStep].placeholder"
                class="dh-wizard-input"
                @keydown.enter.prevent="saveAndAdvance"
              />
              <button
                class="btn btn-primary dh-wizard-btn-continue"
                :disabled="saving"
                @click="saveAndAdvance"
              >
                <span v-if="saving" class="spinner spinner-sm"></span>
                <span v-else>Continuar</span>
              </button>
              <button
                class="dh-wizard-btn-skip"
                :disabled="saving"
                @click="skipStep"
              >
                Pular
              </button>
            </div>
          </template>

          <!-- Navigation steps (9 = Formação) -->
          <template v-else>
            <div class="dh-wizard-nav-step">
              <a
                :href="steps[currentStep].navHref"
                class="btn btn-primary"
              >
                {{ steps[currentStep].navLabel }}
              </a>
              <button class="dh-wizard-btn-skip" @click="skipStep">Pular</button>
              <p class="dh-wizard-nav-hint">
                Ao retornar, esse passo será marcado automaticamente como concluído.
              </p>
            </div>
          </template>
        </div>
      </div>

      <!-- ── Atalhos (shown when wizard is done) ───────────────────── -->
      <div v-else class="db-card dh-shortcuts-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Atalhos</div>
        <div class="dh-shortcuts-grid">
          <a href="/dashboard/curriculos" class="dh-shortcut">
            <span class="dh-shortcut-icon">📋</span>
            <span class="dh-shortcut-label">Currículos</span>
          </a>
          <a href="/dashboard/portfolio/novo" class="dh-shortcut">
            <span class="dh-shortcut-icon">📝</span>
            <span class="dh-shortcut-label">Publicar</span>
          </a>
          <a href="/dashboard/perfil" class="dh-shortcut">
            <span class="dh-shortcut-icon">📍</span>
            <span class="dh-shortcut-label">Localização</span>
          </a>
          <a href="/dashboard/perfil" class="dh-shortcut">
            <span class="dh-shortcut-icon">👤</span>
            <span class="dh-shortcut-label">Perfil</span>
          </a>
        </div>
      </div>

      <!-- ── Publicações ────────────────────────────────────────────── -->
      <div class="db-card">
        <div class="db-card-title" style="display: flex; justify-content: space-between; align-items: center;">
          Publicações
          <a href="/dashboard/portfolio/novo" class="btn btn-primary btn-sm">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Nova Publicação
          </a>
        </div>

        <div v-if="loadingItems" class="loading-center"><div class="spinner spinner-md"></div></div>

        <div v-else-if="recentItems.length === 0" class="dh-empty-publications">
          <span class="dh-empty-icon">📝</span>
          <p class="dh-empty-text">Você ainda não tem publicações.</p>
          <a href="/dashboard/portfolio/novo" class="btn btn-accent">
            Criar sua primeira Publicação
          </a>
        </div>

        <div v-else class="db-list">
          <div
            v-for="item in recentItems"
            :key="item.id"
            class="db-list-item"
            style="padding: var(--spacing-sm) var(--spacing-md);"
          >
            <div class="db-list-thumb" v-if="item.coverImageUrl">
              <img :src="item.coverImageUrl" :alt="item.title" loading="lazy" />
            </div>
            <div class="db-list-info">
              <div class="db-list-title dh-pub-title">{{ item.title }}</div>
              <div class="db-list-meta">
                <StatusBadge :status="item.status" />
                <span>{{ formatDate(item.updatedAt || item.createdAt) }}</span>
              </div>
            </div>
            <div class="db-list-actions">
              <a
                v-if="item.status === 'PUBLISHED'"
                :href="`/portfolio/${item.slug}`"
                target="_blank"
                class="btn btn-ghost btn-sm"
                title="Ver publicado"
              >
                <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
              </a>
              <a :href="`/dashboard/portfolio/${item.slug}`" class="btn btn-ghost btn-sm">Editar</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Completion modal ───────────────────────────────────────────── -->
    <Modal :visible="showCompletionModal" title="Tudo pronto! 🎉" @close="closeCompletionModal">
      <div class="dh-completion-modal">
        <p class="dh-completion-text">Você completou seu perfil com sucesso!</p>
        <div class="dh-completion-illustration" aria-hidden="true">🎊</div>
        <a href="/dashboard/portfolio/novo" class="btn btn-primary dh-completion-cta">
          Criar sua primeira Publicação
        </a>
      </div>
    </Modal>


    <Toast ref="toastRef" />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import Modal from '../ui/Modal.vue';
import Toast from '../ui/Toast.vue';
import CitySelect from '../ui/CitySelect.vue';
import {
  getPortfolioItems,
  getFullProfile,
  updateProfile,
  getCVList,
  getEducation,
} from '../../utils/api';
import type { PortfolioItem, FullProfile } from '../../utils/api';

// ── Refs ────────────────────────────────────────────────────────────────────

const profile = ref<FullProfile | null>(null);
const recentItems = ref<PortfolioItem[]>([]);
const loading = ref(true);
const loadingItems = ref(true);
const saving = ref(false);
const showCompletionModal = ref(false);

const hasCVs = ref(false);
const hasEducation = ref(false);

const currentStep = ref(0);
const stepValue = ref('');
const stepInputRef = ref<HTMLInputElement | null>(null);
const citySelectValue = ref('');
/** Passos confirmados manualmente (save/skip) nesta sessão — garante segmento verde
 *  mesmo quando a resposta do backend demora ou não reflete imediatamente o campo. */
const visitedSteps = ref<Set<number>>(new Set());

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
// Prevents the completion modal from appearing if the profile was already
// complete when the page loaded (modal should only appear after user finishes
// the last step during an active session).
const initialWizardComplete = ref(false);


// ── Step definitions ─────────────────────────────────────────────────────────

interface WizardStep {
  icon: string;
  label: string;
  inputType?: string;
  placeholder?: string;
  navHref?: string;
  navLabel?: string;
  /** Returns true if the step is already complete given the current data. */
  isComplete: () => boolean;
  /** Persist the current stepValue to the backend. */
  save?: () => Promise<void>;
}

const steps: WizardStep[] = [
  {
    icon: '💼',
    label: 'Sua principal atividade é',
    inputType: 'text',
    placeholder: 'Ex: Designer, Advogado, Engenheiro...',
    isComplete: () => !!profile.value?.profession,
    save: async () => {
      if (!stepValue.value.trim()) return;
      const updated = await updateProfile({ profession: stepValue.value.trim() });
      profile.value = updated;
    },
  },
  {
    icon: '📞',
    label: 'Seu melhor telefone',
    inputType: 'tel',
    placeholder: 'Ex: (11) 99999-9999',
    isComplete: () => !!profile.value?.phone,
    save: async () => {
      if (!stepValue.value.trim()) return;
      const updated = await updateProfile({ phone: stepValue.value.trim() });
      profile.value = updated;
    },
  },
  {
    icon: '📍',
    label: 'Sua Localização',
    isComplete: () => !!profile.value?.location,
    save: async () => {
      if (!citySelectValue.value.trim()) return;
      const updated = await updateProfile({ location: citySelectValue.value.trim() });
      profile.value = updated;
    },
  },
  {
    icon: '📋',
    label: 'Importar Currículo',
    navHref: '/dashboard/curriculos',
    navLabel: 'Ir para Currículos →',
    isComplete: () => hasCVs.value,
  },
  {
    icon: '🎓',
    label: 'Histórico Acadêmico / Cursos',
    navHref: '/dashboard/formacao',
    navLabel: 'Ir para Formação →',
    isComplete: () => hasEducation.value,
  },
];

// ── Computed ─────────────────────────────────────────────────────────────────

const completedSteps = computed(() => steps.map((s) => s.isComplete()));

const wizardComplete = computed(() => steps.every((_, idx) => stepComplete(idx)));

// ── Helpers ──────────────────────────────────────────────────────────────────

function stepComplete(idx: number): boolean {
  return (completedSteps.value[idx] ?? false) || visitedSteps.value.has(idx);
}

function firstIncompleteStep(): number {
  for (let i = 0; i < steps.length; i++) {
    if (!stepComplete(i)) return i;
  }
  return steps.length - 1;
}

function prefillInput() {
  if (currentStep.value >= 3) {
    stepValue.value = '';
    return;
  }
  const step = currentStep.value;
  const p = profile.value;
  if (!p) { stepValue.value = ''; return; }
  const map: Record<number, string> = {
    0: p.profession ?? '',
    1: p.phone ?? '',
    2: p.location ?? '',
  };
  stepValue.value = map[step] ?? '';
  if (step === 2) {
    citySelectValue.value = p.location ?? '';
  }
}

async function focusInput() {
  await nextTick();
  stepInputRef.value?.focus();
}

function goToStep(idx: number) {
  if (!stepComplete(idx) && idx > currentStep.value) return;
  currentStep.value = idx;
  prefillInput();
  if (idx < 3) focusInput();
}

async function saveAndAdvance() {
  if (saving.value) return;
  saving.value = true;
  try {
    const step = steps[currentStep.value];
    if (step.save) {
      await step.save();
    }
    // Garante segmento verde mesmo se a resposta do backend não tiver reflexo imediato
    visitedSteps.value = new Set(visitedSteps.value).add(currentStep.value);
    advanceToNext();
  } catch {
    toastRef.value?.show('Erro ao salvar. Tente novamente.', 'error');
  } finally {
    saving.value = false;
  }
}

function skipStep() {
  // Marca como visitado para que o segmento fique verde (passo foi pulado conscientemente)
  visitedSteps.value = new Set(visitedSteps.value).add(currentStep.value);
  advanceToNext();
}

function advanceToNext() {
  // After saving/skipping, find next incomplete step
  let next = currentStep.value + 1;
  while (next < steps.length && stepComplete(next)) {
    next++;
  }
  if (next >= steps.length) {
    // Todos os passos concluídos (save + navegacionais reais)
    if (wizardComplete.value) {
      showCompletionModal.value = true;
    }
    return;
  }
  currentStep.value = next;
  prefillInput();
  if (next < 3) focusInput();
}

function closeCompletionModal() {
  showCompletionModal.value = false;
}


function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Mount ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    const [profileData, cvList, educationList] = await Promise.all([
      getFullProfile(),
      getCVList().catch(() => []),
      getEducation().catch(() => []),
    ]);

    profile.value = profileData;
    hasCVs.value = cvList.length > 0;
    hasEducation.value = educationList.length > 0;

    // Set current step to first incomplete
    currentStep.value = firstIncompleteStep();
    prefillInput();
    if (currentStep.value < 3 && !wizardComplete.value) {
      focusInput();
    }

    // Record whether wizard was already complete on load so the watcher
    // knows not to pop the completion modal automatically.
    initialWizardComplete.value = wizardComplete.value;
  } catch {
    // silently ignore auth errors (DashboardLayout handles redirect)
  } finally {
    loading.value = false;
  }

  // Load portfolio items independently
  try {
    const userId = profile.value?.id ?? '';
    if (!userId) return;
    const [drafts, published] = await Promise.all([
      getPortfolioItems({ limit: 10, status: 'DRAFT', userId }),
      getPortfolioItems({ limit: 10, status: 'PUBLISHED', userId }),
    ]);
    const all = [
      ...drafts.data.map(i => ({ ...i, status: 'DRAFT' as const })),
      ...published.data.map(i => ({ ...i, status: 'PUBLISHED' as const })),
    ].sort((a, b) =>
      new Date(b.updatedAt || b.createdAt || 0).getTime() -
      new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
    recentItems.value = all.slice(0, 5);
  } catch {
    // silently ignore
  } finally {
    loadingItems.value = false;
  }
});

// Re-focus input when step changes
watch(currentStep, (val) => {
  if (val < 3) focusInput();
});

// Show the completion modal only when the user finishes the last step
// during this session — not if the wizard was already complete on load.
watch(wizardComplete, (done) => {
  if (done && !showCompletionModal.value && !loading.value && !initialWizardComplete.value) {
    showCompletionModal.value = true;
  }
});
</script>

<style scoped>
/* ── View Profile button ─────────────────────────────────────────────────── */
.dh-view-profile-btn {
  white-space: nowrap;
}

/* ── Skeleton ────────────────────────────────────────────────────────────── */
.dh-skeleton-wrapper {
  margin-bottom: var(--spacing-lg);
}
.dh-skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.dh-skeleton {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}
.dh-skeleton-title { height: 20px; width: 60%; }
.dh-skeleton-bar   { height: 12px; width: 100%; }
.dh-skeleton-input { height: 44px; width: 100%; }
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

/* ── Wizard card ─────────────────────────────────────────────────────────── */
.dh-wizard-card {
  margin-bottom: var(--spacing-lg);
}

.dh-wizard-heading {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
}
.dh-wizard-icon { font-size: 20px; }

/* Progress bar — desktop */
.dh-progress-bar {
  display: flex;
  gap: 4px;
  margin-bottom: var(--spacing-md);
}
.dh-progress-segment {
  flex: 1;
  height: 8px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  padding: 0;
}
.dh-progress-segment:disabled {
  cursor: default;
}
.dh-seg-done    { background: #22c55e; }
.dh-seg-current { background: var(--accent); }
.dh-seg-pending { background: var(--bg-tertiary); }
.dh-progress-segment:not(:disabled):hover {
  opacity: 0.8;
  transform: scaleY(1.3);
}

/* Progress counter — mobile only */
.dh-progress-counter {
  display: none;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
}

/* Step body */
.dh-wizard-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dh-wizard-step-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.dh-step-icon {
  font-size: 24px;
  flex-shrink: 0;
}
.dh-step-text {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}

/* Input row */
.dh-wizard-input-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.dh-wizard-input {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--bg-primary);
  transition: border-color var(--transition-fast);
  outline: none;
}
.dh-wizard-input:focus {
  border-color: var(--primary);
}
.dh-wizard-btn-continue {
  white-space: nowrap;
  min-width: 100px;
}
.dh-wizard-btn-skip {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: color var(--transition-fast);
  white-space: nowrap;
}
.dh-wizard-btn-skip:hover { color: var(--text-primary); }
.dh-wizard-btn-skip:disabled { opacity: 0.5; cursor: default; }

/* Navigation step (steps 8 & 9) */
.dh-wizard-nav-step {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.dh-wizard-nav-hint {
  width: 100%;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
}

/* ── Shortcuts ───────────────────────────────────────────────────────────── */
.dh-shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
.dh-shortcut {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-sm) var(--spacing-xs);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-primary);
  background: var(--bg-secondary);
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.dh-shortcut:hover {
  background: #eff6ff;
  border-color: var(--primary);
}
.dh-shortcut-icon { font-size: 20px; line-height: 1; }
.dh-shortcut-label {
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* ── Publications empty state ────────────────────────────────────────────── */
.dh-empty-publications {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-lg);
  text-align: center;
}
.dh-empty-icon { font-size: 40px; }
.dh-empty-text {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  margin: 0;
}

/* Publication title ellipsis */
.dh-pub-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

/* ── Wizard hint (URL preview for social steps) ─────────────────────────── */
.dh-wizard-hint {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
  margin-top: 4px;
  word-break: break-all;
}


/* ── Completion modal ────────────────────────────────────────────────────── */
.dh-completion-modal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
  text-align: center;
}
.dh-completion-text {
  font-size: var(--text-base);
  color: var(--text-secondary);
  margin: 0;
}
.dh-completion-illustration {
  font-size: 64px;
  line-height: 1;
}
.dh-completion-cta {
  width: 100%;
}

/* ── Accent button (yellow) ──────────────────────────────────────────────── */
:deep(.btn-accent) {
  background: var(--accent);
  color: #fff;
  border: none;
}
:deep(.btn-accent:hover) {
  background: #d97706;
}

/* ── Mobile ──────────────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  /* Header: stack vertically */
  .dh-view-profile-btn {
    width: 100%;
    justify-content: center;
  }

  /* Hide segment bar, show counter */
  .dh-progress-bar {
    display: none;
  }
  .dh-progress-counter {
    display: block;
  }

  /* Input row: stack vertically */
  .dh-wizard-input-row {
    flex-direction: column;
    align-items: stretch;
  }
  .dh-wizard-input {
    min-width: 0;
    width: 100%;
  }
  .dh-wizard-btn-continue {
    width: 100%;
  }
  .dh-wizard-btn-skip {
    text-align: center;
  }

  /* Shortcuts: 2x2 grid */
  .dh-shortcuts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Publication title: shorter max-width */
  .dh-pub-title {
    max-width: 160px;
  }
}
</style>
