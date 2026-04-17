<template>
  <a :href="`/portfolio/${item.slug}`" data-testid="result-card" :data-type="isService ? 'service' : 'portfolio'" class="vitrine-card" :class="isService ? 'vitrine-card--service' : 'vitrine-card--project'">

    <!-- Service badge -->
    <div v-if="isService" class="vitrine-service-badge">Serviços</div>

    <!-- Cover image -->
    <div class="vitrine-card-image-wrap">
      <img
        v-if="item.coverImageUrl"
        :src="item.coverImageUrl"
        :alt="item.title"
        loading="lazy"
      />
      <div v-else class="vitrine-card-placeholder">
        <svg width="36" height="36" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3.75 3h16.5A.75.75 0 0121 3.75v14.25a.75.75 0 01-.75.75H3.75A.75.75 0 013 18V3.75A.75.75 0 013.75 3z"/>
        </svg>
      </div>
    </div>

    <!-- Body -->
    <div class="vitrine-card-body">
      <p class="vitrine-card-title">{{ item.title }}</p>

      <!-- Tags (project mode) -->
      <div v-if="!isService && item.tags?.length" class="vitrine-card-tags">
        <span v-for="tag in item.tags.slice(0, 2)" :key="tag.id" class="vitrine-tag">{{ tag.name }}</span>
      </div>

      <!-- Price (service mode) -->
      <p v-if="isService && servicePrice" class="vitrine-service-price">{{ servicePrice }}</p>

      <!-- CTA button -->
      <div class="vitrine-card-cta">
        <span class="vitrine-cta-btn" style="background: #2563EB;">{{ ctaLabel }}</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchPortfolioItem } from '../../utils/api';

// Extended type to account for optional service fields
interface ServicePortfolioItem extends SearchPortfolioItem {
  isService?: boolean;
  serviceType?: string;
  price?: number | string;
  priceLabel?: string;
  actionButton?: string;
}

const props = defineProps<{
  item: ServicePortfolioItem;
}>();

const isService = computed(() =>
  props.item.isService === true ||
  (props.item.serviceType != null && props.item.serviceType !== '')
);

const ctaLabel = computed(() => {
  if (isService.value) {
    return (props.item as ServicePortfolioItem).actionButton || 'EU QUERO';
  }
  return 'Saber Mais';
});

const servicePrice = computed(() => {
  const p = props.item as ServicePortfolioItem;
  if (p.priceLabel) return p.priceLabel;
  if (p.price != null) {
    const num = typeof p.price === 'string' ? parseFloat(p.price) : p.price;
    if (!isNaN(num)) {
      return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${p.serviceType ? ' ' + p.serviceType : ''}`;
    }
    return String(p.price);
  }
  return null;
});
</script>
