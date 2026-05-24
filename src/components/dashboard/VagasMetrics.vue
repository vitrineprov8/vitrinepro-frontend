<template>
  <div class="vm-grid">
    <button
      v-for="metric in metrics"
      :key="metric.id"
      type="button"
      class="vm-card"
      :aria-label="`${metric.label}, ${metric.value} ${metric.helper || ''}`"
      @click="emit('select', metric.id)"
    >
      <div class="vm-label">{{ metric.label }}</div>
      <div class="vm-value">{{ metric.value }}</div>
      <div class="vm-helper" :class="trendClass(metric.trend)">
        <span v-if="metric.trend && metric.trend > 0">↗ +{{ metric.trend }} esta semana</span>
        <span v-else-if="metric.trend && metric.trend < 0">↘ {{ metric.trend }} esta semana</span>
        <span v-else>{{ metric.helper || '— sem mudança' }}</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

export interface Metric {
  id: string;
  label: string;
  value: number | string;
  trend?: number;
  helper?: string;
}

defineProps<{ metrics: Metric[] }>();
const emit = defineEmits<{ (e: 'select', id: string): void }>();

function trendClass(trend?: number): string {
  if (!trend) return 'vm-helper--neutral';
  return trend > 0 ? 'vm-helper--positive' : 'vm-helper--negative';
}
</script>

<style scoped>
.vm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-md);
}
.vm-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: left;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: border-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}
.vm-card:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
.vm-card:focus-visible {
  outline: 2px solid var(--primary-light);
  outline-offset: 2px;
}
.vm-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  font-weight: 600;
}
.vm-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.vm-helper {
  font-size: var(--text-xs);
}
.vm-helper--positive { color: var(--age-fresh-text); }
.vm-helper--negative { color: var(--age-critical-text); }
.vm-helper--neutral  { color: var(--text-light); }

@media (max-width: 768px) {
  .vm-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--spacing-sm);
  }
  .vm-card { padding: var(--spacing-md); }
  .vm-value { font-size: 22px; }
  .vm-label { font-size: 10px; }
  .vm-helper { font-size: 10px; }
}
</style>
