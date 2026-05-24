<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { radar, savedVagas, hunterInterests, getErrorMessage } from '../../utils/api';
import type { Vaga, SavedFilterData, VagaSegment } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import Toast from '../ui/Toast.vue';
import RadarFilters from './RadarFilters.vue';
import ApplyVagaModal from '../vagas/ApplyVagaModal.vue';
import SwipeCard from './SwipeCard.vue';
import SwipeTutorialOverlay from './SwipeTutorialOverlay.vue';

const props = defineProps<{
  isHunter?: boolean;
  userIsCompany?: boolean;
}>();

const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const loading = ref(false);
const vagas = ref<Vaga[]>([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);

const q = ref('');
const filters = ref<SavedFilterData>({ order: 'recent' });

// Set of vagaIds saved by the current user (for heart toggle)
const savedIds = ref<Set<string>>(new Set());
const savingId = ref<string | null>(null);

// Apply modal
const applyVaga = ref<Vaga | null>(null);
const applyModalOpen = ref(false);

// Hunter interest state: set of vagaIds where interest already sent
const hunterSentIds = ref<Set<string>>(new Set());
const hunterSendingId = ref<string | null>(null);

const loggedIn = computed(() => isAuthenticated());

// Viewport detection (for mobile Tinder UX)
const isMobile = ref(false);
function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

// Vagas hidden by left-swipe (session only)
const skippedIds = ref<Set<string>>(new Set());

// When hunter, only show vagas that allow external hunters
const filteredVagas = computed(() => {
  if (props.isHunter) return vagas.value.filter(v => v.allowHunters);
  return vagas.value;
});

const filteredTotal = computed(() => filteredVagas.value.length);

const visibleVagas = computed(() =>
  filteredVagas.value.filter(v => !skippedIds.value.has(v.id))
);

// Segment label/color map
const SEGMENT_MAP: Record<VagaSegment, { label: string; color: string }> = {
  TECNOLOGIA:             { label: 'Tecnologia',             color: '#2563eb' },
  COMERCIO_VENDAS:        { label: 'Comércio e Vendas',      color: '#7c3aed' },
  FINANCAS_CONTABILIDADE: { label: 'Finanças',               color: '#0891b2' },
  ADMINISTRATIVO:         { label: 'Administrativo',         color: '#059669' },
  LOGISTICA_TRANSPORTE:   { label: 'Logística',              color: '#d97706' },
  RH:                     { label: 'Recursos Humanos',       color: '#db2777' },
  SAUDE:                  { label: 'Saúde',                  color: '#16a34a' },
  EDUCACAO:               { label: 'Educação',               color: '#9333ea' },
  MARKETING:              { label: 'Marketing',              color: '#ea580c' },
  JURIDICO:               { label: 'Jurídico',               color: '#4f46e5' },
  OUTROS:                 { label: 'Outros',                 color: '#6b7280' },
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
  if (mins < 60) return `há ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `há ${days} dia${days > 1 ? 's' : ''}`;
  const weeks = Math.floor(days / 7);
  return `há ${weeks} semana${weeks > 1 ? 's' : ''}`;
}

function formatSalary(min: number | string | null | undefined, max: number | string | null | undefined): string {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const n1 = min != null ? Number(min) : NaN;
  const n2 = max != null ? Number(max) : NaN;
  if (Number.isFinite(n1) && Number.isFinite(n2)) return `${fmt(n1)} – ${fmt(n2)}`;
  if (Number.isFinite(n1)) return fmt(n1);
  return '';
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

async function load() {
  loading.value = true;
  try {
    const res = await radar.search({
      q: q.value || undefined,
      segment: filters.value.segment || undefined,
      city: filters.value.city || undefined,
      type: filters.value.type || undefined,
      workMode: filters.value.workMode || undefined,
      salaryMin: filters.value.salaryMin || undefined,
      order: filters.value.order || 'recent',
      page: page.value,
      limit: 12,
    });
    vagas.value = res.data;
    total.value = res.total;
    totalPages.value = res.lastPage;
  } catch {
    vagas.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function search() {
  page.value = 1;
  load();
}

async function loadSavedIds() {
  if (!loggedIn.value) return;
  try {
    const list = await savedVagas.list();
    savedIds.value = new Set(list.map(s => s.vagaId));
  } catch {
    // silent
  }
}

async function toggleSave(vaga: Vaga, event: Event) {
  event.preventDefault();
  event.stopPropagation();

  if (!loggedIn.value) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  if (savingId.value) return;
  savingId.value = vaga.id;

  try {
    if (savedIds.value.has(vaga.id)) {
      await savedVagas.unsave(vaga.id);
      savedIds.value.delete(vaga.id);
      toastRef.value?.show('Vaga removida dos salvos.', 'info');
    } else {
      await savedVagas.save(vaga.id);
      savedIds.value.add(vaga.id);
      toastRef.value?.show('Vaga salva!', 'success');
    }
    // Force reactivity
    savedIds.value = new Set(savedIds.value);
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  } finally {
    savingId.value = null;
  }
}

function openApply(vaga: Vaga, event: Event) {
  event.preventDefault();
  event.stopPropagation();

  if (!loggedIn.value) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }

  // Empresa mode = no candidatar
  if (props.isHunter === undefined) {
    applyVaga.value = vaga;
    applyModalOpen.value = true;
  }
}

let dblClickTimer: ReturnType<typeof setTimeout> | null = null;

function handleCardClick(vaga: Vaga) {
  if (dblClickTimer) {
    // Double click — save vaga
    clearTimeout(dblClickTimer);
    dblClickTimer = null;
    if (!savedIds.value.has(vaga.id)) {
      toggleSave(vaga, new Event('dblclick'));
    }
    return;
  }
  dblClickTimer = setTimeout(() => {
    dblClickTimer = null;
    window.location.href = `/vaga/${vaga.slug}`;
  }, 250);
}

async function loadHunterInterests() {
  if (!loggedIn.value || !props.isHunter) return;
  try {
    const list = await hunterInterests.listMine();
    hunterSentIds.value = new Set(list.map(h => h.vagaId));
  } catch {
    // silent
  }
}

async function sendHunterInterest(vaga: Vaga, event: Event) {
  event.preventDefault();
  event.stopPropagation();

  if (!loggedIn.value) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    return;
  }
  if (hunterSendingId.value || hunterSentIds.value.has(vaga.id)) return;
  hunterSendingId.value = vaga.id;

  try {
    await hunterInterests.create(vaga.id);
    hunterSentIds.value.add(vaga.id);
    hunterSentIds.value = new Set(hunterSentIds.value);
    toastRef.value?.show('Interesse como hunter registrado!', 'success');
  } catch (err: unknown) {
    const e = err as { statusCode?: number };
    if (e?.statusCode === 409) {
      hunterSentIds.value.add(vaga.id);
      hunterSentIds.value = new Set(hunterSentIds.value);
      toastRef.value?.show('Interesse já registrado anteriormente.', 'info');
    } else if (e?.statusCode === 403) {
      toastRef.value?.show('Disponível para planos Recruiter ou superior.', 'error');
    } else {
      toastRef.value?.show(getErrorMessage(err), 'error');
    }
  } finally {
    hunterSendingId.value = null;
  }
}

function onSwipeRightHunter(vaga: Vaga) {
  sendHunterInterest(vaga, new Event('swipe'));
}

function onSwipeLeftSkip(vaga: Vaga) {
  skippedIds.value.add(vaga.id);
  skippedIds.value = new Set(skippedIds.value);
}

function onSwipeRightApply(vaga: Vaga) {
  applyVaga.value = vaga;
  applyModalOpen.value = true;
}

onMounted(async () => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  await Promise.all([load(), loadSavedIds(), loadHunterInterests()]);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div class="radar-vagas">
    <SwipeTutorialOverlay v-if="isMobile && loggedIn" />

    <div class="rv-header">
      <div class="rv-search-row">
        <input
          v-model="q"
          type="search"
          class="rv-search"
          placeholder="Buscar por cargo, cidade ou bairro..."
          @keyup.enter="search"
        />
        <button class="btn btn-primary btn-sm" @click="search" :disabled="loading">
          {{ loading ? 'Buscando...' : 'Buscar' }}
        </button>
      </div>
      <RadarFilters v-model="filters" @search="search" />
      <div class="rv-count" v-if="!loading">
        <strong>{{ (isHunter ? filteredTotal : total).toLocaleString('pt-BR') }}</strong>
        {{ isHunter ? 'vagas abertas para Hunters' : 'vagas encontradas' }}
      </div>

      <div v-if="isHunter && !loading" class="rv-hunter-tip">
        <span class="rv-hunter-tip-icon" aria-hidden="true">&#128293;</span>
        <div>
          <strong>Modo Hunter ativo.</strong>
          Você ve apenas vagas que aceitam recrutadores externos.
          <span class="rv-hunter-tip-mobile">
            No celular, arraste para a
            <span style="color:#16a34a">direita &#8594;</span>
            para registrar interesse, ou
            <span style="color:#dc2626">&#8592; esquerda</span>
            para passar.
          </span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="rv-skeleton-grid">
      <div v-for="n in 6" :key="n" class="rv-skeleton-card">
        <div class="rv-skeleton-line w60"></div>
        <div class="rv-skeleton-line w40"></div>
        <div class="rv-skeleton-line"></div>
        <div class="rv-skeleton-line w80"></div>
      </div>
    </div>

    <div v-else-if="filteredVagas.length === 0" class="rv-empty">
      <template v-if="isHunter">
        Nenhuma vaga aberta para Hunters no momento. Tente outros filtros ou volte mais tarde.
      </template>
      <template v-else>
        Nenhuma vaga encontrada. Tente outros filtros.
      </template>
    </div>

    <div v-else-if="isMobile && loggedIn && visibleVagas.length > 0" class="rv-grid rv-grid-mobile">
      <SwipeCard
        v-for="vaga in visibleVagas"
        :key="vaga.id"
        :on-swipe-right="() => (isHunter && vaga.allowHunters ? onSwipeRightHunter(vaga) : onSwipeRightApply(vaga))"
        :on-swipe-left="() => onSwipeLeftSkip(vaga)"
        :disabled="hunterSendingId === vaga.id"
      >
        <div
          class="rv-card"
          role="button"
          tabindex="0"
          @click="handleCardClick(vaga)"
          @keydown.enter="handleCardClick(vaga)"
        >
          <button
            type="button"
            class="rv-heart"
            :class="{ saved: savedIds.has(vaga.id) }"
            :disabled="savingId === vaga.id"
            :aria-label="savedIds.has(vaga.id) ? 'Remover dos salvos' : 'Salvar vaga'"
            @click="toggleSave(vaga, $event)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.8">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" :fill="savedIds.has(vaga.id) ? 'currentColor' : 'none'" />
            </svg>
          </button>

          <div class="rv-card-top">
            <span
              v-if="vaga.segment"
              class="rv-badge"
              :style="{ background: segmentColor(vaga.segment) + '1a', color: segmentColor(vaga.segment) }"
            >{{ segmentLabel(vaga.segment) }}</span>
            <span class="rv-time">{{ formatRelativeTime(vaga.createdAt) }}</span>
          </div>

          <h3 class="rv-title">{{ vaga.title }}</h3>

          <p v-if="vaga.location" class="rv-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
            </svg>
            {{ vaga.location }}
          </p>

          <p class="rv-desc">{{ truncate(vaga.description, 120) }}</p>

          <div class="rv-card-footer">
            <span v-if="vaga.salaryMin" class="rv-salary">{{ formatSalary(vaga.salaryMin, vaga.salaryMax) }}</span>
            <div class="rv-actions" @click.stop>
              <button
                v-if="isHunter && vaga.allowHunters"
                type="button"
                class="btn btn-secondary btn-xs"
                :disabled="hunterSendingId === vaga.id || hunterSentIds.has(vaga.id)"
                @click="sendHunterInterest(vaga, $event)"
              >
                <span v-if="hunterSendingId === vaga.id" class="spinner spinner-sm" />
                <span v-else-if="hunterSentIds.has(vaga.id)">Interesse enviado</span>
                <span v-else>Quero ser Hunter</span>
              </button>
              <button
                v-else-if="!isHunter && !userIsCompany"
                type="button"
                class="btn btn-primary btn-xs"
                @click="openApply(vaga, $event)"
              >
                Candidatar
              </button>
            </div>
          </div>

          <p class="rv-swipe-hint" aria-hidden="true">
            <span style="color:#dc2626">&#8592; Passar</span>
            &nbsp;&nbsp;
            <span style="color:#16a34a">
              {{ isHunter ? 'Hunter' : 'Candidatar' }} &#8594;
            </span>
          </p>
        </div>
      </SwipeCard>
    </div>

    <div v-else class="rv-grid">
      <div
        v-for="vaga in filteredVagas"
        :key="vaga.id"
        class="rv-card"
        @click="handleCardClick(vaga)"
        role="button"
        tabindex="0"
        @keydown.enter="handleCardClick(vaga)"
      >
        <!-- Heart save button -->
        <button
          type="button"
          class="rv-heart"
          :class="{ saved: savedIds.has(vaga.id) }"
          :disabled="savingId === vaga.id"
          :aria-label="savedIds.has(vaga.id) ? 'Remover dos salvos' : 'Salvar vaga'"
          @click="toggleSave(vaga, $event)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.8">
            <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" :fill="savedIds.has(vaga.id) ? 'currentColor' : 'none'" />
          </svg>
        </button>

        <div class="rv-card-top">
          <span
            v-if="vaga.segment"
            class="rv-badge"
            :style="{ background: segmentColor(vaga.segment) + '1a', color: segmentColor(vaga.segment) }"
          >
            {{ segmentLabel(vaga.segment) }}
          </span>
          <span class="rv-time">{{ formatRelativeTime(vaga.createdAt) }}</span>
        </div>

        <h3 class="rv-title">{{ vaga.title }}</h3>

        <p v-if="vaga.location" class="rv-location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
          </svg>
          {{ vaga.location }}
        </p>

        <p class="rv-desc">{{ truncate(vaga.description, 120) }}</p>

        <div class="rv-card-footer">
          <span v-if="vaga.salaryMin" class="rv-salary">{{ formatSalary(vaga.salaryMin, vaga.salaryMax) }}</span>
          <div class="rv-actions" @click.stop>
            <button
              v-if="!isHunter && !userIsCompany"
              type="button"
              class="btn btn-primary btn-xs"
              @click="openApply(vaga, $event)"
            >
              Candidatar
            </button>
            <button
              v-if="isHunter && vaga.allowHunters"
              type="button"
              class="btn btn-secondary btn-xs"
              :disabled="hunterSendingId === vaga.id || hunterSentIds.has(vaga.id)"
              @click="sendHunterInterest(vaga, $event)"
            >
              <span v-if="hunterSendingId === vaga.id" class="spinner spinner-sm" />
              <span v-else-if="hunterSentIds.has(vaga.id)">Interesse enviado</span>
              <span v-else>Quero ser Hunter</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav v-if="totalPages > 1" class="rv-pagination">
      <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="page--; load()">Anterior</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button class="btn btn-ghost btn-sm" :disabled="page >= totalPages" @click="page++; load()">Proxima</button>
    </nav>

    <ApplyVagaModal
      v-if="applyVaga"
      :visible="applyModalOpen"
      :vaga="applyVaga"
      @close="applyModalOpen = false; applyVaga = null"
    />

    <Toast ref="toastRef" />
  </div>
</template>

<style scoped>
.radar-vagas {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rv-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rv-search-row {
  display: flex;
  gap: var(--spacing-sm);
}

.rv-search {
  flex: 1;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.rv-search:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.rv-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.rv-hunter-tip {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-md, 10px);
  padding: 0.6rem 0.85rem;
  font-size: var(--text-sm, 0.875rem);
  color: var(--text-primary);
  line-height: 1.45;
}

.rv-hunter-tip-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.rv-hunter-tip-mobile {
  display: none;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .rv-hunter-tip-mobile {
    display: block;
  }
}

/* Grid */
.rv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 1024px) {
  .rv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .rv-grid {
    grid-template-columns: 1fr;
  }
}

/* Card */
.rv-card {
  position: relative;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
}

.rv-card:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.rv-heart {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.rv-heart:hover,
.rv-heart.saved {
  color: #ef4444;
  border-color: #fca5a5;
  background: #fef2f2;
}

.rv-heart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.rv-card-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  padding-right: 36px;
}

.rv-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: var(--text-xs);
  font-weight: 600;
}

.rv-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.rv-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.35;
}

.rv-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
}

.rv-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.rv-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  margin-top: auto;
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-light);
}

.rv-salary {
  font-size: var(--text-sm);
  font-weight: 600;
  color: #16a34a;
}

.rv-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.rv-swipe-hint {
  font-size: 0.7rem;
  text-align: center;
  margin: 0.4rem 0 0;
  opacity: 0.75;
}

.rv-grid-mobile {
  grid-template-columns: 1fr;
}

/* Empty */
.rv-empty {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem 0;
  font-size: var(--text-base);
}

/* Skeleton */
.rv-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

@media (max-width: 1024px) { .rv-skeleton-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .rv-skeleton-grid { grid-template-columns: 1fr; } }

.rv-skeleton-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rv-skeleton-line {
  height: 12px;
  background: var(--bg-tertiary, #f3f4f6);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.rv-skeleton-line.w60 { width: 60%; }
.rv-skeleton-line.w40 { width: 40%; }
.rv-skeleton-line.w80 { width: 80%; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Pagination */
.rv-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}
</style>
