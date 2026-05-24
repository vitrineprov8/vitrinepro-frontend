<template>
  <DashboardLayout>
    <Toast ref="toast" />

    <!-- Confirm dialog para publicação -->
    <ConfirmDialog
      :visible="showPublishConfirm"
      title="Publicar vaga"
      :message="publishConfirmMessage"
      confirm-label="Publicar vaga"
      :loading="publishing"
      @confirm="doPublish"
      @cancel="showPublishConfirm = false"
    />

    <div class="db-section-header">
      <div>
        <h1 class="db-section-title">{{ vagaId ? 'Editar vaga' : 'Nova vaga' }}</h1>
        <p class="db-section-subtitle">{{ vagaId ? 'Atualize os dados da vaga' : 'Cadastre uma nova vaga' }}</p>
      </div>
      <a href="/dashboard/vagas" class="btn btn-ghost btn-sm">Voltar</a>
    </div>

    <!-- Switcher de contexto: Pessoal + cada time acessivel -->
    <div v-if="accessibleTeams.length > 0" class="vaga-context-switcher">
      <div class="vaga-context-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span><strong>Publicar como</strong> — escolha o contexto desta vaga</span>
      </div>
      <div class="vaga-context-options">
        <button
          type="button"
          class="vaga-context-btn"
          :class="{ active: !activeContextTeamId }"
          :disabled="switchingContext"
          @click="switchContext(null)"
        >
          <span class="vaga-context-btn-title">Pessoal</span>
          <span class="vaga-context-btn-sub">Conta no seu plano. Nenhum time vê esta vaga.</span>
        </button>
        <button
          v-for="t in accessibleTeams"
          :key="t.id"
          type="button"
          class="vaga-context-btn"
          :class="{ active: activeContextTeamId === t.id }"
          :disabled="switchingContext"
          @click="switchContext(t.id)"
        >
          <span class="vaga-context-btn-title">
            {{ t.role === 'OWNER' ? 'Meu time · ' : 'Time · ' }}{{ t.name }}
          </span>
          <span class="vaga-context-btn-sub">
            {{ t.role === 'OWNER'
              ? 'Conta no plano do time. Membros e empresa veem.'
              : 'Conta no plano deste time. Empresa que te convidou vê.' }}
          </span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-center"><div class="spinner spinner-lg" /></div>

    <form v-else class="vaga-form" @submit.prevent="saveDraft">
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

      <!-- Seletor de Cliente — só para TEAM/ENTERPRISE -->
      <div v-if="isTeamOrEnterprise" class="db-field">
        <span class="db-label">Cliente</span>
        <select
          :value="selectedCompanyId"
          class="db-input"
          :disabled="saving"
          @change="onCompanySelectChange"
        >
          <option value="">— Sem cliente vinculado —</option>
          <option v-for="c in companiesList" :key="c.id" :value="c.id">{{ c.name }}</option>
          <option v-if="canManageClients" value="__new__">+ Cadastrar novo cliente…</option>
        </select>
      </div>

      <ClientEditorModal
        :visible="showClientModal"
        @close="showClientModal = false"
        @saved="onClientCreated"
      />

      <!-- Recrutador responsável — TEAM/ENTERPRISE -->
      <div v-if="isTeamOrEnterprise" class="db-field">
        <span class="db-label">Recrutador responsável</span>
        <select
          :value="assignedRecruiterId"
          class="db-input"
          :disabled="saving"
          @change="onRecruiterSelectChange"
        >
          <option value="">— Sem atribuição —</option>
          <option v-for="r in eligibleRecruiters" :key="r.id" :value="r.id">
            {{ r.name }} ({{ r.email }})
          </option>
          <option v-if="canManageClients" value="__invite__">+ Convidar novo recrutador…</option>
        </select>
        <p v-if="selectedCompany?.assignedRecruiters?.length" class="vaga-company-hint">
          Mostrando recrutadores designados ao cliente "{{ selectedCompany.name }}".
        </p>
      </div>

      <!-- Inline invite-recruiter modal -->
      <div v-if="showInviteModal" class="vaga-invite-backdrop" @click.self="showInviteModal = false">
        <div class="vaga-invite-modal" role="dialog" aria-modal="true">
          <h3 class="vaga-invite-title">Convidar recrutador</h3>
          <p class="vaga-invite-desc">
            Envie um convite por e-mail. Quando o recrutador aceitar, você poderá atribuir esta vaga a ele.
          </p>
          <label class="db-field">
            <span class="db-label">E-mail *</span>
            <input v-model="inviteEmail" type="email" class="db-input" :disabled="inviting" required />
          </label>
          <label class="db-field">
            <span class="db-label">Função</span>
            <select v-model="inviteRole" class="db-input" :disabled="inviting">
              <option value="RECRUITER">Recrutador</option>
              <option value="MANAGER">Gerente</option>
            </select>
          </label>
          <div class="vaga-invite-actions">
            <button type="button" class="btn btn-ghost" :disabled="inviting" @click="showInviteModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" :disabled="inviting || !inviteEmail.trim()" @click="sendInvite">
              <span v-if="inviting" class="spinner spinner-sm" />
              {{ inviting ? 'Enviando...' : 'Enviar convite' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Permitir Hunters externos -->
      <div class="vaga-hunters-box">
        <label class="vaga-hunters-toggle">
          <input v-model="form.allowHunters" type="checkbox" />
          <div class="vaga-hunters-text">
            <span class="vaga-hunters-title">Permitir Hunters externos</span>
            <span class="vaga-hunters-desc">
              Outros recrutadores (Hunters) poderao se voluntariar para trabalhar nesta vaga
              e indicar candidatos. Voce mantem o controle final do processo seletivo.
            </span>
          </div>
        </label>
        <label v-if="form.allowHunters" class="db-field vaga-hunters-phone">
          <span class="db-label">Telefone de contato para Hunters</span>
          <input
            v-model="form.hunterContactPhone"
            type="tel"
            maxlength="32"
            placeholder="(11) 99999-9999"
            class="db-input"
          />
          <span class="vaga-hunters-hint">
            Exibido apenas para Hunters que demonstrarem interesse na vaga.
          </span>
        </label>
      </div>

      <div class="vaga-form-actions">
        <button type="button" class="btn btn-ghost" @click="cancel">Cancelar</button>

        <!-- Botão salvar rascunho -->
        <button type="submit" class="btn btn-secondary" :disabled="saving">
          <span v-if="saving" class="spinner spinner-sm" />
          {{ saving ? 'Salvando...' : 'Salvar rascunho' }}
        </button>

        <!-- Botão publicar — disabled se limite atingido -->
        <div class="publish-btn-wrapper">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="saving || publishing || isLimitReached"
            :title="isLimitReached ? 'Limite de vagas atingido — faça upgrade do plano' : 'Publicar esta vaga'"
            @click="requestPublish"
          >
            <span v-if="publishing" class="spinner spinner-sm" />
            {{ publishing ? 'Publicando...' : 'Publicar vaga' }}
          </button>
          <span v-if="isLimitReached" class="publish-limit-tip">
            Limite atingido —
            <a href="/dashboard/recrutador?tab=servicos" class="link-upgrade">ver planos</a>
          </span>
        </div>
      </div>
    </form>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import Toast from '../ui/Toast.vue';
import ConfirmDialog from '../ui/ConfirmDialog.vue';
import ClientEditorModal from './ClientEditorModal.vue';
import {
  createVaga,
  extractPlanLimitBody,
  formatPlanLimitMessage,
  getFullProfile,
  getMyPlan,
  getMyVagaUsage,
  getMyVagas,
  isPlanLimitReachedError,
  publishVaga,
  updateVaga,
  companies,
  team,
  vagasAssignment,
  profile,
  getErrorMessage,
} from '../../utils/api';
import type { AccessibleTeam, Company, FullProfile, PlanTier, TeamMember, TeamRole, VagaPayload, VagaType, VagaUsage, VagaWorkMode } from '../../utils/api';

const PLAN_NAMES: Record<PlanTier, string> = {
  FREE: 'Gratuito',
  RECRUITER: 'Recruiter',
  TEAM: 'Recruiter Team',
  ENTERPRISE: 'Recruiter Enterprise',
};

const props = defineProps<{ vagaId?: string }>();

const toast = ref<InstanceType<typeof Toast>>();
const loading = ref(true);
const saving = ref(false);
const publishing = ref(false);

// Active context (hunter publishing as a team)
const activeContextTeamId = ref<string | null>(null);
// Todos os times nos quais o user pode atuar (próprio + convites aceitos)
const accessibleTeams = ref<AccessibleTeam[]>([]);
const switchingContext = ref(false);

async function switchContext(teamId: string | null) {
  if (switchingContext.value) return;
  if (teamId === activeContextTeamId.value) return;
  switchingContext.value = true;
  try {
    await profile.setActiveContext(teamId);
    activeContextTeamId.value = teamId;
    if (isTeamOrEnterprise.value) {
      await Promise.all([loadCompanies(), loadTeamMembers()]);
    }
    const teamName = accessibleTeams.value.find(t => t.id === teamId)?.name;
    toast.value?.show(
      teamId ? `Contexto alterado para ${teamName}` : 'Contexto pessoal ativado',
      'success'
    );
  } catch (err) {
    toast.value?.show(getErrorMessage(err), 'error');
  } finally {
    switchingContext.value = false;
  }
}
const showPublishConfirm = ref(false);
const currentVagaId = ref<string | undefined>(props.vagaId);
const usage = ref<VagaUsage | null>(null);

// Company (cliente) selector — only for TEAM/ENTERPRISE
const userPlan = ref<PlanTier>('FREE');
const myTeamRole = ref<TeamRole | null>(null);
const isTeamOrEnterprise = computed(
  () => userPlan.value === 'TEAM' || userPlan.value === 'ENTERPRISE'
);
const canManageClients = computed(
  () => myTeamRole.value === null || myTeamRole.value === 'OWNER' || myTeamRole.value === 'MANAGER',
);
const companiesList = ref<Company[]>([]);
const selectedCompanyId = ref<string>('');
const showClientModal = ref(false);
const teamMembers = ref<TeamMember[]>([]);
const assignedRecruiterId = ref<string>('');
const showInviteModal = ref(false);
const inviteEmail = ref('');
const inviteRole = ref<'RECRUITER' | 'MANAGER'>('RECRUITER');
const inviting = ref(false);

function onCompanySelectChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  if (v === '__new__') {
    showClientModal.value = true;
    // revert visible select to current value
    (e.target as HTMLSelectElement).value = selectedCompanyId.value;
    return;
  }
  selectedCompanyId.value = v;
}

function onRecruiterSelectChange(e: Event) {
  const v = (e.target as HTMLSelectElement).value;
  if (v === '__invite__') {
    showInviteModal.value = true;
    (e.target as HTMLSelectElement).value = assignedRecruiterId.value;
    return;
  }
  assignedRecruiterId.value = v;
}

async function sendInvite() {
  if (inviting.value) return;
  const email = inviteEmail.value.trim();
  if (!email) return;
  inviting.value = true;
  try {
    await team.invite({ email, role: inviteRole.value });
    toast.value?.show('Convite enviado. Você poderá atribuir a vaga ao recrutador após ele aceitar.', 'success');
    showInviteModal.value = false;
    inviteEmail.value = '';
    inviteRole.value = 'RECRUITER';
    await loadTeamMembers();
  } catch (err) {
    const e = err as { message?: string };
    toast.value?.show(e?.message ?? 'Erro ao enviar convite.', 'error');
  } finally {
    inviting.value = false;
  }
}

const selectedCompany = computed(() =>
  companiesList.value.find((c) => c.id === selectedCompanyId.value) ?? null,
);

const eligibleRecruiters = computed(() => {
  const all = teamMembers.value
    .filter((m) => m.status === 'ACTIVE' && m.user)
    .map((m) => {
      const name = [m.user!.firstName, m.user!.lastName].filter(Boolean).join(' ') || m.user!.email;
      return { id: m.user!.id, name, email: m.user!.email };
    });
  const assigned = selectedCompany.value?.assignedRecruiters ?? [];
  if (assigned.length === 0) return all;
  const assignedIds = new Set(assigned.map((r) => r.id));
  return all.filter((r) => assignedIds.has(r.id));
});

function onClientCreated(c: Company) {
  companiesList.value = [...companiesList.value, c];
  selectedCompanyId.value = c.id;
  showClientModal.value = false;
  toast.value?.show('Cliente criado com sucesso', 'success');
}

const isLimitReached = computed(() => {
  if (!usage.value) return false;
  if (usage.value.limit === -1) return false;
  return usage.value.used >= usage.value.limit;
});

const publishConfirmMessage = computed(() => {
  if (!usage.value) return 'Deseja publicar esta vaga?';
  const { used, limit, planTier } = usage.value;
  const planName = PLAN_NAMES[planTier] ?? planTier;

  if (limit === -1) {
    return `Você tem vagas ilimitadas no plano ${planName}. Deseja publicar esta vaga?`;
  }

  return (
    `Ao publicar esta vaga você vai usar 1 de ${limit} vaga${limit === 1 ? '' : 's'} do seu plano ${planName} neste mês ` +
    `(${used} já publicada${used === 1 ? '' : 's'}). ` +
    `Esse uso não é devolvido se você despublicar ou deletar a vaga depois. Deseja continuar?`
  );
});

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
  contactEmail: string;
  allowHunters: boolean;
  hunterContactPhone: string;
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
  contactEmail: '',
  allowHunters: false,
  hunterContactPhone: '',
});

// Extended payload type to allow companyId
interface VagaPayloadExtended extends VagaPayload {
  companyId?: string | null;
}

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
    let pageNum = 1;
    let lastPage = 1;
    let found: ReturnType<typeof Object.assign> | null = null;
    do {
      const res = await getMyVagas({ page: pageNum, limit: 20 });
      found = res.data.find((v) => v.id === props.vagaId) ?? null;
      lastPage = res.lastPage;
      pageNum++;
    } while (!found && pageNum <= lastPage);

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
    form.contactEmail = found.contactEmail ?? '';
    form.allowHunters = Boolean(found.allowHunters);
    form.hunterContactPhone = found.hunterContactPhone ?? '';
    selectedCompanyId.value = (found as { companyId?: string | null }).companyId ?? '';
    assignedRecruiterId.value = (found as { assignedToId?: string | null }).assignedToId ?? '';
  } catch {
    toast.value?.show('Erro ao carregar vaga', 'error');
  } finally {
    loading.value = false;
  }
}

async function loadCompanies() {
  try {
    companiesList.value = await companies.list();
  } catch {
    // non-critical — selector won't appear if list is empty
  }
}

async function loadTeamMembers() {
  try {
    teamMembers.value = await team.listMembers();
  } catch {
    teamMembers.value = [];
  }
}

async function persistAssignment() {
  if (!currentVagaId.value) return;
  try {
    await vagasAssignment.assign(currentVagaId.value, assignedRecruiterId.value || null);
  } catch (err) {
    const e = err as { message?: string };
    toast.value?.show(e?.message ?? 'Erro ao atribuir recrutador.', 'error');
  }
}

function buildPayload(): VagaPayloadExtended {
  const payload: VagaPayloadExtended = {
    title: form.title.trim(),
    description: form.description.trim(),
    status: 'DRAFT',
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
  payload.allowHunters = form.allowHunters;
  payload.hunterContactPhone = form.allowHunters ? (form.hunterContactPhone.trim() || null) : null;
  // Include companyId for TEAM/ENTERPRISE (null clears the association)
  if (isTeamOrEnterprise.value) {
    payload.companyId = selectedCompanyId.value || null;
  }
  return payload;
}

async function saveDraft() {
  if (saving.value) return;
  if (!form.title.trim() || !form.description.trim()) {
    toast.value?.show('Preencha título e descrição', 'error');
    return;
  }
  saving.value = true;
  try {
    const payload = buildPayload();
    if (currentVagaId.value) {
      await updateVaga(currentVagaId.value, payload);
      toast.value?.show('Rascunho salvo', 'success');
    } else {
      const created = await createVaga(payload);
      currentVagaId.value = created.id;
      toast.value?.show('Rascunho criado', 'success');
      // Update URL sem recarregar a página para que o id fique correto
      history.replaceState(null, '', `/dashboard/vagas/${created.id}`);
    }
    if (isTeamOrEnterprise.value) {
      await persistAssignment();
    }
  } catch (err: unknown) {
    const e = err as { message?: string };
    toast.value?.show(e?.message || 'Erro ao salvar rascunho', 'error');
  } finally {
    saving.value = false;
  }
}

async function requestPublish() {
  if (saving.value || publishing.value) return;
  if (!form.title.trim() || !form.description.trim()) {
    toast.value?.show('Preencha título e descrição antes de publicar', 'error');
    return;
  }

  // Se nova vaga, precisa salvar primeiro para ter id
  if (!currentVagaId.value) {
    await saveDraft();
    if (!currentVagaId.value) return; // falhou no save
  }

  // Buscar usage atualizado
  try {
    usage.value = await getMyVagaUsage();
  } catch {
    // Se falhar, não bloquear o fluxo — abrir confirm mesmo assim
  }

  showPublishConfirm.value = true;
}

async function doPublish() {
  if (publishing.value || !currentVagaId.value) return;
  publishing.value = true;
  try {
    await publishVaga(currentVagaId.value);
    toast.value?.show('Vaga publicada com sucesso!', 'success');
    showPublishConfirm.value = false;
    setTimeout(() => { window.location.href = '/dashboard/recrutador?tab=publicar&published=1'; }, 700);
  } catch (err: unknown) {
    showPublishConfirm.value = false;

    if (isPlanLimitReachedError(err)) {
      const body = extractPlanLimitBody(err);
      if (body) {
        const msg = formatPlanLimitMessage(body);
        toast.value?.show(`${msg} Faça upgrade do seu plano.`, 'error');
        // Atualizar usage local para desabilitar o botão
        usage.value = { ...body, cycleStart: '', planTier: 'FREE' } as VagaUsage;
        return;
      }
    }

    const e = err as { statusCode?: number; message?: string };
    if (e?.statusCode === 409) {
      toast.value?.show('Esta vaga já está publicada.', 'error');
      return;
    }
    toast.value?.show(e?.message || 'Erro ao publicar vaga', 'error');
  } finally {
    publishing.value = false;
  }
}

function cancel() {
  window.location.href = '/dashboard/recrutador?tab=publicar';
}

onMounted(async () => {
  // Load plan info first so we know if company selector is needed
  try {
    const [info, userProfile] = await Promise.all([getMyPlan(), getFullProfile()]);
    userPlan.value = info.plan;
    // FREE users cannot publish vagas — redirect to plan upsell
    if (info.plan === 'FREE') {
      window.location.href = '/dashboard/recrutador?tab=servicos';
      return;
    }
    myTeamRole.value = info.teamRole ?? null;
    // Lista todos os times acessiveis (proprio + memberships ativas)
    try {
      accessibleTeams.value = await team.listAccessible();
    } catch {
      accessibleTeams.value = [];
    }
    if (userProfile.activeContextTeamId) {
      activeContextTeamId.value = userProfile.activeContextTeamId;
    }
    if (info.plan === 'TEAM' || info.plan === 'ENTERPRISE') {
      loadCompanies();
      loadTeamMembers();
    }
  } catch {
    // non-critical
  }

  await load();
  // Carregar usage em paralelo (não bloqueia o form)
  getMyVagaUsage().then((u) => { usage.value = u; }).catch(() => { /* non-critical */ });
});
</script>

<style scoped>
.vaga-context-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(124, 58, 237, 0.08);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--secondary, #7c3aed);
  margin-bottom: var(--spacing-md);
}

.vaga-context-switcher {
  background: rgba(124, 58, 237, 0.04);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vaga-context-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.vaga-context-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

@media (max-width: 640px) {
  .vaga-context-options { grid-template-columns: 1fr; }
}

.vaga-context-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  cursor: pointer;
  text-align: left;
  transition: all 150ms;
  font-family: var(--font-sans);
}

.vaga-context-btn:hover:not(:disabled) {
  border-color: var(--secondary, #7c3aed);
}

.vaga-context-btn.active {
  border-color: var(--secondary, #7c3aed);
  background: rgba(124, 58, 237, 0.08);
}

.vaga-context-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.vaga-context-btn-title {
  font-weight: 600;
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.vaga-context-btn-sub {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.3;
}

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
.vaga-hunters-box {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
}
.vaga-hunters-toggle {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  cursor: pointer;
}
.vaga-hunters-toggle input[type='checkbox'] {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
  cursor: pointer;
  flex-shrink: 0;
}
.vaga-hunters-text { display: flex; flex-direction: column; gap: 4px; }
.vaga-hunters-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.vaga-hunters-desc {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
}
.vaga-hunters-phone {
  padding-left: 30px;
  border-left: 2px solid var(--primary);
  margin-left: 6px;
}
.vaga-hunters-hint {
  font-size: 11px;
  color: var(--text-light);
}

.vaga-form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.publish-btn-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}
.publish-limit-tip {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.link-upgrade {
  color: var(--primary);
  text-decoration: underline;
}
.vaga-company-hint {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin: 0;
}
.vaga-invite-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: var(--spacing-md);
}
.vaga-invite-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}
.vaga-invite-title { margin: 0; font-size: var(--text-lg); }
.vaga-invite-desc { margin: 0; color: var(--text-secondary); font-size: 0.85rem; }
.vaga-invite-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}
</style>
