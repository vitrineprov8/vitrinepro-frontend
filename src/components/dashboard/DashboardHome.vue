<template>
  <DashboardLayout>
    <div>
      <!-- Welcome -->
      <div class="db-section-header">
        <div>
          <h1 class="db-section-title" v-if="user">Olá, {{ user.firstName }} 👋</h1>
          <h1 class="db-section-title" v-else>Carregando...</h1>
          <p class="db-section-subtitle">Bem-vindo ao seu painel de controle</p>
        </div>
        <a v-if="user?.username" :href="`/perfil/${user.username}`" target="_blank" class="btn btn-secondary">
          <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
          Ver perfil público
        </a>
      </div>

      <!-- Stats -->
      <div class="db-stats-grid">
        <div class="db-stat-card">
          <div class="db-stat-value">{{ stats.articles }}</div>
          <div class="db-stat-label">Artigos</div>
        </div>
        <div class="db-stat-card">
          <div class="db-stat-value">{{ stats.projects }}</div>
          <div class="db-stat-label">Projetos</div>
        </div>
        <div class="db-stat-card">
          <div class="db-stat-value">{{ stats.cvs }}</div>
          <div class="db-stat-label">Currículos</div>
        </div>
        <div class="db-stat-card">
          <div class="db-stat-value">{{ stats.education }}</div>
          <div class="db-stat-label">Formações</div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="db-card" style="margin-bottom: var(--spacing-lg);">
        <div class="db-card-title">Ações rápidas</div>
        <div class="db-quick-actions-grid">
          <a href="/dashboard/artigos/novo" class="btn btn-primary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Novo Artigo
          </a>
          <a href="/dashboard/projetos/novo" class="btn btn-primary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Novo Projeto
          </a>
          <a href="/dashboard/perfil" class="btn btn-secondary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
            Editar Perfil
          </a>
          <a href="/dashboard/curriculos" class="btn btn-secondary">
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
            Upload CV
          </a>
        </div>
      </div>

      <!-- Recent articles -->
      <div class="db-home-recent-grid">
        <div class="db-card">
          <div class="db-card-title" style="display: flex; justify-content: space-between; align-items: center;">
            Artigos recentes
            <a href="/dashboard/artigos" style="font-size: var(--text-xs); color: var(--primary); text-decoration: none; font-weight: 400;">Ver todos →</a>
          </div>
          <div v-if="loadingArticles" class="loading-center"><div class="spinner spinner-md" /></div>
          <div v-else-if="recentArticles.length === 0" style="color: var(--text-secondary); font-size: var(--text-sm);">Nenhum artigo ainda.</div>
          <div v-else class="db-list">
            <div v-for="a in recentArticles" :key="a.id" class="db-list-item" style="padding: var(--spacing-sm) var(--spacing-md);">
              <div class="db-list-info">
                <div class="db-list-title">{{ a.title }}</div>
                <div class="db-list-meta">
                  <StatusBadge :status="a.status" />
                  <span>{{ formatDate(a.publishedAt || a.createdAt) }}</span>
                </div>
              </div>
              <div class="db-list-actions">
                <a
                  v-if="a.status === 'PUBLISHED'"
                  :href="`/artigo/${a.slug}`"
                  target="_blank"
                  class="btn btn-ghost btn-sm"
                  title="Ver publicado"
                >
                  <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
                <a :href="`/dashboard/artigos/${a.slug}`" class="btn btn-ghost btn-sm">Editar</a>
              </div>
            </div>
          </div>
        </div>

        <div class="db-card">
          <div class="db-card-title" style="display: flex; justify-content: space-between; align-items: center;">
            Projetos recentes
            <a href="/dashboard/projetos" style="font-size: var(--text-xs); color: var(--primary); text-decoration: none; font-weight: 400;">Ver todos →</a>
          </div>
          <div v-if="loadingProjects" class="loading-center"><div class="spinner spinner-md" /></div>
          <div v-else-if="recentProjects.length === 0" style="color: var(--text-secondary); font-size: var(--text-sm);">Nenhum projeto ainda.</div>
          <div v-else class="db-list">
            <div v-for="p in recentProjects" :key="p.id" class="db-list-item" style="padding: var(--spacing-sm) var(--spacing-md);">
              <div class="db-list-info">
                <div class="db-list-title">{{ p.title }}</div>
                <div class="db-list-meta">
                  <StatusBadge :status="p.status" />
                  <span>{{ formatDate(p.createdAt) }}</span>
                </div>
              </div>
              <div class="db-list-actions">
                <a
                  v-if="p.status === 'PUBLISHED'"
                  :href="`/projeto/${p.slug}`"
                  target="_blank"
                  class="btn btn-ghost btn-sm"
                  title="Ver publicado"
                >
                  <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
                <a :href="`/dashboard/projetos/${p.slug}`" class="btn btn-ghost btn-sm">Editar</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import DashboardLayout from './DashboardLayout.vue';
import StatusBadge from '../ui/StatusBadge.vue';
import { getArticles, getProjects, getCVList, getEducation, getFullProfile } from '../../utils/api';
import type { Article, Project, FullProfile } from '../../utils/api';

const user = ref<FullProfile | null>(null);
const stats = ref({ articles: 0, projects: 0, cvs: 0, education: 0 });
const recentArticles = ref<Article[]>([]);
const recentProjects = ref<Project[]>([]);
const loadingArticles = ref(true);
const loadingProjects = ref(true);

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

onMounted(async () => {
  try {
    user.value = await getFullProfile();
    const userId = user.value.id;

    const [draftArts, pubArts, draftProjs, pubProjs, cvs, edu] = await Promise.all([
      getArticles({ limit: 10, status: 'DRAFT', userId }),
      getArticles({ limit: 10, status: 'PUBLISHED', userId }),
      getProjects({ limit: 10, status: 'DRAFT', userId }),
      getProjects({ limit: 10, status: 'PUBLISHED', userId }),
      getCVList(),
      getEducation(),
    ]);

    const allArticles = [
      ...draftArts.data.map(a => ({ ...a, status: 'DRAFT' as const })),
      ...pubArts.data.map(a => ({ ...a, status: 'PUBLISHED' as const })),
    ].sort((a, b) => new Date(b.publishedAt || b.createdAt || 0).getTime() - new Date(a.publishedAt || a.createdAt || 0).getTime());
    recentArticles.value = allArticles.slice(0, 3);
    stats.value.articles = draftArts.total + pubArts.total;

    const allProjects = [
      ...draftProjs.data.map(p => ({ ...p, status: 'DRAFT' as const })),
      ...pubProjs.data.map(p => ({ ...p, status: 'PUBLISHED' as const })),
    ].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    recentProjects.value = allProjects.slice(0, 3);
    stats.value.projects = draftProjs.total + pubProjs.total;

    stats.value.cvs = cvs.length;
    stats.value.education = edu.length;
  } catch {
    // silently ignore
  } finally {
    loadingArticles.value = false;
    loadingProjects.value = false;
  }
});
</script>

