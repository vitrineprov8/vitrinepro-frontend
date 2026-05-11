<template>
  <Modal :visible="visible" title="Limite atingido" @close="$emit('close')">
    <div class="upgrade-body">
      <div class="upgrade-icon">
        <svg width="48" height="48" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p class="upgrade-message">
        Você atingiu o limite de <strong>{{ limit }} {{ limit === 1 ? 'vaga' : 'vagas' }}</strong>
        do plano <strong>{{ planName }}</strong>.
        Faça upgrade para publicar mais oportunidades.
      </p>
    </div>
    <template #footer>
      <button class="btn btn-ghost" @click="$emit('close')">Fechar</button>
      <button class="btn btn-primary" @click="goToPlans">Ver planos</button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Modal from '../ui/Modal.vue';
import type { PlanTier } from '../../utils/api';

const props = defineProps<{
  visible: boolean;
  currentPlan: PlanTier;
  limit: number;
}>();

defineEmits<{ close: [] }>();

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  PERSONAL: 'Personal',
  HUNTER: 'Hunter',
  EMPRESARIAL: 'Empresarial',
};

const planName = computed(() => PLAN_NAMES[props.currentPlan]);

function goToPlans() {
  window.location.href = '/dashboard/planos';
}
</script>

<style scoped>
.upgrade-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0 1rem;
  text-align: center;
}
.upgrade-icon {
  color: #f59e0b;
}
.upgrade-message {
  color: var(--text-primary);
  line-height: 1.6;
  max-width: 340px;
}
</style>
