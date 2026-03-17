<template>
  <div>
    <div class="gallery-grid">
      <!-- Arquivos já salvos no servidor -->
      <div
        v-for="(file, idx) in allItems"
        :key="file.id"
        class="gallery-item"
        :class="{
          dragging: dragIndex === idx,
          'drag-over': dragOverIndex === idx,
          'gallery-item-pending': file.pending,
        }"
        draggable="true"
        @dragstart="onDragStart(idx)"
        @dragover.prevent="onDragOver(idx)"
        @drop.prevent="onDrop(idx)"
        @dragend="onDragEnd"
      >
        <!-- Imagem -->
        <template v-if="file.fileType === 'IMAGE'">
          <img :src="file.fileUrl" :alt="file.caption || `Imagem ${idx + 1}`" />
          <div class="gallery-item-actions">
            <button type="button" class="gallery-item-btn" @click="handleDelete(file)" title="Excluir">
              <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
          <input
            class="gallery-item-caption"
            :value="file.caption || ''"
            placeholder="Legenda..."
            :disabled="file.pending"
            @change="handleCaptionChange(file, ($event.target as HTMLInputElement).value)"
          />
        </template>

        <!-- PDF -->
        <template v-else>
          <div class="gallery-pdf-card">
            <div class="gallery-pdf-icon-wrap">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 13H15M9 17H15M9 9H10" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="gallery-pdf-name">{{ truncate(file.originalFilename || 'documento.pdf', 24) }}</div>
            <div class="gallery-pdf-size" v-if="file.fileSize">{{ formatFileSize(file.fileSize) }}</div>
            <a v-if="!file.pending" :href="file.fileUrl" target="_blank" rel="noopener" class="gallery-pdf-open">Abrir PDF</a>
            <div v-else class="gallery-pdf-open" style="opacity:.5; cursor:default;">Aguardando...</div>
          </div>
          <div class="gallery-item-actions">
            <button type="button" class="gallery-item-btn" @click="handleDelete(file)" title="Excluir">
              <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
        </template>

        <!-- Indicador de pendente -->
        <div v-if="file.pending" class="gallery-pending-badge" title="Será salvo ao salvar o item">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
      </div>

      <!-- Botão adicionar -->
      <button type="button" class="gallery-add-btn" @click="fileInput?.click()" :disabled="uploading">
        <span v-if="uploading" class="spinner spinner-md" />
        <template v-else>
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          <span>Adicionar arquivo</span>
        </template>
        <input ref="fileInput" type="file" accept="image/*,.pdf,application/pdf" style="display:none" @change="onFileChange" />
      </button>
    </div>
    <p v-if="allItems.length > 0" style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: var(--spacing-xs);">
      Arraste para reordenar
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PortfolioFile } from '../../utils/api';

export interface PendingFile {
  id: string;
  file: File;
  fileUrl: string;
  fileType: 'IMAGE' | 'PDF';
  caption: string;
  originalFilename?: string;
  fileSize?: number;
  pending: true;
  order: number;
}

type GalleryItem = (PortfolioFile & { pending?: false }) | PendingFile;

const props = defineProps<{
  files: PortfolioFile[];
  pendingFiles?: PendingFile[];
  uploading?: boolean;
}>();

const emit = defineEmits<{
  add: [file: File];
  delete: [fileId: string];
  'delete-pending': [pendingId: string];
  reorder: [fromIdx: number, toIdx: number];
  'caption-change': [fileId: string, caption: string];
}>();

const fileInput = ref<HTMLInputElement>();
const dragIndex = ref<number | null>(null);
const dragOverIndex = ref<number | null>(null);

const allItems = computed<GalleryItem[]>(() => {
  const saved = props.files.map(f => ({ ...f, pending: false as const }));
  const pending = (props.pendingFiles ?? []);
  return [...saved, ...pending].sort((a, b) => a.order - b.order);
});

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) emit('add', file);
  (e.target as HTMLInputElement).value = '';
}

function handleDelete(item: GalleryItem) {
  if ((item as PendingFile).pending) {
    emit('delete-pending', item.id);
  } else {
    emit('delete', item.id);
  }
}

function handleCaptionChange(item: GalleryItem, caption: string) {
  if (!(item as PendingFile).pending) {
    emit('caption-change', item.id, caption);
  }
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

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.gallery-pdf-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: var(--spacing-sm);
  height: 100%;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}

.gallery-pdf-icon-wrap {
  margin-bottom: 2px;
}

.gallery-pdf-name {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--text-primary);
  word-break: break-all;
  line-height: 1.3;
}

.gallery-pdf-size {
  font-size: 10px;
  color: var(--text-secondary);
}

.gallery-pdf-open {
  font-size: 11px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
  margin-top: 2px;
}

.gallery-pdf-open:hover {
  text-decoration: underline;
}

.gallery-item-pending {
  border: 2px dashed var(--border);
  opacity: 0.8;
}

.gallery-pending-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: var(--bg-secondary);
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
</style>
