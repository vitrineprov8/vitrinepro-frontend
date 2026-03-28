<template>
  <div :class="$style.wrapper">
    <!-- Skeleton loader -->
    <div v-if="loading" :class="$style.track" aria-hidden="true">
      <div v-for="n in 6" :key="n" :class="[$style.card, $style.skeleton]">
        <div :class="$style.skeletonAvatar"></div>
        <div :class="$style.skeletonLine" style="width:60%;height:14px;"></div>
        <div :class="$style.skeletonLine" style="width:45%;height:12px;"></div>
        <div :class="$style.skeletonLine" style="width:55%;height:11px;"></div>
      </div>
    </div>

    <!-- Carousel track -->
    <div
      v-else-if="profiles.length > 0"
      ref="trackRef"
      :class="$style.track"
      :style="isDragging ? { cursor: 'grabbing', userSelect: 'none', scrollSnapType: 'none' } : { cursor: 'grab' }"
      role="list"
    >
      <a
        v-for="profile in profiles"
        :key="profile.id"
        :href="`/perfil/${profile.username}`"
        :class="$style.card"
        role="listitem"
        :aria-label="`Ver perfil de ${profile.firstName} ${profile.lastName}`"
      >
        <!-- Avatar -->
        <div :class="$style.avatarWrap">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            :alt="`Foto de ${profile.firstName} ${profile.lastName}`"
            :class="$style.avatar"
            width="72"
            height="72"
            loading="lazy"
          />
          <div v-else :class="$style.avatarFallback" :aria-label="`Iniciais de ${profile.firstName}`">
            {{ initials(profile.firstName, profile.lastName) }}
          </div>
        </div>

        <!-- Info -->
        <div :class="$style.info">
          <p :class="$style.name">{{ profile.firstName }} {{ profile.lastName }}</p>
          <p v-if="profile.profession" :class="$style.profession">{{ profile.profession }}</p>
          <p v-if="profile.location" :class="$style.location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            {{ profile.location }}
          </p>
          <p v-if="profile.projectCount > 0" :class="$style.projects">
            {{ profile.projectCount }} {{ profile.projectCount === 1 ? 'projeto' : 'projetos' }}
          </p>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { searchPortfolio } from '../utils/api';
import type { SearchProfileItem } from '../utils/api';

const loading = ref(true);
const profiles = ref<SearchProfileItem[]>([]);
const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ── Drag-to-scroll ────────────────────────────────────────────────────────────
let dragStartX = 0;
let dragScrollLeft = 0;

function onMouseDown(e: MouseEvent) {
  const el = trackRef.value;
  if (!el) return;
  isDragging.value = true;
  dragStartX = e.pageX - el.offsetLeft;
  dragScrollLeft = el.scrollLeft;
}

function onMouseLeave() {
  isDragging.value = false;
}

function onMouseUp() {
  isDragging.value = false;
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const el = trackRef.value;
  if (!el) return;
  e.preventDefault();
  const x = e.pageX - el.offsetLeft;
  const walk = (x - dragStartX) * 1.5;
  el.scrollLeft = dragScrollLeft - walk;
}

// ── Intersection observer (peek animation — fires once) ───────────────────────
let observer: IntersectionObserver | null = null;

function setupObserver(el: HTMLElement) {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // peek: scroll right ~3 cards, then back to start
          setTimeout(() => {
            el.scrollTo({ left: 600, behavior: 'smooth' });
            setTimeout(() => {
              el.scrollTo({ left: 0, behavior: 'smooth' });
            }, 1200);
          }, 400);
          observer?.unobserve(el);
        }
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(el);
}

onMounted(async () => {
  try {
    const result = await searchPortfolio({ q: '', type: 'professional', sortBy: 'relevance', limit: 12 });
    profiles.value = result.data.filter((item): item is SearchProfileItem => item.kind === 'profile');
  } catch {
    // fail silently — section simply won't render
    profiles.value = [];
  } finally {
    loading.value = false;
  }

  // Wait one tick for v-else-if to render the track element
  requestAnimationFrame(() => {
    const el = trackRef.value;
    if (!el) return;

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    setupObserver(el);
  });
});

onBeforeUnmount(() => {
  const el = trackRef.value;
  if (el) {
    el.removeEventListener('mousedown', onMouseDown);
    el.removeEventListener('mouseleave', onMouseLeave);
    el.removeEventListener('mouseup', onMouseUp);
    el.removeEventListener('mousemove', onMouseMove);
  }
  observer?.disconnect();
  observer = null;
});
</script>

<style module>
.wrapper {
  width: 100%;
  overflow: hidden;
}

.track {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  padding: 8px 4px 16px;
  /* hide scrollbar — keep functionality */
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.track::-webkit-scrollbar {
  display: none;
}

/* ── Card ─────────────────────────────────────────────── */
.card {
  flex: 0 0 200px;
  scroll-snap-align: start;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  padding: 1.25rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: inherit;
  transition: box-shadow var(--transition-base), transform var(--transition-base), border-color var(--transition-base);
  box-shadow: var(--shadow-sm);
  /* prevent cards from being dragged as images during mouse drag */
  -webkit-user-drag: none;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-3px);
  border-color: var(--primary);
}

/* ── Avatar ───────────────────────────────────────────── */
.avatarWrap {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid var(--border);
  /* prevent browser drag-ghost on images */
  pointer-events: none;
}

.avatarFallback {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* ── Info ─────────────────────────────────────────────── */
.info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
  width: 100%;
}

.name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.profession {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  text-align: center;
}

.location {
  font-size: var(--text-xs);
  color: var(--text-light);
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.projects {
  font-size: var(--text-xs);
  color: var(--primary);
  font-weight: 500;
  margin: 0;
}

/* ── Skeleton ─────────────────────────────────────────── */
.skeleton {
  pointer-events: none;
  animation: skeletonPulse 1.5s ease-in-out infinite;
}

.skeletonAvatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bg-tertiary);
}

.skeletonLine {
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
}

@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Desktop: allow wider cards ───────────────────────── */
@media (min-width: 768px) {
  .card {
    flex: 0 0 210px;
  }
}
</style>
