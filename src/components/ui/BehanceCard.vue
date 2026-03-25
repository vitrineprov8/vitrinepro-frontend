<template>
  <a
    :href="`/portfolio/${item.slug}`"
    class="behance-card"
    :class="[layout === 'list' && 'list-layout', size === 'compact' && 'compact-size']"
  >
    <div class="behance-card-image">
      <img v-if="item.coverImageUrl" :src="item.coverImageUrl" :alt="item.title" loading="lazy" />
      <div v-else class="behance-card-placeholder">
        <svg width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v14.25a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V3.75A.75.75 0 013.75 3z"/>
        </svg>
      </div>
      <div v-if="item.tags?.length" class="behance-card-overlay">
        <span class="behance-category-badge">{{ item.tags[0].name }}</span>
      </div>
    </div>
    <div class="behance-card-body">
      <div v-if="item.tags?.length" class="behance-card-tags">
        <span
          v-for="tag in item.tags.slice(0, size === 'compact' ? 1 : 3)"
          :key="tag.id"
          class="behance-tag"
        >{{ tag.name }}</span>
      </div>
      <p class="behance-card-title">{{ item.title }}</p>
      <p v-if="item.user" class="behance-card-author">
        {{ item.user.firstName }} {{ item.user.lastName }}
      </p>
      <template v-if="size !== 'compact'">
        <p v-if="item.subtitle" class="behance-card-subtitle">{{ item.subtitle }}</p>
        <p v-if="item.description" class="behance-card-description">{{ item.description }}</p>
      </template>
      <div class="behance-card-meta">
        <span v-if="item.year">{{ item.year }}</span>
        <span v-if="item.year && item.projectStatus" style="color:var(--border)">•</span>
        <span v-if="item.projectStatus">{{ statusLabel(item.projectStatus) }}</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
interface Tag {
  id: string;
  name: string;
}

interface PortfolioItemUser {
  firstName: string;
  lastName: string;
  username?: string;
  avatarUrl?: string;
}

interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  coverImageUrl?: string;
  year?: string | number;
  projectStatus?: string;
  tags: Tag[];
  user?: PortfolioItemUser;
}

const props = withDefaults(
  defineProps<{
    item: PortfolioItem;
    layout?: 'grid' | 'list';
    size?: 'large' | 'compact';
  }>(),
  {
    layout: 'grid',
    size: 'large',
  }
);

function statusLabel(s: string) {
  const m: Record<string, string> = {
    ONGOING: 'Em andamento',
    COMPLETED: 'Concluído',
    PAUSED: 'Pausado',
    CANCELLED: 'Cancelado',
  };
  return m[s] ?? s;
}
</script>
