<template>
  <span class="badge" :class="badgeClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: string }>();

const badgeClass = computed(() => `badge-${props.status.toLowerCase()}`);

const labels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  ONGOING: 'Em andamento',
  COMPLETED: 'Concluído',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
  UNIVERSITY: 'Universidade',
  COURSE: 'Curso',
  DIPLOMA: 'Diploma',
  CERTIFICATION: 'Certificação',
  active: 'Ativo',
};

const label = computed(() => labels[props.status] ?? props.status);
</script>
