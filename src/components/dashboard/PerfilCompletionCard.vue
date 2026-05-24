<template>
  <div class="pcc-root">
    <div class="pcc-header">
      <div class="pcc-header-text">
        <h3 class="pcc-title">Completar perfil</h3>
        <p class="pcc-subtitle">Perfis completos recebem mais visitas e candidaturas</p>
      </div>
      <div class="pcc-progress-ring" :style="ringStyle" :aria-label="`${pct}% completo`">
        <span class="pcc-pct">{{ pct }}%</span>
      </div>
    </div>

    <div class="pcc-bar-track" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100">
      <div class="pcc-bar-fill" :style="{ width: pct + '%' }" />
    </div>

    <ul class="pcc-checklist" aria-label="Itens do perfil">
      <li
        v-for="item in items"
        :key="item.id"
        class="pcc-item"
        :class="{ 'pcc-item--done': item.done }"
      >
        <span class="pcc-item-icon" :aria-hidden="true">
          <svg v-if="item.done" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>
        <a :href="item.href" class="pcc-item-label">{{ item.label }}</a>
        <span v-if="item.done" class="pcc-item-done-badge">Feito</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import type { Ref } from 'vue';
import { getCVList, getEducation, getPortfolioItems } from '../../utils/api';
import type { FullProfile } from '../../utils/api';

const currentUser = inject<Ref<FullProfile | null>>('currentUser');

const hasCV = ref(false);
const hasEducation = ref(false);
const hasPortfolio = ref(false);

async function loadExtras() {
  try {
    const [cvs, edus, port] = await Promise.all([
      getCVList().catch(() => []),
      getEducation().catch(() => []),
      getPortfolioItems({ limit: 1 }).catch(() => ({ data: [] as unknown[] } as any)),
    ]);
    hasCV.value = Array.isArray(cvs) && cvs.length > 0;
    hasEducation.value = Array.isArray(edus) && edus.length > 0;
    hasPortfolio.value = Array.isArray(port?.data) && port.data.length > 0;
  } catch { /* silent */ }
}

watch(
  () => currentUser?.value?.id,
  (id) => { if (id) loadExtras(); },
  { immediate: true },
);

interface CheckItem {
  id: string;
  label: string;
  href: string;
  done: boolean;
}

const items = computed<CheckItem[]>(() => {
  const p = currentUser?.value;
  const sl = p?.socialLinks ?? {};
  const hasSocial = !!(
    sl.linkedin || sl.github || sl.twitter || sl.instagram ||
    sl.facebook || sl.youtube || sl.tiktok || p?.website
  );

  return [
    {
      id: 'avatar',
      label: 'Adicionar foto de perfil',
      href: '/dashboard/perfil',
      done: !!p?.avatarUrl,
    },
    {
      id: 'bio',
      label: 'Escrever bio / apresentacao',
      href: '/dashboard/perfil',
      done: !!p?.bio?.trim(),
    },
    {
      id: 'profissao',
      label: 'Informar profissao',
      href: '/dashboard/perfil',
      done: !!p?.profession?.trim(),
    },
    {
      id: 'cidade',
      label: 'Adicionar cidade',
      href: '/dashboard/perfil',
      done: !!p?.location?.trim(),
    },
    {
      id: 'redes',
      label: 'Conectar redes sociais',
      href: '/dashboard/perfil',
      done: hasSocial,
    },
    {
      id: 'curriculo',
      label: 'Fazer upload de curriculo',
      href: '/dashboard/curriculos',
      done: hasCV.value,
    },
    {
      id: 'formacao',
      label: 'Adicionar formacao academica',
      href: '/dashboard/formacao',
      done: hasEducation.value,
    },
    {
      id: 'portfolio',
      label: 'Publicar item no portfolio',
      href: '/dashboard/portfolio',
      done: hasPortfolio.value,
    },
  ];
});

const pct = computed(() => {
  if (!items.value.length) return 0;
  const done = items.value.filter((i) => i.done).length;
  return Math.round((done / items.value.length) * 100);
});

const ringStyle = computed(() => {
  const c = pct.value;
  const color = c >= 80 ? '#16a34a' : c >= 50 ? '#2563eb' : '#f59e0b';
  return { '--ring-pct': `${c}%`, '--ring-color': color };
});
</script>

<style scoped>
.pcc-root {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.pcc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
}

.pcc-header-text { flex: 1; min-width: 0; }

.pcc-title {
  margin: 0 0 2px;
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
}

.pcc-subtitle {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

/* Progress ring as a conic-gradient circle */
.pcc-progress-ring {
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: conic-gradient(var(--ring-color, var(--primary)) var(--ring-pct, 0%), var(--bg-tertiary, #f3f4f6) 0%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pcc-progress-ring::after {
  content: '';
  position: absolute;
  inset: 7px;
  background: var(--bg-primary);
  border-radius: 50%;
}

.pcc-pct {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Linear progress bar */
.pcc-bar-track {
  height: 6px;
  background: var(--bg-tertiary, #f3f4f6);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.pcc-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

/* Checklist */
.pcc-checklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pcc-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 6px 0;
  border-bottom: 1px solid var(--bg-secondary, #f9fafb);
}

.pcc-item:last-child { border-bottom: none; }

.pcc-item-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pcc-item--done .pcc-item-icon { color: #16a34a; }
.pcc-item:not(.pcc-item--done) .pcc-item-icon { color: var(--text-muted, #9ca3af); }

.pcc-item-label {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.pcc-item--done .pcc-item-label {
  color: var(--text-secondary);
  text-decoration: line-through;
}

.pcc-item-label:hover { color: var(--primary); }

.pcc-item-done-badge {
  font-size: 11px;
  font-weight: 600;
  color: #16a34a;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  white-space: nowrap;
}

.pcc-item-label {
  min-width: 0;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .pcc-root { padding: var(--spacing-md); }
  .pcc-progress-ring { width: 48px; height: 48px; }
  .pcc-progress-ring::after { inset: 6px; }
  .pcc-pct { font-size: 11px; }
  .pcc-title { font-size: var(--text-sm); }
  .pcc-subtitle { font-size: 11px; }
  .pcc-item-label { font-size: var(--text-xs); }
  .pcc-item-done-badge { font-size: 10px; padding: 2px 6px; }
}
</style>
