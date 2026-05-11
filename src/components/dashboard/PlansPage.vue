<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">Planos</h1>
        <p class="db-section-subtitle">Escolha o plano ideal para publicar suas vagas</p>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <template v-else>
      <!-- Current plan summary -->
      <section v-if="myPlanInfo && myPlanInfo.plan !== 'FREE'" class="my-plan-card" :class="`plan-card-${myPlanInfo.plan.toLowerCase()}`">
        <div class="my-plan-header">
          <div>
            <div class="my-plan-label">Seu plano atual</div>
            <h2 class="my-plan-name">{{ PLAN_NAMES[myPlanInfo.plan] }}</h2>
          </div>
          <span class="my-plan-status" :class="`status-${myPlanInfo.planStatus.toLowerCase()}`">
            {{ statusLabel(myPlanInfo.planStatus) }}
          </span>
        </div>
        <div class="my-plan-stats">
          <div class="my-plan-stat">
            <span class="stat-label">Vagas usadas</span>
            <span class="stat-value">{{ myPlanInfo.vagasUsed }} / {{ myPlanInfo.vagasLimit }}</span>
          </div>
          <div v-if="myPlanInfo.planExpiresAt" class="my-plan-stat">
            <span class="stat-label">Válido até</span>
            <span class="stat-value">{{ formatDate(myPlanInfo.planExpiresAt) }}</span>
          </div>
          <div v-if="lastPaidAt" class="my-plan-stat">
            <span class="stat-label">Última cobrança</span>
            <span class="stat-value">{{ formatDate(lastPaidAt) }}</span>
          </div>
          <div v-if="totalSpent > 0" class="my-plan-stat">
            <span class="stat-label">Total gasto</span>
            <span class="stat-value">R$ {{ totalSpent.toFixed(2) }}</span>
          </div>
        </div>
      </section>

      <!-- Subscription history -->
      <section v-if="subscriptions.length > 0" class="history-section">
        <h2 class="history-title">Histórico de assinaturas</h2>
        <div class="history-list">
          <div v-for="sub in subscriptions" :key="sub.id" class="history-item">
            <div class="history-main">
              <div class="history-plan">{{ PLAN_NAMES[sub.plan] }}</div>
              <div class="history-meta">
                <span>{{ formatDate(sub.createdAt) }}</span>
                <span v-if="sub.couponCode" class="history-coupon">Cupom: {{ sub.couponCode }}</span>
              </div>
            </div>
            <div class="history-right">
              <div class="history-price">
                <span v-if="sub.discountApplied > 0" class="history-original">R$ {{ Number(sub.priceBRL).toFixed(2) }}</span>
                R$ {{ (Number(sub.priceBRL) - Number(sub.discountApplied)).toFixed(2) }}
              </div>
              <span class="history-status" :class="`status-${sub.status.toLowerCase()}`">
                {{ subStatusLabel(sub.status) }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div class="plans-grid">
        <div
          v-for="plan in paidPlans"
          :key="plan.tier"
          class="plan-card"
          :class="{
            'plan-card--current': isCurrentPlan(plan.tier),
            'plan-card--highlight': plan.tier === 'HUNTER',
            'plan-card--clickable': !isCurrentPlan(plan.tier),
          }"
          :role="!isCurrentPlan(plan.tier) ? 'button' : undefined"
          :tabindex="!isCurrentPlan(plan.tier) ? 0 : undefined"
          @click="!isCurrentPlan(plan.tier) && selectPlan(plan.tier)"
          @keydown.enter="!isCurrentPlan(plan.tier) && selectPlan(plan.tier)"
        >
          <div v-if="plan.tier === 'HUNTER'" class="plan-card-ribbon">Popular</div>

          <div class="plan-card-header">
            <h2 class="plan-card-name">{{ plan.name }}</h2>
            <div class="plan-card-price">
              <span class="plan-price-value">R$ {{ plan.priceBRL }}</span>
              <span class="plan-price-period">/mês</span>
            </div>
            <p class="plan-card-vagas">Até {{ plan.vagaLimit }} vagas</p>
          </div>

          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature" class="plan-feature-item">
              <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {{ feature }}
            </li>
          </ul>

          <div class="plan-card-footer">
            <div v-if="isCurrentPlan(plan.tier)" class="plan-current-badge">Plano atual</div>
            <button
              v-else
              class="btn btn-primary plan-cta"
              :class="{ 'btn-outline': plan.tier !== 'HUNTER' }"
              @click.stop="selectPlan(plan.tier)"
            >
              Assinar
            </button>
          </div>
        </div>
      </div>

      <!-- Referral coupon section -->
      <div class="referral-section">
        <h2 class="referral-title">Seu código de indicação</h2>
        <p class="referral-desc">
          Compartilhe e ganhe +1 mês de plano quando alguém usar seu código.
        </p>
        <div v-if="loadingCoupon" class="referral-loading">
          <div class="spinner spinner-sm" />
          <span>Carregando código...</span>
        </div>
        <div v-else-if="myCoupon" class="referral-code-row">
          <code class="referral-code">{{ myCoupon.code }}</code>
          <button class="btn btn-secondary btn-sm" @click="copyCoupon">
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
        <p v-else class="referral-error">Não foi possível carregar seu código. Tente recarregar a página.</p>
      </div>
    </template>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import { getMyCoupon, getMyPlan, listMySubscriptions, listPlans } from '../../utils/api';
import type { Coupon, MyPlanInfo, Plan, PlanStatus, PlanTier, SubscriptionRecord } from '../../utils/api';
import { isAuthenticated, redirectToLogin } from '../../utils/auth';

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  PERSONAL: 'Personal',
  HUNTER: 'Hunter',
  EMPRESARIAL: 'Empresarial',
};

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const loadingCoupon = ref(true);
const plans = ref<Plan[]>([]);
const myPlanInfo = ref<MyPlanInfo | null>(null);
const myCoupon = ref<Coupon | null>(null);
const subscriptions = ref<SubscriptionRecord[]>([]);
const copied = ref(false);

const lastPaidAt = computed(() => {
  const active = subscriptions.value.find((s) => s.status === 'ACTIVE');
  return active?.startsAt ?? null;
});

const totalSpent = computed(() =>
  subscriptions.value
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (Number(s.priceBRL) - Number(s.discountApplied)), 0)
);

function statusLabel(s: PlanStatus): string {
  return ({ NONE: 'Inativo', ACTIVE: 'Ativo', EXPIRED: 'Expirado', PENDING: 'Pendente' } as const)[s];
}
function subStatusLabel(s: string): string {
  const map: Record<string, string> = {
    PENDING: 'Pendente',
    ACTIVE: 'Pago',
    CANCELLED: 'Cancelada',
    EXPIRED: 'Expirada',
  };
  return map[s] ?? s;
}
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const paidPlans = computed(() =>
  plans.value.filter((p) => p.tier !== 'FREE')
);

function isCurrentPlan(tier: PlanTier): boolean {
  return (
    myPlanInfo.value?.plan === tier &&
    myPlanInfo.value?.planStatus === 'ACTIVE'
  );
}

function selectPlan(tier: PlanTier) {
  window.location.href = `/dashboard/checkout?plan=${tier}`;
}

async function copyCoupon() {
  if (!myCoupon.value) return;
  try {
    await navigator.clipboard.writeText(myCoupon.value.code);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    toast.value?.show('Não foi possível copiar. Copie manualmente.', 'error');
  }
}

onMounted(async () => {
  if (!isAuthenticated()) {
    redirectToLogin(window.location.pathname);
    return;
  }

  try {
    [plans.value, myPlanInfo.value, subscriptions.value] = await Promise.all([
      listPlans(),
      getMyPlan(),
      listMySubscriptions().catch(() => [] as SubscriptionRecord[]),
    ]);
  } catch {
    toast.value?.show('Erro ao carregar planos', 'error');
  } finally {
    loading.value = false;
  }

  try {
    myCoupon.value = await getMyCoupon();
  } catch {
    // Non-critical — silently fail
  } finally {
    loadingCoupon.value = false;
  }
});
</script>

<style scoped>
/* Current plan summary card */
.my-plan-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: var(--bg-primary);
  border-left: 4px solid var(--primary);
}
.plan-card-personal { border-left-color: var(--primary); }
.plan-card-hunter { border-left-color: #7c3aed; }
.plan-card-empresarial { border-left-color: #f59e0b; }

.my-plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.my-plan-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}
.my-plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 0.25rem;
}
.my-plan-status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.status-active { background: #dcfce7; color: #166534; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-expired, .status-cancelled, .status-none { background: #fee2e2; color: #991b1b; }

.my-plan-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}
.my-plan-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-md, 8px);
}
.stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* History */
.history-section {
  margin-bottom: 2.5rem;
}
.history-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--text-primary);
}
.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md, 8px);
  background: var(--bg-primary);
}
.history-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.history-plan { font-weight: 600; color: var(--text-primary); }
.history-meta {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.history-coupon {
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  font-family: monospace;
}
.history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.history-price {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}
.history-original {
  text-decoration: line-through;
  color: var(--text-secondary);
  font-weight: 400;
  margin-right: 6px;
  font-size: 0.85rem;
}
.history-status {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.plan-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  padding: 1.75rem 1.5rem;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  transition: box-shadow 0.2s;
}
.plan-card--clickable {
  cursor: pointer;
}
.plan-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}
.plan-card--clickable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
.plan-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}
.plan-card--highlight {
  border-color: var(--primary);
  box-shadow: 0 0 0 1px var(--primary);
}
.plan-card--current {
  border-color: #10b981;
}

.plan-card-ribbon {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.plan-card-header {
  text-align: center;
}
.plan-card-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
.plan-card-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}
.plan-price-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--primary);
}
.plan-price-period {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
.plan-card-vagas {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;
}
.plan-feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
}
.plan-feature-item svg {
  flex-shrink: 0;
  color: #10b981;
  margin-top: 2px;
}

.plan-card-footer {
  margin-top: auto;
}
.plan-cta {
  width: 100%;
}
.btn-outline {
  background: transparent;
  border: 1.5px solid var(--primary);
  color: var(--primary);
}
.btn-outline:hover {
  background: #eff6ff;
}
.plan-current-badge {
  text-align: center;
  padding: 0.5rem;
  background: #ecfdf5;
  color: #065f46;
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
  font-weight: 600;
}

/* Referral section */
.referral-section {
  border-top: 1px solid var(--border);
  padding-top: 2rem;
  max-width: 480px;
}
.referral-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}
.referral-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}
.referral-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}
.referral-code-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.referral-code {
  font-family: monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  background: var(--bg-secondary, #f9fafb);
  border: 1px solid var(--border);
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-md, 8px);
  color: var(--text-primary);
}
.referral-error {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
