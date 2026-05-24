<script setup lang="ts">
/**
 * RadarVagasHunter — wrapper sobre RadarVagas.
 * Em mobile (<=768px): swipe stack — uma vaga por vez.
 *   Swipe direita  = "Quero ser Hunter" (POST /vagas/:id/hunter-interest)
 *   Swipe esquerda = passa para a próxima (descarta)
 * Desktop: grid normal via RadarVagas (isHunter=true).
 */
import { ref, computed, onMounted } from 'vue';
import { radar, hunterInterests, getErrorMessage } from '../../utils/api';
import type { Vaga } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import Toast from '../ui/Toast.vue';
import SwipeCard from '../profissional/SwipeCard.vue';
import RadarVagas from '../profissional/RadarVagas.vue';

const toastRef = ref<InstanceType<typeof Toast> | null>(null);

// Mobile swipe stack state
const isMobile = ref(false);
const swipeMode = ref(false);

const loading = ref(false);
const swipeVagas = ref<Vaga[]>([]);
const swipeIndex = ref(0);
const swipeTotal = ref(0);

// Track sent interests to avoid re-sending
const sentIds = ref<Set<string>>(new Set());

const currentVaga = computed(() => swipeVagas.value[swipeIndex.value] ?? null);
const hasMore = computed(() => swipeIndex.value < swipeVagas.value.length - 1);

function checkMobile() {
  isMobile.value = window.innerWidth <= 768;
}

async function loadSwipeVagas() {
  loading.value = true;
  try {
    // Load vagas that allow hunters for swipe mode
    const res = await radar.search({ limit: 20, page: 1 });
    swipeVagas.value = res.data.filter(v => v.allowHunters !== false);
    swipeTotal.value = swipeVagas.value.length;
    // Pre-load existing interests
    if (isAuthenticated()) {
      const mine = await hunterInterests.listMine();
      sentIds.value = new Set(mine.map(h => h.vagaId));
    }
  } catch {
    swipeVagas.value = [];
  } finally {
    loading.value = false;
  }
}

function enterSwipeMode() {
  swipeIndex.value = 0;
  swipeMode.value = true;
  loadSwipeVagas();
}

function exitSwipeMode() {
  swipeMode.value = false;
}

function nextCard() {
  if (hasMore.value) {
    swipeIndex.value++;
  } else {
    toastRef.value?.show('Sem mais vagas no momento. Tente novamente mais tarde.', 'info');
  }
}

async function onSwipeRight() {
  const vaga = currentVaga.value;
  if (!vaga) return;

  if (!isAuthenticated()) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }

  if (!sentIds.value.has(vaga.id)) {
    try {
      await hunterInterests.create(vaga.id);
      sentIds.value.add(vaga.id);
      sentIds.value = new Set(sentIds.value);
      toastRef.value?.show(`Interesse enviado para "${vaga.title}"!`, 'success');
    } catch (err: unknown) {
      const e = err as { statusCode?: number };
      if (e?.statusCode === 409) {
        sentIds.value.add(vaga.id);
        sentIds.value = new Set(sentIds.value);
      } else if (e?.statusCode === 403) {
        toastRef.value?.show('Disponível para planos Recruiter ou superior.', 'error');
      } else {
        toastRef.value?.show(getErrorMessage(err), 'error');
      }
    }
  }
  nextCard();
}

function onSwipeLeft() {
  nextCard();
}

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
});
</script>

<template>
  <div class="rvh-root">
    <Toast ref="toastRef" />

    <!-- Desktop / non-swipe: reuse RadarVagas com isHunter -->
    <template v-if="!isMobile || !swipeMode">
      <RadarVagas :is-hunter="true" />

      <!-- Mobile: botão para entrar no modo swipe -->
      <div v-if="isMobile" class="rvh-swipe-enter">
        <button type="button" class="btn btn-secondary" @click="enterSwipeMode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 12h16M12 4l8 8-8 8"/>
          </svg>
          Modo swipe (Go Hunter!)
        </button>
      </div>
    </template>

    <!-- Mobile swipe stack -->
    <template v-else>
      <div class="rvh-swipe-header">
        <button type="button" class="btn btn-ghost btn-sm" @click="exitSwipeMode">
          ← Voltar à grid
        </button>
        <span class="rvh-counter">
          {{ swipeIndex + 1 }} de {{ swipeTotal }}
        </span>
      </div>

      <div v-if="loading" class="rvh-loading">
        <div class="spinner spinner-lg" />
        <p>Carregando vagas...</p>
      </div>

      <div v-else-if="!currentVaga" class="rvh-empty">
        <p>Nenhuma vaga com hunters disponível no momento.</p>
        <button type="button" class="btn btn-ghost btn-sm" @click="exitSwipeMode">Voltar à grid</button>
      </div>

      <div v-else class="rvh-swipe-area">
        <SwipeCard
          :key="swipeIndex"
          :on-swipe-right="onSwipeRight"
          :on-swipe-left="onSwipeLeft"
        >
          <div class="rvh-swipe-card">
            <div class="rvh-swipe-card-top">
              <span v-if="currentVaga.segment" class="rvh-segment-badge">
                {{ currentVaga.segment.replace(/_/g, ' ') }}
              </span>
              <span
                v-if="sentIds.has(currentVaga.id)"
                class="rvh-sent-badge"
              >Interesse enviado</span>
            </div>
            <h2 class="rvh-card-title">{{ currentVaga.title }}</h2>
            <p v-if="currentVaga.location" class="rvh-card-location">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/>
              </svg>
              {{ currentVaga.location }}
            </p>
            <p class="rvh-card-desc">{{ (currentVaga.description || '').slice(0, 180) }}{{ (currentVaga.description || '').length > 180 ? '…' : '' }}</p>
            <div class="rvh-card-footer">
              <a :href="`/vaga/${currentVaga.slug}`" class="btn btn-ghost btn-sm" target="_blank">Ver vaga</a>
            </div>
          </div>
        </SwipeCard>

        <div class="rvh-swipe-hints">
          <span class="rvh-hint-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M5 12l7-7M5 12l7 7"/></svg>
            Passar
          </span>
          <span class="rvh-hint-right">
            Go Hunter!
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.rvh-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rvh-swipe-enter {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.rvh-swipe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.rvh-counter {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.rvh-loading,
.rvh-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 0;
  color: var(--text-secondary);
}

.rvh-swipe-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.rvh-swipe-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 360px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rvh-swipe-card-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.rvh-segment-badge {
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--primary-100, rgba(37,99,235,0.1));
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.rvh-sent-badge {
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.rvh-card-title {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.rvh-card-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.rvh-card-desc {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.rvh-card-footer {
  margin-top: auto;
}

.rvh-swipe-hints {
  display: flex;
  width: 100%;
  max-width: 360px;
  justify-content: space-between;
  font-size: var(--text-xs);
  font-weight: 600;
}

.rvh-hint-left {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #b91c1c;
}

.rvh-hint-right {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #16a34a;
}
</style>
