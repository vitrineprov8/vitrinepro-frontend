<template>
  <section class="ha-root">
    <header class="ha-head">
      <h3 class="ha-title">Histórico de assinaturas</h3>
      <span class="ha-sub">Últimos pagamentos</span>
    </header>

    <ul class="ha-list">
      <li v-for="item in items" :key="item.id" class="ha-item">
        <div class="ha-item-id">
          <div class="ha-item-name">{{ item.plan }}</div>
          <div class="ha-item-date">{{ formatDate(item.date) }}</div>
        </div>
        <div class="ha-item-actions">
          <span class="ha-amount">{{ item.amount }}</span>
          <span class="ha-badge" :data-status="item.status">{{ statusLabel(item.status) }}</span>
        </div>
      </li>
      <li v-if="items.length === 0" class="ha-empty">Sem assinaturas anteriores</li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

export interface SubscriptionEntry {
  id: string;
  plan: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

defineProps<{ items: SubscriptionEntry[] }>();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(s: SubscriptionEntry['status']): string {
  if (s === 'paid') return 'Pago';
  if (s === 'pending') return 'Pendente';
  return 'Falhou';
}
</script>

<style scoped>
.ha-root { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.ha-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.ha-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.ha-sub { font-size: var(--text-xs); color: var(--text-light); }
.ha-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.ha-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}
.ha-item-name { font-weight: 600; color: var(--text-primary); }
.ha-item-date { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }
.ha-item-actions { display: flex; align-items: center; gap: var(--spacing-sm); }
.ha-amount { font-weight: 600; color: var(--text-primary); }
.ha-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: var(--radius-full);
}
.ha-badge[data-status='paid']    { background: var(--status-success-bg); color: var(--status-success-text); }
.ha-badge[data-status='pending'] { background: var(--status-pending-bg); color: var(--status-pending-text); }
.ha-badge[data-status='failed']  { background: var(--status-rejected-bg); color: var(--status-rejected-text); }
.ha-empty {
  padding: var(--spacing-md);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-light);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
}
</style>
