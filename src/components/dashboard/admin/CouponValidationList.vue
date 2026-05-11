<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!confirmAction"
      :title="confirmAction?.type === 'validate' ? 'Validar cupom' : 'Rejeitar cupom'"
      :message="confirmAction?.type === 'validate'
        ? `Confirmar bônus de 30 dias para ${confirmAction?.ownerName}?`
        : `Rejeitar a redenção do cupom de ${confirmAction?.ownerName}?`"
      :confirm-label="confirmAction?.type === 'validate' ? 'Validar' : 'Rejeitar'"
      :loading="processing"
      @confirm="executeAction"
      @cancel="confirmAction = null"
    />

    <div v-if="!adminAccess" class="db-section-header">
      <div>
        <h1 class="db-section-title">Acesso restrito</h1>
        <p class="db-section-subtitle">Esta área é apenas para administradores.</p>
      </div>
    </div>

    <template v-else>
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title">Validar cupons</h1>
          <p class="db-section-subtitle">Redenções pendentes de validação manual</p>
        </div>
        <button class="btn btn-ghost btn-sm" @click="load">Atualizar</button>
      </div>

      <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

      <div v-else-if="redemptions.length === 0" class="empty-state">
        <p>Nenhuma redenção pendente no momento.</p>
      </div>

      <div v-else class="coupon-table-wrap">
        <table class="coupon-table">
          <thead>
            <tr>
              <th>Cupom</th>
              <th>Dono do cupom</th>
              <th>Quem usou</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in redemptions" :key="r.id">
              <td>
                <code class="coupon-code">{{ r.coupon.code }}</code>
              </td>
              <td>
                <div class="coupon-user">
                  <span class="coupon-user-name">{{ r.coupon.owner?.firstName }} {{ r.coupon.owner?.lastName }}</span>
                  <span class="coupon-user-email">{{ r.coupon.owner?.email }}</span>
                </div>
              </td>
              <td>
                <div class="coupon-user">
                  <span class="coupon-user-name">{{ r.redeemedBy.firstName }} {{ r.redeemedBy.lastName }}</span>
                  <span class="coupon-user-email">{{ r.redeemedBy.email }}</span>
                </div>
              </td>
              <td class="coupon-date">{{ formatDate(r.createdAt) }}</td>
              <td>
                <div class="coupon-actions">
                  <button
                    class="btn btn-primary btn-sm"
                    :disabled="processing"
                    @click="openConfirm('validate', r)"
                  >Validar</button>
                  <button
                    class="btn btn-ghost btn-sm"
                    :disabled="processing"
                    @click="openConfirm('reject', r)"
                  >Rejeitar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import DashboardLayout from '../DashboardLayout.vue';
import Toast from '../../ui/Toast.vue';
import ConfirmDialog from '../../ui/ConfirmDialog.vue';
import { listPendingRedemptions, rejectRedemption, validateRedemption } from '../../../utils/api';
import type { CouponRedemption } from '../../../utils/api';
import { isAdmin } from '../../../utils/auth';

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const processing = ref(false);
const adminAccess = ref(false);
const redemptions = ref<CouponRedemption[]>([]);

interface ConfirmAction {
  type: 'validate' | 'reject';
  redemption: CouponRedemption;
  ownerName: string;
}
const confirmAction = ref<ConfirmAction | null>(null);

function openConfirm(type: 'validate' | 'reject', r: CouponRedemption) {
  confirmAction.value = {
    type,
    redemption: r,
    ownerName: r.ownerName || `${r.coupon.owner?.firstName ?? ''} ${r.coupon.owner?.lastName ?? ''}`.trim() || 'desconhecido',
  };
}

async function executeAction() {
  if (!confirmAction.value) return;
  processing.value = true;
  const { type, redemption, ownerName } = confirmAction.value;
  try {
    if (type === 'validate') {
      await validateRedemption(redemption.id);
      toast.value?.show(`Bônus de 30 dias concedido a ${ownerName}`, 'success');
    } else {
      await rejectRedemption(redemption.id);
      toast.value?.show('Redenção rejeitada', 'success');
    }
    await load();
  } catch {
    toast.value?.show('Erro ao processar ação. Tente novamente.', 'error');
  } finally {
    confirmAction.value = null;
    processing.value = false;
  }
}

async function load() {
  loading.value = true;
  try {
    redemptions.value = await listPendingRedemptions();
  } catch {
    toast.value?.show('Erro ao carregar redenções', 'error');
  } finally {
    loading.value = false;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

onMounted(() => {
  if (!isAdmin()) {
    adminAccess.value = false;
    loading.value = false;
    return;
  }
  adminAccess.value = true;
  load();
});
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}
.coupon-table-wrap {
  overflow-x: auto;
}
.coupon-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.coupon-table th,
.coupon-table td {
  text-align: left;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}
.coupon-table th {
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary, #f9fafb);
  white-space: nowrap;
}
.coupon-code {
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--bg-secondary, #f9fafb);
  padding: 2px 6px;
  border-radius: 4px;
}
.coupon-user {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.coupon-user-name {
  font-weight: 500;
  color: var(--text-primary);
}
.coupon-user-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.coupon-date {
  white-space: nowrap;
  color: var(--text-secondary);
}
.coupon-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
