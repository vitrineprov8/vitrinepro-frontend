<template>
  <div class="search-results-wrap">
    <!-- Controls bar — shown once there are results or a search has been made -->
    <div v-if="total > 0 || items.length > 0" class="search-results-controls">
      <span class="search-results-count">
        {{ total }} resultado{{ total !== 1 ? 's' : '' }}<span v-if="query"> para "<strong>{{ query }}</strong>"</span>
      </span>

      <button
        class="search-action-btn"
        :class="{ active: filtersActive }"
        @click="$emit('open-filters')"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M7 12h10M11 20h2"/>
        </svg>
        Filtrar
        <span
          v-if="filtersActive"
          style="background:var(--primary);color:white;border-radius:999px;padding:0 6px;font-size:.75rem;margin-left:2px;"
        >•</span>
      </button>

      <!-- View layout toggle -->
      <div class="search-view-toggle">
        <button
          class="search-view-btn"
          :class="{ active: layout === 'grid' }"
          title="Grid"
          @click="layout = 'grid'"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
        </button>
        <button
          class="search-view-btn"
          :class="{ active: layout === 'list' }"
          title="Lista"
          @click="layout = 'list'"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Card size toggle -->
      <div class="search-view-toggle">
        <button
          class="search-view-btn"
          :class="{ active: cardSize === 'large' }"
          title="Card grande"
          @click="cardSize = 'large'"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="14" height="14" rx="2"/>
          </svg>
        </button>
        <button
          class="search-view-btn"
          :class="{ active: cardSize === 'compact' }"
          title="Card compacto"
          @click="cardSize = 'compact'"
        >
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <rect x="1" y="1" width="6" height="6" rx="1"/>
            <rect x="9" y="1" width="6" height="6" rx="1"/>
            <rect x="1" y="9" width="6" height="6" rx="1"/>
            <rect x="9" y="9" width="6" height="6" rx="1"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading && items.length === 0" class="behance-grid">
      <div v-for="n in 6" :key="n" class="behance-card search-skeleton-card">
        <div class="behance-card-image search-skeleton-bg"></div>
        <div class="behance-card-body">
          <div class="search-skeleton-line" style="width:60%;height:14px;margin-bottom:8px;"></div>
          <div class="search-skeleton-line" style="height:18px;margin-bottom:6px;"></div>
          <div class="search-skeleton-line" style="width:80%;height:14px;"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!loading && items.length === 0 && hasSearched"
      class="empty-state"
      style="padding: var(--spacing-4xl) 0; text-align: center;"
    >
      <svg
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        viewBox="0 0 24 24"
        style="margin: 0 auto var(--spacing-md); opacity: .4; display: block;"
      >
        <circle cx="11" cy="11" r="8"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35"/>
      </svg>
      <p class="empty-state-title">Nenhum resultado encontrado</p>
      <p style="color: var(--text-secondary); margin-top: 4px; font-size: var(--text-sm);">
        Tente outros termos ou remova alguns filtros
      </p>
    </div>

    <!-- Results -->
    <div
      v-else-if="items.length > 0"
      :class="[layout === 'grid' ? 'behance-grid' : 'search-list', cardSize === 'compact' && layout === 'grid' ? 'compact' : '']"
    >
      <template v-for="item in items" :key="item.id">
        <ProfileCard
          v-if="item.kind === 'profile'"
          :item="item"
        />
        <BehanceCard
          v-else
          :item="item"
          :layout="layout"
          :size="cardSize"
        />
      </template>
    </div>

    <!-- Sentinel for infinite scroll -->
    <div ref="sentinelRef" class="search-sentinel"></div>

    <!-- Loading more indicator -->
    <div v-if="loadingMore" class="search-loading-more">
      <svg
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        viewBox="0 0 24 24"
        class="search-spinner"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import BehanceCard from '../ui/BehanceCard.vue';
import ProfileCard from '../ui/ProfileCard.vue';
import type { SearchItem } from '../../utils/api';

const props = defineProps<{
  items: SearchItem[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  page: number;
  lastPage: number;
  query?: string;
  filtersActive?: boolean;
  hasSearched?: boolean;
}>();

const emit = defineEmits<{
  'load-more': [];
  'open-filters': [];
}>();

const layout = ref<'grid' | 'list'>('grid');
const cardSize = ref<'large' | 'compact'>('large');
const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        !props.loading &&
        !props.loadingMore &&
        props.page < props.lastPage
      ) {
        emit('load-more');
      }
    },
    { rootMargin: '200px' }
  );
  if (sentinelRef.value) observer.observe(sentinelRef.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>
