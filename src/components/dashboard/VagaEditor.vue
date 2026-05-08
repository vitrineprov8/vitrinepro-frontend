<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <div v-if="!authorized" class="db-section-header">
      <div>
        <h1 class="db-section-title">Acesso restrito</h1>
        <p class="db-section-subtitle">Esta área é apenas para administradores.</p>
      </div>
    </div>

    <template v-else>
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title">{{ vagaId ? 'Editar vaga' : 'Nova vaga' }}</h1>
          <p class="db-section-subtitle">{{ vagaId ? 'Atualize os dados da vaga' : 'Cadastre uma nova vaga' }}</p>
        </div>
        <a href="/dashboard/vagas" class="btn btn-ghost btn-sm">Voltar</a>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

      <form v-else class="vaga-form" @submit.prevent="save">
        <label class="db-field">
          <span class="db-label">Título *</span>
          <input v-model="form.title" type="text" required maxlength="255" class="db-input" />
        </label>

        <label class="db-field">
          <span class="db-label">Descrição *</span>
          <textarea v-model="form.description" rows="6" required class="db-textarea" />
        </label>

        <label class="db-field">
          <span class="db-label">Requisitos</span>
          <textarea v-model="form.requirements" rows="4" class="db-textarea" />
        </label>

        <label class="db-field">
          <span class="db-label">Benefícios</span>
          <textarea v-model="form.benefits" rows="3" class="db-textarea" />
        </label>

        <div class="vaga-form-grid">
          <label class="db-field">
            <span class="db-label">Localização</span>
            <input v-model="form.location" type="text" maxlength="255" class="db-input" />
          </label>

          <label class="db-field">
            <span class="db-label">Tipo</span>
            <select v-model="form.type" class="db-input">
              <option value="">—</option>
              <option value="CLT">CLT</option>
              <option value="PJ">PJ</option>
              <option value="FREELA">Freelance</option>
              <option value="ESTAGIO">Estágio</option>
            </select>
          </label>

          <label class="db-field">
            <span class="db-label">Modalidade</span>
            <select v-model="form.workMode" class="db-input">
              <option value="">—</option>
              <option value="REMOTE">Remoto</option>
              <option value="HYBRID">Híbrido</option>
              <option value="ONSITE">Presencial</option>
            </select>
          </label>

          <label class="db-field">
            <span class="db-label">Status</span>
            <select v-model="form.status" class="db-input">
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicada</option>
              <option value="CLOSED">Encerrada</option>
            </select>
          </label>

          <label class="db-field">
            <span class="db-label">Salário mínimo (BRL)</span>
            <input v-model.number="form.salaryMin" type="number" min="0" step="0.01" class="db-input" />
          </label>

          <label class="db-field">
            <span class="db-label">Salário máximo (BRL)</span>
            <input v-model.number="form.salaryMax" type="number" min="0" step="0.01" class="db-input" />
          </label>

          <label class="db-field">
            <span class="db-label">Prazo (deadline)</span>
            <input v-model="form.deadline" type="datetime-local" class="db-input" />
          </label>

          <label class="db-field">
            <span class="db-label">E-mail de contato</span>
            <input v-model="form.contactEmail" type="email" maxlength="255" class="db-input" />
          </label>
        </div>

        <div class="vaga-form-actions">
          <button type="button" class="btn btn-ghost" @click="cancel">Cancelar</button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            {{ saving ? 'Salvando...' : (vagaId ? 'Salvar' : 'Criar vaga') }}
          </button>
        </div>
      </form>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import { isAdmin } from '../../utils/auth';
import {
  createVaga,
  getAdminVagas,
  updateVaga,
} from '../../utils/api';
import type { VagaPayload, VagaStatus, VagaType, VagaWorkMode } from '../../utils/api';

const props = defineProps<{ vagaId?: string }>();

const toast = ref<InstanceType<typeof Toast>>();
const authorized = ref(false);
const loading = ref(true);
const saving = ref(false);

interface FormState {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  location: string;
  type: VagaType | '';
  workMode: VagaWorkMode | '';
  salaryMin: number | null;
  salaryMax: number | null;
  deadline: string;
  status: VagaStatus;
  contactEmail: string;
}

const form = reactive<FormState>({
  title: '',
  description: '',
  requirements: '',
  benefits: '',
  location: '',
  type: '',
  workMode: '',
  salaryMin: null,
  salaryMax: null,
  deadline: '',
  status: 'DRAFT',
  contactEmail: '',
});

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function load() {
  if (!props.vagaId) {
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    // Admin endpoint returns all statuses; locate this id by paging.
    let page = 1;
    let lastPage = 1;
    let found: any = null;
    do {
      const res = await getAdminVagas({ page, limit: 20 });
      found = res.data.find((v) => v.id === props.vagaId);
      lastPage = res.lastPage;
      page++;
    } while (!found && page <= lastPage);

    if (!found) {
      toast.value?.show('Vaga não encontrada', 'error');
      return;
    }

    form.title = found.title;
    form.description = found.description;
    form.requirements = found.requirements ?? '';
    form.benefits = found.benefits ?? '';
    form.location = found.location ?? '';
    form.type = (found.type ?? '') as VagaType | '';
    form.workMode = (found.workMode ?? '') as VagaWorkMode | '';
    form.salaryMin = found.salaryMin != null ? Number(found.salaryMin) : null;
    form.salaryMax = found.salaryMax != null ? Number(found.salaryMax) : null;
    form.deadline = found.deadline ? toLocalInput(found.deadline) : '';
    form.status = found.status;
    form.contactEmail = found.contactEmail ?? '';
  } catch {
    toast.value?.show('Erro ao carregar vaga', 'error');
  } finally {
    loading.value = false;
  }
}

function buildPayload(): VagaPayload {
  const payload: VagaPayload = {
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
  };
  if (form.requirements.trim()) payload.requirements = form.requirements.trim();
  if (form.benefits.trim()) payload.benefits = form.benefits.trim();
  if (form.location.trim()) payload.location = form.location.trim();
  if (form.type) payload.type = form.type;
  if (form.workMode) payload.workMode = form.workMode;
  if (form.salaryMin != null && Number.isFinite(form.salaryMin)) payload.salaryMin = form.salaryMin;
  if (form.salaryMax != null && Number.isFinite(form.salaryMax)) payload.salaryMax = form.salaryMax;
  if (form.deadline) payload.deadline = new Date(form.deadline).toISOString();
  if (form.contactEmail.trim()) payload.contactEmail = form.contactEmail.trim();
  return payload;
}

async function save() {
  if (saving.value) return;
  if (!form.title.trim() || !form.description.trim()) {
    toast.value?.show('Preencha título e descrição', 'error');
    return;
  }
  saving.value = true;
  try {
    const payload = buildPayload();
    if (props.vagaId) {
      await updateVaga(props.vagaId, payload);
      toast.value?.show('Vaga atualizada', 'success');
    } else {
      const created = await createVaga(payload);
      toast.value?.show('Vaga criada', 'success');
      window.location.href = `/dashboard/vagas/${created.id}`;
      return;
    }
  } catch (err: any) {
    toast.value?.show(err?.message || 'Erro ao salvar vaga', 'error');
  } finally {
    saving.value = false;
  }
}

function cancel() {
  window.location.href = '/dashboard/vagas';
}

onMounted(() => {
  if (!isAdmin()) {
    authorized.value = false;
    loading.value = false;
    return;
  }
  authorized.value = true;
  load();
});
</script>

<style scoped>
.vaga-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 800px;
}
.vaga-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}
.db-field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.vaga-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}
</style>
