<template>
  <div>
    <div v-if="loading" class="loading-center" style="min-height: 100vh;"><div class="spinner spinner-lg" /></div>
    <div v-else-if="!profile" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; text-align: center; padding: 2rem;">
      <h1 style="font-size: 1.5rem; color: var(--text-primary);">Perfil não encontrado</h1>
      <p style="color: var(--text-secondary);">O usuário <strong>{{ username }}</strong> não existe ou o perfil está privado.</p>
      <a href="/" class="btn btn-primary">Voltar ao início</a>
    </div>

    <div v-else>
      <!-- Banner -->
      <div class="public-profile-banner-wrap">
        <img v-if="profile.bannerUrl" :src="profile.bannerUrl" alt="Banner" class="public-profile-banner" />
        <div v-else class="public-profile-banner" style="background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);" />
      </div>

      <!-- Header -->
      <div class="public-profile-header">
        <div class="public-profile-avatar">
          <img v-if="profile.avatarUrl" :src="profile.avatarUrl" :alt="profile.firstName" />
          <span v-else>{{ initials }}</span>
        </div>
        <h1 class="public-profile-name">{{ profile.firstName }} {{ profile.lastName }}</h1>
        <p v-if="profile.profession" class="public-profile-profession">{{ profile.profession }}</p>
        <p v-if="profile.bio" class="public-profile-bio">{{ profile.bio }}</p>
        <div class="public-profile-meta">
          <span v-if="profile.location">
            <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" style="vertical-align: middle; margin-right: 3px;"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
            {{ profile.location }}
          </span>
          <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener">{{ displayWebsite }}</a>
        </div>
        <!-- Social links -->
        <div class="public-profile-socials">
          <a v-for="net in activeSocials" :key="net.key" :href="net.url" target="_blank" rel="noopener" :title="net.label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" v-html="net.icon" />
          </a>
        </div>
      </div>

      <!-- Tabs -->
      <div class="profile-tabs">
        <div class="profile-tabs-nav">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="profile-tab-btn"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >{{ tab.label }}</button>
        </div>

        <!-- All / Articles -->
        <div v-if="activeTab === 'all' || activeTab === 'articles'">
          <div v-if="loadingContent" class="loading-center"><div class="spinner spinner-lg" /></div>
          <div v-else-if="filteredArticles.length === 0 && activeTab === 'articles'" class="empty-state">
            <p class="empty-state-title">Nenhum artigo publicado</p>
          </div>
          <div v-else class="profile-content-grid">
            <a
              v-for="article in filteredArticles"
              :key="article.id"
              :href="`/artigo/${article.slug}`"
              class="profile-content-card"
            >
              <img v-if="article.coverImageUrl" :src="article.coverImageUrl" :alt="article.title" class="profile-content-card-cover" />
              <div v-else class="profile-content-card-cover-placeholder">
                <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
              </div>
              <div class="profile-content-card-body">
                <div v-if="article.tags.length" style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 6px;">
                  <span v-for="tag in article.tags.slice(0,3)" :key="tag.id" class="public-article-tag">{{ tag.name }}</span>
                </div>
                <div class="profile-content-card-title">{{ article.title }}</div>
                <div class="profile-content-card-meta">
                  <span v-if="article.readTime">{{ article.readTime }} min</span>
                  <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Projects -->
        <div v-if="activeTab === 'all' || activeTab === 'projects'">
          <div v-if="activeTab === 'all' && filteredArticles.length > 0 && filteredProjects.length > 0" style="margin: var(--spacing-2xl) 0 var(--spacing-lg); font-size: var(--text-lg); font-weight: 600; color: var(--text-primary);">Projetos</div>
          <div v-if="loadingContent" class="loading-center"><div class="spinner spinner-lg" /></div>
          <div v-else-if="filteredProjects.length === 0 && activeTab === 'projects'" class="empty-state">
            <p class="empty-state-title">Nenhum projeto publicado</p>
          </div>
          <div v-else class="profile-content-grid">
            <a
              v-for="project in filteredProjects"
              :key="project.id"
              :href="`/projeto/${project.slug}`"
              class="profile-content-card"
            >
              <img v-if="project.coverImageUrl" :src="project.coverImageUrl" :alt="project.title" class="profile-content-card-cover" />
              <div v-else class="profile-content-card-cover-placeholder">
                <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6Z" /></svg>
              </div>
              <div class="profile-content-card-body">
                <div class="profile-content-card-title">{{ project.title }}</div>
                <div class="profile-content-card-meta">
                  <span v-if="project.projectStatus">{{ statusLabel(project.projectStatus) }}</span>
                  <span v-if="project.year">{{ project.year }}</span>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- About -->
        <div v-if="activeTab === 'about'">
          <div class="db-card" style="max-width: 640px;">
            <div v-if="profile.bio" style="margin-bottom: var(--spacing-lg);">
              <div class="db-form-section-title" style="margin-bottom: var(--spacing-sm);">Sobre</div>
              <p style="color: var(--text-secondary); line-height: var(--leading-relaxed);">{{ profile.bio }}</p>
            </div>
            <div v-if="profile.location || profile.website || profile.email" style="margin-bottom: var(--spacing-lg);">
              <div class="db-form-section-title" style="margin-bottom: var(--spacing-sm);">Contato</div>
              <div style="display: flex; flex-direction: column; gap: var(--spacing-xs); font-size: var(--text-sm); color: var(--text-secondary);">
                <span v-if="profile.location">📍 {{ profile.location }}</span>
                <a v-if="profile.website" :href="profile.website" target="_blank" style="color: var(--primary);">🌐 {{ displayWebsite }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getPublicProfile, getArticles, getProjects } from '../../utils/api';
import type { FullProfile, Article, Project } from '../../utils/api';

const props = defineProps<{ username: string }>();

const loading = ref(true);
const loadingContent = ref(true);
const profile = ref<FullProfile | null>(null);
const articles = ref<Article[]>([]);
const projects = ref<Project[]>([]);
const activeTab = ref<'all' | 'articles' | 'projects' | 'about'>('all');

const tabs = [
  { label: 'Todos', value: 'all' },
  { label: 'Artigos', value: 'articles' },
  { label: 'Projetos', value: 'projects' },
  { label: 'Sobre', value: 'about' },
];

const initials = computed(() => {
  if (!profile.value) return '';
  return `${profile.value.firstName[0] ?? ''}${profile.value.lastName[0] ?? ''}`.toUpperCase();
});

const displayWebsite = computed(() => {
  if (!profile.value?.website) return '';
  return profile.value.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
});

const filteredArticles = computed(() => articles.value.filter(a => a.status === 'published'));
const filteredProjects = computed(() => projects.value.filter(p => p.status === 'published'));

const socialIconMap: Record<string, string> = {
  linkedin:  '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
  github:    '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  twitter:   '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
  instagram: '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  facebook:  '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
  youtube:   '<path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>',
  tiktok:    '<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>',
};

const activeSocials = computed(() => {
  if (!profile.value?.socialLinks) return [];
  const result = [];
  for (const [key, handle] of Object.entries(profile.value.socialLinks)) {
    if (!handle) continue;
    const prefixes: Record<string, string> = {
      linkedin: 'https://linkedin.com/in/', github: 'https://github.com/',
      twitter: 'https://x.com/', instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/', youtube: 'https://youtube.com/@',
      tiktok: 'https://tiktok.com/@',
    };
    result.push({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      url: handle.startsWith('http') ? handle : `${prefixes[key] ?? ''}${handle}`,
      icon: socialIconMap[key] ?? '',
    });
  }
  return result;
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(s: string) {
  const m: Record<string, string> = { ongoing: 'Em andamento', completed: 'Concluído', paused: 'Pausado', cancelled: 'Cancelado' };
  return m[s] ?? s;
}

onMounted(async () => {
  try {
    profile.value = await getPublicProfile(props.username);
  } catch {
    profile.value = null;
  } finally {
    loading.value = false;
  }

  try {
    const [arts, projs] = await Promise.all([
      getArticles({ limit: 50, status: 'published' }),
      getProjects({ limit: 50, status: 'published' }),
    ]);
    articles.value = arts.data;
    projects.value = projs.data;
  } catch { /* */ } finally {
    loadingContent.value = false;
  }
});
</script>
