<template>
  <Modal :visible="visible" title="Compartilhar processo" @close="emit('close')">
    <Toast ref="toast" />

    <div class="spm-body">
      <p class="spm-help">
        Gere um PDF com todos os dados deste candidato (perfil, contatos, redes, curriculos, notas e historico)
        ou copie um link compartilhavel.
      </p>

      <!-- Acoes principais -->
      <div class="spm-primary-actions">
        <button type="button" class="spm-btn spm-btn--primary" @click="generatePdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          Baixar PDF
        </button>
        <button type="button" class="spm-btn spm-btn--ghost" @click="copyText">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copiar resumo
        </button>
        <a
          :href="whatsappHref"
          target="_blank"
          rel="noopener"
          class="spm-btn spm-btn--whatsapp"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
          WhatsApp
        </a>
      </div>

      <!-- Em breve: link publico -->
      <div class="spm-soon">
        <span class="spm-soon-badge">Em breve</span>
        <span>Gerar link publico</span>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from '../ui/Modal.vue';
import Toast from '../ui/Toast.vue';
import { applications, type ProcessShareLink, type PipelineStage, type CV } from '../../utils/api';
import type { MockCandidate } from '../../data/mock-recrutador';

type SocialEntry = { key: string; label: string; url: string };

const props = defineProps<{
  visible: boolean;
  applicationId: string;
  candidate: MockCandidate;
  stages: PipelineStage[];
  generalScore?: number | string | null;
  generalNote?: string | null;
  socialLinks?: SocialEntry[];
  allCvs?: CV[];
  profileUrl?: string;
  stageLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const toast = ref<InstanceType<typeof Toast>>();

const isMock = computed(() => props.applicationId.startsWith('mock-'));

// ── Link generation (backend) ────────────────────────────────────────────────
const expiresInDays = ref<number>(30);
const generating = ref(false);
const generatedLink = ref<ProcessShareLink | null>(null);

async function generateLink() {
  if (generating.value || isMock.value) return;
  generating.value = true;
  try {
    const link = await applications.share(props.applicationId, expiresInDays.value);
    generatedLink.value = link;
    toast.value?.show('Link gerado', 'success');
  } catch {
    toast.value?.show('Erro ao gerar link', 'error');
  } finally {
    generating.value = false;
  }
}

async function copyLink(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.value?.show('Link copiado', 'success');
  } catch {
    toast.value?.show('Nao foi possivel copiar', 'warning');
  }
}

// ── WhatsApp ──────────────────────────────────────────────────────────────────
const whatsappHref = computed(() => {
  const c = props.candidate;
  const stage = props.stageLabel || '';
  const lines = [
    `Processo seletivo - ${c.fullName}`,
    c.role ? `Cargo: ${c.role}` : '',
    c.location ? `Localizacao: ${c.location}` : '',
    stage ? `Etapa atual: ${stage}` : '',
    props.generalScore ? `Nota geral: ${props.generalScore}` : '',
    c.email ? `Email: ${c.email}` : '',
    c.phone ? `Telefone: ${c.phone}` : '',
    props.profileUrl ? `Perfil: ${props.profileUrl}` : '',
  ].filter(Boolean);
  return `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
});

// ── Copiar resumo (texto) ────────────────────────────────────────────────────
async function copyText() {
  const text = buildSummaryText();
  try {
    await navigator.clipboard.writeText(text);
    toast.value?.show('Resumo copiado', 'success');
  } catch {
    toast.value?.show('Nao foi possivel copiar', 'warning');
  }
}

function buildSummaryText(): string {
  const c = props.candidate;
  const entries = loadEntries();
  const parts: string[] = [];
  parts.push(`=== PROCESSO SELETIVO: ${c.fullName} ===`);
  if (c.role) parts.push(`Cargo: ${c.role}`);
  if (c.location) parts.push(`Localizacao: ${c.location}`);
  if (props.stageLabel) parts.push(`Etapa atual: ${props.stageLabel}`);
  if (props.generalScore) parts.push(`Nota geral: ${props.generalScore}`);
  parts.push('');
  parts.push('--- CONTATO ---');
  parts.push(`Email: ${c.email}`);
  if (c.phone) parts.push(`Telefone: ${c.phone}`);
  if (props.profileUrl) parts.push(`Perfil: ${props.profileUrl}`);
  if (props.socialLinks?.length) {
    parts.push('');
    parts.push('--- REDES SOCIAIS ---');
    props.socialLinks.forEach((s) => parts.push(`${s.label}: ${s.url}`));
  }
  if (props.generalNote) {
    parts.push('');
    parts.push('--- ANOTACAO GERAL ---');
    parts.push(props.generalNote);
  }
  if (entries.length > 0) {
    parts.push('');
    parts.push('--- HISTORICO DE NOTAS ---');
    entries.forEach((e) => {
      const stageLbl = props.stages.find((s) => s.id === e.stage)?.label || e.stage;
      const date = formatDateTime(e.createdAt);
      parts.push(`[${stageLbl}] ${date}${e.nota != null ? ` - Nota: ${e.nota}` : ''}`);
      if (e.observacoes) parts.push(e.observacoes);
      parts.push('');
    });
  }
  return parts.join('\n');
}

// ── PDF generation (client-side via window.print) ────────────────────────────
function generatePdf() {
  const html = buildPrintableHtml();
  const win = window.open('', '_blank', 'width=900,height=1100');
  if (!win) {
    toast.value?.show('Permita popups para gerar o PDF', 'warning');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  // Aguardar imagens carregarem antes de imprimir
  const triggerPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* ignore */
    }
  };
  win.onload = () => setTimeout(triggerPrint, 250);
  // Fallback caso onload nao dispare
  setTimeout(() => {
    if (win && !win.closed) triggerPrint();
  }, 1500);
}

interface NoteEntry {
  stage: string;
  observacoes: string;
  nota: number | null;
  createdAt: string;
}

function loadEntries(): NoteEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`vp:cph-entries:${props.applicationId}`);
    return raw ? (JSON.parse(raw) as NoteEntry[]) : [];
  } catch {
    return [];
  }
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function buildPrintableHtml(): string {
  const c = props.candidate;
  const entries = loadEntries();
  const generatedAt = new Date().toLocaleString('pt-BR');
  const stageLbl = props.stageLabel || c.stage;
  const avgLine = props.generalScore ? `<div class="pdf-score">Nota geral: <strong>${escapeHtml(String(props.generalScore))}</strong></div>` : '';

  const avatarHtml = c.avatarUrl
    ? `<img src="${escapeHtml(c.avatarUrl)}" class="pdf-avatar" alt="" crossorigin="anonymous" />`
    : `<div class="pdf-avatar pdf-avatar--fallback">${escapeHtml(c.initials)}</div>`;

  const socialItems = (props.socialLinks ?? [])
    .map((s) => `<li><a href="${escapeHtml(s.url)}">${escapeHtml(s.label)}</a> — ${escapeHtml(s.url)}</li>`)
    .join('');

  const cvItems = (props.allCvs ?? [])
    .map((cv) => `<li><a href="${escapeHtml(cv.fileUrl)}">${escapeHtml(cv.label)}</a></li>`)
    .join('');

  const tagItems = c.tags.map((t) => `<span class="pdf-tag">${escapeHtml(t)}</span>`).join('');

  const entriesHtml = entries.length
    ? entries
        .map((e) => {
          const lbl = escapeHtml(props.stages.find((s) => s.id === e.stage)?.label || e.stage);
          const notaBadge = e.nota != null ? `<span class="pdf-entry-nota">${Number(e.nota).toFixed(1)}</span>` : '';
          const obs = e.observacoes ? `<p class="pdf-entry-obs">${escapeHtml(e.observacoes).replace(/\n/g, '<br>')}</p>` : '';
          return `<div class="pdf-entry">
            <div class="pdf-entry-head">
              <span class="pdf-entry-stage">${lbl}</span>
              <span class="pdf-entry-date">${escapeHtml(formatDateTime(e.createdAt))}</span>
              ${notaBadge}
            </div>
            ${obs}
          </div>`;
        })
        .join('')
    : '<p class="pdf-empty">Nenhuma nota registrada.</p>';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Processo seletivo - ${escapeHtml(c.fullName)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1f2937;
    max-width: 760px;
    margin: 0 auto;
    padding: 32px 28px;
    line-height: 1.5;
    font-size: 13px;
  }
  h1 { font-size: 22px; margin: 0; color: #111827; }
  h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #6b7280;
    margin: 22px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
  }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .pdf-header {
    display: flex;
    gap: 16px;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 2px solid #2563eb;
  }
  .pdf-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    background: #e5e7eb;
    flex-shrink: 0;
  }
  .pdf-avatar--fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 22px;
    color: #374151;
  }
  .pdf-header-info { flex: 1; min-width: 0; }
  .pdf-meta { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .pdf-stage-badge {
    display: inline-block;
    padding: 3px 10px;
    background: #dbeafe;
    color: #1d4ed8;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    margin-top: 6px;
  }
  .pdf-score {
    margin-top: 6px;
    font-size: 13px;
    color: #374151;
  }
  .pdf-score strong { color: #2563eb; font-size: 16px; }
  ul.pdf-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  ul.pdf-list li {
    padding: 4px 0;
    font-size: 12px;
  }
  dl.pdf-dl {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 4px 12px;
    margin: 0;
    font-size: 12px;
  }
  dl.pdf-dl dt { color: #6b7280; }
  dl.pdf-dl dd { margin: 0; color: #111827; word-break: break-word; }
  .pdf-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .pdf-tag {
    font-size: 11px;
    padding: 3px 9px;
    background: #f3f4f6;
    color: #4b5563;
    border-radius: 999px;
  }
  .pdf-message {
    margin: 0;
    padding: 10px 12px;
    background: #f9fafb;
    border-left: 3px solid #2563eb;
    border-radius: 4px;
    white-space: pre-wrap;
    font-size: 12px;
  }
  .pdf-entry {
    padding: 10px 12px;
    margin-bottom: 8px;
    background: #f9fafb;
    border-left: 3px solid #2563eb;
    border-radius: 4px;
    page-break-inside: avoid;
  }
  .pdf-entry-head {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 4px;
  }
  .pdf-entry-stage {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    background: #dbeafe;
    color: #1d4ed8;
    border-radius: 999px;
    text-transform: uppercase;
  }
  .pdf-entry-date { font-size: 11px; color: #6b7280; }
  .pdf-entry-nota {
    margin-left: auto;
    font-size: 11px;
    font-weight: 700;
    color: #2563eb;
    background: #fff;
    padding: 2px 9px;
    border-radius: 999px;
    border: 1px solid #dbeafe;
  }
  .pdf-entry-obs {
    font-size: 12px;
    color: #1f2937;
    margin: 4px 0 0;
    line-height: 1.45;
  }
  .pdf-empty {
    font-size: 12px;
    color: #9ca3af;
    font-style: italic;
    margin: 0;
  }
  .pdf-footer {
    margin-top: 36px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    font-size: 10px;
    color: #9ca3af;
    text-align: center;
  }
  @media print {
    body { padding: 16px; }
    .pdf-header { border-color: #2563eb; }
    a { color: #2563eb; }
  }
</style>
</head>
<body>
  <div class="pdf-header">
    ${avatarHtml}
    <div class="pdf-header-info">
      <h1>${escapeHtml(c.fullName)}</h1>
      <div class="pdf-meta">
        ${c.role ? escapeHtml(c.role) : ''}${c.role && c.location ? ' · ' : ''}${c.location ? escapeHtml(c.location) : ''}
      </div>
      <div class="pdf-stage-badge">${escapeHtml(stageLbl)}</div>
      ${avgLine}
    </div>
  </div>

  <h2>Contato</h2>
  <dl class="pdf-dl">
    <dt>Email</dt><dd><a href="mailto:${escapeHtml(c.email)}">${escapeHtml(c.email)}</a></dd>
    ${c.phone ? `<dt>Telefone</dt><dd><a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a></dd>` : ''}
    ${props.profileUrl ? `<dt>Perfil VitrinePro</dt><dd><a href="${escapeHtml(props.profileUrl)}">${escapeHtml(props.profileUrl)}</a></dd>` : ''}
    <dt>Data candidatura</dt><dd>${escapeHtml(formatDate(c.appliedAt))}</dd>
  </dl>

  ${socialItems ? `<h2>Redes sociais</h2><ul class="pdf-list">${socialItems}</ul>` : ''}

  ${tagItems ? `<h2>Habilidades</h2><div class="pdf-tags">${tagItems}</div>` : ''}

  ${c.about ? `<h2>Mensagem do candidato</h2><p class="pdf-message">${escapeHtml(c.about)}</p>` : ''}

  ${props.generalNote ? `<h2>Anotacao geral</h2><p class="pdf-message">${escapeHtml(props.generalNote)}</p>` : ''}

  <h2>Historico de notas (${entries.length})</h2>
  ${entriesHtml}

  ${cvItems ? `<h2>Curriculos</h2><ul class="pdf-list">${cvItems}</ul>` : ''}

  <div class="pdf-footer">
    Documento gerado em ${escapeHtml(generatedAt)} · VitrinePro
  </div>
</body>
</html>`;
}

// Reset quando abre
watch(
  () => props.visible,
  (v) => {
    if (v) {
      generatedLink.value = null;
    }
  }
);
</script>

<style scoped>
.spm-body {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 320px;
}

.spm-help {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.spm-primary-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spm-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-sans);
  border-radius: var(--radius-md);
  border: 1.5px solid transparent;
  cursor: pointer;
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.spm-btn--sm { padding: 5px 10px; font-size: 12px; }

.spm-btn--primary {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
.spm-btn--primary:hover { background: var(--primary-dark); }

.spm-btn--secondary {
  background: var(--bg-primary);
  color: var(--primary);
  border-color: var(--primary);
}
.spm-btn--secondary:hover:not(:disabled) { background: var(--bg-secondary); }
.spm-btn--secondary:disabled { opacity: 0.5; cursor: default; }

.spm-btn--ghost {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border-color: var(--border);
}
.spm-btn--ghost:hover { background: var(--bg-secondary); color: var(--text-primary); }

.spm-btn--whatsapp {
  background: #25d366;
  color: #fff;
  border-color: #25d366;
}
.spm-btn--whatsapp:hover { background: #1da851; }

/* Em breve */
.spm-soon {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  font-size: var(--text-sm);
  color: var(--text-light);
}
.spm-soon-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  background: var(--bg-tertiary, #e5e7eb);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.spm-fade-enter-active, .spm-fade-leave-active {
  transition: opacity var(--transition-fast);
}
.spm-fade-enter-from, .spm-fade-leave-to { opacity: 0; }

@media (max-width: 480px) {
  .spm-body { min-width: 0; }
}
</style>
