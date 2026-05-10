<template>
  <article class="vaga-detail">
    <Toast ref="toast" />

    <a href="/vagas" class="vaga-back">← Voltar para vagas</a>

    <header class="vaga-header">
      <h1 class="vaga-title">{{ vaga.title }}</h1>
      <div v-if="vaga.companyName || vaga.source === 'GUPY'" class="vaga-company">
        <span v-if="vaga.companyName" class="vaga-company-name">{{ vaga.companyName }}</span>
        <span v-if="vaga.source === 'GUPY'" class="vaga-gupy-badge">via Gupy</span>
      </div>
      <div class="vaga-meta">
        <span v-if="vaga.type" class="vaga-tag">{{ typeLabel(vaga.type) }}</span>
        <span v-if="vaga.workMode" class="vaga-tag">{{ workModeLabel(vaga.workMode) }}</span>
        <span v-if="vaga.location" class="vaga-tag">📍 {{ vaga.location }}</span>
        <span v-if="vaga.salaryMin" class="vaga-tag">💰 {{ formatSalary(vaga.salaryMin, vaga.salaryMax) }}</span>
      </div>
      <p v-if="vaga.deadline" class="vaga-deadline">
        Candidaturas abertas até {{ formatDate(vaga.deadline) }}
      </p>
      <p v-if="vaga.source === 'GUPY'" class="vaga-gupy-note">
        Esta vaga é gerenciada na Gupy. Ao candidatar-se, registramos seus dados aqui e você será redirecionado ao career page para finalizar.
      </p>
    </header>

    <section class="vaga-section">
      <h2>Descrição</h2>
      <p class="vaga-text">{{ vaga.description }}</p>
    </section>

    <section v-if="vaga.requirements" class="vaga-section">
      <h2>Requisitos</h2>
      <p class="vaga-text">{{ vaga.requirements }}</p>
    </section>

    <section v-if="vaga.benefits" class="vaga-section">
      <h2>Benefícios</h2>
      <p class="vaga-text">{{ vaga.benefits }}</p>
    </section>

    <div id="apply" class="vaga-cta">
      <button
        class="btn btn-primary btn-lg"
        :disabled="!canApply"
        @click="onApplyClick"
      >
        {{ ctaLabel }}
      </button>
      <p v-if="!canApply" class="vaga-cta-note">
        Esta vaga está encerrada e não aceita mais candidaturas.
      </p>
    </div>

    <ApplyVagaModal
      :visible="showModal"
      :vaga="vaga"
      @close="showModal = false"
      @applied="onApplied"
    />
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Toast from '../ui/Toast.vue';
import ApplyVagaModal from './ApplyVagaModal.vue';
import { isAuthenticated, redirectToLogin } from '../../utils/auth';
import type { Vaga, VagaType, VagaWorkMode } from '../../utils/api';

const props = defineProps<{ vaga: Vaga }>();

const toast = ref<InstanceType<typeof Toast>>();
const showModal = ref(false);

const canApply = computed(() => {
  if (props.vaga.status !== 'PUBLISHED') return false;
  if (props.vaga.deadline && new Date(props.vaga.deadline) < new Date()) return false;
  return true;
});

const ctaLabel = computed(() => (canApply.value ? 'Candidatar-me' : 'Vaga encerrada'));

function onApplyClick() {
  if (!canApply.value) return;
  if (!isAuthenticated()) {
    redirectToLogin(`/vaga/${props.vaga.slug}#apply`);
    return;
  }
  showModal.value = true;
}

function onApplied() {
  showModal.value = false;
  toast.value?.show('Candidatura enviada com sucesso!', 'success');
}

function typeLabel(t: VagaType): string {
  return ({ CLT: 'CLT', PJ: 'PJ', FREELA: 'Freelance', ESTAGIO: 'Estágio' } as const)[t];
}
function workModeLabel(m: VagaWorkMode): string {
  return ({ REMOTE: 'Remoto', HYBRID: 'Híbrido', ONSITE: 'Presencial' } as const)[m];
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
</script>

<style scoped>
.vaga-detail {
  max-width: 760px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
}
.vaga-back {
  display: inline-block;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
}
.vaga-back:hover {
  color: var(--primary-color, #6366f1);
}
.vaga-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}
.vaga-title {
  font-size: 2rem;
  margin: 0 0 0.75rem;
  color: var(--text-primary);
}
.vaga-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}
.vaga-tag {
  background: var(--bg-muted, #f3f4f6);
  color: var(--text-secondary);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
}
.vaga-deadline {
  color: var(--text-muted, #6b7280);
  font-size: 0.9rem;
  margin: 0;
}
.vaga-company {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--text-secondary);
}
.vaga-company-name {
  font-weight: 600;
  color: var(--text-primary);
}
.vaga-gupy-badge {
  background: #ede9fe;
  color: #5b21b6;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.vaga-gupy-note {
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  color: #4c1d95;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  margin: 0.75rem 0 0;
}
.vaga-section {
  margin-bottom: 1.75rem;
}
.vaga-section h2 {
  font-size: 1.15rem;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}
.vaga-text {
  color: var(--text-secondary);
  white-space: pre-line;
  line-height: 1.6;
  margin: 0;
}
.vaga-cta {
  margin-top: 2rem;
  text-align: center;
}
.vaga-cta-note {
  margin-top: 0.5rem;
  color: var(--text-muted, #6b7280);
  font-size: 0.9rem;
}
</style>
