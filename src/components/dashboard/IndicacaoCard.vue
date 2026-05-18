<template>
  <div class="ic-card">
    <div class="ic-head">
      <div class="ic-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12v10H4V12M22 7H2v5h20zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7"/></svg>
      </div>
      <div class="ic-text">
        <div class="ic-title">Clube de Indicação 50/50</div>
        <div class="ic-desc">Quem usa seu código ganha <strong>50% off</strong> no primeiro mês e você ganha <strong>50% do valor</strong> do plano deles.</div>
      </div>
    </div>

    <div class="ic-row">
      <div class="ic-code">{{ code }}</div>
      <button class="ic-btn ic-btn--ghost" type="button" @click="copy" :aria-label="copied ? 'Copiado' : 'Copiar código'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {{ copied ? 'Copiado!' : 'Copiar' }}
      </button>
      <button class="ic-btn ic-btn--primary" type="button" @click="share">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0 0 12.05 0C5.45 0 .12 5.33.12 11.93c0 2.1.55 4.16 1.6 5.97L0 24l6.27-1.65a11.93 11.93 0 0 0 5.78 1.47h.01c6.6 0 11.92-5.33 11.92-11.93 0-3.18-1.24-6.18-3.46-8.41ZM12.05 21.79h-.01a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.72.98 1-3.63-.24-.37a9.84 9.84 0 0 1-1.5-5.24c0-5.45 4.44-9.88 9.9-9.88 2.65 0 5.13 1.03 7 2.9a9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.83-9.94 9.83Z"/></svg>
        Compartilhar
      </button>
    </div>

    <div class="ic-stats">
      <div>Indicações: <strong>{{ uses }}</strong></div>
      <div>Recompensas: <strong class="ic-reward">{{ rewardMonths }} {{ rewardMonths === 1 ? 'mês' : 'meses' }} grátis</strong></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

defineProps<{
  code: string;
  uses: number;
  rewardMonths: number;
}>();

const copied = ref(false);

function copy() {
  const codeEl = document.querySelector('.ic-code');
  const value = codeEl?.textContent?.trim() ?? '';
  if (navigator.clipboard && value) {
    navigator.clipboard.writeText(value).then(() => {
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 1800);
    }).catch(() => { copied.value = false; });
  }
}

function share() {
  const codeEl = document.querySelector('.ic-code');
  const value = codeEl?.textContent?.trim() ?? '';
  const text = `Use meu código de indicação ${value} no VitrinePro e ganhe 50% off no primeiro mês! https://v8pro.com.br`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener');
}
</script>

<style scoped>
.ic-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
.ic-head { display: flex; gap: var(--spacing-md); align-items: flex-start; }
.ic-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--secondary);
  color: #ffffff;
  border-radius: var(--radius-md);
}
.ic-title { font-size: var(--text-base); font-weight: 600; color: var(--text-primary); }
.ic-desc { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }

.ic-row {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}
.ic-code {
  flex: 1;
  font-family: var(--font-mono);
  font-size: var(--text-base);
  letter-spacing: 0.12em;
  padding: 10px 14px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  min-width: 180px;
  text-align: center;
}
.ic-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
  border: 1px solid var(--border);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background var(--transition-fast);
}
.ic-btn:hover { background: var(--bg-secondary); }
.ic-btn--primary {
  background: #128c7e;
  border-color: #128c7e;
  color: #ffffff;
}
.ic-btn--primary:hover { background: #0e7268; }

.ic-stats {
  display: flex;
  gap: var(--spacing-lg);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.ic-stats strong { color: var(--text-primary); font-weight: 600; }
.ic-reward { color: var(--age-fresh-text) !important; }
</style>
