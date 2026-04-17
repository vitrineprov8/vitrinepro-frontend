<template>
  <a :href="`/perfil/${item.username}`" data-testid="result-card" data-type="profile" class="vitrine-card vitrine-card--profile">
    <div class="vitrine-card-body vitrine-profile-body">
      <!-- Avatar -->
      <div class="vitrine-profile-avatar">
        <img
          v-if="item.avatarUrl"
          :src="item.avatarUrl"
          :alt="fullName"
          width="64"
          height="64"
          loading="lazy"
        />
        <span v-else class="vitrine-profile-initials">{{ initials }}</span>
      </div>

      <!-- Info -->
      <div class="vitrine-profile-info">
        <p class="vitrine-profile-name">{{ fullName }}</p>
        <p v-if="item.profession" class="vitrine-profile-specialty">{{ item.profession }}</p>
        <p v-if="item.location" class="vitrine-profile-location">
          <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>
          </svg>
          {{ item.location }}
        </p>
      </div>

      <!-- CTA button -->
      <div class="vitrine-card-cta">
        <span class="vitrine-cta-btn" :style="ctaStyle">Ver Perfil</span>
      </div>
    </div>
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SearchProfileItem } from '../../utils/api';

const props = defineProps<{
  item: SearchProfileItem;
}>();

const fullName = computed(() => `${props.item.firstName} ${props.item.lastName}`.trim());

const initials = computed(() =>
  `${props.item.firstName?.[0] ?? ''}${props.item.lastName?.[0] ?? ''}`.toUpperCase()
);

const ctaStyle = computed(() => ({
  background: props.item.bannerColor || '#2563EB',
}));
</script>
