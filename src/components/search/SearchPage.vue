<template>
  <div class="search-page-wrap">

    <!-- Hero search header -->
    <SearchBox
      :initial-query="currentQuery"
      @search="onSearch"
    />

    <!-- Filter tabs — always visible -->
    <div class="search-filter-tabs-bar">
      <div class="search-filter-tabs">
        <button
          v-for="tab in filterTabs"
          :key="tab.value"
          :data-testid="`filter-${tab.value === 'all' ? 'todas' : tab.value === 'specialty' ? 'especialidades' : tab.value === 'project' ? 'projetos' : 'servicos'}`"
          class="search-filter-tab"
          :class="{ active: activeTab === tab.value }"
          @click="onTabClick(tab.value)"
        >
          <span class="search-filter-tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </div>

      <div class="search-results-meta" v-if="hasSearched && (filteredResults.length > 0 || total > 0)">
        <span class="search-results-count">
          {{ filteredResults.length }} resultado{{ filteredResults.length !== 1 ? 's' : '' }}<span v-if="currentQuery"> para "<strong>{{ currentQuery }}</strong>"</span>
        </span>
        <button
          class="search-action-btn"
          :class="{ active: filtersActive }"
          @click="showFilters = true"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M7 12h10M11 20h2"/>
          </svg>
          Filtros
          <span v-if="filtersActive" class="search-filter-badge">•</span>
        </button>
      </div>
    </div>

    <!-- Pre-search state: logo + call to action -->
    <div v-if="!hasSearched" class="search-presearch-state">
      <div class="search-presearch-logo">VitrinePro</div>
      <p class="search-presearch-hint">Busque acima por profissionais, projetos e serviços</p>
    </div>

    <!-- Results -->
    <div v-if="hasSearched" data-testid="results-container" class="search-results-section">
      <SearchResults
        :items="filteredResults"
        :total="filteredResults.length"
        :loading="loading"
        :loading-more="loadingMore"
        :page="currentPage"
        :last-page="lastPage"
        :query="currentQuery"
        :has-searched="hasSearched"
        @load-more="loadMore"
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
import { searchPortfolio, type SearchParams, type SearchItem, type SearchPortfolioItem } from '../../utils/api';

interface FilterState {
  sortBy: string;
  city: string;
  hasImage: boolean;
  projectStatuses: string[];
  dateFrom: string;
  dateTo: string;
  tagIds: string[];
}

// Service detection: matches isService flag OR any "servico/serviços" tag variant
const SERVICE_TAG_NAMES = new Set(['serviços', 'servicos', 'serviço', 'servico']);
function isServiceItem(p: SearchPortfolioItem): boolean {
  if (p.isService === true) return true;
  return p.tags?.some(t => SERVICE_TAG_NAMES.has(t.name.toLowerCase())) ?? false;
}

const filterTabs = [
  { label: 'TODAS', value: 'all', icon: '📁' },
  { label: 'Especialidades', value: 'specialty', icon: '★' },
  { label: 'Projetos', value: 'project', icon: '📂' },
  { label: 'Serviços', value: 'service', icon: '🔧' },
];

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
const activeTab = ref('all');

const currentQuery = ref('');

const filters = ref<FilterState>({
  sortBy: 'relevance',
  city: '',
  hasImage: false,
  projectStatuses: [],
  dateFrom: '',
  dateTo: '',
  tagIds: [],
});

const filtersActive = computed(() => {
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

// Client-side tab filtering
const filteredResults = computed<SearchItem[]>(() => {
  if (activeTab.value === 'all') return results.value;

  if (activeTab.value === 'specialty') {
    return results.value.filter(item => item.kind === 'profile');
  }

  if (activeTab.value === 'service') {
    return results.value.filter(item => {
      if (item.kind !== 'portfolio') return false;
      const p = item as SearchPortfolioItem;
      return isServiceItem(p);
    });
  }

  if (activeTab.value === 'project') {
    return results.value.filter(item => {
      if (item.kind !== 'portfolio') return false;
      const p = item as SearchPortfolioItem;
      return !isServiceItem(p);
    });
  }

  return results.value;
});

function buildParams(page = 1): SearchParams {
  const f = filters.value;

  // Map active tab to backend type parameter so results are scoped correctly
  let type: SearchParams['type'] = 'all';
  if (activeTab.value === 'specialty') type = 'professional';
  else if (activeTab.value === 'service' || activeTab.value === 'project') type = 'project';

  const params: SearchParams = {
    q: currentQuery.value,
    type,
    page,
    limit: 20,
  };

  // When on service tab, let the backend filter to isService=true items only
  if (activeTab.value === 'service') {
    params.isService = true;
  }

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

function onTabClick(tab: string) {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  // Always re-fetch: each tab sends a different `type`/`isService` to the backend
  doSearch();
}

function onSearch({ q }: { q: string }) {
  currentQuery.value = q;
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
  if (activeTab.value && activeTab.value !== 'all') url.searchParams.set('tab', activeTab.value);
  else url.searchParams.delete('tab');
  window.history.replaceState({}, '', url.toString());
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    const tab = url.searchParams.get('tab');
    if (q) currentQuery.value = q;
    if (tab && filterTabs.some(t => t.value === tab)) activeTab.value = tab;
    // Auto-search só se veio com algum parâmetro (ex: da home pela pill de
    // especialidade). Sem parâmetros, fica no pre-search state.
    if (q || tab) doSearch();
  }
});
</script>
