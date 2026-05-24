<template>
  <transition name="cd-fade">
    <div v-if="candidate" class="cd-overlay" @click.self="emit('close')" role="dialog" aria-modal="true">
      <transition name="cd-slide" appear>
        <aside v-if="candidate" class="cd-drawer" :key="candidate.id">
          <Toast ref="toast" />

          <header class="cd-head">
            <div class="cd-head-id">
              <img
                v-if="candidate.avatarUrl"
                :src="candidate.avatarUrl"
                :alt="candidate.fullName"
                class="cd-avatar cd-avatar--img"
              />
              <div v-else class="cd-avatar" :style="{ background: avColor.bg, color: avColor.fg }">
                {{ candidate.initials }}
              </div>
              <div class="cd-head-info">
                <div class="cd-name">{{ candidate.fullName }}</div>
                <div class="cd-role">
                  <template v-if="candidate.role">{{ candidate.role }}</template>
                  <template v-if="candidate.role && candidate.location"> · </template>
                  <template v-if="candidate.location">{{ candidate.location }}</template>
                </div>
              </div>
            </div>
            <!-- Nota Geral -->
            <div class="cd-score-block">
              <label class="cd-score-label" :for="`score-${candidate.id}`">Nota</label>
              <input
                :id="`score-${candidate.id}`"
                v-model.number="localScore"
                type="number"
                min="0"
                max="10"
                step="0.1"
                class="cd-score-input"
                placeholder="—"
                @input="onScoreInput"
              />
            </div>
            <button class="cd-close" type="button" aria-label="Fechar" @click="emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </header>

          <div class="cd-body">
            <!-- Nota Geral textarea (collapsible) -->
            <div class="cd-section cd-general-note-section">
              <button
                type="button"
                class="cd-collapsible-toggle"
                :aria-expanded="generalNoteOpen"
                @click="generalNoteOpen = !generalNoteOpen"
              >
                <span class="cd-section-label" style="margin:0">Anotacao geral</span>
                <svg
                  class="cd-collapsible-chevron"
                  :class="{ 'cd-collapsible-chevron--open': generalNoteOpen }"
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                ><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <Transition name="cd-collapse">
                <div v-if="generalNoteOpen" class="cd-collapse-body">
                  <textarea
                    v-model="localNote"
                    class="cd-textarea"
                    rows="3"
                    placeholder="Anotacoes sobre este candidato..."
                    @input="onNoteInput"
                  />
                </div>
              </Transition>
            </div>

            <!-- CandidateProcessHistory -->
            <CandidateProcessHistory
              :application-id="candidate.applicationId ?? `mock-${candidate.id}`"
              :stages="stages"
              @aggregate-score="onAggregateScore"
            />

            <!-- Profile public URL -->
            <div v-if="candidate.username" class="cd-section">
              <div class="cd-section-label">Perfil VitrinePro</div>
              <a class="cd-profile-link" :href="profileUrl" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                {{ profileShortUrl }}
              </a>
            </div>

            <!-- Redes sociais -->
            <div v-if="candidate.username" class="cd-section">
              <div class="cd-section-label">Redes sociais</div>
              <div v-if="loadingSocial" class="cd-cv-loading">Carregando redes...</div>
              <div v-else-if="socialLinks.length > 0" class="cd-socials">
                <a
                  v-for="s in socialLinks"
                  :key="s.key"
                  :href="s.url"
                  target="_blank"
                  rel="noopener"
                  class="cd-social"
                  :class="`cd-social--${s.key}`"
                  :aria-label="s.label"
                  :title="s.label"
                >
                  <!-- LinkedIn -->
                  <svg v-if="s.key === 'linkedin'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  <!-- GitHub -->
                  <svg v-else-if="s.key === 'github'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  <!-- Twitter / X -->
                  <svg v-else-if="s.key === 'twitter'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  <!-- Instagram -->
                  <svg v-else-if="s.key === 'instagram'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  <!-- Facebook -->
                  <svg v-else-if="s.key === 'facebook'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                  <!-- YouTube -->
                  <svg v-else-if="s.key === 'youtube'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  <!-- TikTok -->
                  <svg v-else-if="s.key === 'tiktok'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                  <!-- Fallback -->
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </a>
              </div>
              <p v-else class="cd-empty">Nenhuma rede social cadastrada.</p>
            </div>

            <div v-if="candidate.about" class="cd-section">
              <div class="cd-section-label">Mensagem do candidato</div>
              <p class="cd-about">{{ candidate.about }}</p>
            </div>

            <div v-if="candidate.tags.length" class="cd-section">
              <div class="cd-section-label">Habilidades</div>
              <div class="cd-tags">
                <span v-for="tag in candidate.tags" :key="tag" class="cd-tag">{{ tag }}</span>
              </div>
            </div>

            <div class="cd-section">
              <div class="cd-section-label">Pipeline</div>
              <dl class="cd-meta">
                <div><dt>Etapa atual</dt><dd><span class="cd-stage">{{ stageLabel }}</span></dd></div>
                <div><dt>Candidatura</dt><dd>{{ formatDate(candidate.appliedAt) }}</dd></div>
                <div v-if="candidate.stageNote"><dt>Nota</dt><dd>{{ candidate.stageNote }}</dd></div>
                <div v-if="candidate.rating"><dt>Avaliação</dt><dd>★ {{ candidate.rating.toFixed(1) }} / 5</dd></div>
              </dl>
            </div>

            <div class="cd-section">
              <div class="cd-section-label">Contato</div>
              <dl class="cd-meta">
                <div>
                  <dt>Email</dt>
                  <dd>
                    <a :href="`mailto:${candidate.email}`" class="cd-link">{{ candidate.email }}</a>
                  </dd>
                </div>
                <div v-if="candidate.phone">
                  <dt>Telefone</dt>
                  <dd class="cd-phone-row">
                    <a :href="`tel:${candidate.phone}`" class="cd-link">{{ candidate.phone }}</a>
                    <a
                      v-if="whatsappUrl"
                      :href="whatsappUrl"
                      target="_blank"
                      rel="noopener"
                      class="cd-whatsapp"
                      aria-label="Abrir conversa no WhatsApp"
                      title="Conversar no WhatsApp"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
                      WhatsApp
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div class="cd-section">
              <div class="cd-section-label">Currículos</div>

              <div v-if="loadingCvs" class="cd-cv-loading">Carregando currículos...</div>

              <ul v-else-if="allCvs.length > 0" class="cd-cv-list">
                <li v-for="cv in allCvs" :key="cv.id" class="cd-cv-item" :class="{ 'cd-cv-item--applied': isAppliedCv(cv.id) }">
                  <div class="cd-cv-info">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span class="cd-cv-label">{{ cv.label }}</span>
                    <span v-if="isAppliedCv(cv.id)" class="cd-cv-badge">Enviado nesta candidatura</span>
                  </div>
                  <div class="cd-cv-actions">
                    <a :href="cv.fileUrl" target="_blank" rel="noopener" class="cd-cv-btn">Abrir</a>
                    <a :href="cv.fileUrl" :download="`${cv.label}.pdf`" class="cd-cv-btn cd-cv-btn--ghost">Download</a>
                  </div>
                </li>
              </ul>

              <p v-else class="cd-empty">Nenhum currículo público disponível.</p>
            </div>
          </div>

          <footer class="cd-actions">
            <button
              class="cd-btn cd-btn--share"
              type="button"
              @click="shareModalOpen = true"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Compartilhar
            </button>
            <button class="cd-btn cd-btn--secondary" type="button" @click="emit('reject', candidate)">
              Rejeitar
            </button>
            <button class="cd-btn cd-btn--primary" type="button" :disabled="!canAdvance" @click="emit('advance', candidate)">
              {{ canAdvance ? 'Avançar etapa' : 'Etapa final' }}
            </button>
          </footer>

          <!-- ShareProcessModal -->
          <ShareProcessModal
            :visible="shareModalOpen"
            :application-id="candidate.applicationId ?? `mock-${candidate.id}`"
            :candidate="candidate"
            :stages="stages"
            :general-score="localScore"
            :general-note="localNote"
            :social-links="socialLinks"
            :all-cvs="allCvs"
            :profile-url="profileUrl"
            :stage-label="stageLabel"
            @close="shareModalOpen = false"
          />
        </aside>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue';
import { avatarColor, type MockCandidate } from '../../data/mock-recrutador';
import {
  getPublicCVList,
  getPublicProfile,
  applications,
  type CV,
  type FullProfile,
  type PipelineStage,
} from '../../utils/api';
import Toast from '../ui/Toast.vue';
import CandidateProcessHistory from './CandidateProcessHistory.vue';
import ShareProcessModal from './ShareProcessModal.vue';

const props = defineProps<{
  candidate: MockCandidate | null;
  /** Full list of stages (including rejected), sorted by order */
  stages: PipelineStage[];
  /** Vaga title — used to pre-fill the WhatsApp first message */
  vagaTitle?: string;
  /** Recruiter display name — used to pre-fill the WhatsApp first message */
  recruiterName?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'advance', c: MockCandidate): void;
  (e: 'reject', c: MockCandidate): void;
}>();

const toast = ref<InstanceType<typeof Toast>>();

// ── Nota Geral ────────────────────────────────────────────────────────────────
const localScore = ref<number | string>('');
const localNote = ref<string>('');
const generalNoteOpen = ref(false);
let scoreDebounce: ReturnType<typeof setTimeout> | null = null;
let noteDebounce: ReturnType<typeof setTimeout> | null = null;
const savingGeneral = ref(false);

function onScoreInput() {
  if (scoreDebounce) clearTimeout(scoreDebounce);
  scoreDebounce = setTimeout(() => saveGeneral(), 800);
}

function onAggregateScore(value: number | null) {
  if (value == null) return;
  localScore.value = value;
  if (scoreDebounce) clearTimeout(scoreDebounce);
  scoreDebounce = setTimeout(() => saveGeneral(), 800);
}

function onNoteInput() {
  if (noteDebounce) clearTimeout(noteDebounce);
  noteDebounce = setTimeout(() => saveGeneral(), 800);
}

async function saveGeneral() {
  const appId = props.candidate?.applicationId;
  if (!appId) return;
  if (savingGeneral.value) return;
  savingGeneral.value = true;
  const scoreNum = localScore.value === '' ? null : Number(localScore.value);
  try {
    await applications.updateGeneral(appId, {
      generalScore: scoreNum,
      generalNote: localNote.value || null,
    });
    toast.value?.show('Nota salva', 'success');
  } catch {
    toast.value?.show('Erro ao salvar nota', 'error');
  } finally {
    savingGeneral.value = false;
  }
}

// ── Share modal ───────────────────────────────────────────────────────────────
const shareModalOpen = ref(false);

// ── Cleanup debounces ─────────────────────────────────────────────────────────
onUnmounted(() => {
  if (scoreDebounce) clearTimeout(scoreDebounce);
  if (noteDebounce) clearTimeout(noteDebounce);
});

// Reset local score/note when candidate changes
watch(
  () => props.candidate?.applicationId,
  () => {
    localScore.value = (props.candidate as any)?.generalScore ?? '';
    localNote.value = (props.candidate as any)?.generalNote ?? '';
    generalNoteOpen.value = false;
    shareModalOpen.value = false;
  },
  { immediate: true }
);

const FRONTEND_URL =
  (import.meta.env.PUBLIC_FRONTEND_URL as string | undefined) ??
  (typeof window !== 'undefined' ? window.location.origin : '');

const avColor = computed(() =>
  props.candidate ? avatarColor(props.candidate.fullName) : { bg: '#e5e7eb', fg: '#374151' }
);

const stageLabel = computed(() => {
  if (!props.candidate) return '';
  const stage = props.stages.find((s) => s.id === props.candidate!.stage);
  return stage?.label ?? props.candidate.stage;
});

const canAdvance = computed(() => {
  if (!props.candidate) return false;
  const visibleStages = props.stages.filter((s) => !s.isRejected).sort((a, b) => a.order - b.order);
  const idx = visibleStages.findIndex((s) => s.id === props.candidate!.stage);
  return idx >= 0 && idx < visibleStages.length - 1;
});

const profileUrl = computed(() =>
  props.candidate?.username ? `${FRONTEND_URL}/perfil/${props.candidate.username}` : ''
);
const profileShortUrl = computed(() => {
  const url = profileUrl.value;
  return url.replace(/^https?:\/\//, '');
});

const whatsappUrl = computed(() => {
  const phone = props.candidate?.phone;
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  const firstName = (props.candidate?.fullName ?? '').trim().split(/\s+/)[0] ?? '';
  const recruiter = (props.recruiterName ?? '').trim() || 'a equipe de recrutamento';
  const vagaPart = props.vagaTitle ? ` para a vaga de ${props.vagaTitle}` : '';
  const message =
    `Olá ${firstName}! Aqui é ${recruiter} da VitrinePro. ` +
    `Vi sua candidatura${vagaPart} e gostaria de conversar com você sobre os próximos passos. ` +
    `Você tem disponibilidade?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
});

// ── CVs (lazy fetch when drawer opens with a userId) ─────────────────────────
const allCvs = ref<CV[]>([]);
const loadingCvs = ref(false);

function isAppliedCv(cvId: string): boolean {
  return props.candidate?.applicationCv?.id === cvId;
}

async function loadCvs(userId: string) {
  loadingCvs.value = true;
  try {
    allCvs.value = await getPublicCVList(userId);
  } catch {
    allCvs.value = [];
  } finally {
    loadingCvs.value = false;
  }
}

// ── Social links (lazy fetch from public profile) ────────────────────────────
type SocialEntry = { key: string; label: string; url: string };
const socialLinks = ref<SocialEntry[]>([]);
const loadingSocial = ref(false);

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: 'LinkedIn',
  github: 'GitHub',
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
};

function normalizeSocialUrl(key: string, raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const handle = value.replace(/^@/, '');
  switch (key) {
    case 'linkedin':
      return `https://www.linkedin.com/in/${handle}`;
    case 'github':
      return `https://github.com/${handle}`;
    case 'twitter':
      return `https://twitter.com/${handle}`;
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'youtube':
      return value.startsWith('UC') ? `https://youtube.com/channel/${handle}` : `https://youtube.com/@${handle}`;
    case 'tiktok':
      return `https://tiktok.com/@${handle}`;
    default:
      return value;
  }
}

function extractSocials(profile: FullProfile): SocialEntry[] {
  const out: SocialEntry[] = [];
  const links = profile.socialLinks ?? {};
  for (const key of Object.keys(SOCIAL_LABELS)) {
    const raw = (links as Record<string, string | undefined>)[key];
    if (raw) {
      const url = normalizeSocialUrl(key, raw);
      if (url) out.push({ key, label: SOCIAL_LABELS[key] ?? key, url });
    }
  }
  return out;
}

async function loadSocialLinks(username: string) {
  loadingSocial.value = true;
  try {
    const profile = await getPublicProfile(username);
    socialLinks.value = extractSocials(profile);
  } catch {
    socialLinks.value = [];
  } finally {
    loadingSocial.value = false;
  }
}

watch(
  () => props.candidate?.id,
  () => {
    allCvs.value = [];
    socialLinks.value = [];
    const userId = props.candidate?.userId;
    if (userId) {
      loadCvs(userId);
    } else if (props.candidate?.applicationCv) {
      // Fallback: at least show the CV used in the application
      const cv = props.candidate.applicationCv;
      allCvs.value = [
        {
          id: cv.id,
          label: cv.label,
          fileUrl: cv.fileUrl,
          isActive: true,
          createdAt: props.candidate.appliedAt,
        },
      ];
    }
    const username = props.candidate?.username;
    if (username) loadSocialLinks(username);
  },
  { immediate: true }
);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
</script>

<style scoped>
.cd-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  justify-content: flex-end;
  z-index: var(--z-modal);
}
.cd-drawer {
  width: 460px;
  max-width: 100vw;
  height: 100vh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-xl);
}
.cd-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border);
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}
.cd-head-id { display: flex; gap: var(--spacing-md); align-items: center; flex: 1; min-width: 0; }
.cd-head-info { min-width: 0; }

/* Nota Geral no header */
.cd-score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.cd-score-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-light);
}
.cd-score-input {
  width: 56px;
  padding: 4px 6px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  font-weight: 700;
  text-align: center;
  color: var(--primary);
  background: var(--bg-primary);
  font-family: var(--font-sans);
  -moz-appearance: textfield;
}
.cd-score-input::-webkit-outer-spin-button,
.cd-score-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.cd-score-input:focus { outline: none; border-color: var(--primary); }

/* Collapsible anotacao geral */
.cd-general-note-section { padding: 0; }
.cd-collapsible-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 2px;
  width: 100%;
  text-align: left;
}
.cd-collapsible-chevron {
  color: var(--text-light);
  transition: transform var(--transition-fast);
  flex-shrink: 0;
}
.cd-collapsible-chevron--open { transform: rotate(180deg); }
.cd-collapse-body { padding-top: var(--spacing-xs); }
.cd-textarea {
  width: 100%;
  resize: vertical;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px 10px;
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.5;
  box-sizing: border-box;
}
.cd-textarea:focus { outline: none; border-color: var(--primary); }
.cd-collapse-enter-active, .cd-collapse-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}
.cd-collapse-enter-from, .cd-collapse-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.cd-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  object-fit: cover;
}
.cd-avatar--img { background: var(--bg-secondary); }
.cd-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
}
.cd-role {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin-top: 2px;
}
.cd-close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 6px;
  border-radius: var(--radius-md);
}
.cd-close:hover { background: var(--bg-secondary); color: var(--text-primary); }

.cd-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
.cd-section-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
  color: var(--text-light);
  margin-bottom: var(--spacing-xs);
}
.cd-about {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
  margin: 0;
  white-space: pre-wrap;
}
.cd-tags { display: flex; gap: var(--spacing-xs); flex-wrap: wrap; }
.cd-tag {
  font-size: 11px;
  padding: 4px 10px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
}
.cd-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--text-sm);
  margin: 0;
}
.cd-meta > div { display: flex; justify-content: space-between; align-items: center; gap: var(--spacing-md); }
.cd-meta dt { color: var(--text-secondary); margin: 0; flex-shrink: 0; }
.cd-meta dd { margin: 0; color: var(--text-primary); text-align: right; word-break: break-word; }
.cd-stage {
  display: inline-block;
  padding: 3px 10px;
  background: var(--status-active-bg);
  color: var(--status-active-text);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
}
.cd-link { color: var(--primary); text-decoration: none; }
.cd-link:hover { text-decoration: underline; }

.cd-profile-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--primary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-decoration: none;
  word-break: break-all;
}
.cd-profile-link:hover { background: var(--bg-tertiary); }

.cd-socials {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.cd-social {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
  text-decoration: none;
  transition: transform var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}
.cd-social:hover { transform: translateY(-1px); color: #fff; }
.cd-social--linkedin:hover { background: #0a66c2; border-color: #0a66c2; }
.cd-social--github:hover { background: #24292e; border-color: #24292e; }
.cd-social--twitter:hover { background: #000; border-color: #000; }
.cd-social--instagram:hover {
  background: radial-gradient(circle at 30% 110%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285aeb 90%);
  border-color: #d6249f;
}
.cd-social--facebook:hover { background: #1877f2; border-color: #1877f2; }
.cd-social--youtube:hover { background: #ff0000; border-color: #ff0000; }
.cd-social--tiktok:hover { background: #000; border-color: #000; }

.cd-phone-row { display: flex; align-items: center; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.cd-whatsapp {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #25d366;
  color: #fff;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
}
.cd-whatsapp:hover { background: #1da851; }

/* CVs */
.cd-cv-loading {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  padding: var(--spacing-sm);
}
.cd-cv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
.cd-cv-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  flex-wrap: wrap;
}
.cd-cv-item--applied {
  border-color: var(--primary);
  background: var(--bg-secondary);
}
.cd-cv-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}
.cd-cv-info svg { color: var(--text-secondary); flex-shrink: 0; }
.cd-cv-label {
  font-size: var(--text-sm);
  color: var(--text-primary);
  font-weight: 500;
}
.cd-cv-badge {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-full);
  font-weight: 600;
  letter-spacing: 0.02em;
}
.cd-cv-actions { display: flex; gap: 6px; flex-shrink: 0; }
.cd-cv-btn {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  background: var(--primary);
  color: #fff;
  border-radius: var(--radius-md);
  text-decoration: none;
}
.cd-cv-btn--ghost {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}
.cd-cv-btn:hover { filter: brightness(0.95); }
.cd-empty {
  font-size: var(--text-sm);
  color: var(--text-light);
  margin: 0;
  padding: var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  text-align: center;
}

.cd-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-wrap: wrap;
}
.cd-btn {
  flex: 1;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  font-family: var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.cd-btn:disabled { opacity: 0.5; cursor: default; }
.cd-btn--secondary {
  background: var(--bg-primary);
  border-color: var(--border);
  color: var(--status-rejected-text);
}
.cd-btn--secondary:hover:not(:disabled) {
  background: var(--status-rejected-bg);
  border-color: var(--status-rejected-text);
}
.cd-btn--primary {
  background: var(--primary);
  color: #ffffff;
}
.cd-btn--primary:hover:not(:disabled) { background: var(--primary-dark); }
.cd-btn--share {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-primary);
  border-color: var(--primary);
  color: var(--primary);
  font-size: 12px;
  padding: 8px 12px;
}
.cd-btn--share:hover { background: var(--bg-secondary); }

.cd-fade-enter-active, .cd-fade-leave-active { transition: opacity var(--transition-base); }
.cd-fade-enter-from, .cd-fade-leave-to { opacity: 0; }

.cd-slide-enter-active, .cd-slide-leave-active { transition: transform var(--transition-slow); }
.cd-slide-enter-from, .cd-slide-leave-to { transform: translateX(100%); }

@media (max-width: 480px) {
  .cd-drawer { width: 100vw; }
  .cd-cv-item { flex-direction: column; align-items: stretch; }
  .cd-cv-actions { justify-content: flex-end; }
}
</style>
