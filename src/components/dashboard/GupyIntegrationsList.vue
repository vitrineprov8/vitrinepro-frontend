<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!deleteTarget"
      title="Excluir integração Gupy"
      :message="`Tem certeza que deseja excluir &quot;${deleteTarget?.displayName}&quot;? As vagas Gupy associadas perderão o link e ficarão sem origem definida.`"
      confirm-label="Excluir"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />

    <Modal
      :visible="formOpen"
      :title="editing ? 'Editar integração Gupy' : 'Nova integração Gupy'"
      @close="closeForm"
    >
      <form class="gupy-form" @submit.prevent="submitForm">
          <div class="form-group">
            <label for="displayName">Nome da empresa</label>
            <input
              id="displayName"
              v-model="form.displayName"
              type="text"
              maxlength="255"
              required
              placeholder="Empresa X"
            />
          </div>

          <div class="form-group">
            <label for="subdomain">Subdomain Gupy</label>
            <div class="subdomain-input">
              <input
                id="subdomain"
                v-model="form.subdomain"
                type="text"
                maxlength="100"
                pattern="[a-z0-9-]+"
                required
                placeholder="vempra"
                @input="onSubdomainInput"
              />
              <span class="subdomain-suffix">.gupy.io</span>
            </div>
            <small>Apenas letras minúsculas, números e hífens.</small>
          </div>

          <label class="form-checkbox">
            <input v-model="form.enabled" type="checkbox" />
            <span>Habilitada</span>
          </label>

          <div v-if="formError" class="form-error">{{ formError }}</div>

          <div class="form-actions">
            <button type="button" class="btn btn-ghost" @click="closeForm">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner spinner-sm"></span>
              {{ editing ? 'Salvar alterações' : 'Criar integração' }}
            </button>
          </div>
        </form>
    </Modal>

    <div v-if="!authorized" class="db-section-header">
      <div>
        <h1 class="db-section-title">Acesso restrito</h1>
        <p class="db-section-subtitle">Esta área é apenas para administradores.</p>
      </div>
    </div>

    <template v-else>
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title">Integrações Gupy</h1>
          <p class="db-section-subtitle">
            Cadastre as empresas Gupy parceiras. Cada vaga Gupy criada será vinculada a uma destas integrações.
          </p>
        </div>
        <button class="btn btn-primary" @click="openCreate">+ Nova integração</button>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

      <div v-else-if="configs.length === 0" class="empty-state">
        <p>Nenhuma integração Gupy cadastrada ainda.</p>
        <button class="btn btn-primary" @click="openCreate">Criar primeira integração</button>
      </div>

      <div v-else class="db-list">
        <div v-for="c in configs" :key="c.id" class="db-list-item">
          <div class="db-list-info">
            <div class="db-list-title">{{ c.displayName }}</div>
            <div class="db-list-meta">
              <code>{{ c.subdomain }}.gupy.io</code>
              <span class="gupy-status-pill" :class="c.enabled ? 's-on' : 's-off'">
                {{ c.enabled ? 'Habilitada' : 'Desabilitada' }}
              </span>
              <span v-if="lastSync[c.id]" class="gupy-sync-time">
                Sincronizada em {{ formatDateTime(lastSync[c.id]) }}
              </span>
            </div>
          </div>

          <div class="db-list-actions">
            <button
              class="btn btn-secondary btn-sm"
              :disabled="!c.enabled || syncing[c.id]"
              @click="openRemoteJobs(c)"
            >Ver vagas</button>
            <button
              class="btn btn-ghost btn-sm"
              :disabled="!c.enabled || syncing[c.id]"
              @click="syncConfig(c)"
            >
              <span v-if="syncing[c.id]" class="spinner spinner-sm"></span>
              Sincronizar
            </button>
            <button class="btn btn-ghost btn-sm" @click="toggleEnabled(c)">
              {{ c.enabled ? 'Desabilitar' : 'Habilitar' }}
            </button>
            <button class="btn btn-secondary btn-sm" @click="openEdit(c)">Editar</button>
            <button class="btn btn-danger btn-sm" @click="deleteTarget = c">Excluir</button>
          </div>
        </div>
      </div>
    </template>

    <GupyRemoteJobsModal
      :visible="remoteJobsOpen"
      :config="remoteJobsConfig"
      @close="remoteJobsOpen = false"
      @imported="onImported"
    />
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import Modal from '../ui/Modal.vue';
import GupyRemoteJobsModal from './GupyRemoteJobsModal.vue';
import { isAdmin } from '../../utils/auth';
import {
  createGupyConfig,
  deleteGupyConfig,
  getGupyConfigs,
  syncGupyConfig,
  updateGupyConfig,
} from '../../utils/api';
import type { GupyConfig, GupyConfigPayload } from '../../utils/api';

const toast = ref<InstanceType<typeof Toast>>();
const authorized = ref(false);
const loading = ref(true);
const configs = ref<GupyConfig[]>([]);

const deleteTarget = ref<GupyConfig | null>(null);
const deleting = ref(false);

const formOpen = ref(false);
const editing = ref<GupyConfig | null>(null);
const saving = ref(false);
const formError = ref('');
const form = reactive<GupyConfigPayload>({
  displayName: '',
  subdomain: '',
  enabled: true,
});

const remoteJobsOpen = ref(false);
const remoteJobsConfig = ref<GupyConfig | null>(null);
const syncing = reactive<Record<string, boolean>>({});
const lastSync = reactive<Record<string, string>>({});

function openRemoteJobs(c: GupyConfig) {
  remoteJobsConfig.value = c;
  remoteJobsOpen.value = true;
}

function onImported(summary: { imported: number; skipped: number; failed: number }) {
  remoteJobsOpen.value = false;
  const parts: string[] = [];
  if (summary.imported) parts.push(`${summary.imported} importadas`);
  if (summary.skipped) parts.push(`${summary.skipped} já existiam`);
  if (summary.failed) parts.push(`${summary.failed} falharam`);
  toast.value?.show(
    parts.length ? parts.join(', ') : 'Nada para importar',
    summary.failed ? 'error' : 'success',
  );
}

async function syncConfig(c: GupyConfig) {
  if (syncing[c.id]) return;
  syncing[c.id] = true;
  try {
    const res = await syncGupyConfig(c.id);
    lastSync[c.id] = res.syncedAt;
    const parts = [
      `${res.total} verificadas`,
      `${res.updated} atualizadas`,
      `${res.closed} encerradas`,
    ];
    if (res.errors.length) parts.push(`${res.errors.length} erros`);
    toast.value?.show(
      parts.join(' · '),
      res.errors.length ? 'error' : 'success',
    );
  } catch (e: any) {
    toast.value?.show(e?.message || 'Erro ao sincronizar', 'error');
  } finally {
    syncing[c.id] = false;
  }
}

function formatDateTime(s: string): string {
  return new Date(s).toLocaleString('pt-BR');
}

async function load() {
  loading.value = true;
  try {
    configs.value = await getGupyConfigs();
  } catch {
    toast.value?.show('Erro ao carregar integrações Gupy', 'error');
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  form.displayName = '';
  form.subdomain = '';
  form.enabled = true;
  formError.value = '';
  formOpen.value = true;
}

function openEdit(c: GupyConfig) {
  editing.value = c;
  form.displayName = c.displayName;
  form.subdomain = c.subdomain;
  form.enabled = c.enabled;
  formError.value = '';
  formOpen.value = true;
}

function closeForm() {
  if (saving.value) return;
  formOpen.value = false;
  editing.value = null;
  formError.value = '';
}

function onSubdomainInput() {
  form.subdomain = form.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

async function submitForm() {
  if (saving.value) return;
  formError.value = '';
  if (!form.displayName.trim()) {
    formError.value = 'Informe o nome da empresa.';
    return;
  }
  if (!/^[a-z0-9-]+$/.test(form.subdomain) || form.subdomain.length < 2) {
    formError.value = 'Subdomain inválido. Use apenas letras minúsculas, números e hífens.';
    return;
  }
  saving.value = true;
  try {
    const payload: GupyConfigPayload = {
      displayName: form.displayName.trim(),
      subdomain: form.subdomain.trim(),
      enabled: form.enabled,
    };
    if (editing.value) {
      await updateGupyConfig(editing.value.id, payload);
      toast.value?.show('Integração atualizada', 'success');
    } else {
      await createGupyConfig(payload);
      toast.value?.show('Integração criada', 'success');
    }
    formOpen.value = false;
    editing.value = null;
    await load();
  } catch (e: any) {
    formError.value = e?.message || 'Erro ao salvar integração.';
  } finally {
    saving.value = false;
  }
}

async function toggleEnabled(c: GupyConfig) {
  try {
    await updateGupyConfig(c.id, { enabled: !c.enabled });
    toast.value?.show(
      !c.enabled ? 'Integração habilitada' : 'Integração desabilitada',
      'success',
    );
    await load();
  } catch {
    toast.value?.show('Erro ao alterar status', 'error');
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  const target = deleteTarget.value;
  try {
    await deleteGupyConfig(target.id);
    toast.value?.show('Integração excluída', 'success');
    await load();
  } catch {
    toast.value?.show('Erro ao excluir integração', 'error');
  } finally {
    deleteTarget.value = null;
    deleting.value = false;
  }
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
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
.gupy-status-pill {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.s-on { background: #dcfce7; color: #166534; }
.s-off { background: #fee2e2; color: #991b1b; }
.gupy-sync-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.gupy-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}
.form-group input {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: var(--font-sans);
}
.form-group small {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.subdomain-input {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
}
.subdomain-input input {
  flex: 1;
  border: none;
  outline: none;
}
.subdomain-suffix {
  padding: 0.6rem 0.8rem;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-family: monospace;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}
.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.form-error {
  background: #fee2e2;
  color: #991b1b;
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
code {
  background: var(--bg-secondary);
  padding: 0.1rem 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}
</style>
