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
        <div v-if="sortedImages.length" class="project-gallery">
          <figure
            v-for="img in sortedImages"
            :key="img.id"
            class="project-gallery-item"
          >
            <img :src="img.imageUrl" :alt="img.caption || project.title" />
            <figcaption v-if="img.caption" class="project-gallery-caption">{{ img.caption }}</figcaption>
          </figure>
        </div>

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
import { computed } from 'vue';
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
