<template>
  <div v-if="totalPages > 1" class="pagination">
    <button class="page-btn" :disabled="currentPage <= 1" @click="emit('page-changed', currentPage - 1)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
    </button>
    <template v-for="p in pages" :key="p">
      <span v-if="p === '...'" style="color: var(--text-light); padding: 0 4px;">…</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="emit('page-changed', p as number)"
      >{{ p }}</button>
    </template>
    <button class="page-btn" :disabled="currentPage >= totalPages" @click="emit('page-changed', currentPage + 1)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ currentPage: number; totalPages: number }>();
const emit = defineEmits<{ 'page-changed': [page: number] }>();

const pages = computed(() => {
  const p = props.currentPage;
  const t = props.totalPages;
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
  if (p <= 4) return [1, 2, 3, 4, 5, '...', t];
  if (p >= t - 3) return [1, '...', t - 4, t - 3, t - 2, t - 1, t];
  return [1, '...', p - 1, p, p + 1, '...', t];
});
</script>
