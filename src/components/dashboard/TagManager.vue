<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir tag"
      :message="`Excluir a tag &quot;${deleteTarget?.name}&quot;? Ela será removida de todos os artigos e projetos.`"
      confirm-label="Excluir tag"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Tags</h1>
        <p class="db-section-subtitle">Gerencie as tags usadas em artigos e projetos</p>
      </div>
    </div>

    <!-- Create tag -->
    <div class="db-card" style="margin-bottom: var(--spacing-lg);">
      <div class="db-card-title">Criar nova tag</div>
      <form @submit.prevent="create" style="display: flex; gap: var(--spacing-sm); max-width: 400px;">
        <input v-model="newName" class="db-input" placeholder="Nome da tag" required maxlength="50" style="flex: 1;" />
        <button type="submit" class="btn btn-primary" :disabled="creating || !newName.trim()">
          <span v-if="creating" class="spinner spinner-sm" />
          {{ creating ? '' : 'Criar' }}
        </button>
      </form>
    </div>

    <!-- Tags list -->
    <div class="db-card">
      <div class="db-card-title">Tags existentes ({{ tags.length }})</div>
      <div v-if="loading" class="loading-center"><div class="spinner spinner-md" /></div>
      <EmptyState
        v-else-if="tags.length === 0"
        title="Nenhuma tag ainda"
        description="Crie sua primeira tag para organizar seu conteúdo."
      />
      <div v-else class="tags-container">
        <div
          v-for="tag in tags"
          :key="tag.id"
          class="tag-pill"
          style="gap: var(--spacing-sm);"
        >
          {{ tag.name }}
          <button
            type="button"
            class="tag-pill-remove"
            @click="deleteTarget = tag"
            title="Excluir tag"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import EmptyState from '../ui/EmptyState.vue';
import { getTags, createTag, deleteTag } from '../../utils/api';
import type { Tag } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const creating = ref(false);
const deleting = ref(false);
const tags = ref<Tag[]>([]);
const newName = ref('');
const deleteTarget = ref<Tag | null>(null);

async function load() {
  try {
    tags.value = await getTags();
  } catch {
    toast.value?.show('Erro ao carregar tags', 'error');
  } finally {
    loading.value = false;
  }
}

async function create() {
  if (!newName.value.trim() || creating.value) return;
  creating.value = true;
  try {
    const tag = await createTag(newName.value.trim());
    tags.value.push(tag);
    newName.value = '';
    toast.value?.show('Tag criada!', 'success');
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao criar tag', 'error');
  } finally {
    creating.value = false;
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const id = deleteTarget.value.id;
  try {
    await deleteTag(id);
    deleteTarget.value = null;
    toast.value?.show('Tag excluída', 'success');
    load();
  } catch {
    deleteTarget.value = null;
    toast.value?.show('Erro ao excluir tag', 'error');
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
</script>
