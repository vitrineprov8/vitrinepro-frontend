<template>
  <div>
    <div v-if="loading" class="loading-center" style="min-height: 100vh;"><div class="spinner spinner-lg" /></div>
    <div v-else-if="!project" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; text-align: center; padding: 2rem;">
      <h1 style="font-size: 1.5rem; color: var(--text-primary);">Projeto não encontrado</h1>
      <a href="/" class="btn btn-primary">Voltar ao início</a>
    </div>
    <div v-else class="public-project">
      <!-- Cover -->
      <img v-if="project.coverImageUrl" :src="project.coverImageUrl" :alt="project.title" class="public-article-cover" />

      <!-- Tags -->
      <div v-if="project.tags.length" class="public-article-tags">
        <span v-for="tag in project.tags" :key="tag.id" class="public-article-tag">{{ tag.name }}</span>
      </div>

      <h1 class="public-article-title">{{ project.title }}</h1>
      <p v-if="project.subtitle" class="public-article-subtitle">{{ project.subtitle }}</p>

      <div class="public-project-layout">
        <!-- Content -->
        <div>
          <p style="font-size: var(--text-lg); color: var(--text-secondary); line-height: var(--leading-relaxed); margin-bottom: var(--spacing-xl);">{{ project.description }}</p>

          <div v-if="project.content" class="public-article-content">
            <TiptapRenderer :content="project.content" />
          </div>

          <!-- Gallery -->
          <div v-if="sortedImages.length > 0" style="margin-top: var(--spacing-2xl);">
            <h2 style="font-size: var(--text-xl); font-weight: 600; margin-bottom: var(--spacing-lg);">Galeria</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--spacing-md);">
              <div v-for="img in sortedImages" :key="img.id" style="border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border);">
                <img :src="img.imageUrl" :alt="img.caption || project.title" style="width:100%; aspect-ratio: 4/3; object-fit: cover; display: block;" />
                <p v-if="img.caption" style="padding: 6px 10px; font-size: var(--text-xs); color: var(--text-secondary); background: var(--bg-secondary);">{{ img.caption }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Meta sidebar -->
        <aside class="public-project-meta-card">
          <div v-if="project.projectStatus" class="public-project-meta-item">
            <span class="public-project-meta-label">Status</span>
            <StatusBadge :status="project.projectStatus" />
          </div>
          <div v-if="project.clientName" class="public-project-meta-item">
            <span class="public-project-meta-label">Cliente</span>
            <span class="public-project-meta-value">{{ project.clientName }}</span>
          </div>
          <div v-if="project.year" class="public-project-meta-item">
            <span class="public-project-meta-label">Ano</span>
            <span class="public-project-meta-value">{{ project.year }}</span>
          </div>
          <div v-if="project.duration" class="public-project-meta-item">
            <span class="public-project-meta-label">Duração</span>
            <span class="public-project-meta-value">{{ project.duration }}</span>
          </div>
          <div v-if="project.role" class="public-project-meta-item">
            <span class="public-project-meta-label">Papel</span>
            <span class="public-project-meta-value">{{ project.role }}</span>
          </div>
          <div v-if="project.externalUrl" class="public-project-meta-item">
            <a :href="project.externalUrl" target="_blank" rel="noopener" class="btn btn-primary" style="width: 100%; justify-content: center;">
              Ver projeto →
            </a>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TiptapRenderer from './TiptapRenderer.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import { getProject } from '../../utils/api';
import type { Project } from '../../utils/api';

const props = defineProps<{ slug: string }>();

const loading = ref(true);
const project = ref<Project | null>(null);

const sortedImages = computed(() =>
  project.value ? [...project.value.images].sort((a, b) => a.order - b.order) : []
);

onMounted(async () => {
  try {
    project.value = await getProject(props.slug);
  } catch {
    project.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
