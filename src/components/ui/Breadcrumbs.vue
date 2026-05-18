<template>
  <nav class="bc-root" aria-label="Trilha de navegação">
    <ol class="bc-list">
      <li v-for="(item, idx) in items" :key="idx" class="bc-item">
        <a v-if="item.href && idx < items.length - 1" :href="item.href" class="bc-link">{{ item.label }}</a>
        <span v-else class="bc-current" :aria-current="idx === items.length - 1 ? 'page' : undefined">{{ item.label }}</span>
        <span v-if="idx < items.length - 1" class="bc-sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

export interface Crumb {
  label: string;
  href?: string;
}

defineProps<{ items: Crumb[] }>();
</script>

<style scoped>
.bc-root { font-family: var(--font-sans); }
.bc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}
.bc-item { display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-xs); }
.bc-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}
.bc-link:hover { color: var(--primary); text-decoration: underline; }
.bc-current { color: var(--text-primary); font-weight: 600; }
.bc-sep { color: var(--text-light); }
</style>
