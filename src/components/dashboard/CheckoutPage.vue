<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Checkout</h1>
        <p class="db-section-subtitle">Revise seu pedido e conclua a assinatura</p>
      </div>
      <a href="/dashboard/planos" class="btn btn-ghost btn-sm">Voltar aos planos</a>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <div v-else class="checkout-layout">
      <!-- Resumo do pedido -->
      <div class="checkout-card">
        <h2 class="checkout-card-title">Resumo do pedido</h2>
        <div class="checkout-summary">
          <div class="checkout-row">
            <span>Plano {{ planLabel }}</span>
            <span>R$ {{ checkout?.priceBRL?.toFixed(2) }}</span>
          </div>
          <div v-if="checkout && checkout.discountBRL > 0" class="checkout-row checkout-row--discount">
            <span>Desconto (cupom)</span>
            <span>- R$ {{ checkout.discountBRL.toFixed(2) }}</span>
          </div>
          <div class="checkout-row checkout-row--total">
            <span>Total</span>
            <span>R$ {{ checkout?.totalBRL?.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Cupom -->
      <div class="checkout-card">
        <h2 class="checkout-card-title">Cupom de desconto</h2>
        <div class="coupon-row">
          <input
            v-model="couponInput"
            type="text"
            class="db-input coupon-input"
            placeholder="Código do cupom"
            :disabled="applyingCoupon"
            @keydown.enter.prevent="applyCoupon"
          />
          <button
            class="btn btn-secondary btn-sm"
            :disabled="applyingCoupon || !couponInput.trim()"
            @click="applyCoupon"
          >
            {{ applyingCoupon ? 'Verificando...' : 'Aplicar' }}
          </button>
        </div>
        <p v-if="couponMessage" class="coupon-message" :class="couponMessageType">
          {{ couponMessage }}
        </p>
      </div>

      <!-- Dados de cobrança (somente se campos faltantes) -->
      <div v-if="missingFields.length > 0" class="checkout-card">
        <h2 class="checkout-card-title">Dados de cobrança</h2>
        <p class="checkout-hint">Preencha os dados abaixo para finalizar sua assinatura.</p>
        <form class="billing-form" @submit.prevent="saveBillingData">
          <div class="billing-form-grid">
            <label v-if="missingFields.includes('firstName')" class="db-field">
              <span class="db-label">Nome *</span>
              <input v-model="billingForm.firstName" type="text" required class="db-input" />
            </label>
            <label v-if="missingFields.includes('lastName')" class="db-field">
              <span class="db-label">Sobrenome *</span>
              <input v-model="billingForm.lastName" type="text" required class="db-input" />
            </label>
            <label v-if="missingFields.includes('phone')" class="db-field">
              <span class="db-label">Telefone</span>
              <input v-model="billingForm.phone" type="tel" class="db-input" placeholder="(11) 91234-5678" />
            </label>
            <label v-if="missingFields.includes('location')" class="db-field">
              <span class="db-label">Cidade / Estado</span>
              <input v-model="billingForm.location" type="text" class="db-input" placeholder="São Paulo, SP" />
            </label>
          </div>
          <div class="billing-form-actions">
            <button type="submit" class="btn btn-secondary btn-sm" :disabled="savingBilling">
              {{ savingBilling ? 'Salvando...' : 'Salvar dados' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Botão pagar -->
      <div class="checkout-card checkout-card--pay">
        <button
          class="btn btn-primary checkout-pay-btn"
          :disabled="paying"
          @click="pay"
        >
          {{ paying ? 'Processando...' : 'Finalizar compra — Pagamento em breve' }}
        </button>
        <p class="checkout-disclaimer">
          Ao continuar, você confirma que deseja assinar o plano {{ planLabel }}.
          O sistema de pagamento real estará disponível em breve.
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import {
  confirmSubscription,
  createCheckout,
  getFullProfile,
  updateProfile,
  validateCouponCode,
} from '../../utils/api';
import type { CheckoutResult, PlanTier } from '../../utils/api';
import { isAuthenticated, redirectToLogin } from '../../utils/auth';

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  RECRUITER: 'Recruiter',
  TEAM: 'Recruiter Team',
  ENTERPRISE: 'Recruiter Enterprise',
};

const VALID_PLANS: PlanTier[] = ['RECRUITER', 'TEAM', 'ENTERPRISE'];

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const paying = ref(false);
const applyingCoupon = ref(false);
const savingBilling = ref(false);

const selectedPlan = ref<PlanTier>('RECRUITER');
const planLabel = ref('');
const checkout = ref<CheckoutResult | null>(null);
const appliedCoupon = ref('');
const couponInput = ref('');
const couponMessage = ref('');
const couponMessageType = ref<'success' | 'error'>('success');

const missingFields = ref<string[]>([]);
const billingForm = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  location: '',
});

async function applyCoupon() {
  if (applyingCoupon.value || !couponInput.value.trim()) return;
  applyingCoupon.value = true;
  couponMessage.value = '';
  try {
    const result = await validateCouponCode(couponInput.value.trim());
    if (!result.valid) {
      couponMessage.value = 'Cupom inválido ou expirado.';
      couponMessageType.value = 'error';
      return;
    }
    // Recalculate checkout with coupon
    const updated = await createCheckout(selectedPlan.value, couponInput.value.trim());
    checkout.value = updated;
    appliedCoupon.value = couponInput.value.trim();
    couponMessage.value = 'Cupom aplicado! Desconto refletido no resumo.';
    couponMessageType.value = 'success';
  } catch {
    couponMessage.value = 'Erro ao validar cupom. Tente novamente.';
    couponMessageType.value = 'error';
  } finally {
    applyingCoupon.value = false;
  }
}

async function saveBillingData() {
  if (savingBilling.value) return;
  savingBilling.value = true;
  try {
    await updateProfile({
      firstName: billingForm.firstName || undefined,
      lastName: billingForm.lastName || undefined,
      phone: billingForm.phone || undefined,
      location: billingForm.location || undefined,
    });
    toast.value?.show('Dados salvos', 'success');
    // Recheck missing fields
    const profile = await getFullProfile();
    missingFields.value = computeMissingFields(profile);
  } catch {
    toast.value?.show('Erro ao salvar dados. Tente novamente.', 'error');
  } finally {
    savingBilling.value = false;
  }
}

function computeMissingFields(profile: { firstName?: string; lastName?: string; phone?: string; location?: string }): string[] {
  const missing: string[] = [];
  if (!profile.firstName?.trim()) missing.push('firstName');
  if (!profile.lastName?.trim()) missing.push('lastName');
  if (!profile.phone?.trim()) missing.push('phone');
  if (!profile.location?.trim()) missing.push('location');
  return missing;
}

async function pay() {
  if (paying.value) return;
  if (!checkout.value) return;
  paying.value = true;
  try {
    await confirmSubscription(checkout.value.subscriptionId);
    toast.value?.show('Assinatura ativada com sucesso!', 'success');
    // Check if profile is complete
    const profile = await getFullProfile();
    const missing = computeMissingFields(profile);
    if (missing.length > 0) {
      window.location.href = '/dashboard/completar-perfil';
    } else {
      window.location.href = '/dashboard?upgraded=1';
    }
  } catch {
    toast.value?.show('Erro ao processar pagamento. Tente novamente.', 'error');
  } finally {
    paying.value = false;
  }
}

onMounted(async () => {
  if (!isAuthenticated()) {
    redirectToLogin(window.location.pathname);
    return;
  }

  // Parse plan from querystring
  const params = new URLSearchParams(window.location.search);
  const planParam = params.get('plan') as PlanTier | null;
  if (!planParam || !VALID_PLANS.includes(planParam)) {
    window.location.href = '/dashboard/planos';
    return;
  }
  selectedPlan.value = planParam;
  planLabel.value = PLAN_NAMES[planParam];

  try {
    const [checkoutResult, profile] = await Promise.all([
      createCheckout(selectedPlan.value),
      getFullProfile(),
    ]);
    checkout.value = checkoutResult;
    missingFields.value = computeMissingFields(profile);
    // Pre-fill billing form with existing data
    billingForm.firstName = profile.firstName ?? '';
    billingForm.lastName = profile.lastName ?? '';
    billingForm.phone = profile.phone ?? '';
    billingForm.location = profile.location ?? '';
  } catch {
    toast.value?.show('Erro ao carregar checkout. Verifique sua conexão.', 'error');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.checkout-layout {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 560px;
}

.checkout-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  background: var(--bg-primary);
}
.checkout-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.checkout-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-primary);
}
.checkout-row--discount {
  color: #10b981;
}
.checkout-row--total {
  font-weight: 700;
  font-size: 1.05rem;
  border-top: 1px solid var(--border);
  padding-top: 0.5rem;
  margin-top: 0.25rem;
}

.coupon-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.coupon-input {
  flex: 1;
}
.coupon-message {
  margin-top: 0.5rem;
  font-size: 0.8rem;
}
.coupon-message.success {
  color: #10b981;
}
.coupon-message.error {
  color: #ef4444;
}

.checkout-hint {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}
.billing-form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}
.billing-form-actions {
  margin-top: 0.75rem;
  display: flex;
  justify-content: flex-end;
}

.checkout-card--pay {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
.checkout-pay-btn {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
}
.checkout-disclaimer {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.5;
}
</style>
