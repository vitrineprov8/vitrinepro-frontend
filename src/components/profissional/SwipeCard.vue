<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const props = defineProps<{
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  disabled?: boolean;
}>();

const THRESHOLD_RATIO = 0.30;
const VELOCITY_THRESHOLD = 0.6;

const cardEl = ref<HTMLElement | null>(null);
const dragging = ref(false);
const startX = ref(0);
const startTime = ref(0);
const currentX = ref(0);
const flyingOut = ref<'left' | 'right' | null>(null);

function overlayOpacity(dir: 'right' | 'left'): number {
  if (!dragging.value && flyingOut.value === null) return 0;
  const w = cardEl.value?.offsetWidth ?? 300;
  const progress = currentX.value / (w * THRESHOLD_RATIO);
  if (dir === 'right') return Math.max(0, Math.min(1, progress));
  return Math.max(0, Math.min(1, -progress));
}

function cardStyle(): Record<string, string> {
  if (flyingOut.value === 'right') {
    return {
      transform: 'translateX(120%) rotate(15deg)',
      opacity: '0',
      transition: 'transform 0.35s ease-out, opacity 0.35s ease-out',
    };
  }
  if (flyingOut.value === 'left') {
    return {
      transform: 'translateX(-120%) rotate(-15deg)',
      opacity: '0',
      transition: 'transform 0.35s ease-out, opacity 0.35s ease-out',
    };
  }
  if (dragging.value) {
    const deg = (currentX.value / 300) * 12;
    return {
      transform: `translateX(${currentX.value}px) rotate(${deg}deg)`,
      transition: 'none',
      cursor: 'grabbing',
    };
  }
  return {
    transform: 'translateX(0) rotate(0deg)',
    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
  };
}

function onPointerDown(e: PointerEvent) {
  if (props.disabled || flyingOut.value !== null) return;
  dragging.value = true;
  startX.value = e.clientX;
  startTime.value = Date.now();
  currentX.value = 0;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  currentX.value = e.clientX - startX.value;
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;

  const dx = e.clientX - startX.value;
  const dt = (Date.now() - startTime.value) || 1;
  const velocity = Math.abs(dx) / dt; // px/ms
  const w = cardEl.value?.offsetWidth ?? 300;
  const threshold = w * THRESHOLD_RATIO;

  if (dx > threshold || (dx > 0 && velocity >= VELOCITY_THRESHOLD)) {
    triggerFly('right');
  } else if (dx < -threshold || (dx < 0 && velocity >= VELOCITY_THRESHOLD)) {
    triggerFly('left');
  } else {
    currentX.value = 0;
  }
}

function triggerFly(dir: 'right' | 'left') {
  flyingOut.value = dir;
  currentX.value = dir === 'right' ? (cardEl.value?.offsetWidth ?? 300) : -(cardEl.value?.offsetWidth ?? 300);
  setTimeout(() => {
    if (dir === 'right') props.onSwipeRight();
    else props.onSwipeLeft();
    flyingOut.value = null;
    currentX.value = 0;
  }, 360);
}

onUnmounted(() => {
  dragging.value = false;
});
</script>

<template>
  <div
    ref="cardEl"
    class="swipe-card-wrap"
    :style="cardStyle()"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <!-- Right overlay: Candidatar -->
    <div
      class="swipe-overlay swipe-overlay-right"
      :style="{ opacity: overlayOpacity('right') }"
      aria-hidden="true"
    >
      <span class="swipe-overlay-label">Candidatar</span>
    </div>

    <!-- Left overlay: Remover -->
    <div
      class="swipe-overlay swipe-overlay-left"
      :style="{ opacity: overlayOpacity('left') }"
      aria-hidden="true"
    >
      <span class="swipe-overlay-label">Remover</span>
    </div>

    <slot />
  </div>
</template>

<style scoped>
.swipe-card-wrap {
  position: relative;
  touch-action: pan-y;
  user-select: none;
  cursor: grab;
  will-change: transform;
}

.swipe-card-wrap:active {
  cursor: grabbing;
}

.swipe-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transition: opacity 0.05s linear;
}

.swipe-overlay-right {
  background: rgba(22, 163, 74, 0.18);
  border: 2px solid rgba(22, 163, 74, 0.5);
}

.swipe-overlay-left {
  background: rgba(239, 68, 68, 0.18);
  border: 2px solid rgba(239, 68, 68, 0.5);
}

.swipe-overlay-label {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.4rem 1rem;
  border-radius: 8px;
}

.swipe-overlay-right .swipe-overlay-label {
  color: #15803d;
  background: rgba(22, 163, 74, 0.15);
}

.swipe-overlay-left .swipe-overlay-label {
  color: #b91c1c;
  background: rgba(239, 68, 68, 0.15);
}
</style>
