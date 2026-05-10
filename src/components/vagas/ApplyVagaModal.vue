<template>
  <Modal
    :visible="visible"
    :title="`Candidatar-se: ${vaga.title}`"
    @close="$emit('close')"
  >
    <Toast ref="toast" />
    <form class="apply-form" @submit.prevent="submit">
      <div v-if="loadingProfile" class="apply-loading">Carregando perfil...</div>

      <template v-else>
        <p v-if="syncFields.length" class="apply-info">
          Os campos a seguir serão preenchidos no seu perfil:
          <strong>{{ syncFields.join(', ') }}</strong>
        </p>

        <label class="apply-field">
          <span>Nome completo *</span>
          <input v-model="form.fullName" type="text" required maxlength="255" />
        </label>

        <label class="apply-field">
          <span>E-mail *</span>
          <input v-model="form.email" type="email" required maxlength="255" />
        </label>

        <label class="apply-field">
          <span>Telefone *</span>
          <input
            :value="form.phone"
            type="tel"
            required
            maxlength="20"
            placeholder="(11) 99999-9999"
            :class="{ 'apply-input-error': phoneInvalid }"
            @input="onPhoneInput"
          />
          <small v-if="phoneInvalid" class="apply-error-msg">
            Telefone inválido. Use (DD) 9XXXX-XXXX ou (DD) XXXX-XXXX.
          </small>
        </label>

        <div class="apply-field">
          <span>Localização *</span>
          <CitySelect
            ref="citySelectRef"
            v-model="form.location"
            placeholder="Buscar cidade..."
          />
        </div>

        <div class="apply-field">
          <span>Currículo *</span>
          <select
            v-if="cvs.length > 0 && !showCvUpload"
            v-model="form.cvId"
            required
          >
            <option value="">Selecione um currículo</option>
            <option v-for="cv in cvs" :key="cv.id" :value="cv.id">{{ cv.label }}</option>
          </select>

          <div v-if="cvs.length > 0 && !showCvUpload" class="apply-hint-row">
            <button type="button" class="apply-link-btn" @click="showCvUpload = true">
              + Adicionar novo currículo
            </button>
          </div>

          <div v-if="cvs.length === 0 || showCvUpload" class="cv-inline-upload">
            <p v-if="cvs.length === 0 && !uploadingCv && !cvUploadStatus" class="apply-hint">
              Você ainda não tem currículos. Faça o upload de um PDF para anexar à candidatura.
            </p>

            <input
              ref="cvFileInput"
              type="file"
              accept="application/pdf,.pdf"
              :disabled="uploadingCv"
              @change="onCvFileChange"
            />

            <div v-if="uploadingCv" class="cv-upload-status uploading">
              <span class="spinner spinner-sm" />
              <span>Enviando currículo...</span>
            </div>

            <div v-else-if="cvUploadStatus === 'success'" class="cv-upload-status success">
              <span aria-hidden="true">✓</span>
              <span>Currículo enviado com sucesso e salvo no seu perfil.</span>
            </div>

            <div v-else-if="cvUploadStatus === 'error'" class="cv-upload-status error">
              <span aria-hidden="true">⚠</span>
              <span>{{ cvUploadError || 'Erro ao enviar currículo. Tente novamente.' }}</span>
            </div>

            <div v-if="cvs.length > 0 && !uploadingCv" class="cv-inline-upload-actions">
              <button
                type="button"
                class="btn btn-ghost btn-sm"
                @click="cancelCvUpload"
              >Cancelar</button>
            </div>
          </div>
        </div>

        <label class="apply-field">
          <span>Resumo profissional (opcional)</span>
          <textarea
            v-model="form.message"
            rows="4"
            maxlength="2000"
            placeholder="Conte um pouco por que essa vaga combina com você"
          />
        </label>
      </template>
    </form>

    <template #footer>
      <button class="btn btn-ghost" :disabled="submitting" @click="$emit('close')">
        Cancelar
      </button>
      <button
        class="btn btn-primary"
        :disabled="submitting || loadingProfile || !canSubmit"
        @click="submit"
      >
        {{ submitting ? 'Enviando...' : 'Enviar candidatura' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import Toast from '../ui/Toast.vue';
import CitySelect from '../ui/CitySelect.vue';
import {
  applyToVaga,
  getCVList,
  getFullProfile,
  uploadCV,
  ApiException,
} from '../../utils/api';
import type { CV, Vaga } from '../../utils/api';
import { formatBrazilPhone, isValidBrazilPhone } from '../../utils/phone';

const props = defineProps<{ visible: boolean; vaga: Vaga }>();
const emit = defineEmits<{ close: []; applied: [] }>();

const toast = ref<InstanceType<typeof Toast>>();
const citySelectRef = ref<InstanceType<typeof CitySelect>>();
const cvFileInput = ref<HTMLInputElement>();
const loadingProfile = ref(false);
const submitting = ref(false);
const cvs = ref<CV[]>([]);
const profileLoaded = ref(false);
const showCvUpload = ref(false);
const uploadingCv = ref(false);
const cvUploadFile = ref<File | null>(null);
const cvUploadStatus = ref<'success' | 'error' | null>(null);
const cvUploadError = ref('');

const initialProfile = ref({
  phone: '' as string | null | undefined,
  location: '' as string | null | undefined,
});

const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  location: '',
  cvId: '',
  message: '',
});

const syncFields = computed(() => {
  const fields: string[] = [];
  if (!initialProfile.value.phone && form.phone) fields.push('telefone');
  if (!initialProfile.value.location && form.location) fields.push('localização');
  return fields;
});

watch(
  () => props.visible,
  async (open) => {
    if (open && !profileLoaded.value) {
      await loadProfile();
    }
  },
  { immediate: true },
);

async function loadProfile() {
  loadingProfile.value = true;
  try {
    const [profile, cvList] = await Promise.all([
      getFullProfile().catch(() => null),
      getCVList().catch(() => [] as CV[]),
    ]);
    if (profile) {
      form.fullName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
      form.email = profile.email ?? '';
      form.phone = profile.phone ? formatBrazilPhone(profile.phone) : '';
      form.location = profile.location ?? '';
      initialProfile.value = {
        phone: profile.phone ?? '',
        location: profile.location ?? '',
      };
    }
    cvs.value = cvList.filter((c) => c.isActive !== false);
    if (cvs.value.length > 0) form.cvId = cvs.value[0].id;
    profileLoaded.value = true;
  } catch {
    toast.value?.show('Erro ao carregar dados do perfil', 'error');
  } finally {
    loadingProfile.value = false;
  }
}

function onPhoneInput(e: Event) {
  form.phone = formatBrazilPhone((e.target as HTMLInputElement).value);
}

const phoneInvalid = computed(
  () => !!form.phone && !isValidBrazilPhone(form.phone),
);

async function onCvFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  cvUploadFile.value = file;
  cvUploadStatus.value = null;
  cvUploadError.value = '';
  if (file) {
    await runCvUpload(file);
  }
}

function cancelCvUpload() {
  showCvUpload.value = false;
  cvUploadFile.value = null;
  cvUploadStatus.value = null;
  cvUploadError.value = '';
  if (cvFileInput.value) cvFileInput.value.value = '';
}

async function runCvUpload(file: File) {
  if (uploadingCv.value) return;
  const label = file.name.replace(/\.pdf$/i, '').trim() || 'Currículo';
  uploadingCv.value = true;
  cvUploadStatus.value = null;
  cvUploadError.value = '';
  try {
    const created = await uploadCV(file, label);
    cvs.value = [created, ...cvs.value];
    form.cvId = created.id;
    cvUploadStatus.value = 'success';
    toast.value?.show('Currículo enviado e salvo no seu perfil', 'success');
    setTimeout(() => {
      if (cvUploadStatus.value === 'success') {
        showCvUpload.value = false;
        cvUploadFile.value = null;
        cvUploadStatus.value = null;
        if (cvFileInput.value) cvFileInput.value.value = '';
      }
    }, 1500);
  } catch (err) {
    cvUploadStatus.value = 'error';
    cvUploadError.value = err instanceof ApiException
      ? err.message || 'Erro ao enviar currículo'
      : 'Erro ao enviar currículo';
    toast.value?.show(cvUploadError.value, 'error');
  } finally {
    uploadingCv.value = false;
  }
}

const canSubmit = computed(() =>
  !!form.fullName.trim() &&
  !!form.email.trim() &&
  !!form.phone.trim() &&
  !phoneInvalid.value &&
  !!form.location.trim() &&
  !!form.cvId &&
  !uploadingCv.value,
);

async function submit() {
  if (submitting.value) return;
  if (!canSubmit.value) {
    toast.value?.show('Preencha todos os campos obrigatórios e anexe um currículo', 'error');
    return;
  }
  if (phoneInvalid.value) {
    toast.value?.show('Informe um telefone brasileiro válido', 'error');
    return;
  }
  if (citySelectRef.value && !citySelectRef.value.isValid) {
    toast.value?.show('Selecione uma cidade válida da lista', 'error');
    return;
  }
  submitting.value = true;
  try {
    const result = await applyToVaga(props.vaga.slug, {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      location: form.location.trim(),
      cvId: form.cvId,
      message: form.message.trim() || undefined,
    });
    if (result.redirectUrl) {
      toast.value?.show(
        'Candidatura registrada. Finalize na Gupy na nova aba que será aberta.',
        'success',
      );
      window.open(result.redirectUrl, '_blank', 'noopener,noreferrer');
    }
    emit('applied');
  } catch (err) {
    if (err instanceof ApiException && err.statusCode === 409) {
      toast.value?.show('Você já se candidatou a esta vaga', 'warning');
    } else if (err instanceof ApiException) {
      toast.value?.show(err.message || 'Erro ao enviar candidatura', 'error');
    } else {
      toast.value?.show('Erro ao enviar candidatura', 'error');
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.apply-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.apply-loading {
  text-align: center;
  padding: 2rem 0;
  color: var(--text-secondary);
}
.apply-info {
  background: var(--bg-muted, #f3f4f6);
  border-left: 3px solid var(--primary-color, #6366f1);
  padding: 0.6rem 0.85rem;
  margin: 0 0 0.5rem;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.apply-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.apply-field span {
  font-size: 0.85rem;
  color: var(--text-secondary);
}
.apply-field input,
.apply-field select,
.apply-field textarea {
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
}
.apply-field textarea {
  resize: vertical;
}
.apply-hint {
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  margin: 0;
}
.apply-hint a {
  color: var(--primary-color, #6366f1);
}
.apply-hint-row {
  display: flex;
  justify-content: flex-end;
}
.apply-link-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.8rem;
  color: var(--primary-color, #6366f1);
  cursor: pointer;
}
.apply-link-btn:hover {
  text-decoration: underline;
}
.cv-inline-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-muted, #f9fafb);
  border: 1px dashed var(--border-color, #d1d5db);
  border-radius: 8px;
}
.cv-inline-upload input[type="text"],
.cv-inline-upload input[type="file"] {
  padding: 0.45rem 0.65rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--bg-primary, white);
}
.cv-inline-upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.cv-upload-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.7rem;
  border-radius: 6px;
  font-size: 0.85rem;
}
.cv-upload-status.uploading {
  background: #eff6ff;
  color: #1e40af;
}
.cv-upload-status.success {
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
}
.cv-upload-status.error {
  background: #fee2e2;
  color: #991b1b;
}
.apply-input-error {
  border-color: #ef4444 !important;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}
.apply-error-msg {
  color: #ef4444;
  font-size: 0.78rem;
  margin-top: 2px;
}
</style>
