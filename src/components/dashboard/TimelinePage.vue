<template>
  <DashboardLayout>
    <div class="tp-root">
      <Breadcrumbs :items="crumbs" />
      <VagasTimeline :vagas="vagas" />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import DashboardLayout from './DashboardLayout.vue';
import Breadcrumbs from '../ui/Breadcrumbs.vue';
import VagasTimeline from './VagasTimeline.vue';
import { MOCK_VAGAS } from '../../data/mock-recrutador';

const vagas = MOCK_VAGAS;
const crumbs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Publicar vagas', href: '/dashboard/recrutador/pessoal' },
  { label: 'Timeline' },
];
</script>

<style scoped>
.tp-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  max-width: 1280px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .tp-root { padding: var(--spacing-md); }
}
</style>
