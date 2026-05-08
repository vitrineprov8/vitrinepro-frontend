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
          <h1 class="db-section-title">Candidatos</h1>
          <p class="db-section-subtitle">Candidaturas recebidas para esta vaga</p>
        </div>
        <a href="/dashboard/vagas" class="btn btn-ghost btn-sm">Voltar</a>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

      <div v-else-if="applications.length === 0" class="empty-state">
        <p>Nenhuma candidatura recebida ainda.</p>
      </div>

      <ul v-else class="apps-list">
        <li v-for="a in applications" :key="a.id" class="apps-card">
          <div class="apps-card-head">
            <div>
              <strong>{{ a.snapshotFullName }}</strong>
              <div class="apps-card-meta">
                <a :href="`mailto:${a.snapshotEmail}`">{{ a.snapshotEmail }}</a>
                <span v-if="a.snapshotPhone">• {{ a.snapshotPhone }}</span>
                <span v-if="a.snapshotLocation">• {{ a.snapshotLocation }}</span>
              </div>
            </div>
            <div class="apps-card-actions">
              <select
                :value="a.status"
                :disabled="updatingId === a.id"
                @change="onStatusChange(a, ($event.target as HTMLSelectElement).value)"
              >
                <option value="PENDING">Pendente</option>
                <option value="REVIEWED">Em análise</option>
                <option value="ACCEPTED">Aceito</option>
                <option value="REJECTED">Recusado</option>
              </select>
            </div>
          </div>

          <div class="apps-card-body">
            <p v-if="a.message" class="apps-message">{{ a.message }}</p>
            <p v-else class="apps-no-message">Sem mensagem.</p>

            <div class="apps-extras">
              <a v-if="a.cv" :href="a.cv.fileUrl" target="_blank" class="btn btn-secondary btn-sm">
                Baixar currículo: {{ a.cv.label }}
              </a>
              <a
                v-if="a.user?.username"
                :href="`/perfil/${a.user.username}`"
                target="_blank"
                class="btn btn-ghost btn-sm"
              >Ver perfil</a>
              <span class="apps-date">enviada em {{ formatDate(a.createdAt) }}</span>
            </div>
          </div>
        </li>
      </ul>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import { isAdmin } from '../../utils/auth';
import { getVagaApplications, updateApplicationStatus } from '../../utils/api';
import type { ApplicationStatus, VagaApplicationAdminView } from '../../utils/api';

const props = defineProps<{ vagaId: string }>();

const toast = ref<InstanceType<typeof Toast>>();
const authorized = ref(false);
const loading = ref(true);
const applications = ref<VagaApplicationAdminView[]>([]);
const updatingId = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    applications.value = await getVagaApplications(props.vagaId);
  } catch {
    toast.value?.show('Erro ao carregar candidaturas', 'error');
  } finally {
    loading.value = false;
  }
}

async function onStatusChange(app: VagaApplicationAdminView, value: string) {
  if (updatingId.value) return;
  updatingId.value = app.id;
  try {
    await updateApplicationStatus(app.id, value as ApplicationStatus);
    app.status = value as ApplicationStatus;
    toast.value?.show('Status atualizado', 'success');
  } catch {
    toast.value?.show('Erro ao atualizar status', 'error');
  } finally {
    updatingId.value = null;
  }
}

function formatDate(s: string): string {
  return new Date(s).toLocaleString('pt-BR');
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
}
.apps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.apps-card {
  background: white;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}
.apps-card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.75rem;
}
.apps-card-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.apps-card-meta a {
  color: var(--primary-color, #6366f1);
}
.apps-card-actions select {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 6px;
}
.apps-message {
  margin: 0 0 0.75rem;
  white-space: pre-line;
  color: var(--text-primary);
}
.apps-no-message {
  margin: 0 0 0.75rem;
  font-style: italic;
  color: var(--text-muted, #9ca3af);
  font-size: 0.9rem;
}
.apps-extras {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}
.apps-date {
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-muted, #9ca3af);
}
</style>
