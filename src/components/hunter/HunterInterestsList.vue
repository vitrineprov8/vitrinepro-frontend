<script setup lang="ts">
/**
 * HunterInterestsList — dono da vaga vê hunters PENDING com botoes Aceitar/Rejeitar.
 * Apos aceitar, mostra telefone do hunter.
 */
import { ref, onMounted } from 'vue';
import { hunterInterests, getErrorMessage } from '../../utils/api';
import type { HunterInterest } from '../../utils/api';
import Toast from '../ui/Toast.vue';

const props = defineProps<{
  vagaId: string;
}>();

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const loading = ref(false);
const interests = ref<HunterInterest[]>([]);
const respondingId = ref<string | null>(null);

async function load() {
  loading.value = true;
  try {
    interests.value = await hunterInterests.listByVaga(props.vagaId);
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  } finally {
    loading.value = false;
  }
}

async function respond(interest: HunterInterest, status: 'ACCEPTED' | 'REJECTED') {
  if (respondingId.value) return;
  respondingId.value = interest.id;
  try {
    const hunterId = interest.hunterUserId ?? interest.hunter?.id;
    if (!hunterId) {
      toastRef.value?.show('Hunter sem ID associado.', 'error');
      return;
    }
    const updated = await hunterInterests.respond(props.vagaId, hunterId, status);
    const idx = interests.value.findIndex(i => i.id === interest.id);
    if (idx !== -1) {
      interests.value[idx] = updated;
      interests.value = [...interests.value];
    }
    toastRef.value?.show(
      status === 'ACCEPTED' ? 'Hunter aceito! O contato foi liberado.' : 'Hunter recusado.',
      status === 'ACCEPTED' ? 'success' : 'info'
    );
  } catch (err) {
    toastRef.value?.show(getErrorMessage(err), 'error');
  } finally {
    respondingId.value = null;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

onMounted(load);
</script>

<template>
  <div class="hil-root">
    <Toast ref="toastRef" />

    <div v-if="loading" class="hil-loading">
      <div class="spinner spinner-md" />
      <span>Carregando hunters...</span>
    </div>

    <div v-else-if="interests.length === 0" class="hil-empty">
      Nenhum hunter demonstrou interesse nesta vaga ainda.
    </div>

    <ul v-else class="hil-list">
      <li
        v-for="item in interests"
        :key="item.id"
        class="hil-card"
        :class="`hil-card--${item.status.toLowerCase()}`"
      >
        <div class="hil-card-main">
          <div class="hil-avatar">
            <img
              v-if="item.hunter?.avatarUrl"
              :src="item.hunter.avatarUrl"
              :alt="item.hunter.firstName"
              width="40"
              height="40"
            />
            <span v-else class="hil-avatar-initials">
              {{ (item.hunter?.firstName?.[0] ?? '?').toUpperCase() }}
            </span>
          </div>

          <div class="hil-info">
            <div class="hil-name">
              {{ item.hunter?.firstName }} {{ item.hunter?.lastName }}
              <a
                v-if="item.hunter?.username"
                :href="`/perfil/${item.hunter.username}`"
                target="_blank"
                class="hil-profile-link"
              >Ver perfil</a>
            </div>
            <div class="hil-email">{{ item.hunter?.email }}</div>

            <!-- Mostrar telefone apenas quando aceito -->
            <div v-if="item.status === 'ACCEPTED' && item.hunter?.phone" class="hil-phone">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3-8.56A2 2 0 0 1 3.7 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 5.82 5.82l1.27-.13a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>
              </svg>
              <a :href="`tel:${item.hunter.phone}`">{{ item.hunter.phone }}</a>
            </div>

            <div class="hil-date">Interesse em {{ formatDate(item.createdAt) }}</div>
          </div>

          <div class="hil-status-col">
            <span
              class="hil-status-badge"
              :class="{
                'hil-badge-pending': item.status === 'PENDING',
                'hil-badge-accepted': item.status === 'ACCEPTED',
                'hil-badge-rejected': item.status === 'REJECTED',
              }"
            >
              {{ item.status === 'PENDING' ? 'Pendente' : item.status === 'ACCEPTED' ? 'Aceito' : 'Recusado' }}
            </span>
          </div>
        </div>

        <!-- Botoes de acao — apenas para PENDING -->
        <div v-if="item.status === 'PENDING'" class="hil-actions">
          <button
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="respondingId === item.id"
            @click="respond(item, 'ACCEPTED')"
          >
            <span v-if="respondingId === item.id" class="spinner spinner-sm" />
            <span v-else>Aceitar</span>
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-sm"
            :disabled="respondingId === item.id"
            @click="respond(item, 'REJECTED')"
          >
            Recusar
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.hil-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hil-loading {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  padding: var(--spacing-md) 0;
}

.hil-empty {
  color: var(--text-muted, #9ca3af);
  font-size: var(--text-sm);
  padding: var(--spacing-md) 0;
  text-align: center;
}

.hil-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hil-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hil-card--accepted {
  border-color: rgba(22, 163, 74, 0.3);
  background: rgba(22, 163, 74, 0.03);
}

.hil-card--rejected {
  opacity: 0.7;
}

.hil-card-main {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.hil-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-secondary);
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hil-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hil-avatar-initials {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--primary);
}

.hil-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hil-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.hil-profile-link {
  font-size: var(--text-xs);
  color: var(--primary);
  text-decoration: none;
  font-weight: 400;
}

.hil-email {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.hil-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-sm);
  font-weight: 600;
  color: #16a34a;
}

.hil-phone a {
  color: inherit;
  text-decoration: none;
}

.hil-date {
  font-size: var(--text-xs);
  color: var(--text-muted, #9ca3af);
}

.hil-status-col {
  flex-shrink: 0;
}

.hil-status-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.hil-badge-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.hil-badge-accepted {
  background: rgba(22, 163, 74, 0.1);
  color: #16a34a;
}

.hil-badge-rejected {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.hil-actions {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--border-light);
}
</style>
