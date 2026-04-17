<template>
  <Teleport to="body">
    <!-- v-if avoids keeping slot content in DOM; @keyframes handles enter animation
         without using Vue <Transition> which causes insertBefore(null) inside Teleport -->
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
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; title: string }>();
defineEmits<{ close: [] }>();
</script>

<style scoped>
.modal-overlay {
  animation: modal-overlay-in 180ms ease-out both;
}
.modal {
  animation: modal-box-in 180ms ease-out both;
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
