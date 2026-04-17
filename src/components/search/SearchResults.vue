<template>
  <div class="search-results-wrap">

    <!-- Loading skeleton -->
    <div v-if="loading && items.length === 0" class="vitrine-grid">
      <div v-for="n in 10" :key="n" class="vitrine-card search-skeleton-card">
        <div class="vitrine-card-image-wrap search-skeleton-bg"></div>
        <div class="vitrine-card-body">
          <div class="search-skeleton-line" style="width:40%;height:12px;margin-bottom:8px;border-radius:4px;"></div>
          <div class="search-skeleton-line" style="height:16px;margin-bottom:6px;border-radius:4px;"></div>
          <div class="search-skeleton-line" style="width:60%;height:12px;border-radius:4px;"></div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!loading && items.length === 0 && hasSearched"
      class="search-empty-state"
    >
      <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/>
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35"/>
      </svg>
      <p class="search-empty-title">Nenhum resultado encontrado</p>
      <p class="search-empty-sub">Tente outros termos ou use os filtros para refinar</p>
    </div>

    <!-- Results grid -->
    <div v-else-if="items.length > 0" class="vitrine-grid">
      <template v-for="item in items" :key="item.id">
        <!-- Card tipo 1: Profissional -->
        <VitrineProfileCard v-if="item.kind === 'profile'" :item="item" />
        <!-- Card tipo 2/3: Projeto ou Serviço -->
        <VitrinePortfolioCard v-else :item="item" />
      </template>
    </div>

    <!-- Infinite scroll sentinel -->
    <div ref="sentinelRef" class="search-sentinel"></div>

    <!-- Loading more -->
    <div v-if="loadingMore" class="search-loading-more">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="search-spinner">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v3m6.366-.366-2.12 2.12M21 12h-3m.366 6.366-2.12-2.12M12 21v-3m-6.366.366 2.12-2.12M3 12h3m-.366-6.366 2.12 2.12"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import VitrineProfileCard from '../ui/VitrineProfileCard.vue';
import VitrinePortfolioCard from '../ui/VitrinePortfolioCard.vue';
import type { SearchItem } from '../../utils/api';

const props = defineProps<{
  items: SearchItem[];
  total: number;
  loading: boolean;
  loadingMore: boolean;
  page: number;
  lastPage: number;
  query?: string;
  hasSearched?: boolean;
}>();

const emit = defineEmits<{
  'load-more': [];
}>();

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
