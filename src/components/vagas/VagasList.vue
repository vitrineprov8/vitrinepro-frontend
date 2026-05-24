<template>
  <section class="vagas-page">
    <header class="vagas-hero">
      <h1 class="vagas-hero-title">Vagas abertas</h1>
      <p class="vagas-hero-subtitle">
        Encontre oportunidades selecionadas pela equipe VitrinePro.
      </p>
    </header>

    <div class="vagas-toolbar">
      <input
        v-model="q"
        type="search"
        placeholder="Buscar por título, cargo ou cidade..."
        class="vagas-search"
        @keyup.enter="reload"
      />
      <select v-model="segmentFilter" class="vagas-select" @change="reload">
        <option value="">Segmento</option>
        <option v-for="s in SEGMENTS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select v-model="type" class="vagas-select" @change="reload">
        <option value="">Tipo</option>
        <option value="CLT">CLT</option>
        <option value="PJ">PJ</option>
        <option value="FREELA">Freelance</option>
        <option value="ESTAGIO">Estágio</option>
      </select>
      <select v-model="workMode" class="vagas-select" @change="reload">
        <option value="">Modalidade</option>
        <option value="REMOTE">Remoto</option>
        <option value="HYBRID">Híbrido</option>
        <option value="ONSITE">Presencial</option>
      </select>
      <select v-model="order" class="vagas-select" @change="reload">
        <option value="recent">Mais recentes</option>
        <option value="relevance">Relevância</option>
      </select>
      <button class="btn btn-secondary" @click="reload">Buscar</button>
    </div>

    <div v-if="loading" class="vagas-state">Carregando...</div>

    <div v-else-if="vagas.length === 0" class="vagas-state">
      Nenhuma vaga aberta no momento.
    </div>

    <div v-else>
      <p class="vagas-count">{{ total.toLocaleString('pt-BR') }} vagas encontradas</p>
      <ul class="vagas-list">
        <li v-for="v in vagas" :key="v.id" class="vagas-card">
          <button
            type="button"
            class="vagas-heart"
            :class="{ saved: savedIds.has(v.id) }"
            :disabled="savingId === v.id"
            :aria-label="savedIds.has(v.id) ? 'Remover dos salvos' : 'Salvar vaga'"
            @click.stop="toggleSave(v)"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="1.8">
              <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" :fill="savedIds.has(v.id) ? 'currentColor' : 'none'" />
            </svg>
          </button>
          <a :href="`/vaga/${v.slug}`" class="vagas-card-link">
            <div class="vagas-card-top">
              <span
                v-if="v.segment"
                class="vagas-segment-badge"
                :style="{ background: segmentColor(v.segment) + '1a', color: segmentColor(v.segment) }"
              >
                {{ segmentLabel(v.segment) }}
              </span>
              <span class="vagas-time">{{ formatRelativeTime(v.createdAt) }}</span>
            </div>
            <h2 class="vagas-card-title">{{ v.title }}</h2>
            <div class="vagas-card-meta">
              <span v-if="v.type" class="vagas-tag">{{ typeLabel(v.type) }}</span>
              <span v-if="v.workMode" class="vagas-tag">{{ workModeLabel(v.workMode) }}</span>
              <span v-if="v.location" class="vagas-tag">{{ v.location }}</span>
            </div>
            <p class="vagas-card-desc">{{ truncate(v.description, 200) }}</p>
            <div class="vagas-card-footer">
              <span v-if="v.salaryMin" class="vagas-salary">{{ formatSalary(v.salaryMin, v.salaryMax) }}</span>
              <span v-if="v.deadline" class="vagas-deadline">
                até {{ formatDate(v.deadline) }}
              </span>
            </div>
          </a>
        </li>
      </ul>
    </div>

    <nav v-if="totalPages > 1" class="vagas-pagination">
      <button class="btn btn-ghost btn-sm" :disabled="page <= 1" @click="goTo(page - 1)">
        Anterior
      </button>
      <span>Página {{ page }} de {{ totalPages }}</span>
      <button class="btn btn-ghost btn-sm" :disabled="page >= totalPages" @click="goTo(page + 1)">
        Próxima
      </button>
    </nav>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { radar, savedVagas } from '../../utils/api';
import type { Vaga, VagaType, VagaWorkMode, VagaSegment } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';

const loading = ref(true);
const vagas = ref<Vaga[]>([]);
const total = ref(0);
const page = ref(1);
const totalPages = ref(1);
const q = ref('');
const type = ref<VagaType | ''>('');
const workMode = ref<VagaWorkMode | ''>('');
const segmentFilter = ref<VagaSegment | ''>('');
const order = ref<'recent' | 'relevance'>('recent');

const savedIds = ref<Set<string>>(new Set());
const savingId = ref<string | null>(null);

const SEGMENTS: { value: VagaSegment | ''; label: string }[] = [
  { value: 'TECNOLOGIA', label: 'Tecnologia' },
  { value: 'COMERCIO_VENDAS', label: 'Comércio e Vendas' },
  { value: 'FINANCAS_CONTABILIDADE', label: 'Finanças' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'LOGISTICA_TRANSPORTE', label: 'Logística' },
  { value: 'RH', label: 'Recursos Humanos' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'JURIDICO', label: 'Jurídico' },
  { value: 'OUTROS', label: 'Outros' },
];

const SEGMENT_COLORS: Record<VagaSegment, string> = {
  TECNOLOGIA:             '#2563eb',
  COMERCIO_VENDAS:        '#7c3aed',
  FINANCAS_CONTABILIDADE: '#0891b2',
  ADMINISTRATIVO:         '#059669',
  LOGISTICA_TRANSPORTE:   '#d97706',
  RH:                     '#db2777',
  SAUDE:                  '#16a34a',
  EDUCACAO:               '#9333ea',
  MARKETING:              '#ea580c',
  JURIDICO:               '#4f46e5',
  OUTROS:                 '#6b7280',
};

const SEGMENT_LABELS: Record<VagaSegment, string> = {
  TECNOLOGIA:             'Tecnologia',
  COMERCIO_VENDAS:        'Comércio e Vendas',
  FINANCAS_CONTABILIDADE: 'Finanças',
  ADMINISTRATIVO:         'Administrativo',
  LOGISTICA_TRANSPORTE:   'Logística',
  RH:                     'Recursos Humanos',
  SAUDE:                  'Saúde',
  EDUCACAO:               'Educação',
  MARKETING:              'Marketing',
  JURIDICO:               'Jurídico',
  OUTROS:                 'Outros',
};

function segmentLabel(s: VagaSegment | null | undefined): string {
  return s ? (SEGMENT_LABELS[s] ?? s) : '';
}

function segmentColor(s: VagaSegment | null | undefined): string {
  return s ? (SEGMENT_COLORS[s] ?? '#6b7280') : '#6b7280';
}

function formatRelativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'agora';
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  return `há ${days}d`;
}

async function load() {
  loading.value = true;
  try {
    const res = await radar.search({
      q: q.value || undefined,
      segment: segmentFilter.value || undefined,
      type: type.value || undefined,
      workMode: workMode.value || undefined,
      order: order.value,
      page: page.value,
      limit: 12,
    });
    vagas.value = res.data;
    total.value = res.total;
    totalPages.value = res.lastPage;
  } catch {
    // Fallback: try legacy endpoint
    try {
      const { getPublicVagas } = await import('../../utils/api');
      const res2 = await getPublicVagas({
        page: page.value,
        limit: 12,
        q: q.value || undefined,
        type: type.value || undefined,
        workMode: workMode.value || undefined,
      });
      vagas.value = res2.data;
      total.value = res2.total;
      totalPages.value = res2.lastPage;
    } catch {
      vagas.value = [];
      total.value = 0;
      totalPages.value = 1;
    }
  } finally {
    loading.value = false;
  }
}

function reload() {
  page.value = 1;
  load();
}

function goTo(p: number) {
  page.value = p;
  load();
}

async function loadSavedIds() {
  if (!isAuthenticated()) return;
  try {
    const list = await savedVagas.list();
    savedIds.value = new Set(list.map(s => s.vagaId));
  } catch {
    // silent
  }
}

async function toggleSave(vaga: Vaga) {
  if (!isAuthenticated()) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    return;
  }
  if (savingId.value) return;
  savingId.value = vaga.id;
  try {
    if (savedIds.value.has(vaga.id)) {
      await savedVagas.unsave(vaga.id);
      savedIds.value.delete(vaga.id);
    } else {
      await savedVagas.save(vaga.id);
      savedIds.value.add(vaga.id);
    }
    savedIds.value = new Set(savedIds.value);
  } catch {
    // noop
  } finally {
    savingId.value = null;
  }
}

function typeLabel(t: VagaType): string {
  return ({ CLT: 'CLT', PJ: 'PJ', FREELA: 'Freelance', ESTAGIO: 'Estágio' } as const)[t];
}

function workModeLabel(m: VagaWorkMode): string {
  return ({ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' } as const)[m];
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

function formatSalary(min: number | string | null | undefined, max: number | string | null | undefined): string {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  const n1 = min != null ? Number(min) : NaN;
  const n2 = max != null ? Number(max) : NaN;
  if (Number.isFinite(n1) && Number.isFinite(n2)) return `${fmt(n1)} – ${fmt(n2)}`;
  if (Number.isFinite(n1)) return `A partir de ${fmt(n1)}`;
  return '';
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('pt-BR');
}

onMounted(async () => {
  await Promise.all([load(), loadSavedIds()]);
});
</script>

<style scoped>
.vagas-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}
.vagas-hero {
  text-align: center;
  margin-bottom: 2rem;
}
.vagas-hero-title {
  font-size: 2rem;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}
.vagas-hero-subtitle {
  color: var(--text-secondary);
  margin: 0;
}
.vagas-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.vagas-search {
  flex: 1 1 240px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
}
.vagas-select {
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
}
.vagas-count {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
.vagas-state {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem 0;
}
.vagas-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
}
.vagas-card {
  position: relative;
  background: var(--bg-primary);
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 12px;
  transition: border-color 0.15s, transform 0.15s;
}
.vagas-card:hover {
  border-color: var(--primary, #2563eb);
  transform: translateY(-1px);
}
.vagas-heart {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 30px;
  height: 30px;
  border: 1px solid var(--border, #e5e7eb);
  border-radius: 50%;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  z-index: 1;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
}
.vagas-heart:hover,
.vagas-heart.saved {
  color: #ef4444;
  border-color: #fca5a5;
  background: #fef2f2;
}
.vagas-heart:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.vagas-card-link {
  display: block;
  padding: 1.25rem;
  padding-right: 3rem;
  color: inherit;
  text-decoration: none;
}
.vagas-card-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}
.vagas-segment-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.vagas-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.vagas-card-title {
  font-size: 1.15rem;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
}
.vagas-card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}
.vagas-tag {
  background: var(--bg-secondary, #f3f4f6);
  color: var(--text-secondary);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
}
.vagas-card-desc {
  color: var(--text-secondary);
  margin: 0 0 0.75rem;
  line-height: 1.5;
  font-size: 0.95rem;
}
.vagas-card-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.vagas-salary {
  font-weight: 600;
  color: #16a34a;
}
.vagas-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  color: var(--text-secondary);
}
</style>
