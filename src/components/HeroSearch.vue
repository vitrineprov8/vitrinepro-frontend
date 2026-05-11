<template>
  <section :class="$style.hero" aria-label="Busca de profissionais">
    <div class="container">
      <div :class="$style.content">
        <h1 :class="$style.title">
          Encontre os melhores profissionais
        </h1>
<!--         <p :class="$style.subtitle">
          Advogados, médicos, designers, desenvolvedores e muito mais — tudo em um só lugar.
        </p>
 -->
        <!-- Search input -->
        <div :class="$style.searchWrap" role="search">
          <div :class="$style.inputWrap">
            <span :class="$style.searchIcon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              :class="$style.input"
              placeholder="Buscar arquitetos, designers, médicos..."
              autocomplete="off"
              aria-label="Campo de busca"
              @keydown.enter="submit"
              @keydown.escape="closeDropdown"
              @focus="onFocus"
              @blur="onBlur"
            />
            <button
              v-if="query"
              :class="$style.clearBtn"
              type="button"
              aria-label="Limpar busca"
              @click="clearQuery"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <!-- Autocomplete dropdown -->
            <div
              v-if="showDropdown && suggestions.length"
              :class="$style.dropdown"
              role="listbox"
              aria-label="Sugestoes de busca"
            >
              <button
                v-for="(s, i) in suggestions"
                :key="i"
                :class="$style.dropdownItem"
                type="button"
                role="option"
                @mousedown.prevent="selectSuggestion(s)"
              >
                <span :class="$style.dropdownIcon" aria-hidden="true">{{ iconByType(s.type) }}</span>
                <span>{{ s.label }}</span>
                <span :class="$style.dropdownType">{{ labelByType(s.type) }}</span>
              </button>
            </div>
          </div>

          <button
            :class="$style.submitBtn"
            type="button"
            @click="submit"
          >
            Buscar
          </button>
        </div>

        <!-- Quick suggestion chips -->
        <div :class="$style.chips" aria-label="Categorias populares">
          <span :class="$style.chipsLabel">Popular:</span>
          <button
            v-for="chip in quickChips"
            :key="chip"
            :class="$style.chip"
            type="button"
            @click="searchChip(chip)"
          >
            {{ chip }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { searchAutocomplete, type AutocompleteSuggestion } from '../utils/api';

const query = ref('');
const suggestions = ref<AutocompleteSuggestion[]>([]);
const showDropdown = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const quickChips = [
  'Arquiteto',
  'Designer',
  'Médico',
  'Advogado',
  'Desenvolvedor',
  'Coordenador',
  'Engenheiro',
];

function iconByType(type: string): string {
  const icons: Record<string, string> = {
    professional: '👤',
    specialty: '💼',
    tag: '🏷',
    project: '📁',
  };
  return icons[type] ?? '🔍';
}

function labelByType(type: string): string {
  const labels: Record<string, string> = {
    professional: 'Profissional',
    specialty: 'Especialidade',
    tag: 'Tag',
    project: 'Projeto',
  };
  return labels[type] ?? '';
}

watch(query, (val) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  if (!val || val.length < 2) {
    suggestions.value = [];
    showDropdown.value = false;
    return;
  }
  debounceTimer = setTimeout(async () => {
    try {
      suggestions.value = await searchAutocomplete(val);
      if (suggestions.value.length) showDropdown.value = true;
    } catch {
      suggestions.value = [];
    }
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

function closeDropdown() {
  showDropdown.value = false;
}

function clearQuery() {
  query.value = '';
  suggestions.value = [];
  showDropdown.value = false;
  inputRef.value?.focus();
}

function selectSuggestion(s: AutocompleteSuggestion) {
  query.value = s.label;
  showDropdown.value = false;
  submit();
}

function submit() {
  const term = query.value.trim();
  if (!term) {
    window.location.href = '/vitrine';
    return;
  }
  window.location.href = '/vitrine?q=' + encodeURIComponent(term);
}

function searchChip(term: string) {
  window.location.href = '/vitrine?q=' + encodeURIComponent(term);
}

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
});
</script>

<style module>
/* ── Hero Section ─────────────────────────────────────────────────────── */
.hero {
  padding: 80px 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #7c3aed 100%);
  position: relative;
  overflow: hidden;
}

/* Subtle decorative blobs */
.hero::before,
.hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.hero::before {
  width: 500px;
  height: 500px;
  top: -200px;
  right: -100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, transparent 70%);
}

.hero::after {
  width: 350px;
  height: 350px;
  bottom: -150px;
  left: -80px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-lg);
  max-width: 720px;
  margin: 0 auto;
}

/* ── Titles ─────────────────────────────────────────────────────────── */
.title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.1;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0;
}

.subtitle {
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: rgba(255, 255, 255, 0.82);
  line-height: var(--leading-relaxed);
  margin: 0;
  max-width: 560px;
}

/* ── Search Wrap ─────────────────────────────────────────────────────── */
.searchWrap {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
  margin-top: var(--spacing-md);
}

.inputWrap {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.searchIcon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 1;
}

.input {
  width: 100%;
  height: 52px;
  font-size: var(--text-base);
  padding: 0 44px 0 48px;
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  background: #ffffff;
  color: var(--text-primary);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  box-sizing: border-box;
  font-family: var(--font-sans);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.input:focus {
  outline: none;
  border-color: var(--primary-light);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.input::placeholder {
  color: var(--text-light);
}

.clearBtn {
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
  padding: 0;
}

.clearBtn:hover {
  background: var(--border-dark);
  color: var(--text-primary);
}

.submitBtn {
  height: 52px;
  padding: 0 28px;
  border: none;
  border-radius: var(--radius-xl);
  background: var(--accent);
  color: white;
  font-weight: 700;
  font-size: var(--text-base);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  font-family: var(--font-sans);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
  flex-shrink: 0;
}

.submitBtn:hover {
  background: var(--accent-dark);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
}

.submitBtn:active {
  transform: translateY(0);
}

/* ── Autocomplete Dropdown ────────────────────────────────────────────── */
.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  z-index: var(--z-dropdown);
  max-height: 300px;
  overflow-y: auto;
  text-align: left;
}

.dropdownItem {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: background var(--transition-fast);
  min-height: 44px;
  text-align: left;
  font-family: var(--font-sans);
}

.dropdownItem:hover {
  background: var(--bg-secondary);
}

.dropdownIcon {
  font-size: 14px;
  flex-shrink: 0;
}

.dropdownType {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--text-light);
  flex-shrink: 0;
}

/* ── Quick Chips ─────────────────────────────────────────────────────── */
.chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

.chipsLabel {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  flex-shrink: 0;
}

.chip {
  padding: 6px 16px;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
  font-family: var(--font-sans);
  white-space: nowrap;
  min-height: 34px;
  display: flex;
  align-items: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.chip:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.chip:active {
  transform: translateY(0);
}

/* ── Responsive ─────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .hero {
    padding: 60px 0 72px;
  }

  .searchWrap {
    flex-direction: column;
  }

  .submitBtn {
    width: 100%;
    height: 48px;
  }

  .input {
    height: 48px;
  }

  .chips {
    gap: 6px;
  }

  .chip {
    font-size: var(--text-xs);
    padding: 5px 12px;
  }
}

@media (max-width: 400px) {
  .title {
    font-size: 1.75rem;
  }
}
</style>
