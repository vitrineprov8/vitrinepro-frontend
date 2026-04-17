<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir formação"
      :message="`Excluir &quot;${deleteTarget?.title}&quot; em ${deleteTarget?.institution}?`"
      confirm-label="Excluir"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
    <Modal :visible="showForm" :title="editTarget ? 'Editar formação' : 'Adicionar formação'" @close="closeForm">
      <form @submit.prevent="saveForm" style="display: flex; flex-direction: column; gap: var(--spacing-md);">
        <div class="db-form-row">
          <div class="db-form-group">
            <label class="db-label">Tipo</label>
            <select v-model="formData.type" class="db-select" required>
              <option value="">Selecione</option>
              <option value="GRADUATE">Graduação</option>
              <option value="POST_GRADUATE">Pós-Graduação</option>
              <option value="MASTER">Mestrado</option>
              <option value="DOCTORATE">Doutorado</option>
              <option value="CERTIFICATION">Certificação</option>
              <option value="COURSE">Curso</option>
            </select>
          </div>
          <!-- <div class="db-form-group">
            <label class="db-label">Ordem <span>(exibição)</span></label>
            <input v-model.number="formData.order" type="number" class="db-input" min="0" placeholder="0" />
          </div> -->
        </div>
        <div class="db-form-group">
          <label class="db-label">Instituição</label>
          <input v-model="formData.institution" class="db-input" placeholder="Nome da instituição" required maxlength="40" />
        </div>
        <div class="db-form-group">
          <label class="db-label">Título / Curso</label>
          <input v-model="formData.title" class="db-input" placeholder="Ex: Bacharelado em Ciência da Computação" required maxlength="200" />
        </div>
        <div class="db-form-group">
          <label class="db-label">Área de estudo <span>(opcional)</span></label>
          <input v-model="formData.fieldOfStudy" class="db-input" placeholder="Ex: Engenharia de Software" maxlength="40" />
        </div>
        <div class="db-form-row">
          <div class="db-form-group">
            <label class="db-label">Data de início</label>
            <input v-model="formData.startDate" type="date" class="db-input" required />
          </div>
          <div class="db-form-group">
            <label class="db-label">Data de conclusão <span>(opcional)</span></label>
            <input v-model="formData.endDate" type="date" class="db-input" />
          </div>
        </div>
        <div class="db-form-group">
          <label class="db-label">Descrição <span>(opcional)</span></label>
          <textarea v-model="formData.description" class="db-textarea" rows="3" placeholder="Atividades, conquistas, observações..." maxlength="100" />
        </div>
        <div v-if="editTarget" class="db-form-group">
          <label class="db-label">Certificado <span>(opcional, PDF ou imagem)</span></label>
          <input ref="certInput" type="file" accept=".pdf,image/*" class="db-input" style="padding: 8px;" @change="onCertChange" />
          <div v-if="editTarget.certificateUrl" style="margin-top: 4px;">
            <a :href="editTarget.certificateUrl" target="_blank" style="font-size: var(--text-xs); color: var(--primary);">Ver certificado atual →</a>
          </div>
        </div>
      </form>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="closeForm">Cancelar</button>
        <button type="button" data-testid="save-education-btn" class="btn btn-primary" @click="saveForm" :disabled="formSaving">
          <span v-if="formSaving" class="spinner spinner-sm" />
          {{ formSaving ? '' : (editTarget ? 'Salvar' : 'Adicionar') }}
        </button>
      </template>
    </Modal>

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Formação Acadêmica</h1>
        <p class="db-section-subtitle">Graduações, cursos e certificações</p>
      </div>
      <button class="btn btn-primary" data-testid="add-education-btn" @click="openNew">
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
        Adicionar
      </button>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>
    <EmptyState
      v-else-if="items.length === 0"
      title="Nenhuma formação ainda"
      description="Adicione suas graduações, cursos e certificações."
      action-label="Adicionar formação"
      @action="openNew"
    />
    <div v-else class="db-list">
      <div v-for="item in sortedItems" :key="item.id" data-testid="edu-item" class="db-list-item">
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: 4px; flex-wrap: wrap;">
            <StatusBadge :status="item.type" />
            <span style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">{{ item.title }}</span>
          </div>
          <div style="font-size: var(--text-sm); color: var(--text-secondary);">{{ item.institution }}</div>
          <div style="font-size: var(--text-xs); color: var(--text-light); margin-top: 2px;">
            {{ formatDate(item.startDate) }} – {{ item.endDate ? formatDate(item.endDate) : 'Presente' }}
            <span v-if="item.fieldOfStudy"> · {{ item.fieldOfStudy }}</span>
          </div>
          <div v-if="item.description" style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">{{ item.description }}</div>
        </div>
        <div style="display: flex; gap: var(--spacing-xs);">
          <a v-if="item.certificateUrl" :href="item.certificateUrl" target="_blank" class="btn btn-ghost btn-sm" title="Ver certificado">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          </a>
          <button class="btn btn-secondary btn-sm" @click="openEdit(item)">Editar</button>
          <button class="btn btn-danger btn-sm" data-testid="edu-delete-btn" @click="deleteTarget = item">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          </button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import Modal from '../ui/Modal.vue';
import EmptyState from '../ui/EmptyState.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import { getEducation, createEducation, updateEducation, deleteEducation, uploadCertificate } from '../../utils/api';
import type { Education } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const deleting = ref(false);
const formSaving = ref(false);
const showForm = ref(false);
const items = ref<Education[]>([]);
const deleteTarget = ref<Education | null>(null);
const editTarget = ref<Education | null>(null);
const certInput = ref<HTMLInputElement>();
let pendingCert: File | null = null;

const emptyForm = () => ({
  type: '' as Education['type'] | '', institution: '', title: '', fieldOfStudy: '',
  startDate: '', endDate: '', description: '', order: 0,
});
const formData = ref(emptyForm());

const sortedItems = computed(() =>
  [...items.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

function formatDate(d: string) {
  const date = new Date(d + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function openNew() {
  editTarget.value = null;
  formData.value = emptyForm();
  showForm.value = true;
}

function openEdit(item: Education) {
  editTarget.value = item;
  formData.value = {
    type: item.type,
    institution: item.institution,
    title: item.title,
    fieldOfStudy: item.fieldOfStudy ?? '',
    startDate: item.startDate?.split('T')[0] ?? '',
    endDate: item.endDate?.split('T')[0] ?? '',
    description: item.description ?? '',
    order: item.order ?? 0,
  };
  showForm.value = true;
}

function closeForm() {
  showForm.value = false;
  pendingCert = null;
}

function onCertChange(e: Event) {
  pendingCert = (e.target as HTMLInputElement).files?.[0] ?? null;
}

async function saveForm() {
  if (!formData.value.type || !formData.value.institution || !formData.value.title || !formData.value.startDate) {
    toast.value?.show('Preencha todos os campos obrigatórios', 'warning');
    return;
  }
  if (formSaving.value) return;
  formSaving.value = true;
  try {
    const payload = {
      type: formData.value.type,
      institution: formData.value.institution,
      title: formData.value.title,
      fieldOfStudy: formData.value.fieldOfStudy || undefined,
      startDate: formData.value.startDate,
      endDate: formData.value.endDate || undefined,
      description: formData.value.description || undefined,
      order: formData.value.order,
    };
    if (editTarget.value) {
      const updated = await updateEducation(editTarget.value.id, payload);
      const idx = items.value.findIndex(i => i.id === editTarget.value!.id);
      if (idx !== -1) items.value[idx] = updated;
      if (pendingCert) {
        const withCert = await uploadCertificate(editTarget.value.id, pendingCert);
        const i = items.value.findIndex(x => x.id === editTarget.value!.id);
        if (i !== -1) items.value[i].certificateUrl = withCert.certificateUrl;
        pendingCert = null;
      }
      toast.value?.show('Formação atualizada!', 'success');
    } else {
      const created = await createEducation(payload);
      items.value.push(created);
      toast.value?.show('Formação adicionada!', 'success');
    }
    closeForm();
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao salvar', 'error');
  } finally {
    formSaving.value = false;
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const id = deleteTarget.value.id;
  // Optimistic: remove immediately so list refreshes without waiting
  const previousItems = [...items.value];
  items.value = items.value.filter(i => i.id !== id);
  try {
    await deleteEducation(id);
    toast.value?.show('Formação excluída', 'success');
  } catch {
    items.value = previousItems; // restore on failure
    toast.value?.show('Erro ao excluir', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
    // Ensure Vue processes all reactive state changes before next interaction
    await nextTick();
  }
}

onMounted(async () => {
  try {
    items.value = await getEducation();
  } catch {
    toast.value?.show('Erro ao carregar formações', 'error');
  } finally {
    loading.value = false;
  }
});
</script>
