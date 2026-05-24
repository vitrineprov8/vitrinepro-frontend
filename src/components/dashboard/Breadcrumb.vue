<template>
  <nav class="db-breadcrumb" aria-label="Breadcrumb">
    <ol class="db-breadcrumb-list">
      <li v-for="(item, idx) in items" :key="idx" class="db-breadcrumb-item">
        <span v-if="idx > 0" class="db-breadcrumb-sep" aria-hidden="true">/</span>
        <a v-if="item.href" :href="item.href" class="db-breadcrumb-link">{{ item.label }}</a>
        <span v-else class="db-breadcrumb-current" aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  items: { label: string; href?: string }[];
}>();
</script>

<style scoped>
.db-breadcrumb {
  margin-bottom: var(--spacing-md);
}
.db-breadcrumb-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.db-breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
}
.db-breadcrumb-sep {
  color: var(--text-light);
  font-size: var(--text-sm);
  user-select: none;
}
.db-breadcrumb-link {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.15s;
}
.db-breadcrumb-link:hover {
  color: var(--primary);
  text-decoration: underline;
}
.db-breadcrumb-current {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: 500;
}
</style>
