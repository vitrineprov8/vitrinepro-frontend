// Mock data — frontend only, no backend wired up yet.
// Estos arrays simulan la respuesta del backend para el módulo de recrutamento.

export type PipelineStage =
  | 'para_analisar'
  | 'analisados'
  | 'abordados'
  | 'entrevista_recrutador'
  | 'entrevista_rh'
  | 'entrevista_gestor'
  | 'entrevista_final'
  | 'rejeitado'
  | 'contratado';

export interface MockCandidate {
  id: string;
  fullName: string;
  initials: string;
  role: string;
  location: string;
  appliedAt: string;            // ISO date
  stage: PipelineStage;
  stageNote?: string;            // pequena nota tipo "Agendado 15/05"
  tags: string[];
  rating?: number;               // 0–5
  email: string;
  phone: string;
  about: string;
  // Recruiter-side extras (filled when the application comes from the real API)
  userId?: string;
  username?: string;
  avatarUrl?: string;
  applicationCv?: { id: string; label: string; fileUrl: string } | null;
}

export interface MockVaga {
  id: string;
  title: string;
  client: string;
  location: string;
  openedAt: string;              // ISO date
  deadline: string;
  status: 'publicada' | 'rascunho' | 'encerrada';
  applicantsCount: number;
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  para_analisar: 'Para analisar',
  analisados: 'Analisados',
  abordados: 'Abordados',
  entrevista_recrutador: 'Entrev. recrutador',
  entrevista_rh: 'Entrev. RH',
  entrevista_gestor: 'Entrev. gestor',
  entrevista_final: 'Entrev. final',
  rejeitado: 'Rejeitado',
  contratado: 'Contratado',
};

export const VISIBLE_STAGES: PipelineStage[] = [
  'para_analisar',
  'analisados',
  'abordados',
  'entrevista_recrutador',
  'entrevista_rh',
  'entrevista_gestor',
  'entrevista_final',
];

export const MOCK_METRICS = {
  contratadas: 5,
  publicadas: 1,
  disponiveis: 4,
  encerradas: 4,
  contratadasTrend: 2,          // delta semana
};

export const MOCK_VAGAS: MockVaga[] = [
  {
    id: 'v-001',
    title: 'Desenvolvedor frontend',
    client: 'Empresa ABC',
    location: 'Curitiba',
    openedAt: '2026-05-10',
    deadline: '2026-05-30',
    status: 'publicada',
    applicantsCount: 9,
  },
  {
    id: 'v-002',
    title: 'Product manager',
    client: 'Empresa ABC',
    location: 'Curitiba',
    openedAt: '2026-05-05',
    deadline: '2026-06-15',
    status: 'publicada',
    applicantsCount: 4,
  },
  {
    id: 'v-003',
    title: 'Analista de dados',
    client: 'DataPrd',
    location: 'Curitiba',
    openedAt: '2026-04-20',
    deadline: '2026-06-30',
    status: 'publicada',
    applicantsCount: 12,
  },
  {
    id: 'v-004',
    title: 'Coordenador de TI',
    client: 'Empresa AY',
    location: 'Remoto',
    openedAt: '2026-03-13',
    deadline: '2026-06-01',
    status: 'publicada',
    applicantsCount: 2,
  },
  {
    id: 'v-005',
    title: 'Product Owner',
    client: 'Empresa ABC',
    location: 'Curitiba',
    openedAt: '2026-05-10',
    deadline: '2026-06-10',
    status: 'rascunho',
    applicantsCount: 0,
  },
  {
    id: 'v-006',
    title: 'Especialista hardware',
    client: 'Security Inc',
    location: 'Curitiba',
    openedAt: '2026-01-01',
    deadline: '2026-06-30',
    status: 'publicada',
    applicantsCount: 1,
  },
];

export const MOCK_CANDIDATES: MockCandidate[] = [
  {
    id: 'c-001',
    fullName: 'Andres Miguel',
    initials: 'AM',
    role: 'Frontend developer',
    location: 'Curitiba, PR',
    appliedAt: '2026-05-11',
    stage: 'para_analisar',
    tags: ['Vue 3', 'TypeScript', 'Tiptap'],
    rating: 4.5,
    email: 'andres@example.com',
    phone: '+55 41 99999-1111',
    about: 'Desenvolvedor frontend com 5 anos de experiência em Vue e arquitetura de design systems.',
  },
  {
    id: 'c-002',
    fullName: 'Lucas Carvalho',
    initials: 'LC',
    role: 'Frontend developer',
    location: 'São Paulo, SP',
    appliedAt: '2026-05-10',
    stage: 'para_analisar',
    tags: ['React', 'Next.js', 'CSS'],
    rating: 4.0,
    email: 'lucas@example.com',
    phone: '+55 11 99999-2222',
    about: 'Especialista em performance web e Core Web Vitals.',
  },
  {
    id: 'c-003',
    fullName: 'Juliana Neves',
    initials: 'JN',
    role: 'Frontend developer',
    location: 'Curitiba, PR',
    appliedAt: '2026-05-09',
    stage: 'para_analisar',
    tags: ['Vue 3', 'Pinia', 'Vitest'],
    rating: 4.2,
    email: 'juliana@example.com',
    phone: '+55 41 99999-3333',
    about: 'Engenheira de software com foco em qualidade e testes automatizados.',
  },
  {
    id: 'c-004',
    fullName: 'Rogério Culpi',
    initials: 'RC',
    role: 'Senior frontend',
    location: 'Curitiba, PR',
    appliedAt: '2026-05-08',
    stage: 'analisados',
    stageNote: 'Match score 87%',
    tags: ['Vue', 'Astro', 'TypeScript'],
    rating: 4.7,
    email: 'rogerio@example.com',
    phone: '+55 41 99999-4444',
    about: 'Líder técnico com experiência em times distribuídos.',
  },
  {
    id: 'c-005',
    fullName: 'Thiago Santos',
    initials: 'TS',
    role: 'Frontend developer',
    location: 'Rio de Janeiro, RJ',
    appliedAt: '2026-05-07',
    stage: 'analisados',
    tags: ['Angular', 'RxJS'],
    rating: 3.8,
    email: 'thiago@example.com',
    phone: '+55 21 99999-5555',
    about: 'Profissional sólido em ecossistema Angular.',
  },
  {
    id: 'c-006',
    fullName: 'Bruno Gonçalves',
    initials: 'BG',
    role: 'Frontend developer',
    location: 'Curitiba, PR',
    appliedAt: '2026-05-06',
    stage: 'abordados',
    stageNote: 'Aguardando resposta',
    tags: ['Vue', 'Nuxt'],
    rating: 4.1,
    email: 'bruno@example.com',
    phone: '+55 41 99999-6666',
    about: 'Engenheiro full-stack com forte experiência em Nuxt.',
  },
  {
    id: 'c-007',
    fullName: 'Carla Almeida',
    initials: 'CA',
    role: 'Frontend developer',
    location: 'Florianópolis, SC',
    appliedAt: '2026-05-05',
    stage: 'abordados',
    stageNote: 'Resposta recebida',
    tags: ['Svelte', 'TypeScript'],
    rating: 4.3,
    email: 'carla@example.com',
    phone: '+55 48 99999-7777',
    about: 'Apaixonada por DX e ferramentas modernas.',
  },
  {
    id: 'c-008',
    fullName: 'João Pedro',
    initials: 'JP',
    role: 'Frontend developer',
    location: 'Curitiba, PR',
    appliedAt: '2026-05-03',
    stage: 'entrevista_recrutador',
    stageNote: 'Agendado 15/05',
    tags: ['Vue', 'GraphQL'],
    rating: 4.4,
    email: 'joao@example.com',
    phone: '+55 41 99999-8888',
    about: 'Experiência em APIs GraphQL e Apollo Client.',
  },
  {
    id: 'c-009',
    fullName: 'Victor Gabriel',
    initials: 'VG',
    role: 'Frontend developer',
    location: 'Belo Horizonte, MG',
    appliedAt: '2026-05-01',
    stage: 'entrevista_rh',
    stageNote: 'Realizada 13/05',
    tags: ['React', 'Redux'],
    rating: 4.6,
    email: 'victor@example.com',
    phone: '+55 31 99999-9999',
    about: 'Forte em arquitetura de aplicações React em larga escala.',
  },
  {
    id: 'c-010',
    fullName: 'Marcela Mendes',
    initials: 'MM',
    role: 'Frontend developer',
    location: 'Porto Alegre, RS',
    appliedAt: '2026-04-28',
    stage: 'entrevista_gestor',
    stageNote: 'A confirmar',
    tags: ['Vue', 'Quasar'],
    rating: 4.8,
    email: 'marcela@example.com',
    phone: '+55 51 99999-0000',
    about: 'Especialista em mobile-first e PWAs.',
  },
];

export const MOCK_SUBSCRIPTION_HISTORY = [
  { id: 's-001', plan: 'Hunter', date: '2026-05-11', amount: 'R$ 99,00', status: 'pending' as const },
  { id: 's-002', plan: 'Hunter', date: '2026-04-11', amount: 'R$ 99,00', status: 'paid' as const },
  { id: 's-003', plan: 'Personal', date: '2026-03-11', amount: 'R$ 49,00', status: 'paid' as const },
];

export const MOCK_INDICACAO = {
  code: 'ANDRES2026',
  uses: 3,
  rewardMonths: 3,
};

// Helpers
export function daysSince(iso: string): number {
  const start = new Date(iso).getTime();
  const today = new Date('2026-05-14').getTime();
  return Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
}

export function ageBucket(days: number): 'fresh' | 'recent' | 'normal' | 'warn' | 'late' | 'critical' {
  if (days <= 5) return 'fresh';
  if (days <= 15) return 'recent';
  if (days <= 30) return 'normal';
  if (days <= 60) return 'warn';
  if (days <= 90) return 'late';
  return 'critical';
}

// Color del avatar derivado del hash de las iniciales
const AVATAR_PALETTE = [
  { bg: '#B5D4F4', fg: '#042C53' },  // blue
  { bg: '#9FE1CB', fg: '#04342C' },  // teal
  { bg: '#F4C0D1', fg: '#4B1528' },  // pink
  { bg: '#CECBF6', fg: '#26215C' },  // purple
  { bg: '#FAC775', fg: '#412402' },  // amber
  { bg: '#F5C4B3', fg: '#4A1B0C' },  // coral
  { bg: '#C0DD97', fg: '#173404' },  // green
];

export function avatarColor(seed: string): { bg: string; fg: string } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]!;
}
