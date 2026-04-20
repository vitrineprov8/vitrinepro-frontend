import type { FullProfile } from './api';

export type ActionType =
  | 'EU_QUERO'
  | 'AGENDAR'
  | 'SAIBA_MAIS'
  | 'CONVERSAR'
  | 'WHATSAPP'
  | 'VEJA_SITE';

const MESSAGES: Record<ActionType, string> = {
  EU_QUERO:   'Olá, estou no site Vitrinepro e quero contratar seus serviços',
  AGENDAR:    'Olá, estou no site Vitrinepro e quero Agendar seus serviços',
  SAIBA_MAIS: 'Olá, estou no site Vitrinepro e quero Saber mais sobre seus serviços',
  CONVERSAR:  'Olá, estou no site Vitrinepro e quero Saber mais sobre seus serviços',
  WHATSAPP:   'Olá, estou no site Vitrinepro e quero Saber mais sobre seus serviços',
  VEJA_SITE:  '',
};

const LABELS: Record<ActionType, string> = {
  EU_QUERO:   'EU QUERO',
  AGENDAR:    'AGENDAR',
  SAIBA_MAIS: 'SABER MAIS',
  CONVERSAR:  'CONVERSAR',
  WHATSAPP:   'WHATSAPP',
  VEJA_SITE:  'VER SITE',
};

/**
 * Normaliza el string del backend (ej "SABER MAIS", "Eu quero", "saiba_mais")
 * al ActionType del enum. Fallback a SAIBA_MAIS.
 */
export function normalizeAction(raw?: string | null): ActionType {
  if (!raw) return 'SAIBA_MAIS';
  const key = raw.trim().toUpperCase().replace(/\s+/g, '_').replace(/Ã|Á|Â|À/g, 'A');
  // Mapeos de variantes comunes
  const map: Record<string, ActionType> = {
    EU_QUERO: 'EU_QUERO',
    QUERO: 'EU_QUERO',
    AGENDAR: 'AGENDAR',
    AGENDAMENTO: 'AGENDAR',
    SAIBA_MAIS: 'SAIBA_MAIS',
    SABER_MAIS: 'SAIBA_MAIS',
    CONVERSAR: 'CONVERSAR',
    WHATSAPP: 'WHATSAPP',
    VEJA_SITE: 'VEJA_SITE',
    VER_SITE: 'VEJA_SITE',
  };
  return map[key] ?? 'SAIBA_MAIS';
}

export function labelForAction(raw?: string | null): string {
  return LABELS[normalizeAction(raw)];
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

function whatsappUrl(phone: string, message: string): string {
  let digits = digitsOnly(phone);
  // Si no empieza con código de país, asumir Brasil (55)
  if (digits && !digits.startsWith('55') && digits.length <= 11) {
    digits = '55' + digits;
  }
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function mailtoUrl(email: string, message: string): string {
  const subject = 'Contato via VitrinePro';
  const params = new URLSearchParams();
  params.set('subject', subject);
  if (message) params.set('body', message);
  return `mailto:${email}?${params.toString()}`;
}

export interface ContactTarget {
  href: string;
  target: string;
  rel?: string;
  /** 'whatsapp' | 'email' | 'website' | 'none' */
  channel: 'whatsapp' | 'email' | 'website' | 'none';
}

/**
 * Decide el canal a abrir según el CTA y el profile.
 * Prioridad: WhatsApp > Email. VEJA_SITE abre website.
 */
export function buildContactAction(
  action: ActionType | string | null | undefined,
  profile: Pick<FullProfile, 'phone' | 'email' | 'website'>
): ContactTarget {
  const type = typeof action === 'string' ? normalizeAction(action) : (action ?? 'SAIBA_MAIS');

  if (type === 'VEJA_SITE') {
    if (profile.website) {
      return { href: profile.website, target: '_blank', rel: 'noopener noreferrer', channel: 'website' };
    }
    return { href: '#', target: '_self', channel: 'none' };
  }

  const message = MESSAGES[type];

  if (profile.phone) {
    return { href: whatsappUrl(profile.phone, message), target: '_blank', rel: 'noopener noreferrer', channel: 'whatsapp' };
  }
  if (profile.email) {
    return { href: mailtoUrl(profile.email, message), target: '_self', channel: 'email' };
  }
  return { href: '#', target: '_self', channel: 'none' };
}
