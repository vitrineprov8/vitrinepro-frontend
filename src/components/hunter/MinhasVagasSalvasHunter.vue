<script setup lang="ts">
/**
 * MinhasVagasSalvasHunter — PDF p11
 * 3 colunas: Vagas Salvas | Vagas em Hunter | Candidatadas
 * Mobile: tabs segmentadas
 */
import { ref, computed, onMounted } from 'vue';
import { savedVagas, hunterInterests, getMyApplications, getErrorMessage, applications } from '../../utils/api';
import type { SavedVagaItem, HunterInterest, VagaApplication } from '../../utils/api';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';

const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const loading = ref(false);
const saved = ref<SavedVagaItem[]>([]);
const hunterList = ref<HunterInterest[]>([]);
const candidaturas = ref<VagaApplication[]>([]);

// Mobile tab control
type MobileTab = 'salvas' | 'hunter' | 'candidatadas';
const activeTab = ref<MobileTab>('salvas');

// Remove candidatura
const removeTarget = ref<VagaApplication | null>(null);
const removing = ref(false);

async function loadAll() {
  loading.value = true;
  try {
    const [s, h, c] = await Promise.all([
      savedVagas.list(),
      hunterInterests.listMine(),
      getMyApplications(),
    ]);
    saved.value = s;
    hunterList.value = h;
    candidaturas.value = c;
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  } finally {
    loading.value = false;
  }
}

async function unsave(item: SavedVagaItem) {
  try {
    await savedVagas.unsave(item.vagaId);
    saved.value = saved.value.filter(s => s.id !== item.id);
    toastRef.value?.show('Vaga removida dos salvos.', 'info');
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  }
}

function confirmRemoveCandidatura(app: VagaApplication) {
  removeTarget.value = app;
}

async function doRemoveCandidatura() {
  if (!removeTarget.value || removing.value) return;
  removing.value = true;
  try {
    await applications.remove(removeTarget.value.id);
    candidaturas.value = candidaturas.value.filter(c => c.id !== removeTarget.value!.id);
    toastRef.value?.show('Candidatura removida.', 'info');
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  } finally {
    removing.value = false;
    removeTarget.value = null;
  }
}

function hunterStatusLabel(status: string): string {
  return { PENDING: 'Em análise', ACCEPTED: 'Aceito', REJECTED: 'Recusado' }[status] ?? status;
}

function hunterStatusClass(status: string): string {
  return { PENDING: 'badge-pending', ACCEPTED: 'badge-accepted', REJECTED: 'badge-rejected' }[status] ?? '';
}

function appStatusLabel(status: string): string {
  return { PENDING: 'Em análise', REVIEWED: 'Visualizada', ACCEPTED: 'Aceita', REJECTED: 'Recusada' }[status] ?? status;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

const tabs: { id: MobileTab; label: string; count: number }[] = [
  { id: 'salvas', label: 'Salvas', count: 0 },
  { id: 'hunter', label: 'Em Hunter', count: 0 },
  { id: 'candidatadas', label: 'Candidatadas', count: 0 },
];

onMounted(loadAll);
</script>

<template>
  <div class="mvsh-root">
    <Toast ref="toastRef" />

    <ConfirmDialog
      :visible="!!removeTarget"
      title="Remover candidatura"
      :message="`Tem certeza que deseja remover sua candidatura para &quot;${removeTarget?.vaga?.title ?? ''}&quot;?`"
      confirm-label="Remover"
      :loading="removing"
      @confirm="doRemoveCandidatura"
      @cancel="removeTarget = null"
    />

    <div v-if="loading" class="mvsh-loading">
      <div class="spinner spinner-lg" />
    </div>

    <template v-else>
      <!-- Mobile segmented tabs -->
      <div class="mvsh-mobile-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="mvsh-tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span class="mvsh-tab-count">
            {{ tab.id === 'salvas' ? saved.length : tab.id === 'hunter' ? hunterList.length : candidaturas.length }}
          </span>
        </button>
      </div>

      <!-- Desktop 3-column grid / Mobile single column by tab -->
      <div class="mvsh-grid">

        <!-- Coluna 1: Vagas Salvas -->
        <div class="mvsh-col" :class="{ 'mvsh-col--hidden-mobile': activeTab !== 'salvas' }">
          <h3 class="mvsh-col-title">
            Vagas Salvas
            <span class="mvsh-col-count">{{ saved.length }}</span>
          </h3>
          <div v-if="saved.length === 0" class="mvsh-empty">
            Nenhuma vaga salva.
          </div>
          <div v-else class="mvsh-cards">
            <div v-for="item in saved" :key="item.id" class="mvsh-card">
              <div class="mvsh-card-header">
                <a :href="`/vaga/${item.vaga.slug}`" class="mvsh-card-title-link">
                  {{ item.vaga.title }}
                </a>
                <button
                  type="button"
                  class="mvsh-remove-btn"
                  aria-label="Remover dos salvos"
                  @click="unsave(item)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <p v-if="item.vaga.location" class="mvsh-card-meta">{{ item.vaga.location }}</p>
              <p class="mvsh-card-date">Salva em {{ formatDate(item.createdAt) }}</p>
              <div class="mvsh-card-actions">
                <a :href="`/vaga/${item.vaga.slug}`" class="btn btn-primary btn-xs">
                  Candidatar
                </a>
                <span class="mvsh-go-hunter-hint">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Go Hunter!
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna 2: Vagas em Hunter -->
        <div class="mvsh-col" :class="{ 'mvsh-col--hidden-mobile': activeTab !== 'hunter' }">
          <h3 class="mvsh-col-title">
            Vagas em Hunter
            <span class="mvsh-col-count">{{ hunterList.length }}</span>
          </h3>
          <div v-if="hunterList.length === 0" class="mvsh-empty">
            Você ainda não registrou interesse como hunter em nenhuma vaga.
          </div>
          <div v-else class="mvsh-cards">
            <div v-for="item in hunterList" :key="item.id" class="mvsh-card">
              <div class="mvsh-card-header">
                <a v-if="item.vaga" :href="`/vaga/${item.vaga.slug}`" class="mvsh-card-title-link">
                  {{ item.vaga.title }}
                </a>
                <span v-else class="mvsh-card-title-link">Vaga removida</span>
                <span class="mvsh-status-badge" :class="hunterStatusClass(item.status)">
                  {{ hunterStatusLabel(item.status) }}
                </span>
              </div>
              <p v-if="item.vaga?.location" class="mvsh-card-meta">{{ item.vaga.location }}</p>
              <p class="mvsh-card-date">Registrado em {{ formatDate(item.createdAt) }}</p>
              <!-- Se aceito, mostrar contato -->
              <div v-if="item.status === 'ACCEPTED' && item.vaga?.hunterContactPhone" class="mvsh-contact-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.56A2 2 0 0 1 3.7 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 5.82 5.82l1.27-.13a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>
                </svg>
                <a :href="`tel:${item.vaga.hunterContactPhone}`">{{ item.vaga.hunterContactPhone }}</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna 3: Candidatadas -->
        <div class="mvsh-col" :class="{ 'mvsh-col--hidden-mobile': activeTab !== 'candidatadas' }">
          <h3 class="mvsh-col-title">
            Candidatadas
            <span class="mvsh-col-count">{{ candidaturas.length }}</span>
          </h3>
          <div v-if="candidaturas.length === 0" class="mvsh-empty">
            Nenhuma candidatura enviada ainda.
          </div>
          <div v-else class="mvsh-cards">
            <div v-for="app in candidaturas" :key="app.id" class="mvsh-card">
              <div class="mvsh-card-header">
                <a v-if="app.vaga" :href="`/vaga/${app.vaga.slug}`" class="mvsh-card-title-link">
                  {{ app.vaga.title }}
                </a>
                <span v-else class="mvsh-card-title-link">Vaga removida</span>
                <button
                  type="button"
                  class="mvsh-remove-btn"
                  aria-label="Remover candidatura"
                  @click="confirmRemoveCandidatura(app)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <p v-if="app.vaga?.location" class="mvsh-card-meta">{{ app.vaga.location }}</p>
              <p class="mvsh-card-date">Enviada em {{ formatDate(app.createdAt) }}</p>
              <div class="mvsh-app-status">
                Status: <strong>{{ appStatusLabel(app.status) }}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.mvsh-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.mvsh-loading {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
}

/* Mobile segmented tabs */
.mvsh-mobile-tabs {
  display: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.mvsh-tab-btn {
  flex: 1;
  padding: 8px 4px;
  border: none;
  background: none;
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: var(--font-sans);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.mvsh-tab-btn.active {
  background: var(--primary);
  color: #fff;
}

.mvsh-tab-count {
  font-size: 10px;
  font-weight: 700;
  opacity: 0.8;
}

/* 3-column grid */
.mvsh-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  align-items: start;
}

.mvsh-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mvsh-col-title {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0 0 var(--spacing-xs);
  padding-bottom: var(--spacing-xs);
  border-bottom: 2px solid var(--border);
}

.mvsh-col-count {
  font-size: var(--text-xs);
  font-weight: 600;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 1px 6px;
  border-radius: 999px;
}

.mvsh-empty {
  font-size: var(--text-sm);
  color: var(--text-muted, #9ca3af);
  padding: var(--spacing-md) 0;
  text-align: center;
}

.mvsh-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.mvsh-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mvsh-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-xs);
}

.mvsh-card-title-link {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  text-decoration: none;
  flex: 1;
  min-width: 0;
}

.mvsh-card-title-link:hover {
  color: var(--primary);
}

.mvsh-remove-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #9ca3af);
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.mvsh-remove-btn:hover {
  color: var(--danger, #ef4444);
  border-color: var(--danger, #ef4444);
}

.mvsh-card-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
}

.mvsh-card-date {
  font-size: var(--text-xs);
  color: var(--text-muted, #9ca3af);
  margin: 0;
}

.mvsh-status-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  white-space: nowrap;
}

.badge-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.badge-accepted {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.badge-rejected {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.mvsh-card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.mvsh-go-hunter-hint {
  font-size: var(--text-xs);
  color: #16a34a;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
}

.mvsh-contact-box {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.2);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  margin-top: 4px;
}

.mvsh-contact-box a {
  color: #16a34a;
  text-decoration: none;
  font-weight: 600;
}

.mvsh-app-status {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .mvsh-mobile-tabs {
    display: flex;
  }

  .mvsh-grid {
    grid-template-columns: 1fr;
  }

  .mvsh-col--hidden-mobile {
    display: none;
  }
}
</style>
