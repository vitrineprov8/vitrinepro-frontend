<template>
  <Toast ref="toast" />
  <Modal
    :visible="visible"
    :title="company ? 'Editar cliente' : 'Novo cliente'"
    @close="handleClose"
  >
    <!-- ImageAdjustModal para logo -->
    <ImageAdjustModal
      :visible="showCropModal"
      :image-src="cropSrc"
      :aspect-ratio="1"
      title="Ajustar logo"
      @confirm="onCropConfirm"
      @cancel="onCropCancel"
    />

    <form class="cem-form" @submit.prevent="handleSubmit">
      <!-- Preview do logo -->
      <div class="cem-logo-section">
        <div class="cem-logo-preview" @click="triggerLogoUpload">
          <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="Logo do cliente" class="cem-logo-img" />
          <div v-else class="cem-logo-placeholder">
            <span class="cem-logo-initials">{{ nameInitials }}</span>
          </div>
          <div class="cem-logo-overlay">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Logo</span>
          </div>
        </div>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          class="cem-file-input"
          @change="onFileSelect"
        />
        <p class="cem-logo-hint">Clique para fazer upload. Proporção 1:1 (quadrado).</p>
      </div>

      <label class="cem-field">
        <span class="cem-label">Nome da empresa *</span>
        <input
          v-model="form.name"
          type="text"
          required
          maxlength="255"
          placeholder="Ex: Empresa ABC Ltda"
          class="cem-input"
          :disabled="saving"
        />
      </label>

      <label class="cem-field">
        <span class="cem-label">Segmento</span>
        <input
          v-model="form.industry"
          type="text"
          maxlength="100"
          placeholder="Ex: Tecnologia, Saúde, Financeiro..."
          class="cem-input"
          :disabled="saving"
        />
      </label>

      <label class="cem-field">
        <span class="cem-label">Descrição</span>
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="2000"
          placeholder="Breve descrição sobre a empresa..."
          class="cem-textarea"
          :disabled="saving"
        />
      </label>

      <div v-if="availableRecruiters.length > 0" class="cem-field">
        <span class="cem-label">Recrutadores responsáveis</span>
        <p class="cem-hint">Selecione quem do seu time vai administrar esta empresa.</p>
        <div class="cem-recruiters">
          <label
            v-for="r in availableRecruiters"
            :key="r.id"
            class="cem-recruiter-row"
          >
            <input
              type="checkbox"
              :value="r.id"
              v-model="selectedRecruiterIds"
              :disabled="saving"
            />
            <span class="cem-recruiter-name">
              {{ r.firstName }} {{ r.lastName }}
              <span class="cem-recruiter-email">({{ r.email }})</span>
            </span>
          </label>
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" class="btn btn-secondary" :disabled="saving" @click="handleClose">
        Cancelar
      </button>
      <button type="button" class="btn btn-primary" :disabled="saving" @click="handleSubmit">
        <span v-if="saving" class="spinner spinner-sm" />
        {{ saving ? 'Salvando...' : (company ? 'Salvar alterações' : 'Criar cliente') }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import Toast from '../ui/Toast.vue';
import ImageAdjustModal from '../ui/ImageAdjustModal.vue';
import { companies, team, uploadGenericImage } from '../../utils/api';
import type { Company, CompanyPayload, CompanyRecruiter, TeamMember } from '../../utils/api';

const props = defineProps<{
  visible: boolean;
  company?: Company | null;
}>();

const emit = defineEmits<{
  close: [];
  saved: [company: Company];
}>();

const toast = ref<InstanceType<typeof Toast>>();
const saving = ref(false);
const fileInputRef = ref<HTMLInputElement>();
const logoPreviewUrl = ref<string | null>(null);
const pendingLogoBlob = ref<Blob | null>(null);
const availableRecruiters = ref<CompanyRecruiter[]>([]);
const selectedRecruiterIds = ref<string[]>([]);

async function loadRecruiters() {
  try {
    const members: TeamMember[] = await team.listMembers();
    availableRecruiters.value = members
      .filter((m) => m.status === 'ACTIVE' && m.role !== 'OWNER' && m.user)
      .map((m) => ({
        id: m.user!.id,
        firstName: m.user!.firstName ?? '',
        lastName: m.user!.lastName ?? '',
        email: m.user!.email,
        avatarUrl: m.user!.avatarUrl ?? null,
      }));
  } catch {
    availableRecruiters.value = [];
  }
}

// Crop modal state
const showCropModal = ref(false);
const cropSrc = ref('');
let cropObjectUrl = '';

const form = reactive<{
  name: string;
  industry: string;
  description: string;
}>({
  name: '',
  industry: '',
  description: '',
});

// Sync form when company prop changes
watch(
  () => props.company,
  (c) => {
    if (c) {
      form.name = c.name;
      form.industry = c.industry ?? '';
      form.description = c.description ?? '';
      logoPreviewUrl.value = c.logoUrl ?? null;
      selectedRecruiterIds.value = (c.assignedRecruiters ?? []).map((r) => r.id);
    } else {
      form.name = '';
      form.industry = '';
      form.description = '';
      logoPreviewUrl.value = null;
      selectedRecruiterIds.value = [];
    }
    pendingLogoBlob.value = null;
  },
  { immediate: true }
);

// Also reset and reload recruiters when modal opens
watch(
  () => props.visible,
  (v) => {
    if (v) {
      loadRecruiters();
      if (!props.company) {
        form.name = '';
        form.industry = '';
        form.description = '';
        logoPreviewUrl.value = null;
        pendingLogoBlob.value = null;
        selectedRecruiterIds.value = [];
      }
    }
  },
  { immediate: true }
);

const nameInitials = computed(() => {
  if (!form.name) return '?';
  return form.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
});

function triggerLogoUpload() {
  fileInputRef.value?.click();
}

function onFileSelect(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  // Release any previous object URL
  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl);
  }

  cropObjectUrl = URL.createObjectURL(file);
  cropSrc.value = cropObjectUrl;
  showCropModal.value = true;

  // Reset input so the same file can be re-selected
  input.value = '';
}

function onCropConfirm(blob: Blob) {
  pendingLogoBlob.value = blob;

  // Release previous preview URL if it was a blob URL
  if (logoPreviewUrl.value?.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreviewUrl.value);
  }
  logoPreviewUrl.value = URL.createObjectURL(blob);
  showCropModal.value = false;

  // Release crop source URL
  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl);
    cropObjectUrl = '';
  }
}

function onCropCancel() {
  showCropModal.value = false;
  if (cropObjectUrl) {
    URL.revokeObjectURL(cropObjectUrl);
    cropObjectUrl = '';
  }
}

async function handleSubmit() {
  if (saving.value) return;
  if (!form.name.trim()) return;

  saving.value = true;
  try {
    let logoUrl: string | null | undefined = props.company?.logoUrl ?? null;

    // Upload logo if there's a pending blob
    if (pendingLogoBlob.value) {
      const file = new File([pendingLogoBlob.value], 'logo.jpg', { type: pendingLogoBlob.value.type || 'image/jpeg' });
      const result = await uploadGenericImage(file);
      logoUrl = result.url;
    }

    const payload: CompanyPayload = {
      name: form.name.trim(),
      industry: form.industry.trim() || null,
      description: form.description.trim() || null,
      logoUrl: logoUrl ?? null,
    };

    let saved: Company;
    if (props.company) {
      saved = await companies.update(props.company.id, payload);
    } else {
      saved = await companies.create(payload);
    }

    if (availableRecruiters.value.length > 0) {
      try {
        saved = await companies.setRecruiters(saved.id, selectedRecruiterIds.value);
      } catch (err) {
        const e = err as { message?: string };
        toast.value?.show(e?.message ?? 'Erro ao atribuir recrutadores.', 'error');
      }
    }

    emit('saved', saved);
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao salvar cliente', 'error');
  } finally {
    saving.value = false;
  }
}

function handleClose() {
  if (saving.value) return;
  // Clean up blob URLs
  if (logoPreviewUrl.value?.startsWith('blob:') && !props.company?.logoUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(logoPreviewUrl.value);
  }
  emit('close');
}
</script>

<style scoped>
.cem-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.cem-logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
}

.cem-logo-preview {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border);
  overflow: hidden;
  cursor: pointer;
  background: var(--bg-secondary);
}

.cem-logo-preview:hover .cem-logo-overlay {
  opacity: 1;
}

.cem-logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cem-logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light, #dbeafe);
}

.cem-logo-initials {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--primary);
}

.cem-logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.cem-file-input {
  display: none;
}

.cem-logo-hint {
  margin: 0;
  font-size: 11px;
  color: var(--text-secondary);
  text-align: center;
}

.cem-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.cem-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.cem-input,
.cem-textarea {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.cem-input:focus,
.cem-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.cem-input:disabled,
.cem-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cem-textarea {
  resize: vertical;
  min-height: 72px;
}

.cem-hint {
  margin: 0 0 var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.cem-recruiters {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  max-height: 180px;
  overflow-y: auto;
}

.cem-recruiter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--text-sm);
  cursor: pointer;
}

.cem-recruiter-name { color: var(--text-primary); }
.cem-recruiter-email { color: var(--text-secondary); font-size: 0.75rem; }
</style>
