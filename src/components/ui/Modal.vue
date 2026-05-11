<template>
  <div
    v-if="visible"
    class="modal-overlay"
    @click.self="$emit('close')"
    @keydown.esc="$emit('close')"
  >
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="modal-close" @click="$emit('close')" aria-label="Fechar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <slot />
      </div>
      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue';

const props = defineProps<{ visible: boolean; title: string }>();
defineEmits<{ close: [] }>();

watch(
  () => props.visible,
  (v) => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = v ? 'hidden' : '';
  },
);

onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = '';
});
</script>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  animation: modal-overlay-in 180ms ease-out both;
}
.modal {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
  animation: modal-box-in 180ms ease-out both;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--border-light);
}
.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.modal-close {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast);
}
.modal-close:hover {
  background: var(--bg-secondary);
}
.modal-body {
  flex: 1;
  padding: var(--spacing-xl);
  overflow-y: auto;
}
.modal-footer {
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
}
@keyframes modal-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes modal-box-in {
  from { opacity: 0; transform: scale(0.95) translateY(-10px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
