<template>
  <div class="search-box-wrap">
    <!-- Type tabs -->
    <div class="search-type-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="search-type-tab"
        :class="{ active: selectedType === tab.value }"
        @click="selectedType = tab.value"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Input row -->
    <div class="search-input-row">
      <div class="search-input-wrap">
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          class="search-input"
          :placeholder="placeholderByType"
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
      <button class="search-btn-submit" @click="submit">Ver resultados</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { searchAutocomplete, type AutocompleteSuggestion } from '../../utils/api';

const props = defineProps<{
  initialQuery?: string;
  initialType?: string;
}>();

const emit = defineEmits<{
  search: [{ q: string; type: string }];
}>();

const tabs = [
  { label: 'Todos', value: 'all' },
  { label: 'Profissional', value: 'professional' },
  { label: 'Especialidade', value: 'specialty' },
  { label: 'Projeto', value: 'project' },
];

const query = ref(props.initialQuery || '');
const selectedType = ref(props.initialType || 'all');
const suggestions = ref<AutocompleteSuggestion[]>([]);
const showDropdown = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const placeholderByType = computed(() => {
  const m: Record<string, string> = {
    all: 'Buscar projetos, profissionais, especialidades...',
    professional: 'Buscar por nome do profissional...',
    specialty: 'Buscar por especialidade ou profissão...',
    project: 'Buscar por tag, título ou categoria...',
  };
  return m[selectedType.value] ?? m.all;
});

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
    suggestions.value = await searchAutocomplete(val, selectedType.value);
    if (suggestions.value.length) showDropdown.value = true;
  }, 300);
});

watch(selectedType, () => {
  suggestions.value = [];
  showDropdown.value = false;
  // Disparar búsqueda inmediatamente al cambiar de tab
  emit('search', { q: query.value, type: selectedType.value });
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

function submit() {
  showDropdown.value = false;
  emit('search', { q: query.value, type: selectedType.value });
}
</script>
