<script setup lang="ts">
import { ref, onMounted } from 'vue';

const STORAGE_KEY = 'radar_swipe_tutorial_seen';

const visible = ref(false);

onMounted(() => {
  if (typeof localStorage !== 'undefined') {
    if (localStorage.getItem(STORAGE_KEY) !== 'true') {
      visible.value = true;
    }
  }
});

function dismiss() {
  visible.value = false;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'true');
  }
}
</script>

<template>
  <Transition name="tutorial-fade">
    <div v-if="visible" class="tutorial-overlay" role="dialog" aria-modal="true" aria-label="Tutorial de gestos">
      <div class="tutorial-box">
        <p class="tutorial-title">Dica rapida</p>
        <div class="tutorial-gestures">
          <div class="tutorial-gesture tutorial-gesture-left">
            <div class="tutorial-arrow tutorial-arrow-left">
              <span class="tutorial-arrow-icon">&#8592;</span>
            </div>
            <span class="tutorial-gesture-label tutorial-label-remove">Remover</span>
          </div>
          <div class="tutorial-card-preview">
            <div class="tutorial-card-hand">
              <span class="tutorial-hand-icon">&#9757;</span>
            </div>
          </div>
          <div class="tutorial-gesture tutorial-gesture-right">
            <div class="tutorial-arrow tutorial-arrow-right">
              <span class="tutorial-arrow-icon">&#8594;</span>
            </div>
            <span class="tutorial-gesture-label tutorial-label-apply">Candidatar</span>
          </div>
        </div>
        <p class="tutorial-hint">Arraste os cards das vagas salvas para interagir com eles.</p>
        <button type="button" class="btn btn-primary tutorial-btn" @click="dismiss">
          Entendi
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.tutorial-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.tutorial-box {
  background: var(--bg-primary, #fff);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}

.tutorial-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem;
}

.tutorial-hint {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin: 1rem 0 1.5rem;
}

.tutorial-gestures {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.tutorial-gesture {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  width: 80px;
}

.tutorial-card-preview {
  width: 60px;
  height: 70px;
  border: 2px solid var(--border, #e5e7eb);
  border-radius: 10px;
  background: var(--bg-secondary, #f9fafb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tutorial-hand-icon {
  font-size: 1.8rem;
  animation: hand-wobble 1.2s ease-in-out infinite;
}

@keyframes hand-wobble {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(12px); }
  75% { transform: translateX(-12px); }
}

.tutorial-arrow {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-arrow-right {
  background: rgba(22, 163, 74, 0.12);
  animation: pulse-right 1.4s ease-in-out infinite;
}

.tutorial-arrow-left {
  background: rgba(239, 68, 68, 0.12);
  animation: pulse-left 1.4s ease-in-out infinite;
}

@keyframes pulse-right {
  0%, 100% { transform: translateX(0); opacity: 0.7; }
  50% { transform: translateX(4px); opacity: 1; }
}

@keyframes pulse-left {
  0%, 100% { transform: translateX(0); opacity: 0.7; }
  50% { transform: translateX(-4px); opacity: 1; }
}

.tutorial-arrow-icon {
  font-size: 1.3rem;
}

.tutorial-arrow-right .tutorial-arrow-icon {
  color: #16a34a;
}

.tutorial-arrow-left .tutorial-arrow-icon {
  color: #dc2626;
}

.tutorial-gesture-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.tutorial-label-apply { color: #16a34a; }
.tutorial-label-remove { color: #dc2626; }

.tutorial-btn {
  width: 100%;
  max-width: 200px;
}

.tutorial-fade-enter-active,
.tutorial-fade-leave-active {
  transition: opacity 0.25s ease;
}

.tutorial-fade-enter-from,
.tutorial-fade-leave-to {
  opacity: 0;
}
</style>
