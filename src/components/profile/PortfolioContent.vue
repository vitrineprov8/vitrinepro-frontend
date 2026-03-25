<template>
  <div class="project-wrap">
    <!-- Hero image -->
    <div v-if="item.coverImageUrl" class="project-hero">
      <img :src="item.coverImageUrl" :alt="item.title" />
    </div>

    <!-- Header: single-column, compact -->
    <div class="project-header-wrap">
      <div class="portfolio-header">
        <!-- Tags row + share button -->
        <div class="portfolio-header-top">
          <div v-if="item.tags?.length" style="display:flex;gap:6px;flex-wrap:wrap;flex:1">
            <span v-for="tag in item.tags" :key="tag.id" class="project-tag-pill">{{ tag.name }}</span>
          </div>
          <ShareButton :url="currentUrl" :title="item.title" />
        </div>

        <!-- Title + subtitle -->
        <h1 class="portfolio-title">{{ item.title }}</h1>
        <p v-if="item.subtitle" class="portfolio-subtitle">{{ item.subtitle }}</p>

        <!-- Compact metadata chips (only if any exist) -->
        <div v-if="hasStats" class="portfolio-meta-chips">
          <span v-if="item.clientName" class="portfolio-meta-chip">
            <span class="portfolio-meta-chip-label">Cliente</span>{{ item.clientName }}
          </span>
          <span v-if="item.year" class="portfolio-meta-chip">
            <span class="portfolio-meta-chip-label">Ano</span>{{ item.year }}
          </span>
          <span v-if="item.duration" class="portfolio-meta-chip">
            <span class="portfolio-meta-chip-label">Duração</span>{{ item.duration }}
          </span>
          <span v-if="item.role" class="portfolio-meta-chip">
            <span class="portfolio-meta-chip-label">Papel</span>{{ item.role }}
          </span>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="project-content-wrap">
      <div class="project-content-inner">
        <!-- Overview / description -->
        <p v-if="item.description" class="project-overview-text">{{ item.description }}</p>

        <!-- Rich content (TipTap) -->
        <TiptapRenderer v-if="item.content" :content="item.content" />

        <!-- Image gallery -->
        <div v-if="sortedImages.length" class="project-gallery-v2">
          <h3 class="project-gallery-heading">Galeria</h3>
          <div class="project-gallery-grid">
            <figure
              v-for="(img, idx) in sortedImages"
              :key="img.id"
              class="project-gallery-thumb"
              :class="{ 'gallery-thumb-wide': idx === 0 && sortedImages.length > 2 }"
              @click="openLightbox(idx)"
            >
              <img :src="img.fileUrl" :alt="img.caption || item.title" loading="lazy" />
              <div class="gallery-thumb-overlay">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M15.803 15.803L21 21"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 7.5v6m-3-3h6"/></svg>
              </div>
              <figcaption v-if="img.caption" class="gallery-thumb-caption">{{ img.caption }}</figcaption>
            </figure>
          </div>
        </div>

        <!-- PDF files -->
        <div v-if="pdfFiles.length" class="portfolio-pdf-section">
          <h3 class="project-gallery-heading">Arquivos</h3>
          <div class="portfolio-pdf-list">
            <a
              v-for="pdf in pdfFiles"
              :key="pdf.id"
              :href="pdf.fileUrl"
              target="_blank"
              rel="noopener"
              class="portfolio-pdf-card"
            >
              <div class="portfolio-pdf-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div class="portfolio-pdf-info">
                <span class="portfolio-pdf-name">{{ pdf.originalFilename || 'documento.pdf' }}</span>
                <span v-if="pdf.fileSize" class="portfolio-pdf-size">{{ formatFileSize(pdf.fileSize) }}</span>
                <span v-if="pdf.caption" class="portfolio-pdf-caption">{{ pdf.caption }}</span>
              </div>
              <div class="portfolio-pdf-action">
                <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                Abrir PDF
              </div>
            </a>
          </div>
        </div>

        <!-- Lightbox -->
          <div v-if="lightboxOpen" class="gallery-lightbox" @click.self="closeLightbox">
            <button class="lightbox-close" @click="closeLightbox" aria-label="Fechar">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <button v-if="sortedImages.length > 1" class="lightbox-prev" @click="prevImage" aria-label="Anterior">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>
            <div class="lightbox-content">
              <img :src="sortedImages[lightboxIdx].fileUrl" :alt="sortedImages[lightboxIdx].caption || item.title" />
              <p v-if="sortedImages[lightboxIdx].caption" class="lightbox-caption">{{ sortedImages[lightboxIdx].caption }}</p>
              <p class="lightbox-counter">{{ lightboxIdx + 1 }} / {{ sortedImages.length }}</p>
            </div>
            <button v-if="sortedImages.length > 1" class="lightbox-next" @click="nextImage" aria-label="Próxima">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </div>

        <!-- CTA box -->
        <div v-if="authorUsername" class="project-cta-box">
          <h3>Gostou deste item?</h3>
          <p>Veja o perfil completo e entre em contato para saber mais.</p>
          <a v-if="authorUsername" :href="`/perfil/${authorUsername}`" class="portfolio-author-bar">
            <div class="portfolio-author-avatar">
              <img v-if="authorAvatar" :src="authorAvatar" :alt="authorName" />
              <span v-else>{{ authorInitials }}</span>
            </div>
            <div class="portfolio-author-info">
              <span class="portfolio-author-name">{{ authorName }}</span>
              <span v-if="authorProfession" class="portfolio-author-profession">{{ authorProfession }}</span>
            </div>
            <svg class="portfolio-author-arrow" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import TiptapRenderer from './TiptapRenderer.vue';
import ShareButton from '../ui/ShareButton.vue';

interface Tag { id: string; name: string; }
interface PortfolioFile {
  id: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'PDF';
  mimeType?: string;
  caption?: string;
  originalFilename?: string;
  fileSize?: number;
  order: number;
}
interface PortfolioUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profession?: string;
  avatarUrl?: string;
}
interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: any;
  coverImageUrl?: string;
  clientName?: string;
  year?: string;
  duration?: string;
  role?: string;
  projectStatus?: string;
  externalUrl?: string;
  tags: Tag[];
  files: PortfolioFile[];
  user?: PortfolioUser;
}

const props = defineProps<{ item: PortfolioItem }>();

const currentUrl = ref('');
onMounted(() => { currentUrl.value = window.location.href; });

const hasStats = computed(() =>
  !!(props.item.clientName || props.item.year || props.item.duration ||
     props.item.role || props.item.projectStatus || props.item.externalUrl)
);

const sortedImages = computed(() =>
  (props.item.files ?? []).filter(f => f.fileType === 'IMAGE').sort((a, b) => a.order - b.order)
);

const pdfFiles = computed(() =>
  (props.item.files ?? []).filter(f => f.fileType === 'PDF').sort((a, b) => a.order - b.order)
);

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Lightbox
const lightboxOpen = ref(false);
const lightboxIdx = ref(0);

function openLightbox(idx: number) {
  lightboxIdx.value = idx;
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOpen.value = false;
  document.body.style.overflow = '';
}

function nextImage() {
  lightboxIdx.value = (lightboxIdx.value + 1) % sortedImages.value.length;
}

function prevImage() {
  lightboxIdx.value = (lightboxIdx.value - 1 + sortedImages.value.length) % sortedImages.value.length;
}

function onKeydown(e: KeyboardEvent) {
  if (!lightboxOpen.value) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') nextImage();
  if (e.key === 'ArrowLeft') prevImage();
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const authorName = computed(() => {
  const u = props.item.user;
  if (!u) return '';
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
});

const authorInitials = computed(() => {
  const u = props.item.user;
  if (!u) return '';
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
});

const authorUsername = computed(() => props.item.user?.username ?? null);
const authorAvatar = computed(() => props.item.user?.avatarUrl ?? null);
const authorProfession = computed(() => props.item.user?.profession ?? null);
</script>

<style scoped>
/* ── Compact portfolio header ─────────────────────────── */
.portfolio-header {
  max-width: 900px;
  margin: 0 auto;
  padding: 1.75rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.portfolio-header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.portfolio-title {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--text-primary);
  margin: 0;
}

.portfolio-subtitle {
  font-size: clamp(0.95rem, 2.5vw, 1.15rem);
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.portfolio-meta-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.25rem;
}

.portfolio-meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  font-size: 0.82rem;
  color: var(--text-primary);
  font-weight: 500;
}

.portfolio-meta-chip-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.portfolio-author-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
  margin-top: 0.25rem;
}
.portfolio-author-bar:hover { border-color: var(--primary); background: var(--bg-primary); }

.portfolio-author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.portfolio-author-avatar img { width: 100%; height: 100%; object-fit: cover; }

.portfolio-author-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.portfolio-author-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.portfolio-author-profession { font-size: 0.78rem; color: var(--text-secondary); }
.portfolio-author-arrow { flex-shrink: 0; color: var(--text-tertiary); }

/* ── PDF files ────────────────────────────────────────── */
.portfolio-pdf-section {
  margin-top: 2.5rem;
}

.portfolio-pdf-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.portfolio-pdf-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-secondary);
  text-decoration: none;
  color: var(--text-primary);
  transition: border-color 0.15s, background 0.15s;
}

.portfolio-pdf-card:hover {
  border-color: var(--primary);
  background: var(--bg-primary);
}

.portfolio-pdf-icon {
  flex-shrink: 0;
  color: var(--text-secondary);
}

.portfolio-pdf-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.portfolio-pdf-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.portfolio-pdf-size {
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.portfolio-pdf-caption {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.portfolio-pdf-action {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary);
  white-space: nowrap;
}
</style>
