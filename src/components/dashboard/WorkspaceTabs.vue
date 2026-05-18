<template>
  <div class="wt-root" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="tab.id === active"
      :tabindex="tab.id === active ? 0 : -1"
      class="wt-tab"
      :class="{ 'wt-tab--active': tab.id === active }"
      @click="emit('update:active', tab.id)"
      @keydown="onKey($event, tab.id)"
    >
      <span class="wt-tab-label">{{ tab.label }}</span>
      <span v-if="tab.badge" class="wt-tab-badge">{{ tab.badge }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

export interface WorkspaceTab {
  id: string;
  label: string;
  badge?: string | number;
}

const props = defineProps<{
  tabs: WorkspaceTab[];
  active: string;
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'update:active', id: string): void;
}>();

function onKey(ev: KeyboardEvent, id: string) {
  const idx = props.tabs.findIndex((t) => t.id === id);
  if (idx === -1) return;
  if (ev.key === 'ArrowRight') {
    ev.preventDefault();
    const next = props.tabs[(idx + 1) % props.tabs.length];
    if (next) emit('update:active', next.id);
  } else if (ev.key === 'ArrowLeft') {
    ev.preventDefault();
    const prev = props.tabs[(idx - 1 + props.tabs.length) % props.tabs.length];
    if (prev) emit('update:active', prev.id);
  }
}
</script>

<style scoped>
.wt-root {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.wt-root::-webkit-scrollbar { display: none; }

.wt-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px 24px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.wt-tab:hover:not(.wt-tab--active) {
  background: var(--border-light);
  color: var(--text-primary);
}
.wt-tab:focus-visible {
  outline: 2px solid var(--primary-light);
  outline-offset: 2px;
}
.wt-tab--active {
  background: var(--primary);
  color: #ffffff;
}
.wt-tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.25);
}
.wt-tab:not(.wt-tab--active) .wt-tab-badge {
  background: var(--bg-primary);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .wt-tab { padding: 8px 16px; font-size: 13px; }
}
</style>
