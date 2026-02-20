<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir currículo"
      :message="`Excluir o currículo &quot;${deleteTarget?.label}&quot;? O arquivo será removido permanentemente.`"
      confirm-label="Excluir"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Currículos</h1>
        <p class="db-section-subtitle">Gerencie seus arquivos de currículo</p>
      </div>
    </div>

    <!-- Upload -->
    <div class="db-card" style="margin-bottom: var(--spacing-lg);">
      <div class="db-card-title">Adicionar currículo</div>
      <form @submit.prevent="upload" style="display: flex; flex-direction: column; gap: var(--spacing-md); max-width: 480px;">
        <div class="db-form-group">
          <label class="db-label">Rótulo</label>
          <input v-model="uploadLabel" class="db-input" placeholder="Ex: Currículo PT 2024" required />
        </div>
        <div class="db-form-group">
          <label class="db-label">Arquivo PDF</label>
          <input ref="fileInput" type="file" accept=".pdf" class="db-input" style="padding: 8px;" required @change="onFileChange" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="uploading || !uploadFile || !uploadLabel.trim()" style="align-self: flex-start;">
          <span v-if="uploading" class="spinner spinner-sm" />
          {{ uploading ? 'Enviando...' : 'Fazer upload' }}
        </button>
      </form>
    </div>

    <!-- List -->
    <div class="db-card">
      <div class="db-card-title">Meus currículos</div>
      <div v-if="loading" class="loading-center"><div class="spinner spinner-md" /></div>
      <EmptyState
        v-else-if="cvs.length === 0"
        title="Nenhum currículo ainda"
        description="Faça upload do seu currículo em PDF para disponibilizá-lo no seu perfil."
      />
      <div v-else style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
        <div v-for="cv in cvs" :key="cv.id" class="cv-item">
          <div class="cv-icon">
            <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">{{ cv.label }}</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary);">
              {{ formatDate(cv.createdAt) }}
              <span v-if="cv.isActive" class="badge badge-active" style="margin-left: var(--spacing-xs);">Ativo</span>
            </div>
          </div>
          <div style="display: flex; gap: var(--spacing-xs);">
            <button class="btn btn-secondary btn-sm" @click="download(cv.id)" title="Baixar">
              <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            </button>
            <button
              v-if="!cv.isActive"
              class="btn btn-secondary btn-sm"
              @click="setActive(cv.id)"
              title="Definir como ativo"
            >Ativar</button>
            <button class="btn btn-danger btn-sm" @click="deleteTarget = cv">
              <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
            </button>
          </div>
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
import { getCVList, uploadCV, updateCV, deleteCV, getCVDownloadUrl } from '../../utils/api';
import type { CV } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const uploading = ref(false);
const deleting = ref(false);
const cvs = ref<CV[]>([]);
const deleteTarget = ref<CV | null>(null);
const uploadLabel = ref('');
const uploadFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement>();

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function onFileChange(e: Event) {
  uploadFile.value = (e.target as HTMLInputElement).files?.[0] ?? null;
}

async function upload() {
  if (!uploadFile.value || !uploadLabel.value.trim()) return;
  uploading.value = true;
  try {
    const cv = await uploadCV(uploadFile.value, uploadLabel.value.trim());
    cvs.value.unshift(cv);
    uploadLabel.value = '';
    uploadFile.value = null;
    if (fileInput.value) fileInput.value.value = '';
    toast.value?.show('Currículo enviado!', 'success');
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao enviar', 'error');
  } finally {
    uploading.value = false;
  }
}

async function download(id: string) {
  try {
    const { url } = await getCVDownloadUrl(id);
    window.open(url, '_blank');
  } catch {
    toast.value?.show('Erro ao obter link de download', 'error');
  }
}

async function setActive(id: string) {
  try {
    await updateCV(id, { isActive: true });
    cvs.value.forEach(cv => { cv.isActive = cv.id === id; });
    toast.value?.show('Currículo ativo atualizado', 'success');
  } catch {
    toast.value?.show('Erro ao atualizar', 'error');
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    await deleteCV(deleteTarget.value.id);
    cvs.value = cvs.value.filter(c => c.id !== deleteTarget.value!.id);
    toast.value?.show('Currículo excluído', 'success');
    deleteTarget.value = null;
  } catch {
    toast.value?.show('Erro ao excluir', 'error');
  } finally {
    deleting.value = false;
  }
}

onMounted(async () => {
  try {
    cvs.value = await getCVList();
  } catch {
    toast.value?.show('Erro ao carregar currículos', 'error');
  } finally {
    loading.value = false;
  }
});
</script>
