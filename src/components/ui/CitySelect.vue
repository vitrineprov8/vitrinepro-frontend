<template>
  <div class="city-select-wrap" ref="wrapRef">
    <div
      class="city-select-input-row"
      :class="{ focused: isFocused, error: hasError }"
    >
      <input
        ref="inputRef"
        class="city-select-input"
        type="text"
        :value="query"
        :placeholder="placeholder"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        role="combobox"
        :aria-expanded="showDropdown && filtered.length > 0"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-activedescendant="activeIndex >= 0 ? `city-opt-${activeIndex}` : undefined"
        @input="onInput"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <button
        v-if="modelValue"
        type="button"
        class="city-select-clear"
        tabindex="-1"
        aria-label="Limpar cidade"
        @mousedown.prevent="clear"
      >
        ×
      </button>
    </div>

    <ul
      v-if="showDropdown && filtered.length > 0"
      class="city-select-dropdown"
      role="listbox"
      aria-label="Cidades disponíveis"
    >
      <li
        v-for="(city, index) in filtered"
        :key="city"
        :id="`city-opt-${index}`"
        class="city-select-item"
        :class="{ active: index === activeIndex }"
        role="option"
        :aria-selected="index === activeIndex"
        @mousedown.prevent="selectCity(city)"
      >
        <span v-html="highlight(city)" />
      </li>
    </ul>

    <p v-if="hasError" class="city-select-error-msg" role="alert">
      Selecione uma cidade válida da lista
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { brazilCities } from '../../data/brazil-cities';

const props = withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
}>(), {
  placeholder: 'Buscar cidade...',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const inputRef = ref<HTMLInputElement>();
const wrapRef = ref<HTMLElement>();
const query = ref(props.modelValue);
const isFocused = ref(false);
const showDropdown = ref(false);
const activeIndex = ref(-1);
const hasError = ref(false);

// Expose isValid so the parent form can check before saving
defineExpose({ isValid: computed(() => !hasError.value) });

// Keep query in sync when modelValue changes externally
watch(() => props.modelValue, (val) => {
  if (val !== query.value) query.value = val;
});

const filtered = computed<string[]>(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return [];

  const results: string[] = [];
  for (const city of brazilCities) {
    if (results.length >= 12) break;
    if (city.toLowerCase().includes(q)) {
      results.push(city);
    }
  }
  return results;
});

// Reset active index whenever filtered list changes
watch(filtered, () => {
  activeIndex.value = -1;
});

function onInput(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  showDropdown.value = true;
  activeIndex.value = -1;

  // If user clears the input, also clear the modelValue
  if (!query.value) {
    emit('update:modelValue', '');
  }
}

function onFocus() {
  isFocused.value = true;
  showDropdown.value = true;
}

function onBlur() {
  isFocused.value = false;
  setTimeout(() => {
    showDropdown.value = false;
    const trimmed = query.value.trim();
    if (!trimmed) {
      hasError.value = false;
      emit('update:modelValue', '');
      query.value = '';
    } else if (brazilCities.includes(trimmed)) {
      hasError.value = false;
      emit('update:modelValue', trimmed);
    } else {
      // Invalid — not in the list
      hasError.value = true;
      query.value = '';
      emit('update:modelValue', '');
    }
  }, 150);
}

function onKeydown(e: KeyboardEvent) {
  if (!showDropdown.value || filtered.value.length === 0) return;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1);
      scrollActiveIntoView();
      break;
    case 'ArrowUp':
      e.preventDefault();
      activeIndex.value = Math.max(activeIndex.value - 1, 0);
      scrollActiveIntoView();
      break;
    case 'Enter':
      e.preventDefault();
      if (activeIndex.value >= 0 && activeIndex.value < filtered.value.length) {
        selectCity(filtered.value[activeIndex.value]);
      }
      break;
    case 'Escape':
      e.preventDefault();
      showDropdown.value = false;
      inputRef.value?.blur();
      break;
  }
}

function scrollActiveIntoView() {
  nextTick(() => {
    const dropdown = wrapRef.value?.querySelector('.city-select-dropdown');
    const activeEl = dropdown?.querySelector('.city-select-item.active');
    if (activeEl) {
      (activeEl as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  });
}

function selectCity(city: string) {
  query.value = city;
  emit('update:modelValue', city);
  showDropdown.value = false;
  activeIndex.value = -1;
  inputRef.value?.blur();
}

function clear() {
  query.value = '';
  emit('update:modelValue', '');
  showDropdown.value = false;
  activeIndex.value = -1;
  nextTick(() => inputRef.value?.focus());
}

function highlight(city: string): string {
  const q = query.value.trim();
  if (!q) return escapeHtml(city);

  const escaped = escapeRegex(q);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return escapeHtml(city).replace(regex, '<strong>$1</strong>');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
</script>

<style scoped>
.city-select-wrap {
  position: relative;
  width: 100%;
}

.city-select-input-row {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  transition: border-color 150ms ease-in-out, box-shadow 150ms ease-in-out;
  box-sizing: border-box;
}

.city-select-input-row.focused {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.city-select-input {
  flex: 1;
  min-width: 0;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--text-primary);
  outline: none;
  box-shadow: none;
}

.city-select-input::placeholder {
  color: var(--text-light);
}

.city-select-clear {
  flex-shrink: 0;
  padding: 0 var(--spacing-sm);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  transition: color 150ms ease-in-out;
}

.city-select-clear:hover {
  color: var(--text-primary);
}

.city-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: var(--z-dropdown);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 240px;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  overscroll-behavior: contain;
}

.city-select-item {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: background 100ms ease-in-out;
}

.city-select-item:hover,
.city-select-item.active {
  background: var(--bg-secondary);
}

.city-select-item.active {
  background: var(--bg-tertiary);
}

.city-select-item :deep(strong) {
  font-weight: 600;
  color: var(--primary);
}

.city-select-input-row.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.city-select-error-msg {
  color: #ef4444;
  font-size: var(--text-xs);
  margin-top: 4px;
}

/* Mobile: limit dropdown height and ensure it appears below */
@media (max-width: 640px) {
  .city-select-dropdown {
    max-height: 200px;
  }
}
</style>
