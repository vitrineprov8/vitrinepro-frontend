<template>
  <div class="search-hero">
    <div class="search-hero-content">
      <h1 class="search-hero-title">Encontre profissionais e serviços perto de você</h1>

      <!-- Search input row -->
      <div class="search-hero-form">
        <div class="search-input-wrap">
          <svg class="search-input-icon" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref="inputRef"
            v-model="query"
            data-testid="search-input"
            type="text"
            class="search-input"
            placeholder="Qual profissional ou serviço você procura?"
            autocomplete="off"
            @keydown.enter="submit"
            @keydown.escape="showDropdown = false"
            @focus="onFocus"
            @blur="onBlur"
          />
          <!-- Autocomplete dropdown -->
          <div v-if="showDropdown && suggestions.length" class="autocomplete-dropdown">
            <div
              v-for="(s, i) in suggestions"
              :key="i"
              class="autocomplete-item"
              @mousedown.prevent="selectSuggestion(s)"
            >
              <span class="autocomplete-item-icon">{{ iconByType(s.type) }}</span>
              <span>{{ s.label }}</span>
            </div>
          </div>
        </div>
        <button class="search-btn-submit" data-testid="search-btn" @click="submit">Buscar</button>
      </div>

      <!-- Popular tags -->
      <div class="search-popular-tags">
        <span class="search-popular-label">Populares:</span>
        <div class="search-popular-chips">
          <button
            v-for="tag in popularTags"
            :key="tag"
            data-testid="popular-tag"
            class="search-popular-chip"
            @click="selectPopularTag(tag)"
          >{{ tag }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { searchAutocomplete, type AutocompleteSuggestion } from '../../utils/api';

const props = defineProps<{
  initialQuery?: string;
}>();

const emit = defineEmits<{
  search: [{ q: string }];
}>();

const popularTags = [
  'Arquiteto',
  'Designer',
  'Médico',
  'Advogado',
  'Desenvolvedor',
  'Coordenador',
];

const query = ref(props.initialQuery || '');
const suggestions = ref<AutocompleteSuggestion[]>([]);
const showDropdown = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function iconByType(type: string) {
  const m: Record<string, string> = {
    professional: '👤',
    specialty: '💼',
    tag: '🏷',
    project: '📁',
  };
  return m[type] ?? '🔍';
}

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val || val.length < 2) {
    suggestions.value = [];
    return;
  }
  debounceTimer = setTimeout(async () => {
    suggestions.value = await searchAutocomplete(val, 'all');
    if (suggestions.value.length) showDropdown.value = true;
  }, 300);
});

function onFocus() {
  if (suggestions.value.length) showDropdown.value = true;
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
}

function selectSuggestion(s: AutocompleteSuggestion) {
  query.value = s.label;
  showDropdown.value = false;
  submit();
}

function selectPopularTag(tag: string) {
  query.value = tag;
  showDropdown.value = false;
  emit('search', { q: tag });
}

function submit() {
  showDropdown.value = false;
  emit('search', { q: query.value });
}
</script>
