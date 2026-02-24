<template>
  <Modal :visible="visible" :title="title || 'Ajustar imagem'" @close="$emit('cancel')">
    <div class="img-adjust-wrapper">
      <Cropper
        ref="cropperRef"
        :src="imageSrc"
        :stencil-props="{ aspectRatio: aspectRatio ?? 16 / 9 }"
        :auto-zoom="true"
        class="img-adjust-cropper"
      />
    </div>

    <div class="img-adjust-controls">
      <span class="img-adjust-label">Zoom</span>
      <button class="btn btn-ghost btn-sm" type="button" @mousedown="startZoom(-0.02)" @mouseup="stopZoom" @mouseleave="stopZoom" title="Reducir">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/></svg>
      </button>
      <input
        type="range"
        min="0"
        max="100"
        v-model.number="zoomLevel"
        class="img-adjust-slider"
        @input="applyZoom"
      />
      <button class="btn btn-ghost btn-sm" type="button" @mousedown="startZoom(0.02)" @mouseup="stopZoom" @mouseleave="stopZoom" title="Ampliar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>
      <button class="btn btn-ghost btn-sm" type="button" @click="resetCrop" title="Centralizar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/></svg>
      </button>
    </div>

    <template #footer>
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancelar</button>
      <button type="button" class="btn btn-primary" :disabled="confirming" @click="confirm">
        <span v-if="confirming" class="spinner spinner-sm" />
        {{ confirming ? '' : 'Confirmar' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import Modal from './Modal.vue';

const props = defineProps<{
  visible: boolean;
  imageSrc: string;
  aspectRatio?: number;
  title?: string;
}>();

const emit = defineEmits<{
  confirm: [blob: Blob];
  cancel: [];
}>();

const cropperRef = ref<InstanceType<typeof Cropper>>();
const confirming = ref(false);
const zoomLevel = ref(50);
let zoomInterval: ReturnType<typeof setInterval> | null = null;

watch(() => props.visible, (val) => {
  if (val) zoomLevel.value = 50;
});

function applyZoom() {
  if (!cropperRef.value) return;
  // Map 0-100 slider to zoom factor relative to default
  const factor = (zoomLevel.value - 50) / 50;
  cropperRef.value.zoom(factor >= 0 ? 1 + factor * 2 : 1 / (1 + Math.abs(factor) * 2));
}

function startZoom(delta: number) {
  if (!cropperRef.value) return;
  zoomInterval = setInterval(() => {
    cropperRef.value?.zoom(1 + delta);
  }, 80);
}

function stopZoom() {
  if (zoomInterval) {
    clearInterval(zoomInterval);
    zoomInterval = null;
  }
}

function resetCrop() {
  cropperRef.value?.reset();
  zoomLevel.value = 50;
}

async function confirm() {
  if (!cropperRef.value || confirming.value) return;
  confirming.value = true;
  try {
    const { canvas } = cropperRef.value.getResult();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) emit('confirm', blob);
    }, 'image/jpeg', 0.92);
  } finally {
    confirming.value = false;
  }
}
</script>

<style scoped>
.img-adjust-wrapper {
  width: 100%;
  height: 340px;
  background: #111;
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
}

.img-adjust-cropper {
  width: 100%;
  height: 100%;
}

.img-adjust-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-top: var(--spacing-md, 16px);
  padding: 0 2px;
}

.img-adjust-label {
  font-size: var(--text-xs, 12px);
  color: var(--text-secondary, #666);
  white-space: nowrap;
  min-width: 36px;
}

.img-adjust-slider {
  flex: 1;
  height: 4px;
  accent-color: var(--primary, #6366f1);
  cursor: pointer;
}
</style>
