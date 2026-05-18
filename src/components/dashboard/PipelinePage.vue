<template>
  <DashboardLayout>
    <div class="pp-root">
      <Breadcrumbs :items="crumbs" />
      <CandidatePipeline
        v-if="vaga"
        :vaga-title="vaga.title"
        :subline="`${vaga.location} · prazo ${formatDate(vaga.deadline)} · ${vaga.applicantsCount} candidatos`"
        :candidates="candidates"
      />
      <div v-else class="pp-empty">
        <h3>Vaga não encontrada</h3>
        <p>O id <code>{{ vagaId }}</code> não existe nos dados mock. <a href="/dashboard/recrutador">Voltar</a></p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Breadcrumbs from '../ui/Breadcrumbs.vue';
import CandidatePipeline from './CandidatePipeline.vue';
import { MOCK_VAGAS, MOCK_CANDIDATES } from '../../data/mock-recrutador';

const props = defineProps<{ vagaId: string }>();

const vaga = computed(() => MOCK_VAGAS.find((v) => v.id === props.vagaId));
const candidates = computed(() => {
  if (!vaga.value) return [];
  if (vaga.value.id === 'v-001') return [...MOCK_CANDIDATES];
  return MOCK_CANDIDATES.slice(0, vaga.value.applicantsCount);
});
const crumbs = computed(() => [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Publicar vagas', href: '/dashboard/recrutador' },
  { label: vaga.value?.title ?? 'Vaga' },
  { label: 'Candidatos' },
]);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
</script>

<style scoped>
.pp-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  max-width: 1280px;
  margin: 0 auto;
}
.pp-empty {
  padding: var(--spacing-2xl);
  text-align: center;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}
.pp-empty h3 { margin: 0 0 var(--spacing-xs); }
.pp-empty p { color: var(--text-secondary); margin: 0; }
.pp-empty a { color: var(--primary); }
@media (max-width: 768px) {
  .pp-root { padding: var(--spacing-md); }
}
</style>
