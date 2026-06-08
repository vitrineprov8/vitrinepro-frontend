<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="hs-root">
    <div class="hs-header">
      <div class="hs-header-text">
        <h2 class="hs-title">{{ title }}</h2>
        <p v-if="subtitle" class="hs-subtitle">{{ subtitle }}</p>
      </div>
      <slot name="header-actions" />
    </div>

    <div v-if="$slots.tabs" class="hs-tabs-row">
      <slot name="tabs" />
    </div>

    <div class="hs-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hs-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  max-width: 1280px;
  margin: 0 auto;
}

.hs-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.hs-header-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hs-title {
  margin: 0;
  font-size: var(--text-xl, 1.25rem);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.hs-subtitle {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.hs-tabs-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.hs-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

@media (max-width: 768px) {
  .hs-root {
    padding: var(--spacing-md);
    gap: var(--spacing-md);
  }
}
</style>
