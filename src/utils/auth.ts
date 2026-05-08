/**
 * Utilidades de autenticação
 * Gerenciamento de tokens JWT e estado de autenticação
 */

const TOKEN_KEY = 'token';

/**
 * Salvar token no localStorage
 */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Obter token do localStorage
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Remover token do localStorage (logout)
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Verificar se o usuário está autenticado
 * (tem um token válido no localStorage)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Interface para dados decodificados do JWT
 */
export interface JWTPayload {
  sub: string;
  email: string;
  role?: 'USER' | 'ADMIN';
  iat: number;
  exp: number;
  [key: string]: any;
}

/**
 * Decodificar JWT (básico, sem validação de assinatura)
 * Apenas para obter dados do usuário no cliente
 * IMPORTANTE: Nunca confie apenas nesta validação, o backend sempre valida
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Obter dados do usuário do token JWT armazenado
 */
export function getUserFromToken(): JWTPayload | null {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
}

/**
 * Verifica se o usuário autenticado tem role ADMIN
 */
export function isAdmin(): boolean {
  return getUserFromToken()?.role === 'ADMIN';
}

/**
 * Redirecionar para página de login
 */
export function redirectToLogin(returnUrl?: string): void {
  if (typeof window === 'undefined') return;

  const url = returnUrl
    ? `/login?redirect=${encodeURIComponent(returnUrl)}`
    : '/login';

  window.location.href = url;
}

/**
 * Redirecionar para dashboard ou URL especificada
 */
export function redirectAfterLogin(): void {
  if (typeof window === 'undefined') return;

  // Verificar se há URL de retorno nos query params
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect');

  if (redirectUrl) {
    window.location.href = redirectUrl;
  } else {
    window.location.href = '/dashboard';
  }
}

/**
 * Fazer logout e redirecionar para home
 * 
 */
export function logout(): void {
  removeToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Verificar se o token está expirado
 * NOTA: Esta verificação é apenas client-side, o backend sempre valida
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;

  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;

  // Verificar se o timestamp de expiração já passou
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}
