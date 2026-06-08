<template>
  <DashboardLayout>
    <Toast ref="toast" />
    <ConfirmDialog
      :visible="!!closeTargetVaga"
      title="Encerrar vaga"
      :message="`Tem certeza que deseja encerrar &quot;${closeTargetVaga?.title ?? ''}&quot;? Ela deixará de aparecer publicamente.`"
      confirm-label="Encerrar vaga"
      :loading="!!closingVagaId"
      @confirm="confirmCloseVaga"
      @cancel="closeTargetVaga = null"
    />

    <HunterShell title="Hunter Pessoal" subtitle="Publicação e gestão de vagas como pessoa">
      <template #header-actions>
        <button v-if="activeTab === 'vagas' && !isFreePlan" class="hpw-cta" type="button" @click="onNewVaga">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Nova vaga
        </button>
      </template>

      <template #tabs>
        <SubTabs
          :tabs="tabs"
          :active="activeTab"
          aria-label="Abas do Hunter Pessoal"
          @update:active="(id) => setTab(id as TabId)"
        />
      </template>

      <!-- Tab: Vagas -->
      <section v-if="activeTab === 'vagas'">
        <!-- FREE paywall inline -->
        <template v-if="isFreePlan">
          <div class="hpw-hero">
            <h3>Plano pago necessário para publicar vagas</h3>
            <p>
              Para publicar vagas como Hunter Pessoal, você precisa de um plano Recruiter ou superior.
              <a href="/dashboard/planos">Página completa de planos →</a>
            </p>
          </div>
          <PlansInline @go-checkout="goToCheckout" />
        </template>

        <!-- Paid users: vagas list -->
        <template v-else>
          <div class="hpw-subtabs-row">
            <div class="hpw-toolbar">
              <button class="hpw-toolbar-btn" :class="{ 'hpw-toolbar-btn--active': viewMode === 'list' }" @click="viewMode = 'list'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Lista
              </button>
              <button class="hpw-toolbar-btn" :class="{ 'hpw-toolbar-btn--active': viewMode === 'timeline' }" @click="viewMode = 'timeline'">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
                Timeline
              </button>
            </div>
          </div>

          <!-- Usage bar -->
          <div v-if="usage && usage.limit !== -1" class="hpw-usage-bar" :class="{ 'hpw-usage-bar--full': usage.used >= usage.limit }">
            <span>
              <strong>{{ usage.used }} / {{ usage.limit }}</strong> vagas publicadas neste ciclo
            </span>
            <span class="hpw-usage-help" title="O contador soma cada publicação do ciclo e não é devolvido ao despublicar ou apagar uma vaga.">?</span>
          </div>

          <div v-if="loadingVagas" class="hpw-loading">Carregando vagas...</div>

          <div v-else class="hpw-vagas-layout">
            <div class="hpw-overview-row">
              <PipelineOverviewCard />
            </div>

            <div class="hpw-vagas-list-area">
              <VagasTimeline v-if="viewMode === 'timeline'" :vagas="vagas" />

              <div v-else class="hpw-vagas-list">
                <div v-if="filteredVagas.length === 0 && vagas.length === 0 && (usage?.used ?? 0) > 0" class="hpw-empty">
                  <p>Você já usou {{ usage?.used }} de {{ usage?.limit }} publicações neste ciclo, mas não há vagas para mostrar.</p>
                  <a href="/dashboard/vagas/novo" class="hpw-cta-link">Publicar nova vaga</a>
                </div>
                <div v-else-if="filteredVagas.length === 0 && vagas.length === 0" class="hpw-empty">
                  <p>Você ainda não tem vagas. Crie sua primeira.</p>
                  <a href="/dashboard/vagas/novo" class="hpw-cta-link">Criar vaga</a>
                </div>

                <!-- Vaga picker -->
                <div v-if="filteredVagas.length > 0" class="hpw-vaga-picker" v-click-outside="closeVagaPicker">
                  <label class="hpw-vaga-picker-label" for="hpw-vaga-picker-input">Selecionar vaga</label>
                  <div class="hpw-vaga-picker-input-wrap">
                    <svg class="hpw-vaga-picker-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
                    <input
                      id="hpw-vaga-picker-input"
                      type="text"
                      class="hpw-vaga-picker-input"
                      :placeholder="selectedVaga?.title || 'Buscar vaga por título...'"
                      v-model="vagaPickerQuery"
                      @focus="vagaPickerOpen = true"
                      @input="vagaPickerOpen = true"
                      autocomplete="off"
                    />
                    <button type="button" class="hpw-vaga-picker-toggle" @click="vagaPickerOpen = !vagaPickerOpen">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path :d="vagaPickerOpen ? 'M18 15l-6-6-6 6' : 'M6 9l6 6 6-6'"/></svg>
                    </button>
                  </div>
                  <ul v-if="vagaPickerOpen" class="hpw-vaga-picker-list" role="listbox">
                    <li v-if="vagaPickerMatches.length === 0" class="hpw-vaga-picker-empty">Nenhuma vaga encontrada.</li>
                    <li
                      v-for="v in vagaPickerMatches"
                      :key="v.id"
                      class="hpw-vaga-picker-item"
                      :class="{ 'hpw-vaga-picker-item--active': selectedVagaId === v.id }"
                      role="option"
                      :aria-selected="selectedVagaId === v.id"
                      @click="onPickVaga(v.id)"
                    >
                      <span class="hpw-vaga-picker-item-title">{{ v.title }}</span>
                      <span class="hpw-vaga-picker-item-meta">
                        <span class="hpw-status" :data-status="v.status">{{ statusLabel(v.status) }}</span>
                      </span>
                    </li>
                  </ul>
                </div>

                <!-- Selected vaga card -->
                <article v-for="v in displayedVaga" :key="v.id" class="hpw-vaga hpw-vaga--selected">
                  <div class="hpw-vaga-id">
                    <div class="hpw-vaga-title">{{ v.title }}</div>
                    <div class="hpw-vaga-meta">
                      {{ v.location ? `· ${v.location}` : '' }}
                      {{ v.deadline ? `· prazo ${formatDate(v.deadline)}` : '' }}
                    </div>
                  </div>
                  <div class="hpw-vaga-actions">
                    <span class="hpw-status" :data-status="v.status">{{ statusLabel(v.status) }}</span>
                    <span class="hpw-applicants">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      {{ v.applicationsCount ?? 0 }}
                    </span>
                    <a v-if="v.status === 'PUBLISHED' && v.slug" :href="`/vaga/${v.slug}`" target="_blank" rel="noopener" class="hpw-vaga-public" @click.stop>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                      <span class="hpw-action-text">Ver vaga</span>
                    </a>
                    <a :href="`/dashboard/vagas/${v.id}`" class="hpw-vaga-action" @click.stop>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      <span class="hpw-action-text">Editar</span>
                    </a>
                    <button v-if="v.status === 'PUBLISHED'" type="button" class="hpw-vaga-action hpw-vaga-action--danger" :disabled="closingVagaId === v.id" @click.stop="requestCloseVaga(v)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      <span class="hpw-action-text">{{ closingVagaId === v.id ? 'Encerrando...' : 'Encerrar' }}</span>
                    </button>
                    <button v-else-if="v.status === 'CLOSED'" type="button" class="hpw-vaga-action" @click.stop="requestRepublishVaga(v)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                      <span class="hpw-action-text">Republicar</span>
                    </button>
                    <button class="hpw-vaga-link" type="button" @click.stop="selectVaga(v.id)">
                      <span class="hpw-action-text">Ver pipeline</span>
                      <svg class="hpw-vaga-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </article>
              </div>
            </div>

            <!-- Pipeline section -->
            <section v-if="selectedVagaId && viewMode === 'list'" ref="pipelineSectionEl" class="hpw-pipeline-section">
              <div class="hpw-pipeline-tabs">
                <button type="button" class="hpw-pipeline-tab" :class="{ active: pipelineTab === 'pipeline' }" @click="pipelineTab = 'pipeline'">Candidatos</button>
                <button type="button" class="hpw-pipeline-tab" :class="{ active: pipelineTab === 'hunters' }" @click="pipelineTab = 'hunters'">
                  Hunters
                  <span class="hpw-pipeline-tab-badge">{{ selectedVagaAllowHunters ? 'ativo' : 'inativo' }}</span>
                </button>
              </div>
              <template v-if="pipelineTab === 'pipeline'">
                <div v-if="loadingCandidates" class="hpw-loading">Carregando candidatos...</div>
                <CandidatePipeline v-else :key="selectedVagaId" :vaga-title="selectedVagaTitle" :subline="selectedVagaSubline" :candidates="candidatesForSelected" :recruiter-name="recruiterName" />
              </template>
              <template v-else-if="pipelineTab === 'hunters'">
                <div v-if="!selectedVagaAllowHunters" class="hpw-placeholder">
                  <p>Esta vaga não tem "Permitir Hunters" ativado. Edite a vaga para habilitar.</p>
                </div>
                <HunterInterestsList v-else :vaga-id="selectedVagaId" />
              </template>
            </section>
          </div>
        </template>
      </section>

      <!-- Tab: Seleção -->
      <section v-else-if="activeTab === 'selecao'" class="hpw-placeholder">
        <h4>Seleção e Testes</h4>
        <p>Provas e avaliações associadas a vagas. (Em construção.)</p>
      </section>

      <!-- Tab: Vagas Salvas -->
      <MinhasVagasSalvasHunter v-else-if="activeTab === 'salvas'" />

      <!-- Tab: Planos -->
      <section v-else-if="activeTab === 'planos'">
        <PendingInvitesCard />
        <div class="hpw-hero">
          <h3>Solicitar serviços</h3>
          <p>Contrate profissionais ou escolha um plano. <a href="/dashboard/planos">Página completa de planos →</a></p>
        </div>
        <div v-if="loadingServicos" class="hpw-loading">Carregando...</div>
        <template v-else>
          <PlansInline @go-checkout="goToCheckout" />
          <HistoricoAssinaturas :items="history" />
          <IndicacaoCard :code="indicacao.code" :uses="indicacao.uses" :reward-months="indicacao.rewardMonths" />
        </template>
      </section>
    </HunterShell>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import HunterShell from './HunterShell.vue';
import SubTabs from '../ui/SubTabs.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import PlansInline from './PlansInline.vue';
import PipelineOverviewCard from './PipelineOverviewCard.vue';
import VagasTimeline from './VagasTimeline.vue';
import CandidatePipeline from './CandidatePipeline.vue';
import HunterInterestsList from '../hunter/HunterInterestsList.vue';
import MinhasVagasSalvasHunter from '../hunter/MinhasVagasSalvasHunter.vue';
import PendingInvitesCard from './PendingInvitesCard.vue';
import HistoricoAssinaturas from './HistoricoAssinaturas.vue';
import type { SubscriptionEntry } from './HistoricoAssinaturas.vue';
import IndicacaoCard from './IndicacaoCard.vue';
import {
  getFullProfile,
  getMyPlan,
  getMyVagas,
  getMyVagaUsage,
  getVagaApplications,
  listMySubscriptions,
  getMyCoupon,
  publishVaga,
  unpublishVaga,
  profile as profileApi,
  isPlanLimitReachedError,
  extractPlanLimitBody,
  formatPlanLimitMessage,
  type PlanTier,
  type Vaga,
  type VagaStatus,
  type VagaApplicationAdminView,
  type VagaUsage,
} from '../../utils/api';
import type { MockCandidate } from '../../data/mock-recrutador';
import { avatarColor } from '../../data/mock-recrutador';

type TabId = 'vagas' | 'selecao' | 'salvas' | 'planos';

// ── Plan ──────────────────────────────────────────────────────────────────────
const userPlan = ref<PlanTier>('FREE');
const recruiterName = ref('');
const isFreePlan = computed(() => userPlan.value === 'FREE');

// ── Tabs ──────────────────────────────────────────────────────────────────────
const tabs = computed(() => [
  { id: 'vagas', label: 'Vagas', count: vagas.value.length },
  { id: 'selecao', label: 'Seleção e Testes' },
  { id: 'salvas', label: 'Vagas Salvas' },
  { id: 'planos', label: isFreePlan.value ? 'Ver Planos' : 'Solicitar serviços' },
]);

const activeTab = ref<TabId>('vagas');

function setTab(id: TabId) {
  activeTab.value = id;
  const url = new URL(window.location.href);
  url.searchParams.set('tab', id);
  window.history.replaceState(null, '', url.toString());
  window.dispatchEvent(new CustomEvent('vp:nav-changed'));
  if (id === 'planos' && history.value.length === 0 && !loadingServicos.value) {
    loadServicos();
  }
}

// ── Vagas ─────────────────────────────────────────────────────────────────────
const vagas = ref<Vaga[]>([]);
const loadingVagas = ref(false);
const statusFilter = ref<VagaStatus | 'all'>('all');
const selectedVagaId = ref('');
const usage = ref<VagaUsage | null>(null);
const viewMode = ref<'list' | 'timeline'>('list');

// ── Pipeline ──────────────────────────────────────────────────────────────────
const pipelineTab = ref<'pipeline' | 'hunters'>('pipeline');
const pipelineSectionEl = ref<HTMLElement | null>(null);
const selectedVagaAllowHunters = computed(
  () => vagas.value.find(v => v.id === selectedVagaId.value)?.allowHunters === true
);

// ── Close / Republish ─────────────────────────────────────────────────────────
const closeTargetVaga = ref<Vaga | null>(null);
const closingVagaId = ref<string | null>(null);

// ── Candidates ────────────────────────────────────────────────────────────────
const candidatesMap = ref<Map<string, MockCandidate[]>>(new Map());
const loadingCandidates = ref(false);

// ── Serviços ──────────────────────────────────────────────────────────────────
const history = ref<SubscriptionEntry[]>([]);
const indicacao = ref({ code: '—', uses: 0, rewardMonths: 0 });
const loadingServicos = ref(false);

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref<InstanceType<typeof Toast>>();

function showToast(msg: string, type: 'success' | 'error' | 'info' = 'error') {
  const mapped = type === 'info' ? 'warning' : type;
  toast.value?.show(msg, mapped as 'success' | 'error' | 'warning');
}

// ── Derived ───────────────────────────────────────────────────────────────────
const filteredVagas = computed(() => {
  const base = statusFilter.value === 'all'
    ? vagas.value
    : vagas.value.filter(v => v.status === statusFilter.value);
  return [...base].sort((a, b) => {
    const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return tb - ta;
  });
});

const selectedVaga = computed(() => vagas.value.find(v => v.id === selectedVagaId.value));

// ── Vaga picker ───────────────────────────────────────────────────────────────
const vagaPickerQuery = ref('');
const vagaPickerOpen = ref(false);

const vagaPickerMatches = computed(() => {
  const q = vagaPickerQuery.value.trim().toLowerCase();
  if (!q) return filteredVagas.value;
  return filteredVagas.value.filter(v =>
    v.title.toLowerCase().includes(q) || (v.location || '').toLowerCase().includes(q)
  );
});

const displayedVaga = computed(() => {
  const sel = selectedVaga.value;
  if (sel && filteredVagas.value.some(v => v.id === sel.id)) return [sel];
  return filteredVagas.value.length > 0 ? [filteredVagas.value[0]!] : [];
});

function onPickVaga(id: string) {
  selectedVagaId.value = id;
  vagaPickerOpen.value = false;
  vagaPickerQuery.value = '';
}

function closeVagaPicker() {
  vagaPickerOpen.value = false;
}

const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    (el as unknown as Record<string, unknown>).__clickOutside__ = (ev: MouseEvent) => {
      if (!el.contains(ev.target as Node)) binding.value();
    };
    document.addEventListener('mousedown', (el as unknown as Record<string, unknown>).__clickOutside__ as EventListener);
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('mousedown', (el as unknown as Record<string, unknown>).__clickOutside__ as EventListener);
  },
};

const selectedVagaTitle = computed(() => selectedVaga.value?.title ?? '');
const selectedVagaSubline = computed(() => {
  const v = selectedVaga.value;
  if (!v) return '';
  const parts: string[] = [];
  if (v.location) parts.push(v.location);
  if (v.deadline) parts.push(`prazo ${formatDate(v.deadline)}`);
  parts.push(`${v.applicationsCount ?? 0} candidatos`);
  return parts.join(' · ');
});

const candidatesForSelected = computed((): MockCandidate[] => {
  if (!selectedVagaId.value) return [];
  return candidatesMap.value.get(selectedVagaId.value) ?? [];
});

// ── Handlers ──────────────────────────────────────────────────────────────────
function requestCloseVaga(v: Vaga) {
  closeTargetVaga.value = v;
}

async function confirmCloseVaga() {
  if (!closeTargetVaga.value || closingVagaId.value) return;
  const target = closeTargetVaga.value;
  closingVagaId.value = target.id;
  try {
    const updated = await unpublishVaga(target.id);
    const idx = vagas.value.findIndex(x => x.id === target.id);
    if (idx !== -1) vagas.value[idx] = updated;
    showToast('Vaga encerrada', 'success');
  } catch (err: unknown) {
    showToast((err as { message?: string })?.message || 'Erro ao encerrar vaga');
  } finally {
    closingVagaId.value = null;
    closeTargetVaga.value = null;
  }
}

async function requestRepublishVaga(v: Vaga) {
  if (closingVagaId.value) return;
  closingVagaId.value = v.id;
  try {
    const updated = await publishVaga(v.id);
    const idx = vagas.value.findIndex(x => x.id === v.id);
    if (idx !== -1) vagas.value[idx] = updated;
    try { usage.value = await getMyVagaUsage(); } catch { /* non-critical */ }
    showToast('Vaga republicada', 'success');
  } catch (err: unknown) {
    if (isPlanLimitReachedError(err)) {
      const body = extractPlanLimitBody(err);
      showToast(body ? formatPlanLimitMessage(body) : 'Limite de vagas do plano atingido neste ciclo.');
    } else {
      showToast((err as { message?: string })?.message || 'Erro ao republicar vaga');
    }
  } finally {
    closingVagaId.value = null;
  }
}

function onNewVaga() {
  window.location.href = '/dashboard/vagas/novo';
}

function goToCheckout(plan: PlanTier) {
  window.location.href = `/dashboard/checkout?plan=${plan}`;
}

function selectVaga(id: string) {
  const wasAlreadySelected = selectedVagaId.value === id;
  selectedVagaId.value = id;
  nextTick(() => {
    const el = pipelineSectionEl.value;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: wasAlreadySelected ? 'auto' : 'smooth' });
  });
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusLabel(s: VagaStatus): string {
  if (s === 'PUBLISHED') return 'Publicada';
  if (s === 'DRAFT') return 'Rascunho';
  return 'Encerrada';
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function loadVagas() {
  if (loadingVagas.value) return;
  loadingVagas.value = true;
  try {
    const [vagasResult, usageResult] = await Promise.allSettled([
      getMyVagas({ limit: 20 }),
      getMyVagaUsage(),
    ]);
    if (vagasResult.status === 'fulfilled') {
      vagas.value = vagasResult.value.data;
      if (vagasResult.value.data.length > 0 && !selectedVagaId.value) {
        const sorted = [...vagasResult.value.data].sort((a, b) => {
          const ta = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const tb = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return tb - ta;
        });
        selectedVagaId.value = sorted[0]!.id;
      }
    } else {
      showToast('Erro ao carregar vagas. Verifique sua conexão.');
    }
    if (usageResult.status === 'fulfilled') {
      usage.value = usageResult.value;
    }
  } finally {
    loadingVagas.value = false;
  }
}

async function loadCandidates(vagaId: string) {
  if (!vagaId || candidatesMap.value.has(vagaId) || loadingCandidates.value) return;
  loadingCandidates.value = true;
  try {
    const apps = await getVagaApplications(vagaId);
    candidatesMap.value.set(vagaId, apps.map(appToMockCandidate));
  } catch {
    showToast('Erro ao carregar candidatos desta vaga.');
    candidatesMap.value.set(vagaId, []);
  } finally {
    loadingCandidates.value = false;
  }
}

async function loadServicos() {
  if (loadingServicos.value) return;
  loadingServicos.value = true;
  try {
    const [subs, coupon] = await Promise.allSettled([
      listMySubscriptions(),
      getMyCoupon(),
    ]);
    if (subs.status === 'fulfilled') {
      history.value = subs.value.map(s => ({
        id: s.id,
        plan: s.plan,
        date: s.createdAt,
        amount: `R$ ${(s.priceBRL - s.discountApplied).toFixed(2).replace('.', ',')}`,
        status: mapSubStatus(s.status),
      }));
    }
    if (coupon.status === 'fulfilled') {
      indicacao.value = { code: coupon.value.code, uses: 0, rewardMonths: 0 };
    }
  } finally {
    loadingServicos.value = false;
  }
}

function mapSubStatus(s: string): SubscriptionEntry['status'] {
  if (s === 'ACTIVE') return 'paid';
  if (s === 'PENDING') return 'pending';
  return 'failed';
}

function appToMockCandidate(app: VagaApplicationAdminView): MockCandidate {
  const fullName = app.snapshotFullName || `${app.user?.firstName ?? ''} ${app.user?.lastName ?? ''}`.trim() || 'Candidato';
  const initials = fullName.split(' ').map(w => w[0] ?? '').slice(0, 2).join('').toUpperCase();
  return {
    id: app.id,
    fullName,
    initials,
    role: '',
    location: app.snapshotLocation ?? '',
    appliedAt: app.createdAt,
    stage: (app.pipelineStage ?? 'para_analisar') as MockCandidate['stage'],
    tags: [],
    email: app.snapshotEmail,
    phone: app.snapshotPhone ?? '',
    about: app.message ?? '',
    userId: app.user?.id,
    username: app.user?.username,
    avatarUrl: app.user?.avatarUrl,
    applicationCv: app.cv,
  };
}

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(selectedVagaId, (id) => {
  if (id && viewMode.value === 'list') loadCandidates(id);
});

watch(viewMode, (mode) => {
  if (mode === 'list' && selectedVagaId.value) loadCandidates(selectedVagaId.value);
});

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Sincronizar contexto pessoal com backend
  try { await profileApi.setActiveContext(null); } catch { /* non-critical */ }

  // Load plan
  try {
    const [planInfo, prof] = await Promise.allSettled([getMyPlan(), getFullProfile()]);
    if (planInfo.status === 'fulfilled') userPlan.value = planInfo.value.plan;
    if (prof.status === 'fulfilled') {
      recruiterName.value = `${prof.value.firstName ?? ''} ${prof.value.lastName ?? ''}`.trim();
    }
  } catch { /* non-critical */ }

  // Read ?tab= query param
  const search = new URLSearchParams(window.location.search);
  const tabParam = search.get('tab') as TabId | null;
  if (tabParam && ['vagas', 'selecao', 'salvas', 'planos'].includes(tabParam)) {
    activeTab.value = tabParam;
  }

  // Show paywall if ?paywall=1
  if (search.get('paywall') === '1') {
    activeTab.value = 'planos';
  }

  // Load vagas (only for paid plans)
  if (!isFreePlan.value) {
    await loadVagas();
  }

  // Post-publish toast
  if (search.get('published') === '1') {
    showToast('Vaga publicada com sucesso!', 'success');
    window.history.replaceState(null, '', '/dashboard/hunter/pessoal?tab=vagas');
  }

  // If starting on planos tab, load serviços
  if (activeTab.value === 'planos') {
    loadServicos();
  }
});
</script>

<style scoped>
.hpw-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background var(--transition-fast);
}
.hpw-cta:hover { background: var(--primary-dark, var(--primary)); }

.hpw-cta-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.hpw-cta-link:hover { background: var(--primary-dark, var(--primary)); }

.hpw-subtabs-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-md);
}

.hpw-toolbar {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.hpw-toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
}
.hpw-toolbar-btn:hover { color: var(--text-primary); }
.hpw-toolbar-btn--active { background: var(--bg-primary); color: var(--text-primary); box-shadow: var(--shadow-sm); }

.hpw-usage-bar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: 0.6rem 0.9rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
.hpw-usage-bar strong { color: var(--text-primary); }
.hpw-usage-bar--full { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
.hpw-usage-bar--full strong { color: #7f1d1d; }
.hpw-usage-help {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-secondary);
  margin-left: auto;
  cursor: help;
}

.hpw-loading {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.hpw-paywall {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  text-align: center;
}

.hpw-paywall-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.hpw-paywall-title {
  margin: 0;
  font-size: var(--text-lg, 1.125rem);
  font-weight: 700;
  color: var(--text-primary);
}

.hpw-paywall-desc {
  margin: 0;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.6;
}

.hpw-vagas-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.hpw-overview-row {
  display: grid;
  grid-template-columns: 1fr;
}

.hpw-vagas-list-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-width: 0;
}

.hpw-vagas-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }

.hpw-empty {
  padding: var(--spacing-2xl);
  text-align: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}
.hpw-empty p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); }

.hpw-vaga {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}
.hpw-vaga:hover { border-color: var(--primary-light, var(--primary)); }
.hpw-vaga--selected { border-color: var(--primary); background: rgba(37, 99, 235, 0.03); }
.hpw-vaga-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.hpw-vaga-meta { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.hpw-vaga-actions { display: flex; gap: var(--spacing-sm); align-items: center; flex-shrink: 0; }

.hpw-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
}
.hpw-status[data-status='PUBLISHED'] { background: var(--status-success-bg); color: var(--status-success-text); }
.hpw-status[data-status='DRAFT']     { background: var(--status-pending-bg); color: var(--status-pending-text); }
.hpw-status[data-status='CLOSED']    { background: var(--status-neutral-bg); color: var(--status-neutral-text); }

.hpw-applicants {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.hpw-vaga-public,
.hpw-vaga-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.hpw-vaga-public:hover,
.hpw-vaga-action:hover:not(:disabled) { background: var(--bg-tertiary); color: var(--text-primary); }
.hpw-vaga-action:disabled { opacity: 0.6; cursor: default; }
.hpw-vaga-action--danger { color: #b91c1c; }
.hpw-vaga-action--danger:hover:not(:disabled) { background: #fee2e2; border-color: #fca5a5; color: #991b1b; }

.hpw-vaga-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  white-space: nowrap;
}
.hpw-vaga-link:hover { text-decoration: underline; }
.hpw-vaga-link-icon { display: none; }

/* Vaga picker */
.hpw-vaga-picker { position: relative; display: flex; flex-direction: column; gap: 6px; margin-bottom: var(--spacing-sm); }
.hpw-vaga-picker-label { font-size: var(--text-xs); font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
.hpw-vaga-picker-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0 var(--spacing-sm);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.hpw-vaga-picker-input-wrap:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
.hpw-vaga-picker-icon { color: var(--text-muted, #9ca3af); flex-shrink: 0; }
.hpw-vaga-picker-input {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  padding: 10px var(--spacing-sm); font-size: var(--text-sm); font-family: var(--font-sans); color: var(--text-primary);
}
.hpw-vaga-picker-toggle { border: none; background: none; padding: 6px; cursor: pointer; color: var(--text-secondary); display: flex; align-items: center; }
.hpw-vaga-picker-toggle:hover { color: var(--text-primary); }
.hpw-vaga-picker-list {
  position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20;
  list-style: none; margin: 0; padding: 4px; background: var(--bg-primary);
  border: 1px solid var(--border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg);
  max-height: 320px; overflow-y: auto;
}
.hpw-vaga-picker-empty { padding: var(--spacing-md); text-align: center; color: var(--text-secondary); font-size: var(--text-sm); }
.hpw-vaga-picker-item {
  display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-sm);
  padding: 8px 10px; border-radius: var(--radius-sm); cursor: pointer; font-size: var(--text-sm);
  transition: background var(--transition-fast);
}
.hpw-vaga-picker-item:hover { background: var(--bg-secondary); }
.hpw-vaga-picker-item--active { background: rgba(37, 99, 235, 0.08); color: var(--primary); font-weight: 600; }
.hpw-vaga-picker-item-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hpw-vaga-picker-item-meta { display: inline-flex; align-items: center; gap: var(--spacing-xs); flex-shrink: 0; }

/* Pipeline */
.hpw-pipeline-section { margin-top: var(--spacing-md); padding-top: var(--spacing-lg); border-top: 1px solid var(--border); }
.hpw-pipeline-tabs { display: flex; gap: 2px; margin-bottom: var(--spacing-md); border-bottom: 1px solid var(--border); }
.hpw-pipeline-tab {
  padding: 6px 16px; border: none; background: none;
  font-size: var(--text-sm); font-weight: 500; font-family: var(--font-sans);
  color: var(--text-secondary); cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  display: flex; align-items: center; gap: 6px;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}
.hpw-pipeline-tab.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 600; }
.hpw-pipeline-tab-badge { font-size: 10px; font-weight: 700; padding: 1px 5px; border-radius: 999px; background: var(--bg-secondary); color: var(--text-muted, #9ca3af); }

.hpw-placeholder { padding: var(--spacing-2xl); text-align: center; background: var(--bg-secondary); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
.hpw-placeholder h4 { margin: 0 0 var(--spacing-xs); color: var(--text-primary); }
.hpw-placeholder p { margin: 0; color: var(--text-secondary); }

.hpw-hero h3 { margin: 0 0 var(--spacing-xs); }
.hpw-hero p { margin: 0; color: var(--text-secondary); font-size: var(--text-sm); }

@media (max-width: 768px) {
  .hpw-vaga { flex-direction: column; align-items: stretch; gap: var(--spacing-xs); }
  .hpw-action-text { display: none; }
  .hpw-vaga-actions { width: 100%; gap: 6px; flex-wrap: wrap; justify-content: flex-start; }
  .hpw-applicants { margin-right: auto; }
  .hpw-vaga-public, .hpw-vaga-action { width: 32px; height: 32px; padding: 0; justify-content: center; border-radius: var(--radius-md); }
  .hpw-vaga-link { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: var(--radius-md); background: var(--primary); color: #fff; }
  .hpw-vaga-link-icon { display: block; }
}
</style>
