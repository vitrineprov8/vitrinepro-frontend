<template>
  <div :class="$style.wrapper">
    <!-- Skeleton loader -->
    <div v-if="loading" :class="$style.track" aria-hidden="true">
      <div v-for="n in 5" :key="n" :class="[$style.card, $style.skeleton]">
        <div :class="$style.skeletonCover"></div>
        <div :class="$style.skeletonBody">
          <div :class="$style.skeletonLine" style="width:75%;height:14px;"></div>
          <div :class="$style.skeletonLine" style="width:55%;height:12px;margin-top:6px;"></div>
          <div :class="$style.skeletonFooter">
            <div :class="$style.skeletonAvatarSm"></div>
            <div :class="$style.skeletonLine" style="width:80px;height:11px;"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Carousel track -->
    <div
      v-else-if="projects.length > 0"
      ref="trackRef"
      :class="$style.track"
      :style="isDragging ? { cursor: 'grabbing', userSelect: 'none', scrollSnapType: 'none' } : { cursor: 'grab' }"
      role="list"
    >
      <a
        v-for="project in projects"
        :key="project.id"
        :href="`/portfolio/${project.slug}`"
        :class="$style.card"
        role="listitem"
        :aria-label="`Ver projeto: ${project.title}`"
      >
        <!-- Cover image -->
        <div :class="$style.coverWrap">
          <img
            v-if="project.coverImageUrl"
            :src="project.coverImageUrl"
            :alt="`Capa do projeto ${project.title}`"
            :class="$style.cover"
            width="320"
            height="180"
            loading="lazy"
          />
          <div v-else :class="$style.coverFallback" aria-hidden="true"></div>

          <!-- Author avatar overlay -->
          <div v-if="project.user" :class="$style.authorBadge">
            <img
              v-if="project.user.avatarUrl"
              :src="project.user.avatarUrl"
              :alt="`Foto de ${project.user.firstName}`"
              :class="$style.authorAvatar"
              width="28"
              height="28"
              loading="lazy"
            />
            <div v-else :class="$style.authorAvatarFallback" aria-hidden="true">
              {{ project.user.firstName.charAt(0).toUpperCase() }}
            </div>
          </div>
        </div>

        <!-- Card body -->
        <div :class="$style.body">
          <p :class="$style.title">{{ project.title }}</p>
          <p v-if="project.subtitle" :class="$style.subtitle">{{ project.subtitle }}</p>

          <div :class="$style.footer">
            <span v-if="project.user" :class="$style.author">
              {{ project.user.firstName }} {{ project.user.lastName }}
            </span>
            <div v-if="project.tags && project.tags.length > 0" :class="$style.tags">
              <span
                v-for="tag in project.tags.slice(0, 2)"
                :key="tag.id"
                :class="$style.tag"
              >{{ tag.name }}</span>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { searchPortfolio } from '../utils/api';
import type { SearchPortfolioItem } from '../utils/api';

const loading = ref(true);
const projects = ref<SearchPortfolioItem[]>([]);
const trackRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);

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
    const result = await searchPortfolio({ q: '', type: 'project', sortBy: 'relevance', limit: 12 });
    projects.value = result.data.filter((item): item is SearchPortfolioItem => item.kind === 'portfolio');
  } catch {
    // fail silently — section simply won't render
    projects.value = [];
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
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.track::-webkit-scrollbar {
  display: none;
}

/* ── Card ─────────────────────────────────────────────── */
.card {
  flex: 0 0 280px;
  scroll-snap-align: start;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

/* ── Cover ─────────────────────────────────────────────── */
.coverWrap {
  position: relative;
  width: 100%;
  height: 158px;
  overflow: hidden;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform var(--transition-slow);
  /* prevent browser drag-ghost on images */
  pointer-events: none;
}

.card:hover .cover {
  transform: scale(1.04);
}

.coverFallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  opacity: 0.25;
}

/* Author badge on cover */
.authorBadge {
  position: absolute;
  bottom: 8px;
  left: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #fff;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.authorAvatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.authorAvatarFallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

/* ── Body ─────────────────────────────────────────────── */
.body {
  padding: 0.875rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.subtitle {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.625rem;
}

.author {
  font-size: var(--text-xs);
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 110px;
}

.tags {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.tag {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--primary);
  background: rgba(37, 99, 235, 0.08);
  border-radius: var(--radius-full);
  padding: 2px 7px;
  white-space: nowrap;
  max-width: 72px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Skeleton ─────────────────────────────────────────── */
.skeleton {
  pointer-events: none;
  animation: skeletonPulse 1.5s ease-in-out infinite;
}

.skeletonCover {
  width: 100%;
  height: 158px;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

.skeletonBody {
  padding: 0.875rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.skeletonLine {
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
}

.skeletonFooter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding-top: 0.625rem;
}

.skeletonAvatarSm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  flex-shrink: 0;
}

@keyframes skeletonPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ── Desktop: wider cards ─────────────────────────────── */
@media (min-width: 768px) {
  .card {
    flex: 0 0 310px;
  }
}
</style>
