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
  <div class="rw-root">
    <Breadcrumbs :items="crumbs" />

    <div class="rw-tabs-row">
      <WorkspaceTabs
        :tabs="mainTabs"
        :active="activeMain"
        aria-label="Áreas do dashboard"
        @update:active="onMainTabChange"
      />
      <button v-if="activeMain === 'vagas'" class="rw-cta" type="button" @click="onNewVaga">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Nova vaga
      </button>
    </div>

    <section v-if="activeMain === 'vagas'" class="rw-panel">
      <VagasMetrics :metrics="metrics" @select="onMetricSelect" />

      <div class="rw-subtabs-row">
        <SubTabs
          :tabs="subTabs"
          :active="activeSub"
          aria-label="Seções de Publicar Vagas"
          @update:active="(id) => (activeSub = id as SubId)"
        />
        <div v-if="activeSub === 'vagas'" class="rw-toolbar">
          <button class="rw-toolbar-btn" :class="{ 'rw-toolbar-btn--active': viewMode === 'list' }" @click="viewMode = 'list'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            Lista
          </button>
          <button class="rw-toolbar-btn" :class="{ 'rw-toolbar-btn--active': viewMode === 'timeline' }" @click="viewMode = 'timeline'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
            Timeline
          </button>
        </div>
      </div>

      <div v-if="activeSub === 'vagas'" class="rw-vagas-tab">
        <!-- Usage indicator -->
        <div v-if="usage && usage.limit !== -1" class="rw-usage-bar" :class="{ 'rw-usage-bar--full': usage.used >= usage.limit }">
          <span>
            <strong>{{ usage.used }} / {{ usage.limit }}</strong> vagas publicadas neste ciclo
          </span>
          <span class="rw-usage-help" title="O contador soma cada publicação do ciclo e não é devolvido ao despublicar ou apagar uma vaga.">?</span>
        </div>

        <!-- Loading state -->
        <div v-if="loadingVagas" class="rw-loading">Carregando vagas...</div>

        <!-- Layout: lista + sidebar + pipeline em um único grid -->
        <div v-else class="rw-vagas-layout">
          <!-- Lista de vagas (ou timeline) -->
          <div class="rw-vagas-list-area">
            <VagasTimeline v-if="viewMode === 'timeline'" :vagas="vagas" />

            <div v-else class="rw-vagas-list">
              <div v-if="filteredVagas.length === 0 && vagas.length === 0 && (usage?.used ?? 0) > 0" class="rw-empty-vagas">
                <p>
                  Você já usou {{ usage?.used }} de {{ usage?.limit }} publicações neste ciclo, mas não há vagas para mostrar.
                  Provavelmente foram apagadas — o contador <strong>não é devolvido</strong> ao apagar uma vaga.
                </p>
                <a href="/dashboard/vagas/novo" class="rw-cta-link">Publicar nova vaga</a>
              </div>
              <div v-else-if="filteredVagas.length === 0 && vagas.length === 0" class="rw-empty-vagas">
                <p>Você ainda não tem vagas. Crie sua primeira.</p>
                <a href="/dashboard/vagas/novo" class="rw-cta-link">Criar vaga</a>
              </div>
              <div v-else-if="filteredVagas.length === 0" class="rw-empty-vagas">
                <p>Nenhuma vaga com este filtro. <button type="button" class="rw-empty-reset" @click="statusFilter = 'all'">Mostrar todas</button></p>
              </div>
              <article
                v-for="v in filteredVagas"
                :key="v.id"
                class="rw-vaga"
                :class="{ 'rw-vaga--selected': selectedVagaId === v.id }"
                @click="selectVaga(v.id)"
              >
                <div class="rw-vaga-id">
                  <div class="rw-vaga-title">{{ v.title }}</div>
                  <div class="rw-vaga-meta">
                    {{ v.company?.name ?? '' }}
                    {{ v.location ? `· ${v.location}` : '' }}
                    {{ v.deadline ? `· prazo ${formatDate(v.deadline)}` : '' }}
                  </div>
                </div>
                <div class="rw-vaga-actions">
                  <span class="rw-status" :data-status="v.status">{{ statusLabel(v.status) }}</span>
                  <span class="rw-applicants">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {{ v.applicationsCount ?? 0 }}
                  </span>
                  <a
                    v-if="v.status === 'PUBLISHED' && v.slug"
                    :href="`/vaga/${v.slug}`"
                    target="_blank"
                    rel="noopener"
                    class="rw-vaga-public"
                    title="Abrir vaga pública"
                    aria-label="Abrir vaga pública em nova aba"
                    @click.stop
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                    <span class="rw-action-text">Ver vaga</span>
                  </a>
                  <a
                    :href="`/dashboard/vagas/${v.id}`"
                    class="rw-vaga-action"
                    title="Editar vaga"
                    aria-label="Editar vaga"
                    @click.stop
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    <span class="rw-action-text">Editar</span>
                  </a>
                  <button
                    v-if="v.status === 'PUBLISHED'"
                    type="button"
                    class="rw-vaga-action rw-vaga-action--danger"
                    :disabled="closingVagaId === v.id"
                    :title="closingVagaId === v.id ? 'Encerrando...' : 'Encerrar vaga'"
                    :aria-label="closingVagaId === v.id ? 'Encerrando vaga' : 'Encerrar vaga'"
                    @click.stop="requestCloseVaga(v)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    <span class="rw-action-text">{{ closingVagaId === v.id ? 'Encerrando...' : 'Encerrar' }}</span>
                  </button>
                  <button
                    v-else-if="v.status === 'CLOSED'"
                    type="button"
                    class="rw-vaga-action"
                    title="Republicar vaga"
                    aria-label="Republicar vaga"
                    @click.stop="requestRepublishVaga(v)"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                    <span class="rw-action-text">Republicar</span>
                  </button>
                  <button
                    class="rw-vaga-link"
                    type="button"
                    title="Ver pipeline"
                    aria-label="Ver pipeline da vaga"
                    @click.stop="selectVaga(v.id)"
                  >
                    <span class="rw-action-text">Ver pipeline →</span>
                    <svg class="rw-vaga-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </article>
            </div>

          </div>

          <!-- Sidebar: PipelineOverviewCard sempre, RecentActivityFeed só TEAM/ENTERPRISE -->
          <aside class="rw-sidebar-col">
            <PipelineOverviewCard />
            <RecentActivityFeed v-if="isTeamOrEnterprise" />
          </aside>

          <!-- Pipeline (ocupa as duas colunas no desktop, abaixo da vaga no mobile) -->
          <section
            v-if="selectedVagaId && viewMode === 'list'"
            ref="pipelineSectionEl"
            class="rw-pipeline-section"
          >
            <div v-if="loadingCandidates" class="rw-loading">Carregando candidatos...</div>
            <CandidatePipeline
              v-else
              :key="selectedVagaId"
              :vaga-title="selectedVagaTitle"
              :subline="selectedVagaSubline"
              :candidates="candidatesForSelected"
              :recruiter-name="recruiterName"
            />
          </section>
        </div>
      </div>

      <div v-else-if="activeSub === 'selecao'" class="rw-placeholder">
        <h4>Seleção e Testes</h4>
        <p>Provas e avaliações associadas a vagas. (Em construção.)</p>
      </div>

      <TeamMembersList v-else-if="activeSub === 'time' && isTeamOrEnterprise" />

      <ClientsList v-else-if="activeSub === 'clientes' && isTeamOrEnterprise" />
    </section>

    <section v-else-if="activeMain === 'carreira'" class="rw-panel">
      <div class="rw-hero">
        <h3>Sua carreira</h3>
        <p>Gerencie seu perfil, currículos, portfólio e localização em um só lugar.</p>
      </div>
      <div class="rw-career-shortcuts">
        <a href="/dashboard/curriculos" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/></svg>
          <span class="rw-shortcut-label">Currículos</span>
          <span class="rw-shortcut-desc">Faça upload e gerencie seus currículos</span>
        </a>
        <a href="/dashboard/portfolio" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/></svg>
          <span class="rw-shortcut-label">Publicações</span>
          <span class="rw-shortcut-desc">Projetos e artigos do seu portfólio</span>
        </a>
        <a href="/dashboard/perfil" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>
          <span class="rw-shortcut-label">Perfil</span>
          <span class="rw-shortcut-desc">Foto, bio, localização e redes sociais</span>
        </a>
        <a href="/dashboard/formacao" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/></svg>
          <span class="rw-shortcut-label">Formação</span>
          <span class="rw-shortcut-desc">Educação e certificações</span>
        </a>
        <a href="/dashboard/tags" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>
          <span class="rw-shortcut-label">Tags</span>
          <span class="rw-shortcut-desc">Habilidades e especialidades do perfil</span>
        </a>
        <a href="/dashboard/minhas-candidaturas" class="rw-shortcut">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" /></svg>
          <span class="rw-shortcut-label">Minhas candidaturas</span>
          <span class="rw-shortcut-desc">Vagas em que você se candidatou</span>
        </a>
      </div>
    </section>

    <section v-else-if="activeMain === 'servicos'" class="rw-panel">
      <PendingInvitesCard />
      <div class="rw-hero">
        <h3>Solicitar serviços</h3>
        <p>Contrate profissionais ou escolha um plano. <a href="/dashboard/planos">Página completa de planos →</a></p>
      </div>

      <div v-if="loadingServicos" class="rw-loading">Carregando...</div>
      <template v-else>
        <PlansInline @go-checkout="goToCheckout" />
        <HistoricoAssinaturas :items="history" />
        <IndicacaoCard :code="indicacao.code" :uses="indicacao.uses" :reward-months="indicacao.rewardMonths" />
      </template>
    </section>
  </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Breadcrumbs from '../ui/Breadcrumbs.vue';
import SubTabs from '../ui/SubTabs.vue';
import WorkspaceTabs from './WorkspaceTabs.vue';
import VagasMetrics from './VagasMetrics.vue';
import TeamMembersList from './TeamMembersList.vue';
import ClientsList from './ClientsList.vue';
import VagasTimeline from './VagasTimeline.vue';
import CandidatePipeline from './CandidatePipeline.vue';
import HistoricoAssinaturas from './HistoricoAssinaturas.vue';
import type { SubscriptionEntry } from './HistoricoAssinaturas.vue';
import IndicacaoCard from './IndicacaoCard.vue';
import PlansInline from './PlansInline.vue';
import PendingInvitesCard from './PendingInvitesCard.vue';
import PipelineOverviewCard from './PipelineOverviewCard.vue';
import RecentActivityFeed from './RecentActivityFeed.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
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

interface Metric {
  id: string;
  label: string;
  value: number | string;
  trend?: number;
  helper?: string;
}

type MainId = 'carreira' | 'vagas' | 'servicos';
type SubId = 'vagas' | 'selecao' | 'time' | 'clientes';

// ── Plan & recruiter ─────────────────────────────────────────────────────────
const userPlan = ref<PlanTier>('FREE');
const recruiterName = ref<string>('');
const isTeamOrEnterprise = computed(
  () => userPlan.value === 'TEAM' || userPlan.value === 'ENTERPRISE'
);

// ── Tabs ──────────────────────────────────────────────────────────────────────
const mainTabs = [
  { id: 'carreira', label: 'Carreira' },
  { id: 'vagas', label: 'Publicar vagas' },
  { id: 'servicos', label: 'Solicitar serviços' },
];

const subTabs = computed(() => {
  const base = [
    { id: 'vagas', label: 'Vagas', count: vagas.value.length },
    { id: 'selecao', label: 'Seleção e Testes' },
  ];
  if (isTeamOrEnterprise.value) {
    base.push(
      { id: 'time', label: 'Meu Time' },
      { id: 'clientes', label: 'Clientes' }
    );
  }
  return base;
});

const TAB_QUERY_MAP: Record<string, MainId> = {
  carreira: 'carreira',
  publicar: 'vagas',
  servicos: 'servicos',
};

const MAIN_TO_QUERY: Record<MainId, string> = {
  carreira: 'carreira',
  vagas: 'publicar',
  servicos: 'servicos',
};

const activeMain = ref<MainId>('vagas');
const activeSub = ref<SubId>('vagas');
const viewMode = ref<'list' | 'timeline'>('list');

// ── Vagas (real data) ─────────────────────────────────────────────────────────
const vagas = ref<Vaga[]>([]);
const loadingVagas = ref(false);
const statusFilter = ref<VagaStatus | 'all'>('all');
const selectedVagaId = ref<string>('');
const usage = ref<VagaUsage | null>(null);

// ── Close / Republish vaga ───────────────────────────────────────────────────
const closeTargetVaga = ref<Vaga | null>(null);
const closingVagaId = ref<string | null>(null);

// ── Candidates (real data, fetched per selected vaga) ────────────────────────
const candidatesMap = ref<Map<string, MockCandidate[]>>(new Map());
const loadingCandidates = ref(false);

// ── Serviços (real data) ──────────────────────────────────────────────────────
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
const crumbs = computed(() => {
  const baseCrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: mainTabLabel.value },
  ];
  if (activeMain.value === 'vagas' && activeSub.value) {
    const sub = subTabs.value.find((t) => t.id === activeSub.value);
    if (sub) baseCrumbs.push({ label: sub.label });
  }
  return baseCrumbs;
});

const mainTabLabel = computed(() => mainTabs.find((t) => t.id === activeMain.value)?.label ?? '');

const metrics = computed<Metric[]>(() => {
  const publishedVagas = vagas.value.filter((v) => v.status === 'PUBLISHED');
  const totalApplicants = vagas.value.reduce((sum, v) => sum + (v.applicationsCount ?? 0), 0);
  const conversionRate = totalApplicants > 0 ? Math.round((0 / totalApplicants) * 100) : 0;

  const base: Metric[] = [
    { id: 'publicadas',  label: 'Publicadas',  value: publishedVagas.length, helper: 'no ar agora' },
    { id: 'em_analise',  label: 'Em análise',  value: totalApplicants, helper: 'candidatos ativos' },
    { id: 'entrevistas', label: 'Entrevistas', value: 0, helper: 'em breve' },
    { id: 'contratadas', label: 'Contratados', value: 0, helper: 'em breve' },
  ];

  if (isTeamOrEnterprise.value) {
    base.push({
      id: 'conversao',
      label: 'Conversão',
      value: `${conversionRate}%`,
      helper: 'contratados / candidatos',
    });
  }

  return base;
});

const filteredVagas = computed(() => {
  if (statusFilter.value === 'all') return vagas.value;
  return vagas.value.filter((v) => v.status === statusFilter.value);
});

const selectedVaga = computed(() => vagas.value.find((v) => v.id === selectedVagaId.value));

const selectedVagaTitle = computed(() => selectedVaga.value?.title ?? '');
const selectedVagaSubline = computed(() => {
  const v = selectedVaga.value;
  if (!v) return '';
  const parts = [];
  if (v.location) parts.push(v.location);
  if (v.deadline) parts.push(`prazo ${formatDate(v.deadline)}`);
  parts.push(`${v.applicationsCount ?? 0} candidatos`);
  return parts.join(' · ');
});

const candidatesForSelected = computed((): MockCandidate[] => {
  if (!selectedVagaId.value) return [];
  return candidatesMap.value.get(selectedVagaId.value) ?? [];
});

// ── Close / Republish handlers ───────────────────────────────────────────────
function requestCloseVaga(v: Vaga) {
  closeTargetVaga.value = v;
}

async function confirmCloseVaga() {
  if (!closeTargetVaga.value || closingVagaId.value) return;
  const target = closeTargetVaga.value;
  closingVagaId.value = target.id;
  try {
    const updated = await unpublishVaga(target.id);
    const idx = vagas.value.findIndex((x) => x.id === target.id);
    if (idx !== -1) vagas.value[idx] = updated;
    showToast('Vaga encerrada', 'success');
  } catch (err: unknown) {
    const e = err as { message?: string };
    showToast(e?.message || 'Erro ao encerrar vaga');
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
    const idx = vagas.value.findIndex((x) => x.id === v.id);
    if (idx !== -1) vagas.value[idx] = updated;
    try { usage.value = await getMyVagaUsage(); } catch { /* non-critical */ }
    showToast('Vaga republicada', 'success');
  } catch (err: unknown) {
    if (isPlanLimitReachedError(err)) {
      const body = extractPlanLimitBody(err);
      if (body) {
        showToast(formatPlanLimitMessage(body));
      } else {
        showToast('Limite de vagas do plano atingido neste ciclo.');
      }
    } else {
      const e = err as { message?: string };
      showToast(e?.message || 'Erro ao republicar vaga');
    }
  } finally {
    closingVagaId.value = null;
  }
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
        selectedVagaId.value = vagasResult.value.data[0]!.id;
      }
    } else {
      showToast('Erro ao carregar vagas. Verifique sua conexão.');
      vagas.value = [];
    }

    if (usageResult.status === 'fulfilled') {
      usage.value = usageResult.value;
    }
  } finally {
    loadingVagas.value = false;
  }
}

async function loadCandidates(vagaId: string) {
  if (!vagaId) return;
  if (candidatesMap.value.has(vagaId)) return; // already fetched
  if (loadingCandidates.value) return;
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
      history.value = subs.value.map((s) => ({
        id: s.id,
        plan: s.plan,
        date: s.createdAt,
        amount: `R$ ${(s.priceBRL - s.discountApplied).toFixed(2).replace('.', ',')}`,
        status: mapSubStatus(s.status),
      }));
    } else {
      showToast('Erro ao carregar histórico de assinaturas.');
    }

    if (coupon.status === 'fulfilled') {
      indicacao.value = {
        code: coupon.value.code,
        uses: 0,
        rewardMonths: 0,
      };
    } else {
      showToast('Erro ao carregar código de indicação.');
    }
  } finally {
    loadingServicos.value = false;
  }
}

// Map SubscriptionRecord status → SubscriptionEntry status
function mapSubStatus(s: string): SubscriptionEntry['status'] {
  if (s === 'ACTIVE') return 'paid';
  if (s === 'PENDING') return 'pending';
  return 'failed';
}

// Map VagaApplicationAdminView → MockCandidate (for CandidatePipeline compatibility)
function appToMockCandidate(app: VagaApplicationAdminView): MockCandidate {
  const fullName = app.snapshotFullName || `${app.user?.firstName ?? ''} ${app.user?.lastName ?? ''}`.trim() || 'Candidato';
  const initials = fullName
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

// ── Event handlers ────────────────────────────────────────────────────────────
function onMainTabChange(id: string) {
  activeMain.value = id as MainId;
  const queryParam = MAIN_TO_QUERY[id as MainId];
  if (queryParam) {
    window.history.replaceState(null, '', `/dashboard/recrutador?tab=${queryParam}`);
    window.dispatchEvent(new CustomEvent('vp:nav-changed'));
  }
  if (id === 'servicos' && history.value.length === 0 && !loadingServicos.value) {
    loadServicos();
  }
}

function onMetricSelect(id: string) {
  if (id === 'publicadas') statusFilter.value = 'PUBLISHED';
  else if (id === 'encerradas') statusFilter.value = 'CLOSED';
  else statusFilter.value = 'all';
}

function onNewVaga() {
  window.location.href = '/dashboard/vagas/novo';
}

function goToCheckout(plan: PlanTier) {
  window.location.href = `/dashboard/checkout?plan=${plan}`;
}

const pipelineSectionEl = ref<HTMLElement | null>(null);

function selectVaga(id: string) {
  const wasAlreadySelected = selectedVagaId.value === id;
  selectedVagaId.value = id;
  // Wait for the pipeline section to render (it's `v-if`-mounted), then scroll into view
  nextTick(() => {
    const el = pipelineSectionEl.value;
    if (!el) return;
    const headerOffset = 80; // approximate sticky header height
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
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

// ── Watchers ──────────────────────────────────────────────────────────────────
watch(selectedVagaId, (id) => {
  if (id && viewMode.value === 'list') {
    loadCandidates(id);
  }
});

watch(viewMode, (mode) => {
  if (mode === 'list' && selectedVagaId.value) {
    loadCandidates(selectedVagaId.value);
  }
});

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const search = new URLSearchParams(window.location.search);
  const param = search.get('tab');
  if (param && param in TAB_QUERY_MAP) {
    activeMain.value = TAB_QUERY_MAP[param]!;
  } else {
    // Normalize URL so the sidebar deep-link highlight matches the default tab
    const queryParam = MAIN_TO_QUERY[activeMain.value];
    window.history.replaceState(null, '', `/dashboard/recrutador?tab=${queryParam}`);
    window.dispatchEvent(new CustomEvent('vp:nav-changed'));
  }

  // Load plan + recruiter profile (non-blocking)
  try {
    const [planInfo, profile] = await Promise.allSettled([getMyPlan(), getFullProfile()]);
    if (planInfo.status === 'fulfilled') userPlan.value = planInfo.value.plan;
    if (profile.status === 'fulfilled') {
      const p = profile.value;
      recruiterName.value = `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
    }
  } catch {
    // non-critical
  }

  // Load vagas
  await loadVagas();

  // Pós-publicação: toast + limpeza do query param
  if (search.get('published') === '1') {
    showToast('Vaga publicada com sucesso!', 'success');
    history.replaceState(null, '', '/dashboard/recrutador?tab=publicar');
  }

  // If starting on servicos tab, load it
  if (activeMain.value === 'servicos') {
    loadServicos();
  }
});
</script>

<style scoped>
.rw-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  max-width: 1280px;
  margin: 0 auto;
}
.rw-tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.rw-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  transition: background var(--transition-fast);
}
.rw-cta:hover { background: var(--primary-dark); }
.rw-cta-link {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  background: var(--primary);
  color: #ffffff;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: background var(--transition-fast);
}
.rw-cta-link:hover { background: var(--primary-dark); }

.rw-panel { display: flex; flex-direction: column; gap: var(--spacing-lg); }

.rw-subtabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.rw-toolbar { display: flex; gap: 4px; padding: 3px; background: var(--bg-tertiary); border-radius: var(--radius-md); }
.rw-toolbar-btn {
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
.rw-toolbar-btn:hover { color: var(--text-primary); }
.rw-toolbar-btn--active { background: var(--bg-primary); color: var(--text-primary); box-shadow: var(--shadow-sm); }

.rw-loading {
  padding: var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.rw-usage-bar {
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
.rw-usage-bar strong { color: var(--text-primary); }
.rw-usage-bar--full {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}
.rw-usage-bar--full strong { color: #7f1d1d; }
.rw-usage-help {
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

.rw-empty-vagas {
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
.rw-empty-vagas p {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--text-sm);
}
.rw-empty-reset {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: var(--text-sm);
  padding: 0;
  text-decoration: underline;
  font-family: inherit;
}

.rw-vagas-list { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.rw-vaga {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}
.rw-vaga:hover { border-color: var(--primary-light); }
.rw-vaga--selected { border-color: var(--primary); background: rgba(37, 99, 235, 0.03); }
.rw-vaga-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.rw-vaga-meta { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }
.rw-vaga-actions { display: flex; gap: var(--spacing-sm); align-items: center; flex-shrink: 0; }
.rw-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-weight: 600;
}
.rw-status[data-status='PUBLISHED'] { background: var(--status-success-bg); color: var(--status-success-text); }
.rw-status[data-status='DRAFT']     { background: var(--status-pending-bg); color: var(--status-pending-text); }
.rw-status[data-status='CLOSED']    { background: var(--status-neutral-bg); color: var(--status-neutral-text); }
.rw-applicants {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}
.rw-vaga-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-sans);
  white-space: nowrap;
}
.rw-vaga-link:hover { text-decoration: underline; }

.rw-vaga-public {
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
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast);
}
.rw-vaga-public:hover {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.rw-vaga-action {
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
.rw-vaga-action:hover:not(:disabled) {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-dark, var(--border));
}
.rw-vaga-action:disabled { opacity: 0.6; cursor: default; }
.rw-vaga-action--danger { color: #b91c1c; }
.rw-vaga-action--danger:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #991b1b;
}

.rw-pipeline-section {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

@media (max-width: 1100px) {
  .rw-pipeline-section {
    margin-top: 0;
    padding-top: var(--spacing-md);
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
  }
}
@media (max-width: 768px) {
  .rw-pipeline-section {
    padding-top: var(--spacing-sm);
    border-top: none;
  }
}

.rw-placeholder {
  padding: var(--spacing-2xl);
  text-align: center;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border);
}
.rw-placeholder h4 { margin: 0 0 var(--spacing-xs); color: var(--text-primary); }
.rw-placeholder p { margin: 0 0 var(--spacing-md); color: var(--text-secondary); }

.rw-hero {
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}
.rw-hero h3 { margin: 0 0 var(--spacing-xs); color: var(--text-primary); }
.rw-hero p { margin: 0; color: var(--text-secondary); }
.rw-hero a { color: var(--primary); text-decoration: none; }
.rw-hero a:hover { text-decoration: underline; }

.rw-career-shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
}
.rw-shortcut {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-lg);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.rw-shortcut:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-sm);
}
.rw-shortcut svg { color: var(--primary); flex-shrink: 0; }
.rw-shortcut-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.rw-shortcut-desc {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

/* Layout vagas — duas colunas para todos os planos */
.rw-vagas-tab {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.rw-vagas-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--spacing-lg);
  align-items: start;
}

.rw-vagas-list-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-width: 0;
}

.rw-sidebar-col {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  position: sticky;
  top: var(--spacing-lg);
  min-width: 0;
}

/* Pipeline spans the full grid width on desktop */
.rw-pipeline-section {
  grid-column: 1 / -1;
  min-width: 0;
}

@media (max-width: 1100px) {
  .rw-vagas-layout {
    grid-template-columns: 1fr;
  }
  .rw-vagas-list-area { order: 1; }
  .rw-pipeline-section { order: 2; grid-column: auto; }
  .rw-sidebar-col {
    order: 3;
    position: static;
  }
}

/* Pipeline arrow icon is mobile-only by default */
.rw-vaga-link-icon { display: none; }

@media (max-width: 768px) {
  .rw-root { padding: var(--spacing-md); }
  .rw-vaga {
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-md);
  }
  .rw-vaga-title { font-size: var(--text-sm); line-height: 1.3; }
  .rw-vaga-meta {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Hide all action text labels — keep icons only */
  .rw-action-text { display: none; }

  /* Action row: status + applicants on the left, icon buttons right-aligned, wraps if overflow */
  .rw-vaga-actions {
    width: 100%;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-start;
  }
  .rw-status,
  .rw-applicants { flex: 0 0 auto; }
  .rw-applicants { margin-right: auto; }

  /* Square icon-only buttons */
  .rw-vaga-public,
  .rw-vaga-action {
    width: 32px;
    height: 32px;
    padding: 0;
    justify-content: center;
    border-radius: var(--radius-md);
  }

  /* Pipeline link: icon-only arrow as primary call-to-action */
  .rw-vaga-link {
    width: 32px;
    height: 32px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: var(--primary);
    color: #fff;
  }
  .rw-vaga-link:hover { text-decoration: none; background: var(--primary-dark, var(--primary)); }
  .rw-vaga-link-icon { display: block; }
}
</style>
