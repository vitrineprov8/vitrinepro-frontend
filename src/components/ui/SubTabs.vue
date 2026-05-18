<template>
  <nav class="st-root" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="tab.id === active"
      :tabindex="tab.id === active ? 0 : -1"
      class="st-tab"
      :class="{ 'st-tab--active': tab.id === active }"
      @click="emit('update:active', tab.id)"
    >
      {{ tab.label }}
      <span v-if="tab.count != null" class="st-count">{{ tab.count }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

export interface SubTab {
  id: string;
  label: string;
  count?: number;
}

defineProps<{
  tabs: SubTab[];
  active: string;
  ariaLabel?: string;
}>();

const emit = defineEmits<{ (e: 'update:active', id: string): void }>();
</script>

<style scoped>
.st-root {
  display: flex;
  gap: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
}
.st-tab {
  position: relative;
  padding: var(--spacing-sm) 4px;
  border: none;
  background: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: -1px;
  border-bottom: 3px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.st-tab:hover { color: var(--text-primary); }
.st-tab:focus-visible {
  outline: 2px solid var(--primary-light);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
.st-tab--active {
  color: var(--text-primary);
  font-weight: 600;
  border-bottom-color: var(--primary);
}
.st-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}
.st-tab--active .st-count {
  background: var(--primary);
  color: #ffffff;
}
</style>
