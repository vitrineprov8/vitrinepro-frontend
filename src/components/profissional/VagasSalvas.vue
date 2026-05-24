<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import Modal from '../ui/Modal.vue';
import ApplyVagaModal from '../vagas/ApplyVagaModal.vue';
import SwipeCard from './SwipeCard.vue';
import SwipeTutorialOverlay from './SwipeTutorialOverlay.vue';
import {
  savedVagas,
  getMyApplications,
  applications,
  getErrorMessage,
} from '../../utils/api';
import type { SavedVagaItem, VagaApplication, Vaga, VagaSegment } from '../../utils/api';

// ─── State ────────────────────────────────────────────────────────────────────

type ActiveTab = 'salvas' | 'candidatadas';

const toast = ref<InstanceType<typeof Toast>>();
const activeTab = ref<ActiveTab>('salvas');

const loadingSaved = ref(false);
const loadingApps = ref(false);

const saved = ref<SavedVagaItem[]>([]);
const apps = ref<VagaApplication[]>([]);

// Confirm remove from saved
const confirmRemoveSaved = ref(false);
const removeSavedTarget = ref<SavedVagaItem | null>(null);
const removingId = ref<string | null>(null);

// Confirm remove application (candidatura)
const confirmRemoveApp = ref(false);
const removeAppTarget = ref<VagaApplication | null>(null);
const removingAppId = ref<string | null>(null);

// Apply modal
const applyModalOpen = ref(false);
const applyVaga = ref<Vaga | null>(null);
// Track which saved item originated the apply action (for removal after apply)
const applySavedItemId = ref<string | null>(null);

// Undo toast for swipe-left
const undoTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const undoItem = ref<SavedVagaItem | null>(null);
const showUndo = ref(false);

// Closed vagas modal
const closedModalOpen = ref(false);
const closedSaved = ref<SavedVagaItem[]>([]);
const closedApps = ref<VagaApplication[]>([]);

// Viewport detection
const isMobile = ref(false);

// ─── Segment helpers ──────────────────────────────────────────────────────────

const SEGMENT_MAP: Record<VagaSegment, { label: string; color: string }> = {
  TECNOLOGIA:             { label: 'Tecnologia',       color: '#2563eb' },
  COMERCIO_VENDAS:        { label: 'Comércio e Vendas', color: '#7c3aed' },
  FINANCAS_CONTABILIDADE: { label: 'Finanças',          color: '#0891b2' },
  ADMINISTRATIVO:         { label: 'Administrativo',    color: '#059669' },
  LOGISTICA_TRANSPORTE:   { label: 'Logistica',         color: '#d97706' },
  RH:                     { label: 'Recursos Humanos',  color: '#db2777' },
  SAUDE:                  { label: 'Saude',             color: '#16a34a' },
  EDUCACAO:               { label: 'Educacao',          color: '#9333ea' },
  MARKETING:              { label: 'Marketing',         color: '#ea580c' },
  JURIDICO:               { label: 'Juridico',          color: '#4f46e5' },
  OUTROS:                 { label: 'Outros',            color: '#6b7280' },
};

function segmentLabel(s: VagaSegment | null | undefined): string {
  return s ? (SEGMENT_MAP[s]?.label ?? s) : '';
}
function segmentColor(s: VagaSegment | null | undefined): string {
  return s ? (SEGMENT_MAP[s]?.color ?? '#6b7280') : '#6b7280';
}

function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `ha ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `ha ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `ha ${days} dia${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `ha ${weeks} semana${weeks > 1 ? 's' : ''}`;
}

function goToVaga(slug: string | undefined | null) {
  if (!slug) return;
  window.location.href = `/vaga/${slug}`;
}

function pipelineStageLabel(stage: string | null | undefined): string {
  if (!stage) return 'Em analise';
  return stage;
}

function whatsappUrl(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const num = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${num}`;
}

// ─── Data loading ─────────────────────────────────────────────────────────────

const activeSaved = computed(() =>
  saved.value.filter((s) => s.vaga?.status === 'PUBLISHED' || s.vaga?.status === 'DRAFT'),
);

const activeApps = computed(() =>
  apps.value.filter((a) => a.vaga?.status !== 'CLOSED'),
);

async function loadSaved() {
  loadingSaved.value = true;
  try {
    saved.value = await savedVagas.list();
  } catch (err) {
    toast.value?.show(getErrorMessage(err), 'error');
  } finally {
    loadingSaved.value = false;
  }
}

async function loadApps() {
  loadingApps.value = true;
  try {
    apps.value = await getMyApplications();
  } catch (err) {
    toast.value?.show(getErrorMessage(err), 'error');
  } finally {
    loadingApps.value = false;
  }
}

async function loadAll() {
  await Promise.all([loadSaved(), loadApps()]);
}

// ─── Remove from saved ────────────────────────────────────────────────────────

function askRemoveSaved(item: SavedVagaItem) {
  removeSavedTarget.value = item;
  confirmRemoveSaved.value = true;
}

async function confirmDoRemoveSaved() {
  const item = removeSavedTarget.value;
  if (!item) return;
  if (removingId.value) return;
  removingId.value = item.vagaId;
  confirmRemoveSaved.value = false;
  try {
    await savedVagas.unsave(item.vagaId);
    saved.value = saved.value.filter((s) => s.id !== item.id);
    toast.value?.show('Vaga removida dos salvos', 'success');
  } catch (err) {
    toast.value?.show(getErrorMessage(err), 'error');
  } finally {
    removingId.value = null;
    removeSavedTarget.value = null;
  }
}

// ─── Remove application (candidatura) ────────────────────────────────────────

function askRemoveApp(app: VagaApplication) {
  removeAppTarget.value = app;
  confirmRemoveApp.value = true;
}

async function confirmDoRemoveApp() {
  const app = removeAppTarget.value;
  if (!app) return;
  if (removingAppId.value) return;
  removingAppId.value = app.id;
  confirmRemoveApp.value = false;
  try {
    await applications.remove(app.id);
    apps.value = apps.value.filter((a) => a.id !== app.id);
    toast.value?.show('Candidatura removida', 'success');
  } catch (err) {
    toast.value?.show(getErrorMessage(err), 'error');
  } finally {
    removingAppId.value = null;
    removeAppTarget.value = null;
  }
}

// ─── Swipe handlers ───────────────────────────────────────────────────────────

function onSwipeRight(item: SavedVagaItem) {
  // Open apply modal
  applyVaga.value = item.vaga;
  applySavedItemId.value = item.id;
  applyModalOpen.value = true;
}

function onSwipeLeft(item: SavedVagaItem) {
  // Optimistically remove, offer undo for 4s
  saved.value = saved.value.filter((s) => s.id !== item.id);

  // Cancel any previous undo
  if (undoTimeout.value) clearTimeout(undoTimeout.value);
  undoItem.value = item;
  showUndo.value = true;

  undoTimeout.value = setTimeout(async () => {
    showUndo.value = false;
    const target = undoItem.value;
    undoItem.value = null;
    if (target) {
      try {
        await savedVagas.unsave(target.vagaId);
      } catch {
        // Re-add on failure
        saved.value = [target, ...saved.value];
        toast.value?.show('Erro ao remover vaga', 'error');
      }
    }
  }, 4000);
}

async function undoSwipeLeft() {
  if (!undoItem.value) return;
  if (undoTimeout.value) clearTimeout(undoTimeout.value);
  const item = undoItem.value;
  saved.value = [item, ...saved.value];
  undoItem.value = null;
  showUndo.value = false;
  toast.value?.show('Vaga restaurada aos salvos', 'success');
}

// ─── Apply modal ──────────────────────────────────────────────────────────────

async function onApplied() {
  applyModalOpen.value = false;
  toast.value?.show('Candidatura enviada com sucesso!', 'success');

  // Remove from saved list (the vaga moved to candidatadas)
  if (applySavedItemId.value) {
    const vagaId = saved.value.find((s) => s.id === applySavedItemId.value)?.vagaId;
    if (vagaId) {
      // The apply was sent; optionally remove from saved too
      saved.value = saved.value.filter((s) => s.id !== applySavedItemId.value);
      // Best-effort unsave (don't block on failure)
      savedVagas.unsave(vagaId).catch(() => null);
    }
  }
  applyVaga.value = null;
  applySavedItemId.value = null;

  // Refresh applications
  await loadApps();
  activeTab.value = 'candidatadas';
}

function onApplyClose() {
  applyModalOpen.value = false;
  applyVaga.value = null;
  applySavedItemId.value = null;
}

// ─── Closed vagas modal ───────────────────────────────────────────────────────

function openClosedModal() {
  closedSaved.value = saved.value.filter((s) => s.vaga?.status === 'CLOSED');
  closedApps.value = apps.value.filter((a) => a.vaga?.status === 'CLOSED');
  closedModalOpen.value = true;
}

// ─── Viewport detection ───────────────────────────────────────────────────────

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  loadAll();
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  if (undoTimeout.value) clearTimeout(undoTimeout.value);
});
</script>

<template>
  <div class="vs-root">
    <Toast ref="toast" />

    <SwipeTutorialOverlay v-if="isMobile" />

    <!-- Header row -->
    <div class="vs-header">
      <div class="vs-header-left">
        <h2 class="vs-title">Vagas Salvas</h2>
      </div>
      <button type="button" class="vs-closed-link" @click="openClosedModal">
        Vagas Encerradas
      </button>
    </div>

    <!-- Mobile: segmented tabs -->
    <div v-if="isMobile" class="vs-tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="vs-tab"
        :class="{ active: activeTab === 'salvas' }"
        :aria-selected="activeTab === 'salvas'"
        @click="activeTab = 'salvas'"
      >
        Salvas
        <span v-if="activeSaved.length > 0" class="vs-tab-count">{{ activeSaved.length }}</span>
      </button>
      <button
        type="button"
        role="tab"
        class="vs-tab"
        :class="{ active: activeTab === 'candidatadas' }"
        :aria-selected="activeTab === 'candidatadas'"
        @click="activeTab = 'candidatadas'"
      >
        Candidatadas
        <span v-if="activeApps.length > 0" class="vs-tab-count vs-tab-count-apps">{{ activeApps.length }}</span>
      </button>
    </div>

    <!-- Desktop: 2-column grid; Mobile: single column by active tab -->
    <div class="vs-columns" :class="{ 'vs-columns-mobile': isMobile }">

      <!-- Column: Vagas Salvas -->
      <div
        v-if="!isMobile || activeTab === 'salvas'"
        class="vs-column"
      >
        <h3 class="vs-column-title">Salvas</h3>

        <div v-if="loadingSaved" class="vs-loading">
          <div class="spinner spinner-md" />
        </div>

        <div v-else-if="activeSaved.length === 0" class="vs-empty">
          <div class="vs-empty-icon">&#128278;</div>
          <p class="vs-empty-title">Nenhuma vaga salva ainda</p>
          <p class="vs-empty-sub">Explore o Radar de Vagas e clique no coracao para salvar oportunidades.</p>
          <a href="/vagas" class="btn btn-primary btn-sm">Ver Radar de Vagas</a>
        </div>

        <div v-else class="vs-cards">
          <template v-for="item in activeSaved" :key="item.id">
            <!-- Mobile: SwipeCard wrapper -->
            <SwipeCard
              v-if="isMobile"
              :on-swipe-right="() => onSwipeRight(item)"
              :on-swipe-left="() => onSwipeLeft(item)"
              :disabled="removingId === item.vagaId"
            >
              <div
                class="vs-card vs-card-saved vs-card-clickable"
                role="link"
                tabindex="0"
                @click="goToVaga(item.vaga?.slug)"
                @keydown.enter="goToVaga(item.vaga?.slug)"
              >
                <div class="vs-card-top">
                  <span
                    v-if="item.vaga?.segment"
                    class="vs-segment-badge"
                    :style="{ background: segmentColor(item.vaga.segment) + '20', color: segmentColor(item.vaga.segment) }"
                  >{{ segmentLabel(item.vaga.segment) }}</span>
                  <span class="vs-relative-time">{{ formatRelativeTime(item.vaga?.createdAt) }}</span>
                </div>
                <h4 class="vs-card-title">{{ item.vaga?.title ?? 'Vaga indisponivel' }}</h4>
                <p v-if="item.vaga?.location" class="vs-card-location">
                  <span aria-hidden="true">&#128205;</span> {{ item.vaga.location }}
                </p>
                <p v-if="item.vaga?.description" class="vs-card-desc">
                  {{ item.vaga.description.slice(0, 120) }}{{ item.vaga.description.length > 120 ? '...' : '' }}
                </p>
                <div class="vs-card-actions">
                  <button
                    type="button"
                    class="btn btn-primary btn-sm vs-btn-apply"
                    :disabled="removingId === item.vagaId"
                    @click.stop="onSwipeRight(item)"
                  >
                    Candidatar
                  </button>
                </div>
                <p class="vs-swipe-hint" aria-hidden="true">
                  <span style="color:#dc2626">&#8592; Remover</span>
                  &nbsp;&nbsp;
                  <span style="color:#16a34a">Candidatar &#8594;</span>
                </p>
              </div>
            </SwipeCard>

            <!-- Desktop: regular card -->
            <div
              v-else
              class="vs-card vs-card-saved vs-card-clickable"
              role="link"
              tabindex="0"
              @click="goToVaga(item.vaga?.slug)"
              @keydown.enter="goToVaga(item.vaga?.slug)"
            >
              <div class="vs-card-top">
                <span
                  v-if="item.vaga?.segment"
                  class="vs-segment-badge"
                  :style="{ background: segmentColor(item.vaga.segment) + '20', color: segmentColor(item.vaga.segment) }"
                >{{ segmentLabel(item.vaga.segment) }}</span>
                <span class="vs-relative-time">{{ formatRelativeTime(item.vaga?.createdAt) }}</span>
                <button
                  type="button"
                  class="vs-btn-remove"
                  :disabled="removingId === item.vagaId"
                  :aria-label="`Remover ${item.vaga?.title} dos salvos`"
                  @click.stop="askRemoveSaved(item)"
                >
                  <span aria-hidden="true">&#10005;</span>
                </button>
              </div>
              <h4 class="vs-card-title">{{ item.vaga?.title ?? 'Vaga indisponivel' }}</h4>
              <p v-if="item.vaga?.location" class="vs-card-location">
                <span aria-hidden="true">&#128205;</span> {{ item.vaga.location }}
              </p>
              <p v-if="item.vaga?.description" class="vs-card-desc">
                {{ item.vaga.description.slice(0, 120) }}{{ item.vaga.description.length > 120 ? '...' : '' }}
              </p>
              <div class="vs-card-actions">
                <button
                  type="button"
                  class="btn btn-primary btn-sm vs-btn-apply"
                  :disabled="removingId === item.vagaId"
                  @click.stop="() => { applyVaga = item.vaga; applySavedItemId = item.id; applyModalOpen = true; }"
                >
                  Candidatar
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Column: Vagas Candidatadas -->
      <div
        v-if="!isMobile || activeTab === 'candidatadas'"
        class="vs-column"
      >
        <h3 class="vs-column-title">Candidatadas</h3>

        <div v-if="loadingApps" class="vs-loading">
          <div class="spinner spinner-md" />
        </div>

        <div v-else-if="activeApps.length === 0" class="vs-empty">
          <div class="vs-empty-icon">&#128196;</div>
          <p class="vs-empty-title">Nenhuma candidatura ainda</p>
          <p class="vs-empty-sub">Candidate-se a uma vaga salva para acompanhar o status aqui.</p>
        </div>

        <div v-else class="vs-cards">
          <div
            v-for="app in activeApps"
            :key="app.id"
            class="vs-card vs-card-applied vs-card-clickable"
            role="link"
            tabindex="0"
            @click="goToVaga(app.vaga?.slug)"
            @keydown.enter="goToVaga(app.vaga?.slug)"
          >
            <div class="vs-card-top">
              <span
                v-if="app.vaga"
                class="vs-segment-badge vs-segment-badge-applied"
              >
                {{ app.vaga.type ?? 'Vaga' }}
              </span>
              <span class="vs-relative-time">{{ formatRelativeTime(app.createdAt) }}</span>
            </div>
            <h4 class="vs-card-title">{{ app.vaga?.title ?? 'Vaga removida' }}</h4>
            <p v-if="app.vaga?.location" class="vs-card-location">
              <span aria-hidden="true">&#128205;</span> {{ app.vaga.location }}
            </p>
            <div class="vs-card-footer">
              <span class="vs-status-badge">
                Status: {{ pipelineStageLabel((app as any).pipelineStage) }}
              </span>
              <a
                v-if="(app as any).hunterContactPhone || app.vaga"
                :href="whatsappUrl((app as any).hunterContactPhone) ?? undefined"
                target="_blank"
                rel="noopener noreferrer"
                class="vs-whatsapp-btn"
                :aria-label="`Contato WhatsApp para ${app.vaga?.title}`"
                :class="{ 'vs-whatsapp-disabled': !whatsappUrl((app as any).hunterContactPhone) }"
                @click.stop.prevent="!whatsappUrl((app as any).hunterContactPhone) ? toast?.show('Telefone de contato nao disponivel para esta vaga', 'warning') : window.open(whatsappUrl((app as any).hunterContactPhone)!, '_blank')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <button
                type="button"
                class="vs-btn-remove"
                :disabled="removingAppId === app.id"
                :aria-label="`Remover candidatura ${app.vaga?.title ?? ''}`"
                @click.stop="askRemoveApp(app)"
              >
                <span aria-hidden="true">&#10005;</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Undo snackbar (swipe-left) -->
    <Transition name="undo-fade">
      <div v-if="showUndo" class="vs-undo-bar" role="alert">
        <span>Vaga removida dos salvos</span>
        <button type="button" class="vs-undo-btn" @click="undoSwipeLeft">
          Desfazer
        </button>
      </div>
    </Transition>

    <!-- Confirm remove from saved -->
    <ConfirmDialog
      :visible="confirmRemoveSaved"
      title="Remover dos salvos"
      :message="`Remover '${removeSavedTarget?.vaga?.title ?? 'esta vaga'}' dos seus salvos?`"
      confirm-label="Remover"
      confirm-variant="danger"
      @confirm="confirmDoRemoveSaved"
      @cancel="() => { confirmRemoveSaved = false; removeSavedTarget = null; }"
    />

    <!-- Confirm remove application -->
    <ConfirmDialog
      :visible="confirmRemoveApp"
      title="Remover candidatura"
      :message="`Remover sua candidatura para '${removeAppTarget?.vaga?.title ?? 'esta vaga'}'? Esta acao nao pode ser desfeita.`"
      confirm-label="Remover"
      confirm-variant="danger"
      @confirm="confirmDoRemoveApp"
      @cancel="() => { confirmRemoveApp = false; removeAppTarget = null; }"
    />

    <!-- Apply modal -->
    <ApplyVagaModal
      v-if="applyVaga"
      :visible="applyModalOpen"
      :vaga="applyVaga"
      @applied="onApplied"
      @close="onApplyClose"
    />

    <!-- Closed vagas modal -->
    <Modal
      :visible="closedModalOpen"
      title="Vagas Encerradas"
      @close="closedModalOpen = false"
    >
      <div class="vs-closed-modal-body">
        <p v-if="closedSaved.length === 0 && closedApps.length === 0" class="vs-closed-empty">
          Nenhuma vaga encerrada encontrada.
        </p>

        <div v-if="closedSaved.length > 0">
          <h4 class="vs-closed-section-title">Salvas encerradas</h4>
          <ul class="vs-closed-list">
            <li v-for="s in closedSaved" :key="s.id" class="vs-closed-item">
              <span class="vs-closed-item-title">{{ s.vaga?.title ?? 'Vaga removida' }}</span>
              <span class="vs-closed-badge">Encerrada</span>
            </li>
          </ul>
        </div>

        <div v-if="closedApps.length > 0">
          <h4 class="vs-closed-section-title">Candidaturas encerradas</h4>
          <ul class="vs-closed-list">
            <li v-for="a in closedApps" :key="a.id" class="vs-closed-item">
              <span class="vs-closed-item-title">{{ a.vaga?.title ?? 'Vaga removida' }}</span>
              <span class="vs-closed-badge">Encerrada</span>
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
/* ─── Root ─────────────────────────────────────────────────────────────────── */
.vs-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 1.5rem);
  position: relative;
}

/* ─── Header ───────────────────────────────────────────────────────────────── */
.vs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vs-title {
  font-size: var(--text-xl, 1.25rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.vs-closed-link {
  background: none;
  border: none;
  color: var(--primary);
  font-size: var(--text-sm, 0.875rem);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  font-weight: 500;
}
.vs-closed-link:hover {
  opacity: 0.8;
}

/* ─── Mobile tabs ──────────────────────────────────────────────────────────── */
.vs-tabs {
  display: flex;
  border: 1.5px solid var(--border, #e5e7eb);
  border-radius: 10px;
  overflow: hidden;
  width: fit-content;
}

.vs-tab {
  padding: 0.5rem 1.2rem;
  background: none;
  border: none;
  font-size: var(--text-sm, 0.875rem);
  font-weight: 500;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.vs-tab + .vs-tab {
  border-left: 1.5px solid var(--border, #e5e7eb);
}

.vs-tab.active {
  background: var(--primary);
  color: #fff;
  font-weight: 600;
}

.vs-tab-count {
  background: rgba(255,255,255,0.25);
  color: inherit;
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  font-weight: 700;
}

.vs-tab:not(.active) .vs-tab-count {
  background: var(--bg-muted, #f3f4f6);
  color: var(--text-secondary);
}

.vs-tab-count-apps {
  /* Candidatadas accent */
}

/* ─── Columns layout ───────────────────────────────────────────────────────── */
.vs-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
}

.vs-columns-mobile {
  grid-template-columns: 1fr;
}

.vs-column {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vs-column-title {
  font-size: var(--text-base, 1rem);
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 0.25rem;
  padding-bottom: 0.5rem;
  border-bottom: 1.5px solid var(--border, #e5e7eb);
}

/* ─── Loading ──────────────────────────────────────────────────────────────── */
.vs-loading {
  display: flex;
  justify-content: center;
  padding: 2rem;
}

/* ─── Empty state ──────────────────────────────────────────────────────────── */
.vs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 2.5rem 1rem;
  text-align: center;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 12px;
  border: 1.5px dashed var(--border, #e5e7eb);
}

.vs-empty-icon {
  font-size: 2rem;
}

.vs-empty-title {
  font-size: var(--text-base, 1rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.vs-empty-sub {
  font-size: var(--text-sm, 0.875rem);
  color: var(--text-secondary);
  margin: 0;
  max-width: 260px;
}

/* ─── Cards ────────────────────────────────────────────────────────────────── */
.vs-cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vs-card {
  background: var(--bg-primary, #fff);
  border: 1.5px solid var(--border, #e5e7eb);
  border-radius: 12px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: box-shadow 150ms, border-color 150ms;
}

.vs-card:hover {
  border-color: var(--border-dark, #d1d5db);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.vs-card-clickable {
  cursor: pointer;
}
.vs-card-clickable:hover {
  border-color: var(--primary, #6366f1);
}
.vs-card-clickable:focus-visible {
  outline: 2px solid var(--primary, #6366f1);
  outline-offset: 2px;
}

.vs-card-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.vs-segment-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  white-space: nowrap;
}

.vs-segment-badge-applied {
  background: var(--bg-muted, #f3f4f6);
  color: var(--text-secondary);
}

.vs-relative-time {
  font-size: 0.75rem;
  color: var(--text-muted, #9ca3af);
  margin-left: auto;
}

.vs-btn-remove {
  background: none;
  border: none;
  color: var(--text-muted, #9ca3af);
  cursor: pointer;
  padding: 0.2rem 0.35rem;
  border-radius: 6px;
  font-size: 0.9rem;
  line-height: 1;
  transition: color 150ms, background 150ms;
  flex-shrink: 0;
}

.vs-btn-remove:hover:not(:disabled) {
  color: #dc2626;
  background: rgba(239,68,68,0.08);
}

.vs-btn-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.vs-card-title {
  font-size: var(--text-base, 1rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.vs-card-location {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0;
}

.vs-card-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.vs-card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.3rem;
}

.vs-btn-apply {
  flex: 1;
}

.vs-swipe-hint {
  font-size: 0.72rem;
  text-align: center;
  margin: 0.25rem 0 0;
  opacity: 0.75;
}

/* ─── Applied card footer ──────────────────────────────────────────────────── */
.vs-card-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

.vs-status-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent, #f59e0b);
  background: rgba(245,158,11,0.1);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(245,158,11,0.25);
}

.vs-whatsapp-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(22,163,74,0.1);
  color: #16a34a;
  text-decoration: none;
  transition: background 150ms;
  cursor: pointer;
  border: none;
  flex-shrink: 0;
}

.vs-whatsapp-btn:hover {
  background: rgba(22,163,74,0.2);
}

.vs-whatsapp-disabled {
  opacity: 0.4;
  cursor: default;
}

/* ─── Undo bar ─────────────────────────────────────────────────────────────── */
.vs-undo-bar {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--text-primary, #1f2937);
  color: #fff;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  z-index: 500;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  white-space: nowrap;
}

.vs-undo-btn {
  background: none;
  border: none;
  color: var(--accent, #f59e0b);
  font-weight: 700;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}
.vs-undo-btn:hover {
  text-decoration: underline;
}

.undo-fade-enter-active,
.undo-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.undo-fade-enter-from,
.undo-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}

/* ─── Closed modal ─────────────────────────────────────────────────────────── */
.vs-closed-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vs-closed-empty {
  color: var(--text-secondary);
  text-align: center;
  padding: 1.5rem;
  margin: 0;
}

.vs-closed-section-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.vs-closed-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.vs-closed-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.85rem;
  background: var(--bg-secondary, #f9fafb);
  border-radius: 8px;
  gap: 0.75rem;
}

.vs-closed-item-title {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}

.vs-closed-badge {
  font-size: 0.75rem;
  background: rgba(239,68,68,0.1);
  color: #b91c1c;
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
}

/* ─── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .vs-columns:not(.vs-columns-mobile) {
    grid-template-columns: 1fr;
  }
}
</style>
