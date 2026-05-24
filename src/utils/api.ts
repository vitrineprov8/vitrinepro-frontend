/**
 * Utilidades para chamadas à API do backend
 */

import { getToken } from './auth';

/**
 * Obtém a URL base do backend das variáveis de entorno
 */
export function getBackendUrl(): string {
  return import.meta.env.PUBLIC_BACKEND_URL || 'http://localhost:3000';
}

/**
 * Interface para respostas de erro da API
 */
interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

/**
 * Classe de erro customizada para erros da API
 */
export class ApiException extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string,
    public body?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Wrapper de fetch com funcionalidades adicionais:
 * - Headers automáticos (Content-Type, Authorization)
 * - Manejo de erros HTTP
 * - Injeção automática do token JWT se existir
 */
export async function fetchAPI<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBackendUrl()}${endpoint}`;

  // Headers padrão
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  // Adicionar token JWT se existir
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Se não for OK, lançar erro
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      let errorDetail = '';
      let errorBody: Record<string, unknown> | undefined;

      try {
        const errorData = await response.json() as Record<string, unknown>;
        errorBody = errorData;
        const rawMessage = errorData.message;
        if (typeof rawMessage === 'string') {
          errorMessage = rawMessage;
        } else if (rawMessage && typeof rawMessage === 'object') {
          const nestedMsg = (rawMessage as Record<string, unknown>).message;
          errorMessage = typeof nestedMsg === 'string' ? nestedMsg : errorMessage;
        }
        errorDetail = typeof errorData.error === 'string' ? errorData.error : '';
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiException(response.status, errorMessage, errorDetail, errorBody);
    }

    // 204 No Content — sem corpo para parsear
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T;
    }

    // Retornar resposta parseada
    return await response.json();
  } catch (error) {
    // Se for ApiException, repassar
    if (error instanceof ApiException) {
      throw error;
    }

    // Se for erro de rede, criar ApiException
    throw new ApiException(
      0,
      'Erro de conexão. Verifique sua internet e se o backend está rodando.'
    );
  }
}

/**
 * Interface para resposta de login/registro
 */
export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Interface para dados de perfil do usuário
 */
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  provider?: string;
  createdAt: string;
}

/**
 * Login com email e senha
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Registrar novo usuário
 */
export async function registerUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string,
  options?: {
    isCompany?: boolean;
    companyName?: string;
    companyIndustry?: string;
  }
): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, firstName, lastName, password, ...options }),
  });
}

/**
 * Obter perfil do usuário autenticado
 */
export async function getProfile(): Promise<UserProfile> {
  return fetchAPI<UserProfile>('/auth/profile', {
    method: 'GET',
  });
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface FullProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  profession?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bannerColor?: string;
  isVisible?: boolean;
  // Empresa fields
  isCompany?: boolean;
  companyName?: string;
  companyIndustry?: string;
  companyLogoUrl?: string;
  // Hunter multi-contexto
  activeContextTeamId?: string | null;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  slug?: string;
}

export interface PortfolioFile {
  id: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'PDF';
  mimeType?: string;
  caption?: string;
  originalFilename?: string;
  fileSize?: number;
  order: number;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: any;
  coverImageUrl?: string;
  clientName?: string;
  year?: number;
  duration?: string;
  role?: string;
  projectStatus?: 'ONGOING' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | null;
  status?: 'DRAFT' | 'PUBLISHED';
  externalUrl?: string;
  tags: Tag[];
  files: PortfolioFile[];
  createdAt?: string;
  updatedAt?: string;
  // Service fields
  isService?: boolean;
  serviceType?: string | null;
  actionButton?: string | null;
  servicePrice?: number | null;
  publicationDurationDays?: number | null;
  isFeatured?: boolean;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    profession?: string;
    username?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface CV {
  id: string;
  label: string;
  isActive: boolean;
  fileUrl: string;
  createdAt: string;
}

export interface Education {
  id: string;
  type: 'GRADUATE' | 'POST_GRADUATE' | 'MASTER' | 'DOCTORATE' | 'CERTIFICATION' | 'COURSE';
  institution: string;
  title: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  order?: number;
  certificateUrl?: string;
}

// ─── UPLOAD HELPER ────────────────────────────────────────────────────────────

/**
 * Fetch wrapper para uploads multipart/form-data.
 * NÃO define Content-Type (o browser define automaticamente com o boundary).
 */
export async function fetchAPIFormData<T = any>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PATCH' = 'POST'
): Promise<T> {
  const url = `${getBackendUrl()}${endpoint}`;
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const response = await fetch(url, { method, headers, body: formData });
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch { /* */ }
      throw new ApiException(response.status, errorMessage);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiException) throw error;
    throw new ApiException(0, 'Erro de conexão. Verifique sua internet e se o backend está rodando.');
  }
}

// ─── PROFILE ──────────────────────────────────────────────────────────────────

export async function getFullProfile(): Promise<FullProfile> {
  return fetchAPI<FullProfile>('/profile/me');
}

export async function updateProfile(data: {
  firstName?: string; lastName?: string;
  username?: string; profession?: string | null; bio?: string | null;
  phone?: string | null; website?: string | null; location?: string | null;
  bannerColor?: string | null;
  isVisible?: boolean;
  socialLinks?: Partial<FullProfile['socialLinks']>;
}): Promise<FullProfile> {
  return fetchAPI<FullProfile>('/profile', { method: 'PATCH', body: JSON.stringify(data) });
}

export async function uploadAvatar(file: File): Promise<FullProfile> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<FullProfile>('/profile/avatar', fd);
}

export async function uploadBanner(file: File): Promise<FullProfile> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<FullProfile>('/profile/banner', fd);
}

export async function getPublicProfile(username: string): Promise<FullProfile> {
  return fetchAPI<FullProfile>(`/profile/${username}`);
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────

export async function getPortfolioItems(params?: {
  page?: number; limit?: number; status?: string; userId?: string; tag?: string;
}): Promise<PaginatedResponse<PortfolioItem>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.status) qs.set('status', params.status);
  if (params?.userId) qs.set('userId', params.userId);
  if (params?.tag) qs.set('tag', params.tag);
  const query = qs.toString() ? `?${qs}` : '';
  return fetchAPI<PaginatedResponse<PortfolioItem>>(`/portfolio${query}`);
}

export async function getPortfolioItem(slug: string): Promise<PortfolioItem> {
  return fetchAPI<PortfolioItem>(`/portfolio/${slug}`);
}

export async function createPortfolioItem(data: {
  title: string; description?: string; subtitle?: string; content?: any;
  clientName?: string; year?: number; duration?: string; role?: string;
  projectStatus?: string; status?: string; externalUrl?: string; tagIds?: string[];
  isService?: boolean; serviceType?: string | null; actionButton?: string | null;
  servicePrice?: number | null; publicationDurationDays?: number | null;
}): Promise<PortfolioItem> {
  return fetchAPI<PortfolioItem>('/portfolio', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePortfolioItem(id: string, data: Partial<PortfolioItem> & { tagIds?: string[] }): Promise<PortfolioItem> {
  return fetchAPI<PortfolioItem>(`/portfolio/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deletePortfolioItem(id: string): Promise<void> {
  return fetchAPI<void>(`/portfolio/${id}`, { method: 'DELETE' });
}

export async function uploadPortfolioCover(id: string, file: File): Promise<PortfolioItem> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<PortfolioItem>(`/portfolio/${id}/cover`, fd);
}

export async function addPortfolioFile(id: string, file: File, caption?: string): Promise<PortfolioFile> {
  const fd = new FormData();
  fd.append('file', file);
  if (caption) fd.append('caption', caption);
  return fetchAPIFormData<PortfolioFile>(`/portfolio/${id}/files`, fd);
}

export async function deletePortfolioFile(portfolioId: string, fileId: string): Promise<void> {
  return fetchAPI<void>(`/portfolio/${portfolioId}/files/${fileId}`, { method: 'DELETE' });
}

export async function reorderPortfolioFiles(portfolioId: string, orders: { id: string; order: number }[]): Promise<void> {
  return fetchAPI<void>(`/portfolio/${portfolioId}/files/reorder`, {
    method: 'PATCH', body: JSON.stringify({ orders }),
  });
}

// ─── TAGS ─────────────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  return fetchAPI<Tag[]>('/tags');
}

export async function createTag(name: string): Promise<Tag> {
  return fetchAPI<Tag>('/tags', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function deleteTag(id: string): Promise<void> {
  return fetchAPI<void>(`/tags/${id}`, { method: 'DELETE' });
}

// ─── CV ───────────────────────────────────────────────────────────────────────

export async function getCVList(): Promise<CV[]> {
  return fetchAPI<CV[]>('/cv');
}

export async function getPublicCVList(userId: string): Promise<CV[]> {
  return fetchAPI<CV[]>(`/cv/public/${userId}`);
}

export async function uploadCV(file: File, label: string): Promise<CV> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('label', label);
  return fetchAPIFormData<CV>('/cv', fd);
}

export async function updateCV(id: string, data: { label?: string; isActive?: boolean }): Promise<CV> {
  return fetchAPI<CV>(`/cv/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCV(id: string): Promise<void> {
  return fetchAPI<void>(`/cv/${id}`, { method: 'DELETE' });
}

export async function getCVDownloadUrl(id: string): Promise<{ url: string }> {
  return fetchAPI<{ url: string }>(`/cv/${id}/download`);
}

// ─── EDUCATION ────────────────────────────────────────────────────────────────

export async function getEducation(): Promise<Education[]> {
  return fetchAPI<Education[]>('/education');
}

export async function getPublicEducation(userId: string): Promise<Education[]> {
  return fetchAPI<Education[]>(`/education/public/${userId}`);
}

export async function createEducation(data: {
  type: string; institution: string; title: string;
  fieldOfStudy?: string; startDate: string; endDate?: string;
  description?: string; order?: number;
}): Promise<Education> {
  return fetchAPI<Education>('/education', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateEducation(id: string, data: Partial<Education>): Promise<Education> {
  return fetchAPI<Education>(`/education/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteEducation(id: string): Promise<void> {
  return fetchAPI<void>(`/education/${id}`, { method: 'DELETE' });
}

export async function uploadCertificate(id: string, file: File): Promise<Education> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<Education>(`/education/${id}/certificate`, fd);
}

// ─── UPLOADS ──────────────────────────────────────────────────────────────────

export async function uploadContentImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<{ url: string }>('/uploads/image', fd);
}

export async function uploadGenericImage(file: File): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append('file', file);
  return fetchAPIFormData<{ url: string }>('/uploads/image', fd);
}

// ─── SEARCH ───────────────────────────────────────────────────────────────────

export interface SearchParams {
  q?: string;
  type?: 'all' | 'professional' | 'specialty' | 'project';
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'year';
  sortOrder?: 'ASC' | 'DESC';
  city?: string;
  hasImage?: boolean;
  projectStatus?: string;
  isService?: boolean;
  dateFrom?: string;
  dateTo?: string;
  tagId?: string;
}

/** Portfolio item shape returned by the search endpoint (includes author as `user`). */
export interface SearchPortfolioItem {
  kind: 'portfolio';
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImageUrl?: string;
  year?: string | number;
  projectStatus?: string;
  isService?: boolean;
  serviceType?: string | null;
  actionButton?: string | null;
  servicePrice?: number | null;
  tags: Tag[];
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatarUrl?: string;
    profession?: string;
    location?: string;
  };
}

/** Profile shape returned by the search endpoint for Professional/Especialidade searches. */
export interface SearchProfileItem {
  kind: 'profile';
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  profession?: string;
  location?: string;
  avatarUrl?: string;
  bannerColor?: string;
  bio?: string;
  phone?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  projectCount: number;
}

/** Union of all item shapes the search endpoint can return. */
export type SearchItem = SearchPortfolioItem | SearchProfileItem;

export interface SearchResult {
  data: SearchItem[];
  total: number;
  page: number;
  lastPage: number;
  cities: string[];
  availableTags: { id: string; name: string }[];
}

export interface AutocompleteSuggestion {
  label: string;
  value: string;
  type: 'professional' | 'specialty' | 'tag' | 'project';
}

export async function searchPortfolio(params: SearchParams): Promise<SearchResult> {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const BACKEND = getBackendUrl();
  const res = await fetch(`${BACKEND}/search?${qs.toString()}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function searchAutocomplete(q: string, type?: string): Promise<AutocompleteSuggestion[]> {
  if (!q || q.length < 2) return [];
  const qs = new URLSearchParams({ q });
  if (type && type !== 'all') qs.set('type', type);
  const BACKEND = getBackendUrl();
  const res = await fetch(`${BACKEND}/search/autocomplete?${qs.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

// ─── VAGAS ────────────────────────────────────────────────────────────────────

export type VagaStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type VagaType = 'CLT' | 'PJ' | 'FREELA' | 'ESTAGIO';
export type VagaWorkMode = 'REMOTE' | 'HYBRID' | 'ONSITE';
export type VagaSegment =
  | 'COMERCIO_VENDAS'
  | 'LOGISTICA_TRANSPORTE'
  | 'FINANCAS_CONTABILIDADE'
  | 'ADMINISTRATIVO'
  | 'TECNOLOGIA'
  | 'RH'
  | 'SAUDE'
  | 'EDUCACAO'
  | 'MARKETING'
  | 'JURIDICO'
  | 'OUTROS';

export interface Vaga {
  id: string;
  slug: string;
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  location?: string | null;
  type?: VagaType | null;
  workMode?: VagaWorkMode | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  deadline?: string | null;
  status: VagaStatus;
  contactEmail?: string | null;
  createdAt?: string;
  updatedAt?: string;
  applicationsCount?: number;
  // Fase 1 fields
  segment?: VagaSegment | null;
  allowHunters?: boolean;
  hunterContactPhone?: string | null;
  // TEAM/ENTERPRISE fields
  company?: Company | null;
  companyId?: string | null;
  assignedTo?: { id: string; name: string; avatarUrl?: string } | null;
  assignedToId?: string | null;
}

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';

// ─── PIPELINE TEMPLATE ────────────────────────────────────────────────────────

export interface PipelineStage {
  id: string;
  label: string;
  color?: string;
  order: number;
  isRejected?: boolean;
}

export interface PipelineTemplate {
  id: string;
  ownerId: string;
  stages: PipelineStage[];
  createdAt: string;
  updatedAt: string;
}

export const pipelineTemplates = {
  getMine(): Promise<PipelineTemplate> {
    return fetchAPI<PipelineTemplate>('/me/pipeline-template');
  },
  updateMine(stages: PipelineStage[]): Promise<PipelineTemplate> {
    return fetchAPI<PipelineTemplate>('/me/pipeline-template', {
      method: 'PATCH',
      body: JSON.stringify({ stages }),
    });
  },
};

export interface VagaApplication {
  id: string;
  status: ApplicationStatus;
  message?: string | null;
  createdAt: string;
  vaga?: {
    id: string;
    slug: string;
    title: string;
    status: VagaStatus;
    location?: string | null;
    type?: VagaType | null;
    workMode?: VagaWorkMode | null;
  } | null;
}

export interface VagaApplicationAdminView {
  id: string;
  status: ApplicationStatus;
  pipelineStage?: string | null;
  isRejected?: boolean;
  message?: string | null;
  snapshotFullName: string;
  snapshotEmail: string;
  snapshotPhone?: string | null;
  snapshotLocation?: string | null;
  createdAt: string;
  vagaId?: string;
  vagaTitle?: string;
  cv: { id: string; label: string; fileUrl: string } | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    username?: string;
    avatarUrl?: string;
  } | null;
}

export interface ApplyVagaPayload {
  cvId?: string;
  message?: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
}

export interface VagaPayload {
  title: string;
  description: string;
  requirements?: string;
  benefits?: string;
  location?: string;
  type?: VagaType;
  workMode?: VagaWorkMode;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  status?: VagaStatus;
  contactEmail?: string;
  allowHunters?: boolean;
  hunterContactPhone?: string | null;
}

export interface VagaListParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: VagaStatus;
  type?: VagaType;
  workMode?: VagaWorkMode;
}

function buildVagasQuery(params?: VagaListParams): string {
  if (!params) return '';
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  if (params.type) qs.set('type', params.type);
  if (params.workMode) qs.set('workMode', params.workMode);
  return qs.toString() ? `?${qs.toString()}` : '';
}

export async function getPublicVagas(params?: VagaListParams): Promise<PaginatedResponse<Vaga>> {
  return fetchAPI<PaginatedResponse<Vaga>>(`/vagas${buildVagasQuery(params)}`);
}

export async function getVagaBySlug(slug: string): Promise<Vaga> {
  return fetchAPI<Vaga>(`/vagas/${slug}`);
}

export async function getAdminVagas(params?: VagaListParams): Promise<PaginatedResponse<Vaga>> {
  return fetchAPI<PaginatedResponse<Vaga>>(`/vagas/admin/list${buildVagasQuery(params)}`);
}

export async function createVaga(data: VagaPayload): Promise<Vaga> {
  return fetchAPI<Vaga>('/vagas', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateVaga(id: string, data: Partial<VagaPayload>): Promise<Vaga> {
  return fetchAPI<Vaga>(`/vagas/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteVaga(id: string): Promise<void> {
  return fetchAPI<void>(`/vagas/${id}`, { method: 'DELETE' });
}

export async function applyToVaga(slug: string, payload: ApplyVagaPayload): Promise<VagaApplication> {
  return fetchAPI<VagaApplication>(`/vagas/${slug}/apply`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getMyApplications(): Promise<VagaApplication[]> {
  return fetchAPI<VagaApplication[]>('/me/applications');
}

export async function getVagaApplications(vagaId: string): Promise<VagaApplicationAdminView[]> {
  return fetchAPI<VagaApplicationAdminView[]>(`/vagas/${vagaId}/applications`);
}

export async function updateApplicationStatus(
  id: string,
  pipelineStage: string,
  isRejected?: boolean,
): Promise<VagaApplication> {
  return fetchAPI<VagaApplication>(`/applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ pipelineStage, isRejected: isRejected ?? false }),
  });
}

// ─── PLANS & SUBSCRIPTIONS ────────────────────────────────────────────────────

export type PlanTier = 'FREE' | 'RECRUITER' | 'TEAM' | 'ENTERPRISE';
export type PlanStatus = 'NONE' | 'ACTIVE' | 'EXPIRED' | 'PENDING';

export interface Plan {
  tier: PlanTier;
  name: string;
  priceBRL: number;
  vagaLimit: number;
  seatLimit: number;
  features: string[];
}

export interface VagaUsage {
  used: number;
  limit: number;       // -1 = ilimitado
  cycleStart: string;
  cycleEnd: string;
  planTier: PlanTier;
  inheritedFromTeam?: boolean;
}

export interface PublicCoupon {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
}

export interface PlanLimitReachedBody {
  code: 'PLAN_LIMIT_REACHED';
  used: number;
  limit: number;
  cycleEnd: string;
  message: string;
}

export interface MyPlanInfo {
  plan: PlanTier;
  planStatus: PlanStatus;
  planExpiresAt: string | null;
  vagasUsed: number;
  vagasLimit: number;
  inheritedFromTeam?: boolean;
  teamRole?: TeamRole | null;
  teamId?: string | null;
}

export interface Subscription {
  id: string;
  plan: PlanTier;
  status: string;
  priceBRL: number;
  couponCode: string | null;
  discountApplied: number;
  startsAt: string | null;
  endsAt: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  isActive: boolean;
}

export interface CouponRedemption {
  id: string;
  coupon: Coupon & { owner?: { id: string; firstName: string; lastName: string; email: string } };
  redeemedBy: { id: string; firstName: string; lastName: string; email: string };
  ownerName: string;
  status: string;
  createdAt: string;
}

export interface CheckoutResult {
  subscriptionId: string;
  priceBRL: number;
  discountBRL: number;
  totalBRL: number;
  couponValid: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  discountType?: 'PERCENT' | 'FIXED';
  discountValue?: number;
  ownerId?: string;
}

/** Lista os planos disponíveis (público, sem autenticação) */
export async function listPlans(): Promise<Plan[]> {
  return fetchAPI<Plan[]>('/plans');
}

/** Retorna informações do plano atual do usuário autenticado */
export async function getMyPlan(): Promise<MyPlanInfo> {
  return fetchAPI<MyPlanInfo>('/me/plan');
}

/** Lista as vagas do próprio usuário autenticado (paginado) */
export async function getMyVagas(params?: VagaListParams): Promise<PaginatedResponse<Vaga>> {
  return fetchAPI<PaginatedResponse<Vaga>>(`/vagas/me${buildVagasQuery(params)}`);
}

/** Inicia o checkout de um plano (cria Subscription pendente) */
export async function createCheckout(
  plan: PlanTier,
  couponCode?: string
): Promise<CheckoutResult> {
  return fetchAPI<CheckoutResult>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan, ...(couponCode ? { couponCode } : {}) }),
  });
}

/** Confirma o pagamento (mock — ativa o plano imediatamente) */
export async function confirmSubscription(id: string): Promise<{ user: MyPlanInfo }> {
  return fetchAPI<{ user: MyPlanInfo }>(`/subscriptions/${id}/confirm`, {
    method: 'POST',
  });
}

export interface SubscriptionRecord {
  id: string;
  plan: PlanTier;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  priceBRL: number;
  couponCode: string | null;
  discountApplied: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Lista o histórico de assinaturas do usuário autenticado (mais recente primeiro) */
export async function listMySubscriptions(): Promise<SubscriptionRecord[]> {
  return fetchAPI<SubscriptionRecord[]>('/subscriptions/me');
}

/** Retorna o uso de vagas do usuário no ciclo atual */
export async function getMyVagaUsage(): Promise<VagaUsage> {
  return fetchAPI<VagaUsage>('/vagas/me/usage');
}

/** Publica uma vaga (POST /vagas/:id/publish — consome 1 slot do ciclo) */
export async function publishVaga(id: string): Promise<Vaga> {
  return fetchAPI<Vaga>(`/vagas/${id}/publish`, { method: 'POST' });
}

/** Despublica/encerra uma vaga (POST /vagas/:id/unpublish) */
export async function unpublishVaga(id: string): Promise<Vaga> {
  return fetchAPI<Vaga>(`/vagas/${id}/unpublish`, { method: 'POST' });
}

/** Lista cupons públicos ativos (sem autenticação) */
export async function listPublicActiveCoupons(): Promise<PublicCoupon[]> {
  return fetchAPI<PublicCoupon[]>('/coupons/public/active');
}

/** Retorna o cupom de indicação do usuário autenticado (cria se não existir) */
export async function getMyCoupon(): Promise<Coupon> {
  return fetchAPI<Coupon>('/me/coupon');
}

/** Valida um código de cupom publicamente */
export async function validateCouponCode(code: string): Promise<CouponValidationResult> {
  return fetchAPI<CouponValidationResult>(`/coupons/${encodeURIComponent(code)}/validate`);
}

/** [Admin] Lista redenções de cupons pendentes de validação */
export async function listPendingRedemptions(): Promise<CouponRedemption[]> {
  return fetchAPI<CouponRedemption[]>('/admin/coupons/redemptions?status=PENDING_VALIDATION');
}

/** [Admin] Valida uma redenção de cupom */
export async function validateRedemption(id: string): Promise<void> {
  return fetchAPI<void>(`/admin/coupons/redemptions/${id}/validate`, { method: 'POST' });
}

/** [Admin] Rejeita uma redenção de cupom */
export async function rejectRedemption(id: string): Promise<void> {
  return fetchAPI<void>(`/admin/coupons/redemptions/${id}/reject`, { method: 'POST' });
}

// ─── COMPANY (CLIENTES) ───────────────────────────────────────────────────────

export interface CompanyRecruiter {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  industry: string | null;
  description: string | null;
  ownerId: string;
  assignedRecruiters?: CompanyRecruiter[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyPayload {
  name: string;
  logoUrl?: string | null;
  industry?: string | null;
  description?: string | null;
}

export const companies = {
  list(): Promise<Company[]> {
    return fetchAPI<Company[]>('/companies');
  },
  get(id: string): Promise<Company> {
    return fetchAPI<Company>(`/companies/${id}`);
  },
  create(data: CompanyPayload): Promise<Company> {
    return fetchAPI<Company>('/companies', { method: 'POST', body: JSON.stringify(data) });
  },
  update(id: string, data: Partial<CompanyPayload>): Promise<Company> {
    return fetchAPI<Company>(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  remove(id: string): Promise<void> {
    return fetchAPI<void>(`/companies/${id}`, { method: 'DELETE' });
  },
  setRecruiters(id: string, recruiterIds: string[]): Promise<Company> {
    return fetchAPI<Company>(`/companies/${id}/recruiters`, {
      method: 'PATCH',
      body: JSON.stringify({ recruiterIds }),
    });
  },
};

// ─── TEAM & MEMBERS ───────────────────────────────────────────────────────────

export type TeamRole = 'OWNER' | 'MANAGER' | 'RECRUITER';
export type TeamMemberStatus = 'PENDING' | 'ACTIVE';

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string | null;
  invitedEmail?: string | null;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    username?: string | null;
    avatarUrl?: string | null;
  } | null;
  team?: { id: string; name: string };
  role: TeamRole;
  status: TeamMemberStatus;
  joinedAt: string;
}

export interface Team {
  id: string;
  name: string;
  ownerId: string;
  members?: TeamMember[];
}

export interface AccessibleTeam {
  id: string;
  name: string;
  ownerId: string;
  role: TeamRole;
}

export const team = {
  getMine(): Promise<Team> {
    return fetchAPI<Team>('/me/team');
  },
  /** All teams the user can act in (owned + active memberships) */
  listAccessible(): Promise<AccessibleTeam[]> {
    return fetchAPI<AccessibleTeam[]>('/me/team/accessible');
  },
  listMembers(): Promise<TeamMember[]> {
    return fetchAPI<TeamMember[]>('/me/team/members');
  },
  invite(data: { email: string; role: 'MANAGER' | 'RECRUITER' }): Promise<TeamMember> {
    return fetchAPI<TeamMember>('/me/team/invite', { method: 'POST', body: JSON.stringify(data) });
  },
  updateMember(id: string, data: { role: TeamRole }): Promise<TeamMember> {
    return fetchAPI<TeamMember>(`/me/team/members/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  removeMember(id: string): Promise<void> {
    return fetchAPI<void>(`/me/team/members/${id}`, { method: 'DELETE' });
  },
  listPendingInvites(): Promise<TeamMember[]> {
    return fetchAPI<TeamMember[]>('/me/team/invites/pending');
  },
  acceptInvite(memberId: string): Promise<TeamMember> {
    return fetchAPI<TeamMember>(`/me/team/accept/${memberId}`, { method: 'POST' });
  },
  rejectInvite(memberId: string): Promise<void> {
    return fetchAPI<void>(`/me/team/invites/${memberId}/reject`, { method: 'POST' });
  },
};

// ─── VAGAS ASSIGNMENT ─────────────────────────────────────────────────────────

export const vagasAssignment = {
  assign(vagaId: string, userId: string | null): Promise<Vaga> {
    return fetchAPI<Vaga>(`/vagas/${vagaId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ userId }),
    });
  },
};

// ─── PLAN LIMIT HELPERS ───────────────────────────────────────────────────────

/**
 * Type guard — detecta o shape PLAN_LIMIT_REACHED devolvido pelo backend
 */
export function isPlanLimitReachedError(
  err: unknown
): err is ApiException & { body: PlanLimitReachedBody } {
  if (!(err instanceof ApiException)) return false;
  if (err.statusCode !== 403) return false;
  const body = err.body;
  if (!body || typeof body !== 'object') return false;
  const msg = body['message'];
  if (msg && typeof msg === 'object') {
    return (msg as Record<string, unknown>)['code'] === 'PLAN_LIMIT_REACHED';
  }
  return false;
}

/**
 * Extrai o body PLAN_LIMIT_REACHED de uma ApiException com body aninhado
 */
export function extractPlanLimitBody(err: ApiException): PlanLimitReachedBody | null {
  if (err.statusCode !== 403 || !err.body) return null;
  const msg = err.body['message'];
  if (msg && typeof msg === 'object' && (msg as Record<string, unknown>)['code'] === 'PLAN_LIMIT_REACHED') {
    return msg as unknown as PlanLimitReachedBody;
  }
  return null;
}

/** Formata a mensagem de limite atingido em PT-BR */
export function formatPlanLimitMessage(body: PlanLimitReachedBody): string {
  const cycleEnd = new Date(body.cycleEnd).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return `Limite de ${body.limit} vaga${body.limit === 1 ? '' : 's'} atingido neste ciclo (${body.used}/${body.limit} usadas). O contador reinicia em ${cycleEnd}.`;
}

// ─── SAVED VAGAS ──────────────────────────────────────────────────────────────

export interface SavedVagaItem {
  id: string;
  vagaId: string;
  createdAt: string;
  vaga: Vaga;
}

export const savedVagas = {
  async list(): Promise<SavedVagaItem[]> {
    const res = await fetchAPI<SavedVagaItem[] | { data: SavedVagaItem[] }>('/me/saved-vagas?limit=20');
    return Array.isArray(res) ? res : (res?.data ?? []);
  },
  save(vagaId: string): Promise<SavedVagaItem> {
    return fetchAPI<SavedVagaItem>(`/vagas/${vagaId}/save`, { method: 'POST' });
  },
  unsave(vagaId: string): Promise<void> {
    return fetchAPI<void>(`/vagas/${vagaId}/save`, { method: 'DELETE' });
  },
};

// ─── SAVED FILTERS ────────────────────────────────────────────────────────────

export interface SavedFilterData {
  q?: string;
  segment?: VagaSegment | '';
  city?: string;
  type?: VagaType | '';
  workMode?: VagaWorkMode | '';
  salaryMin?: number | null;
  order?: 'recent' | 'relevance';
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: SavedFilterData;
  isDefault: boolean;
  position: number;
  createdAt: string;
}

export const savedFilters = {
  list(): Promise<SavedFilter[]> {
    return fetchAPI<SavedFilter[]>('/me/saved-filters');
  },
  create(data: { name: string; filters: SavedFilterData }): Promise<SavedFilter> {
    return fetchAPI<SavedFilter>('/me/saved-filters', { method: 'POST', body: JSON.stringify(data) });
  },
  update(id: string, data: Partial<{ name: string; filters: SavedFilterData }>): Promise<SavedFilter> {
    return fetchAPI<SavedFilter>(`/me/saved-filters/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete(id: string): Promise<void> {
    return fetchAPI<void>(`/me/saved-filters/${id}`, { method: 'DELETE' });
  },
  setDefault(id: string): Promise<SavedFilter> {
    return fetchAPI<SavedFilter>(`/me/saved-filters/${id}/default`, { method: 'POST' });
  },
};

// ─── RADAR DE VAGAS ───────────────────────────────────────────────────────────

export interface RadarSearchParams {
  q?: string;
  segment?: VagaSegment | '';
  city?: string;
  type?: VagaType | '';
  workMode?: VagaWorkMode | '';
  salaryMin?: number;
  order?: 'recent' | 'relevance';
  page?: number;
  limit?: number;
}

export const radar = {
  search(params: RadarSearchParams): Promise<PaginatedResponse<Vaga>> {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const query = qs.toString() ? `?${qs}` : '';
    return fetchAPI<PaginatedResponse<Vaga>>(`/vagas/radar${query}`);
  },
};

// ─── HUNTER INTERESTS ─────────────────────────────────────────────────────────

export type HunterInterestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface HunterInterest {
  id: string;
  vagaId: string;
  hunterUserId: string;
  status: HunterInterestStatus;
  createdAt: string;
  vaga?: Vaga;
  hunter?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    username?: string | null;
    avatarUrl?: string | null;
  };
}

export const hunterInterests = {
  /** Registra interesse como hunter na vaga (409 se duplicado) */
  create(vagaId: string): Promise<HunterInterest> {
    return fetchAPI<HunterInterest>(`/vagas/${vagaId}/hunter-interest`, { method: 'POST' });
  },
  /** Lista meus interesses como hunter (com join na vaga) */
  listMine(): Promise<HunterInterest[]> {
    return fetchAPI<HunterInterest[]>('/me/hunter-interests');
  },
  /** [Dono da vaga] Lista hunters interessados em uma vaga */
  listByVaga(vagaId: string): Promise<HunterInterest[]> {
    return fetchAPI<HunterInterest[]>(`/vagas/${vagaId}/hunter-interests`);
  },
  /** [Dono da vaga] Aceita ou rejeita um hunter interessado */
  respond(vagaId: string, hunterId: string, status: 'ACCEPTED' | 'REJECTED'): Promise<HunterInterest> {
    return fetchAPI<HunterInterest>(`/vagas/${vagaId}/hunter-interests/${hunterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};

// ─── PROFILE CONTEXT (Hunter multi-empresa) ───────────────────────────────────

export const profile = {
  /** Define o contexto ativo do hunter (team ou pessoal) */
  setActiveContext(teamId: string | null): Promise<FullProfile> {
    return fetchAPI<FullProfile>('/profile/me/active-context', {
      method: 'PATCH',
      body: JSON.stringify({ teamId }),
    });
  },
};

// ─── APPLICATIONS ─────────────────────────────────────────────────────────────

/** Entrada de histórico de etapa do processo seletivo */
export interface StageHistoryEntry {
  id?: string;
  stage: string;
  enteredAt: string;
  byUserId?: string;
  byUserName?: string;
  note?: string | null;
}

/** Observações e nota de uma etapa específica */
export interface StageNote {
  observacoes?: string | null;
  nota?: number | null;
}

/** Link de compartilhamento de processo */
export interface ProcessShareLink {
  id: string;
  token: string;
  url: string;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  createdBy?: { id: string; firstName: string; lastName: string } | null;
}

/** Snapshot público de um processo (retornado por GET /public/processo/:token) */
export interface PublicProcessSnapshot {
  applicationId: string;
  candidate: {
    fullName: string;
    email: string;
    phone?: string | null;
    location?: string | null;
    avatarUrl?: string | null;
    username?: string | null;
    profession?: string | null;
  };
  vaga: {
    title: string;
    segment?: string | null;
    location?: string | null;
  };
  currentStage: string | null;
  generalScore?: number | null;
  generalNote?: string | null;
  stageNotes?: Record<string, StageNote>;
  stageHistory: StageHistoryEntry[];
  createdBy?: { id: string; firstName: string; lastName: string } | null;
  shareToken: string;
}

export const applications = {
  /** Candidato remove a própria candidatura */
  remove(id: string): Promise<void> {
    return fetchAPI<void>(`/applications/${id}`, { method: 'DELETE' });
  },

  /** Atualiza nota geral e/ou anotação geral de uma candidatura */
  updateGeneral(id: string, body: { generalScore?: number | null; generalNote?: string | null }): Promise<void> {
    return fetchAPI<void>(`/applications/${id}/general`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  /** Atualiza observações e/ou nota de uma etapa específica */
  updateStageNotes(id: string, stageKey: string, body: { observacoes?: string | null; nota?: number | null }): Promise<void> {
    return fetchAPI<void>(`/applications/${id}/stage-notes/${encodeURIComponent(stageKey)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  /** Retorna o histórico de etapas de uma candidatura */
  history(id: string): Promise<StageHistoryEntry[]> {
    return fetchAPI<StageHistoryEntry[]>(`/applications/${id}/history`);
  },

  /** Gera um link de compartilhamento público */
  share(id: string, expiresInDays?: number): Promise<ProcessShareLink> {
    return fetchAPI<ProcessShareLink>(`/applications/${id}/share`, {
      method: 'POST',
      body: JSON.stringify(expiresInDays != null ? { expiresInDays } : {}),
    });
  },

  /** Revoga um link de compartilhamento */
  revokeShare(id: string, token: string): Promise<void> {
    return fetchAPI<void>(`/applications/${id}/share/${token}`, { method: 'DELETE' });
  },

  /** Retorna a URL completa para download do PDF de processo */
  pdfUrl(id: string): string {
    return `${getBackendUrl()}/applications/${id}/pdf`;
  },
};

// ─── PUBLIC PROCESSO ──────────────────────────────────────────────────────────

export const publicProcesso = {
  /** Carrega snapshot público de um processo pelo token */
  get(token: string): Promise<PublicProcessSnapshot> {
    return fetchAPI<PublicProcessSnapshot>(`/public/processo/${token}`);
  },
};

// ─── ERROR MESSAGES ───────────────────────────────────────────────────────────

/**
 * Mapear erros da API para mensagens amigáveis em português
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiException) {
    const { statusCode, message, error: errorType } = error;

    // Erros específicos
    if (statusCode === 401) {
      if (message.toLowerCase().includes('credentials')) {
        return 'Email ou senha incorretos';
      }
      if (message.toLowerCase().includes('provider')) {
        return 'Esta conta usa autenticação via Google ou LinkedIn';
      }
      return 'Não autorizado. Faça login novamente.';
    }

    if (statusCode === 400) {
      if (message.toLowerCase().includes('exists') || message.toLowerCase().includes('already')) {
        return 'Este email já está registrado';
      }
      return message;
    }

    if (statusCode === 404) {
      return 'Recurso não encontrado';
    }

    if (statusCode === 500) {
      return 'Erro no servidor. Tente novamente em alguns instantes.';
    }

    if (statusCode === 0) {
      return message; // Já vem com mensagem de erro de rede
    }

    return message;
  }

  // Erro desconhecido
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
