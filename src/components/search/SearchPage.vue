<template>
  <div class="search-page-wrap">

    <!-- Hero -->
    <div class="search-page-hero">
      <h1 class="search-page-title">Descubra talentos criativos</h1>
      <p class="search-page-subtitle">Encontre profissionais, projetos e especialidades no VitrinePro</p>
    </div>

    <!-- CTA banner -->
    <div class="search-cta-banner">
      <div class="search-cta-content">
        <strong>Você é um profissional criativo?</strong>
        <p>Crie seu portfólio grátis e seja descoberto por recrutadores e clientes ao redor do Brasil.</p>
      </div>
      <a href="/signup" class="search-cta-btn">Criar perfil grátis →</a>
    </div>

    <!-- Search box -->
    <SearchBox
      :initial-query="currentQuery"
      :initial-type="currentType"
      @search="onSearch"
    />

    <!-- Results -->
    <div style="margin-top: var(--spacing-xl);">
      <SearchResults
        :items="results"
        :total="total"
        :loading="loading"
        :loading-more="loadingMore"
        :page="currentPage"
        :last-page="lastPage"
        :query="currentQuery"
        :filters-active="hasActiveFilters"
        :has-searched="hasSearched"
        @load-more="loadMore"
        @open-filters="showFilters = true"
      />
    </div>

    <SearchFilters
      :visible="showFilters"
      :cities="cities"
      :available-tags="availableTags"
      :model-value="filters"
      @close="showFilters = false"
      @apply="onApplyFilters"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import SearchBox from './SearchBox.vue';
import SearchResults from './SearchResults.vue';
import SearchFilters from './SearchFilters.vue';
import { searchPortfolio, type SearchParams, type SearchItem } from '../../utils/api';

interface FilterState {
  sortBy: string;
  city: string;
  hasImage: boolean;
  projectStatuses: string[];
  dateFrom: string;
  dateTo: string;
  tagIds: string[];
}

const results = ref<SearchItem[]>([]);
const total = ref(0);
const currentPage = ref(1);
const lastPage = ref(1);
const loading = ref(false);
const loadingMore = ref(false);
const hasSearched = ref(false);
const cities = ref<string[]>([]);
const availableTags = ref<{ id: string; name: string }[]>([]);
const showFilters = ref(false);

const currentQuery = ref('');
const currentType = ref('all');

const filters = ref<FilterState>({
  sortBy: 'relevance',
  city: '',
  hasImage: false,
  projectStatuses: [],
  dateFrom: '',
  dateTo: '',
  tagIds: [],
});

const hasActiveFilters = computed(() => {
  const f = filters.value;
  return (
    f.city !== '' ||
    f.hasImage ||
    f.projectStatuses.length > 0 ||
    f.dateFrom !== '' ||
    f.dateTo !== '' ||
    f.tagIds.length > 0
  );
});

function buildParams(page = 1): SearchParams {
  const f = filters.value;
  const params: SearchParams = {
    q: currentQuery.value,
    type: currentType.value as SearchParams['type'],
    page,
    limit: 12,
  };

  if (f.sortBy === 'date_desc') {
    params.sortBy = 'date';
    params.sortOrder = 'DESC';
  } else if (f.sortBy === 'date_asc') {
    params.sortBy = 'date';
    params.sortOrder = 'ASC';
  } else if (f.sortBy === 'year_desc') {
    params.sortBy = 'year';
    params.sortOrder = 'DESC';
  } else if (f.sortBy === 'year_asc') {
    params.sortBy = 'year';
    params.sortOrder = 'ASC';
  } else {
    params.sortBy = 'relevance';
  }

  if (f.city) params.city = f.city;
  if (f.hasImage) params.hasImage = true;
  if (f.projectStatuses.length === 1) params.projectStatus = f.projectStatuses[0];
  if (f.dateFrom) params.dateFrom = f.dateFrom;
  if (f.dateTo) params.dateTo = f.dateTo;
  if (f.tagIds.length === 1) params.tagId = f.tagIds[0];

  return params;
}

async function doSearch() {
  if (loading.value) return;
  loading.value = true;
  hasSearched.value = true;
  currentPage.value = 1;
  results.value = [];
  try {
    const res = await searchPortfolio(buildParams(1));
    results.value = res.data;
    total.value = res.total;
    lastPage.value = res.lastPage;
    cities.value = res.cities;
    availableTags.value = res.availableTags;
    updateURL();
  } catch (e) {
    console.error('Search error', e);
  } finally {
    loading.value = false;
  }
}

async function loadMore() {
  if (loadingMore.value || currentPage.value >= lastPage.value) return;
  loadingMore.value = true;
  currentPage.value++;
  try {
    const res = await searchPortfolio(buildParams(currentPage.value));
    results.value.push(...res.data);
    lastPage.value = res.lastPage;
  } catch (e) {
    console.error('Load more error', e);
    currentPage.value--;
  } finally {
    loadingMore.value = false;
  }
}

function onSearch({ q, type }: { q: string; type: string }) {
  currentQuery.value = q;
  currentType.value = type;
  doSearch();
}

function onApplyFilters(f: FilterState) {
  filters.value = f;
  doSearch();
}

function updateURL() {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (currentQuery.value) url.searchParams.set('q', currentQuery.value);
  else url.searchParams.delete('q');
  if (currentType.value && currentType.value !== 'all') url.searchParams.set('type', currentType.value);
  else url.searchParams.delete('type');
  window.history.replaceState({}, '', url.toString());
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const type = url.searchParams.get('type');
    if (q) currentQuery.value = q;
    if (type) currentType.value = type;
  }
  // Siempre buscar al montar — sin query muestra los más recientes
  doSearch();
});
</script>
