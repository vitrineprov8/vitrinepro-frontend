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
        placeholder="Buscar por título ou descrição"
        class="vagas-search"
        @keyup.enter="reload"
      />
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
      <button class="btn btn-secondary" @click="reload">Buscar</button>
    </div>

    <div v-if="loading" class="vagas-state">Carregando...</div>

    <div v-else-if="vagas.length === 0" class="vagas-state">
      Nenhuma vaga aberta no momento.
    </div>

    <ul v-else class="vagas-list">
      <li v-for="v in vagas" :key="v.id" class="vagas-card">
        <a :href="`/vaga/${v.slug}`" class="vagas-card-link">
          <h2 class="vagas-card-title">{{ v.title }}</h2>
          <div class="vagas-card-meta">
            <span v-if="v.type" class="vagas-tag">{{ typeLabel(v.type) }}</span>
            <span v-if="v.workMode" class="vagas-tag">{{ workModeLabel(v.workMode) }}</span>
            <span v-if="v.location" class="vagas-tag">📍 {{ v.location }}</span>
          </div>
          <p class="vagas-card-desc">{{ truncate(v.description, 200) }}</p>
          <div class="vagas-card-footer">
            <span v-if="v.salaryMin">{{ formatSalary(v.salaryMin, v.salaryMax) }}</span>
            <span v-if="v.deadline" class="vagas-deadline">
              até {{ formatDate(v.deadline) }}
            </span>
          </div>
        </a>
      </li>
    </ul>

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
import { getPublicVagas } from '../../utils/api';
import type { Vaga, VagaType, VagaWorkMode } from '../../utils/api';

const loading = ref(true);
const vagas = ref<Vaga[]>([]);
const page = ref(1);
const totalPages = ref(1);
const q = ref('');
const type = ref<VagaType | ''>('');
const workMode = ref<VagaWorkMode | ''>('');

async function load() {
  loading.value = true;
  try {
    const res = await getPublicVagas({
      page: page.value,
      limit: 12,
      q: q.value || undefined,
      type: type.value || undefined,
      workMode: workMode.value || undefined,
    });
    vagas.value = res.data;
    totalPages.value = res.lastPage;
  } catch {
    vagas.value = [];
    totalPages.value = 1;
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

onMounted(load);
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
  margin-bottom: 1.5rem;
}
.vagas-search {
  flex: 1 1 240px;
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.95rem;
}
.vagas-select {
  padding: 0.6rem 0.85rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  background: white;
  font-size: 0.95rem;
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
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  transition: border-color 0.15s, transform 0.15s;
}
.vagas-card:hover {
  border-color: var(--primary-color, #6366f1);
  transform: translateY(-1px);
}
.vagas-card-link {
  display: block;
  padding: 1.25rem;
  color: inherit;
  text-decoration: none;
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
  background: var(--bg-muted, #f3f4f6);
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
  color: var(--text-muted, #6b7280);
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
