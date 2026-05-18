<template>
  <div class="pli-root">
    <div v-if="loading" class="pli-loading">Carregando planos...</div>

    <template v-else>
      <div v-if="activeCoupons.length > 0" class="pli-coupon-banner" role="region" aria-label="Cupom promocional">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-3.75-3.75 3.75-3.75-3.75-3.75 3.75V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" /></svg>
        <span>
          Use o cupom <strong>{{ activeCoupons[0].code }}</strong> e ganhe
          <strong>{{ formatCouponDiscount(activeCoupons[0]) }}</strong> no primeiro mês!
        </span>
      </div>

      <section v-if="myPlanInfo && myPlanInfo.plan !== 'FREE'" class="pli-current">
        <div>
          <div class="pli-current-label">Seu plano atual</div>
          <div class="pli-current-name">{{ PLAN_NAMES[myPlanInfo.plan] }}</div>
        </div>
        <span class="pli-status" :class="`pli-status-${myPlanInfo.planStatus.toLowerCase()}`">
          {{ statusLabel(myPlanInfo.planStatus) }}
        </span>
        <div class="pli-current-stat">
          <span>Vagas usadas</span>
          <strong>{{ myPlanInfo.vagasUsed }} / {{ myPlanInfo.vagasLimit === -1 ? '∞' : myPlanInfo.vagasLimit }}</strong>
        </div>
      </section>

      <div class="pli-grid">
        <div
          v-for="plan in paidPlans"
          :key="plan.tier"
          class="pli-card"
          :class="{
            'pli-card--current': isCurrentPlan(plan.tier),
            'pli-card--highlight': plan.tier === 'TEAM',
            'pli-card--clickable': !isCurrentPlan(plan.tier),
          }"
          :role="!isCurrentPlan(plan.tier) ? 'button' : undefined"
          :tabindex="!isCurrentPlan(plan.tier) ? 0 : undefined"
          @click="!isCurrentPlan(plan.tier) && emit('go-checkout', plan.tier)"
          @keydown.enter="!isCurrentPlan(plan.tier) && emit('go-checkout', plan.tier)"
        >
          <div v-if="plan.tier === 'TEAM'" class="pli-ribbon">Popular</div>

          <div class="pli-card-header">
            <h4 class="pli-card-name">{{ plan.name }}</h4>
            <div class="pli-card-price">
              <span class="pli-price-value">R$ {{ plan.priceBRL }}</span>
              <span class="pli-price-period">/mês</span>
            </div>
            <p class="pli-card-vagas">{{ formatVagaLimit(plan.vagaLimit) }}</p>
          </div>

          <ul class="pli-features">
            <li v-for="feature in plan.features" :key="feature">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              {{ feature }}
            </li>
          </ul>

          <div class="pli-card-footer">
            <div v-if="isCurrentPlan(plan.tier)" class="pli-current-badge">Plano atual</div>
            <button
              v-else
              type="button"
              class="pli-cta"
              :class="{ 'pli-cta--outline': plan.tier !== 'TEAM' }"
              @click.stop="emit('go-checkout', plan.tier)"
            >
              Assinar
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getMyPlan, listPlans, listPublicActiveCoupons } from '../../utils/api';
import type { MyPlanInfo, Plan, PlanStatus, PlanTier, PublicCoupon } from '../../utils/api';

const emit = defineEmits<{ (e: 'go-checkout', plan: PlanTier): void }>();

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  RECRUITER: 'Recruiter',
  TEAM: 'Recruiter Team',
  ENTERPRISE: 'Recruiter Enterprise',
};

const loading = ref(true);
const plans = ref<Plan[]>([]);
const myPlanInfo = ref<MyPlanInfo | null>(null);
const activeCoupons = ref<PublicCoupon[]>([]);

const paidPlans = computed(() => plans.value.filter((p) => p.tier !== 'FREE'));

function statusLabel(s: PlanStatus): string {
  return ({ NONE: 'Inativo', ACTIVE: 'Ativo', EXPIRED: 'Expirado', PENDING: 'Pendente' } as const)[s];
}

function isCurrentPlan(tier: PlanTier): boolean {
  return myPlanInfo.value?.plan === tier && myPlanInfo.value?.planStatus === 'ACTIVE';
}

function formatVagaLimit(limit: number): string {
  if (limit === -1 || limit == null) return 'Vagas ilimitadas';
  return `Até ${limit} vagas`;
}

function formatCouponDiscount(coupon: PublicCoupon): string {
  if (coupon.discountType === 'PERCENT') return `${coupon.discountValue}% off`;
  return `R$ ${coupon.discountValue.toFixed(2)} off`;
}

onMounted(async () => {
  try {
    [plans.value, myPlanInfo.value] = await Promise.all([
      listPlans(),
      getMyPlan().catch(() => null),
    ]);
  } finally {
    loading.value = false;
  }

  try {
    activeCoupons.value = await listPublicActiveCoupons();
  } catch {
    // silent fail
  }
});
</script>

<style scoped>
.pli-root { display: flex; flex-direction: column; gap: var(--spacing-md); }
.pli-loading { padding: var(--spacing-lg); text-align: center; color: var(--text-secondary); }

.pli-coupon-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: var(--text-primary);
  flex-wrap: wrap;
}
.pli-coupon-banner svg { flex-shrink: 0; color: #d97706; }

.pli-current {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  border-left: 4px solid var(--primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  flex-wrap: wrap;
}
.pli-current-label { font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
.pli-current-name { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
.pli-status { padding: 3px 9px; border-radius: 999px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; }
.pli-status-active { background: #dcfce7; color: #166534; }
.pli-status-pending { background: #fef3c7; color: #92400e; }
.pli-status-expired, .pli-status-none, .pli-status-cancelled { background: #fee2e2; color: #991b1b; }
.pli-current-stat { display: flex; flex-direction: column; gap: 2px; margin-left: auto; font-size: 0.8rem; color: var(--text-secondary); }
.pli-current-stat strong { color: var(--text-primary); font-size: 0.95rem; }

.pli-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
}

.pli-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1rem;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  transition: box-shadow 0.2s, transform 0.2s;
}
.pli-card--clickable { cursor: pointer; }
.pli-card--clickable:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
.pli-card--clickable:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.pli-card--highlight { border-color: var(--primary); box-shadow: 0 0 0 1px var(--primary); }
.pli-card--current { border-color: #10b981; }

.pli-ribbon {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.pli-card-header { text-align: center; }
.pli-card-name { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.4rem; }
.pli-card-price { display: flex; align-items: baseline; justify-content: center; gap: 2px; }
.pli-price-value { font-size: 1.6rem; font-weight: 800; color: var(--primary); }
.pli-price-period { font-size: 0.8rem; color: var(--text-secondary); }
.pli-card-vagas { margin-top: 0.2rem; font-size: 0.8rem; color: var(--text-secondary); }

.pli-features {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}
.pli-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--text-primary);
}
.pli-features svg { flex-shrink: 0; color: #10b981; margin-top: 2px; }

.pli-card-footer { margin-top: auto; }
.pli-cta {
  width: 100%;
  padding: 0.55rem 1rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  font-family: inherit;
}
.pli-cta:hover { filter: brightness(0.95); }
.pli-cta--outline {
  background: transparent;
  border: 1.5px solid var(--primary);
  color: var(--primary);
}
.pli-cta--outline:hover { background: #eff6ff; }

.pli-current-badge {
  text-align: center;
  padding: 0.45rem;
  background: #ecfdf5;
  color: #065f46;
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  font-weight: 600;
}

@media (max-width: 640px) {
  .pli-grid { grid-template-columns: 1fr; }
  .pli-current { flex-direction: column; align-items: flex-start; }
  .pli-current-stat { margin-left: 0; }
}
</style>
