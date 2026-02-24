<template>
  <div class="article-wrap">
    <!-- Hero image -->
    <div v-if="article.coverImageUrl" class="article-hero">
      <img :src="article.coverImageUrl" :alt="article.title" />
      <div class="article-hero-overlay" />
    </div>

    <!-- Article header -->
    <div class="article-header-inner">
      <!-- Tags -->
      <div v-if="article.tags?.length" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:var(--spacing-lg)">
        <span v-for="tag in article.tags" :key="tag.id" class="article-tag-pill">{{ tag.name }}</span>
      </div>

      <h1 class="article-title-hero">{{ article.title }}</h1>
      <p v-if="article.subtitle" class="article-subtitle-hero">{{ article.subtitle }}</p>

      <!-- Meta bar: author + date/readtime -->
      <div class="article-meta-bar">
        <a v-if="authorUsername" :href="`/perfil/${authorUsername}`" class="article-meta-author">
          <div class="article-meta-avatar">
            <img v-if="authorAvatar" :src="authorAvatar" :alt="authorName" />
            <span v-else>{{ authorInitials }}</span>
          </div>
          <div>
            <span class="article-meta-author-name">{{ authorName }}</span>
            <span v-if="authorProfession" class="article-meta-author-profession">{{ authorProfession }}</span>
          </div>
        </a>
        <div v-else class="article-meta-author" style="cursor:default">
          <div class="article-meta-avatar">
            <img v-if="authorAvatar" :src="authorAvatar" :alt="authorName" />
            <span v-else>{{ authorInitials }}</span>
          </div>
          <div>
            <span class="article-meta-author-name">{{ authorName }}</span>
            <span v-if="authorProfession" class="article-meta-author-profession">{{ authorProfession }}</span>
          </div>
        </div>

        <div class="article-meta-right">
          <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
          <span v-if="article.readTime" class="sep">•</span>
          <span v-if="article.readTime">{{ article.readTime }} min de leitura</span>
        </div>
      </div>
    </div>

    <!-- Article body -->
    <div class="article-body">
      <TiptapRenderer v-if="article.content" :content="article.content" />
      <p v-else style="color:var(--text-secondary);font-style:italic">Nenhum conteúdo disponível.</p>

      <!-- Conclusion -->
      <div v-if="article.conclusion" class="article-conclusion-box">
        {{ article.conclusion }}
      </div>

      <!-- CTA box -->
      <div v-if="authorUsername" class="article-cta-box">
        <p>Gostou do conteúdo? Veja o perfil completo do autor.</p>
        <a :href="`/perfil/${authorUsername}`" class="btn-white">Ver Perfil Completo</a>
      </div>
    </div>

    <!-- Author card -->
    <div v-if="article.user" class="article-author-card">
      <div class="article-author-avatar-lg">
        <img v-if="authorAvatar" :src="authorAvatar" :alt="authorName" />
        <span v-else>{{ authorInitials }}</span>
      </div>
      <div class="article-author-card-info">
        <p class="article-author-card-label">Sobre o autor</p>
        <a v-if="authorUsername" :href="`/perfil/${authorUsername}`" class="article-author-card-name">
          {{ authorName }}
        </a>
        <span v-else class="article-author-card-name" style="cursor:default">{{ authorName }}</span>
        <p v-if="authorProfession" class="article-author-card-profession">{{ authorProfession }}</p>
        <p v-if="article.user.bio" class="article-author-card-bio">{{ article.user.bio }}</p>
        <a v-if="authorUsername" :href="`/perfil/${authorUsername}`" class="btn btn-outline">
          Ver Perfil Completo
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TiptapRenderer from './TiptapRenderer.vue';

interface Tag { id: string; name: string; }
interface ArticleUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profession?: string;
  bio?: string;
  avatarUrl?: string;
}
interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  content?: any;
  conclusion?: string;
  coverImageUrl?: string;
  readTime?: number;
  publishedAt?: string;
  createdAt?: string;
  tags: Tag[];
  user?: ArticleUser;
}

const props = defineProps<{ article: Article }>();

const authorName = computed(() => {
  const u = props.article.user;
  if (!u) return 'Autor';
  return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || 'Autor';
});

const authorInitials = computed(() => {
  const u = props.article.user;
  if (!u) return 'A';
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || 'A';
});

const authorUsername = computed(() => props.article.user?.username ?? null);
const authorAvatar = computed(() => props.article.user?.avatarUrl ?? null);
const authorProfession = computed(() => props.article.user?.profession ?? null);

function formatDate(d?: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}
</script>
