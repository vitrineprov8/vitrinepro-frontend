<template>
  <div>
    <div class="gallery-grid">
      <div
        v-for="(img, idx) in images"
        :key="img.id"
        class="gallery-item"
        :class="{ dragging: dragIndex === idx, 'drag-over': dragOverIndex === idx }"
        draggable="true"
        @dragstart="onDragStart(idx)"
        @dragover.prevent="onDragOver(idx)"
        @drop.prevent="onDrop(idx)"
        @dragend="onDragEnd"
      >
        <img :src="img.imageUrl" :alt="img.caption || `Imagem ${idx + 1}`" />
        <div class="gallery-item-actions">
          <button type="button" class="gallery-item-btn" @click="$emit('delete', img.id)" title="Excluir">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
        <input
          class="gallery-item-caption"
          :value="img.caption || ''"
          placeholder="Legenda..."
          @change="$emit('caption-change', img.id, ($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Add button -->
      <button type="button" class="gallery-add-btn" @click="fileInput?.click()" :disabled="uploading">
        <span v-if="uploading" class="spinner spinner-md" />
        <template v-else>
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          <span>Adicionar imagem</span>
        </template>
        <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      </button>
    </div>
    <p v-if="images.length > 0" style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: var(--spacing-xs);">
      Arraste as imagens para reordenar
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProjectImage } from '../../utils/api';

const props = defineProps<{
  images: ProjectImage[];
  uploading?: boolean;
}>();

const emit = defineEmits<{
  add: [file: File];
  delete: [imageId: string];
  reorder: [fromIdx: number, toIdx: number];
  'caption-change': [imageId: string, caption: string];
}>();

const fileInput = ref<HTMLInputElement>();
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) emit('add', file);
  (e.target as HTMLInputElement).value = '';
}

function onDragStart(idx: number) { dragIndex.value = idx; }
function onDragOver(idx: number) { dragOverIndex.value = idx; }
function onDrop(toIdx: number) {
  if (dragIndex.value !== null && dragIndex.value !== toIdx) {
    emit('reorder', dragIndex.value, toIdx);
  }
}
function onDragEnd() {
  dragIndex.value = null;
  dragOverIndex.value = null;
}
</script>
