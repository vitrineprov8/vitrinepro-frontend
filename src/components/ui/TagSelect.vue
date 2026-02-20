<template>
  <div>
    <div class="tags-container" style="margin-bottom: var(--spacing-sm);">
      <button
        v-for="tag in availableTags"
        :key="tag.id"
        type="button"
        class="tag-pill"
        :class="{ selected: selectedIds.includes(tag.id) }"
        @click="toggle(tag.id)"
      >
        <svg v-if="selectedIds.includes(tag.id)" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>
        {{ tag.name }}
      </button>
      <span v-if="availableTags.length === 0" style="font-size: var(--text-xs); color: var(--text-secondary);">Nenhuma tag disponível</span>
    </div>

    <div v-if="showNew" style="display: flex; gap: var(--spacing-xs);">
      <input
        v-model="newTagName"
        class="db-input"
        style="flex: 1;"
        placeholder="Nome da nova tag"
        @keydown.enter.prevent="addTag"
      />
      <button type="button" class="btn btn-secondary btn-sm" @click="addTag" :disabled="creating || !newTagName.trim()">
        <span v-if="creating" class="spinner spinner-sm" />
        {{ creating ? '' : 'Criar' }}
      </button>
      <button type="button" class="btn btn-ghost btn-sm" @click="showNew = false">Cancelar</button>
    </div>
    <button v-else type="button" class="btn btn-ghost btn-sm" style="margin-top: 4px;" @click="showNew = true">
      + Nova tag
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Tag } from '../../utils/api';
import { createTag } from '../../utils/api';

const props = defineProps<{
  availableTags: Tag[];
  selectedIds: string[];
}>();

const emit = defineEmits<{
  'update:selectedIds': [ids: string[]];
  'tag-created': [tag: Tag];
}>();

const showNew = ref(false);
const newTagName = ref('');
const creating = ref(false);

function toggle(id: string) {
  const ids = [...props.selectedIds];
  const idx = ids.indexOf(id);
  if (idx === -1) ids.push(id);
  else ids.splice(idx, 1);
  emit('update:selectedIds', ids);
}

async function addTag() {
  if (!newTagName.value.trim() || creating.value) return;
  creating.value = true;
  try {
    const tag = await createTag(newTagName.value.trim());
    emit('tag-created', tag);
    emit('update:selectedIds', [...props.selectedIds, tag.id]);
    newTagName.value = '';
    showNew.value = false;
  } catch {
    /* silently fail — parent handles error context */
  } finally {
    creating.value = false;
  }
}
</script>
