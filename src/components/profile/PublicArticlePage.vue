<template>
  <div>
    <div v-if="loading" class="loading-center" style="min-height: 100vh;"><div class="spinner spinner-lg" /></div>
    <div v-else-if="!article" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 1rem; text-align: center; padding: 2rem;">
      <h1 style="font-size: 1.5rem; color: var(--text-primary);">Artigo não encontrado</h1>
      <a href="/" class="btn btn-primary">Voltar ao início</a>
    </div>
    <article v-else class="public-article">
      <div v-if="article.tags.length" class="public-article-tags">
        <span v-for="tag in article.tags" :key="tag.id" class="public-article-tag">{{ tag.name }}</span>
      </div>

      <h1 class="public-article-title">{{ article.title }}</h1>
      <p v-if="article.subtitle" class="public-article-subtitle">{{ article.subtitle }}</p>

      <div class="public-article-meta">
        <span v-if="article.readTime">{{ article.readTime }} min de leitura</span>
        <span>{{ formatDate(article.publishedAt || article.createdAt) }}</span>
      </div>

      <img v-if="article.coverImageUrl" :src="article.coverImageUrl" :alt="article.title" class="public-article-cover" />

      <div class="public-article-content">
        <TiptapRenderer v-if="article.content" :content="article.content" />
        <div v-else style="color: var(--text-secondary); font-style: italic;">Nenhum conteúdo disponível.</div>
      </div>

      <div v-if="article.conclusion" class="public-article-conclusion">
        {{ article.conclusion }}
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import TiptapRenderer from './TiptapRenderer.vue';
import { getArticle } from '../../utils/api';
import type { Article } from '../../utils/api';

const props = defineProps<{ slug: string }>();

const loading = ref(true);
const article = ref<Article | null>(null);

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

onMounted(async () => {
  try {
    article.value = await getArticle(props.slug);
  } catch {
    article.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
