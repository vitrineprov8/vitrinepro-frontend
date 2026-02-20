<template>
  <Modal :visible="visible" :title="title" @close="$emit('cancel')">
    <p style="color: var(--text-secondary); margin: 0; line-height: var(--leading-relaxed);">{{ message }}</p>
    <template #footer>
      <button class="btn btn-secondary" @click="$emit('cancel')" :disabled="loading">Cancelar</button>
      <button class="btn btn-danger" @click="$emit('confirm')" :disabled="loading">
        <span v-if="loading" class="spinner spinner-sm" />
        {{ loading ? 'Aguarde...' : (confirmLabel || 'Excluir') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue';
defineProps<{
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}>();
defineEmits<{ confirm: []; cancel: [] }>();
</script>
