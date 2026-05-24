<script setup lang="ts">
import type { SavedFilterData, VagaSegment, VagaType, VagaWorkMode } from '../../utils/api';

const props = defineProps<{
  modelValue: SavedFilterData;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: SavedFilterData): void;
  (e: 'search'): void;
}>();

const SEGMENTS: { value: VagaSegment | ''; label: string }[] = [
  { value: '', label: 'Todos os segmentos' },
  { value: 'TECNOLOGIA', label: 'Tecnologia' },
  { value: 'COMERCIO_VENDAS', label: 'Comércio e Vendas' },
  { value: 'FINANCAS_CONTABILIDADE', label: 'Finanças e Contabilidade' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
  { value: 'LOGISTICA_TRANSPORTE', label: 'Logística e Transporte' },
  { value: 'RH', label: 'Recursos Humanos' },
  { value: 'SAUDE', label: 'Saúde' },
  { value: 'EDUCACAO', label: 'Educação' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'JURIDICO', label: 'Jurídico' },
  { value: 'OUTROS', label: 'Outros' },
];

const TYPES: { value: VagaType | ''; label: string }[] = [
  { value: '', label: 'Tipo' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'FREELA', label: 'Freelance' },
  { value: 'ESTAGIO', label: 'Estágio' },
];

const WORK_MODES: { value: VagaWorkMode | ''; label: string }[] = [
  { value: '', label: 'Modalidade' },
  { value: 'REMOTE', label: 'Remoto' },
  { value: 'HYBRID', label: 'Híbrido' },
  { value: 'ONSITE', label: 'Presencial' },
];

const ORDER_OPTS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'relevance', label: 'Relevância' },
];

function update(key: keyof SavedFilterData, value: string | number | undefined) {
  emit('update:modelValue', { ...props.modelValue, [key]: value });
}
</script>

<template>
  <div class="radar-filters">
    <div class="rf-row">
      <input
        type="text"
        class="rf-input"
        placeholder="Cidade"
        :value="modelValue.city || ''"
        @input="update('city', ($event.target as HTMLInputElement).value)"
        @keyup.enter="$emit('search')"
      />
      <select class="rf-select" :value="modelValue.segment || ''" @change="update('segment', ($event.target as HTMLSelectElement).value as VagaSegment | '')">
        <option v-for="s in SEGMENTS" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
      <select class="rf-select" :value="modelValue.type || ''" @change="update('type', ($event.target as HTMLSelectElement).value as VagaType | '')">
        <option v-for="t in TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
      </select>
      <select class="rf-select" :value="modelValue.workMode || ''" @change="update('workMode', ($event.target as HTMLSelectElement).value as VagaWorkMode | '')">
        <option v-for="m in WORK_MODES" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <select class="rf-select" :value="modelValue.order || 'recent'" @change="update('order', ($event.target as HTMLSelectElement).value as 'recent' | 'relevance')">
        <option v-for="o in ORDER_OPTS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.radar-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.rf-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  align-items: center;
}
.rf-input,
.rf-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  flex: 1 1 140px;
  min-width: 120px;
}
.rf-input:focus,
.rf-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
</style>
