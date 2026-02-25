<template>
  <div class="project-wrap">
    <!-- Hero image -->
    <div v-if="project.coverImageUrl" class="project-hero">
      <img :src="project.coverImageUrl" :alt="project.title" />
    </div>

    <!-- Two-column header -->
    <div class="project-header-wrap">
      <div class="project-header-grid">
        <!-- Left: tags, title, subtitle -->
        <div class="project-header-main">
          <div v-if="project.tags?.length" style="display:flex;gap:8px;flex-wrap:wrap">
            <span v-for="tag in project.tags" :key="tag.id" class="project-tag-pill">{{ tag.name }}</span>
          </div>
          <h1 class="project-title-hero">{{ project.title }}</h1>
          <p v-if="project.subtitle" class="project-subtitle-hero">{{ project.subtitle }}</p>
        </div>

        <!-- Right: author card + stats box -->
        <div class="project-sidebar">
          <a v-if="authorUsername" :href="`/perfil/${authorUsername}`" class="project-author-card">
            <div class="project-author-avatar">
              <img v-if="authorAvatar" :src="authorAvatar" :alt="authorName" />
              <span v-else>{{ authorInitials }}</span>
            </div>
            <div>
              <span class="project-author-info-name">{{ authorName }}</span>
              <span v-if="authorProfession" class="project-author-info-profession">{{ authorProfession }}</span>
            </div>
          </a>

          <div class="project-stats-box">
            <div v-if="project.clientName" class="project-stat-item">
              <span class="project-stat-label">Cliente</span>
              <span class="project-stat-value">{{ project.clientName }}</span>
            </div>
            <div v-if="project.year" class="project-stat-item">
              <span class="project-stat-label">Ano</span>
              <span class="project-stat-value">{{ project.year }}</span>
            </div>
            <div v-if="project.duration" class="project-stat-item">
              <span class="project-stat-label">Duração</span>
              <span class="project-stat-value">{{ project.duration }}</span>
            </div>
            <div v-if="project.role" class="project-stat-item">
              <span class="project-stat-label">Papel</span>
              <span class="project-stat-value">{{ project.role }}</span>
            </div>
            <div v-if="project.projectStatus" class="project-stat-item">
              <span class="project-stat-label">Status</span>
              <StatusBadge :status="project.projectStatus" />
            </div>
            <div v-if="project.externalUrl" class="project-stat-item" style="border-bottom:none;padding-bottom:0">
              <a :href="project.externalUrl" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%;justify-content:center;text-align:center">
                Ver Projeto →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="project-content-wrap">
      <div class="project-content-inner">
        <!-- Overview / description -->
        <p v-if="project.description" class="project-overview-text">{{ project.description }}</p>

        <!-- Rich content (TipTap) -->
        <TiptapRenderer v-if="project.content" :content="project.content" />

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
              <img :src="img.imageUrl" :alt="img.caption || project.title" loading="lazy" />
              <div class="gallery-thumb-overlay">
                <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803M15.803 15.803L21 21"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 7.5v6m-3-3h6"/></svg>
              </div>
              <figcaption v-if="img.caption" class="gallery-thumb-caption">{{ img.caption }}</figcaption>
            </figure>
          </div>
        </div>

        <!-- Lightbox -->
        <Teleport to="body">
          <div v-if="lightboxOpen" class="gallery-lightbox" @click.self="closeLightbox">
            <button class="lightbox-close" @click="closeLightbox" aria-label="Fechar">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <button v-if="sortedImages.length > 1" class="lightbox-prev" @click="prevImage" aria-label="Anterior">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/></svg>
            </button>
            <div class="lightbox-content">
              <img :src="sortedImages[lightboxIdx].imageUrl" :alt="sortedImages[lightboxIdx].caption || project.title" />
              <p v-if="sortedImages[lightboxIdx].caption" class="lightbox-caption">{{ sortedImages[lightboxIdx].caption }}</p>
              <p class="lightbox-counter">{{ lightboxIdx + 1 }} / {{ sortedImages.length }}</p>
            </div>
            <button v-if="sortedImages.length > 1" class="lightbox-next" @click="nextImage" aria-label="Próxima">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5"/></svg>
            </button>
          </div>
        </Teleport>

        <!-- CTA box -->
        <div v-if="authorUsername" class="project-cta-box">
          <h3>Gostou deste projeto?</h3>
          <p>Entre em contato para discutir como posso ajudar no seu próximo projeto.</p>
          <a :href="`/perfil/${authorUsername}`" class="btn-white">Ver Mais Projetos</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
import TiptapRenderer from './TiptapRenderer.vue';
import StatusBadge from '../ui/StatusBadge.vue';

interface Tag { id: string; name: string; }
interface ProjectImage { id: string; imageUrl: string; caption?: string; order: number; }
interface ProjectUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profession?: string;
  avatarUrl?: string;
}
interface Project {
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
  projectStatus?: string;
  externalUrl?: string;
  tags: Tag[];
  images: ProjectImage[];
  user?: ProjectUser;
}

const props = defineProps<{ project: Project }>();

const sortedImages = computed(() =>
  props.project.images ? [...props.project.images].sort((a, b) => a.order - b.order) : []
);

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
  const u = props.project.user;
  if (!u) return '';
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
});

const authorInitials = computed(() => {
  const u = props.project.user;
  if (!u) return '';
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
});

const authorUsername = computed(() => props.project.user?.username ?? null);
const authorAvatar = computed(() => props.project.user?.avatarUrl ?? null);
const authorProfession = computed(() => props.project.user?.profession ?? null);
</script>
