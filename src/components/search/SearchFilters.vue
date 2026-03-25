<template>
    <!-- Overlay -->
    <div v-if="visible" class="search-filters-overlay" @click="$emit('close')"></div>

    <!-- Drawer -->
    <div v-if="visible" class="search-filters-drawer">
      <!-- Mobile drag handle -->
      <div class="search-filters-handle"></div>

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: 1.1rem; font-weight: 600; margin: 0;">Filtros</h3>
        <button
          @click="$emit('close')"
          style="background:none;border:none;cursor:pointer;font-size:1.4rem;padding:4px;color:var(--text-secondary);line-height:1;"
          aria-label="Fechar filtros"
        >×</button>
      </div>

      <!-- Sort -->
      <div class="filter-section">
        <p class="filter-section-title">Ordenar por</p>
        <select v-model="local.sortBy" class="filter-city-select">
          <option value="relevance">Relevância</option>
          <option value="date_desc">Mais recentes</option>
          <option value="date_asc">Mais antigos</option>
          <option value="year_desc">Ano (decrescente)</option>
          <option value="year_asc">Ano (crescente)</option>
        </select>
      </div>

      <!-- City -->
      <div v-if="cities.length" class="filter-section">
        <p class="filter-section-title">Cidade</p>
        <select v-model="local.city" class="filter-city-select">
          <option value="">Todas as cidades</option>
          <option v-for="c in cities" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Has image -->
      <div class="filter-section">
        <p class="filter-section-title">Imagem de capa</p>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--text-sm);">
          <input type="checkbox" v-model="local.hasImage" />
          <span>Somente com imagem</span>
        </label>
      </div>

      <!-- Project status -->
      <div class="filter-section">
        <p class="filter-section-title">Status do projeto</p>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label
            v-for="s in statuses"
            :key="s.value"
            style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:var(--text-sm);"
          >
            <input type="checkbox" :value="s.value" v-model="local.projectStatuses" />
            <span>{{ s.label }}</span>
          </label>
        </div>
      </div>

      <!-- Date range -->
      <div class="filter-section">
        <p class="filter-section-title">Data de criação</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <div style="flex:1;min-width:120px;">
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px;">De</label>
            <input
              type="date"
              v-model="local.dateFrom"
              style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);box-sizing:border-box;"
            />
          </div>
          <div style="flex:1;min-width:120px;">
            <label style="font-size:var(--text-xs);color:var(--text-secondary);display:block;margin-bottom:4px;">Até</label>
            <input
              type="date"
              v-model="local.dateTo"
              style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);box-sizing:border-box;"
            />
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="availableTags.length" class="filter-section">
        <p class="filter-section-title">Tags</p>
        <div class="filter-tags-chips">
          <span
            v-for="tag in availableTags"
            :key="tag.id"
            class="filter-tag-chip"
            :class="{ selected: local.tagIds.includes(tag.id) }"
            @click="toggleTag(tag.id)"
          >{{ tag.name }}</span>
        </div>
      </div>

      <!-- Footer actions -->
      <div class="search-filters-footer">
        <button
          @click="clear"
          style="flex:1;padding:10px;border:1px solid var(--border);border-radius:var(--radius-md);background:var(--bg-primary);cursor:pointer;font-size:var(--text-sm);"
        >Limpar</button>
        <button
          @click="apply"
          style="flex:1;padding:10px;border:none;border-radius:var(--radius-md);background:var(--primary);color:white;cursor:pointer;font-weight:600;font-size:var(--text-sm);"
        >Aplicar</button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface FilterState {
  sortBy: string;
  city: string;
  hasImage: boolean;
  projectStatuses: string[];
  dateFrom: string;
  dateTo: string;
  tagIds: string[];
}

const props = defineProps<{
  visible: boolean;
  cities: string[];
  availableTags: { id: string; name: string }[];
  modelValue: FilterState;
}>();

const emit = defineEmits<{
  close: [];
  apply: [FilterState];
}>();

const statuses = [
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'ONGOING', label: 'Em andamento' },
  { value: 'PAUSED', label: 'Pausado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

const local = ref<FilterState>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (v) => { local.value = { ...v }; },
  { deep: true }
);

function toggleTag(id: string) {
  const idx = local.value.tagIds.indexOf(id);
  if (idx === -1) local.value.tagIds.push(id);
  else local.value.tagIds.splice(idx, 1);
}

function clear() {
  local.value = {
    sortBy: 'relevance',
    city: '',
    hasImage: false,
    projectStatuses: [],
    dateFrom: '',
    dateTo: '',
    tagIds: [],
  };
}

function apply() {
  emit('apply', { ...local.value });
  emit('close');
}
</script>
