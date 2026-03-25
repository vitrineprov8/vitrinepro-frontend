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
    public error?: string
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

      try {
        const errorData: ApiError = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetail = errorData.error || '';
      } catch {
        // Se não conseguir parsear JSON, usar mensagem padrão
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiException(response.status, errorMessage, errorDetail);
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
  password: string
): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, firstName, lastName, password }),
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
  type: 'UNIVERSITY' | 'COURSE' | 'DIPLOMA' | 'CERTIFICATION';
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
  username?: string; profession?: string; bio?: string;
  phone?: string; website?: string; location?: string;
  bannerColor?: string;
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
  title: string; description: string; subtitle?: string; content?: any;
  clientName?: string; year?: number; duration?: string; role?: string;
  projectStatus?: string; status?: string; externalUrl?: string; tagIds?: string[];
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
