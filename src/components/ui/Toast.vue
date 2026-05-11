<template>
  <div v-if="toasts.length > 0" class="toast-wrapper">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        data-testid="toast"
        class="toast"
        :class="`toast-${toast.type}`"
      >
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>
          <svg v-else-if="toast.type === 'error'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd" /></svg>
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="remove(toast.id)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const toasts = ref<Toast[]>([]);
let nextId = 0;

function show(message: string, type: Toast['type'] = 'success', duration = 4000) {
  const id = nextId++;
  toasts.value.push({ id, message, type });
  setTimeout(() => remove(id), duration);
}

function remove(id: number) {
  const idx = toasts.value.findIndex(t => t.id === id);
  if (idx !== -1) toasts.value.splice(idx, 1);
}

defineExpose({ show });
</script>

<style>
.toast-wrapper {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: calc(var(--z-modal) + 10);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 360px;
}
@media (max-width: 640px) {
  .toast-wrapper {
    left: var(--spacing-md);
    right: var(--spacing-md);
  }
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  font-size: var(--text-sm);
}
.toast-success {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #15803d;
}
.toast-error {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}
.toast-warning {
  background: #fef3c7;
  border: 1px solid #fde68a;
  color: #92400e;
}
.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
}
.toast-icon svg {
  width: 16px;
  height: 16px;
}
.toast-message { flex: 1; line-height: var(--leading-relaxed); }
.toast-close {
  flex-shrink: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.6;
  padding: 0;
  display: flex;
}
.toast-close:hover { opacity: 1; }
.toast-enter-active { animation: toast-in 200ms ease-out; }
.toast-leave-active { animation: toast-in 200ms ease-in reverse; }
@keyframes toast-in {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);   opacity: 1; }
}
</style>
