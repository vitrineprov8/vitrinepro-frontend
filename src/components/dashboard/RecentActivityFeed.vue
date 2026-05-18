<template>
  <div class="raf-card">
    <div class="raf-header">
      <h4 class="raf-title">Atividade recente</h4>
    </div>

    <div v-if="loading" class="raf-loading" aria-busy="true" aria-label="Carregando atividade">
      <div v-for="i in 5" :key="i" class="raf-skeleton-row">
        <div class="raf-skeleton-avatar"></div>
        <div class="raf-skeleton-text">
          <div class="raf-skeleton-line raf-skeleton-line--wide"></div>
          <div class="raf-skeleton-line raf-skeleton-line--narrow"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="raf-error" role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ error }}</span>
    </div>

    <ul v-else-if="feed.length > 0" class="raf-list" aria-label="Atividade recente de candidatos">
      <li v-for="item in feed" :key="item.id" class="raf-item">
        <div
          class="raf-avatar"
          :style="{ background: item.avatarBg, color: item.avatarFg }"
          aria-hidden="true"
        >
          <img
            v-if="item.avatarUrl"
            :src="item.avatarUrl"
            :alt="item.name"
            class="raf-avatar-img"
            loading="lazy"
            width="32"
            height="32"
          />
          <span v-else>{{ item.initials }}</span>
        </div>
        <div class="raf-item-body">
          <p class="raf-item-text">
            <span class="raf-name">{{ item.name }}</span>
            se inscreveu em
            <span class="raf-vaga">{{ item.vagaTitle }}</span>
          </p>
          <time class="raf-time" :datetime="item.createdAt" :title="formatAbsolute(item.createdAt)">
            {{ relativeTime(item.createdAt) }}
          </time>
        </div>
      </li>
    </ul>

    <div v-else class="raf-empty">
      Nenhuma candidatura recente.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getMyVagas, getVagaApplications } from '../../utils/api';
import type { VagaApplicationAdminView } from '../../utils/api';
import { avatarColor } from '../../data/mock-recrutador';

interface FeedItem {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  avatarBg: string;
  avatarFg: string;
  vagaTitle: string;
  createdAt: string;
}

const FEED_LIMIT = 10;

const loading = ref(false);
const error = ref<string | null>(null);
const feed = ref<FeedItem[]>([]);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    // Busca até 10 vagas mais recentes com candidatos
    const vagasPage = await getMyVagas({ limit: 10, status: 'PUBLISHED' });
    const vagasWithCandidates = vagasPage.data.filter(
      (v) => (v.applicationsCount ?? 0) > 0
    );

    if (vagasWithCandidates.length === 0) {
      feed.value = [];
      return;
    }

    // Fetch paralelo das aplicações
    const results = await Promise.allSettled(
      vagasWithCandidates.map((v) =>
        getVagaApplications(v.id).then((apps) =>
          apps.map((a) => ({ ...a, _vagaTitle: v.title }))
        )
      )
    );

    // Coleta todas as aplicações com título da vaga
    const allApps: Array<VagaApplicationAdminView & { _vagaTitle: string }> = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
        allApps.push(...result.value);
      }
    }

    // Ordena por createdAt desc e pega as primeiras FEED_LIMIT
    allApps.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recent = allApps.slice(0, FEED_LIMIT);

    feed.value = recent.map((app) => {
      const firstName = app.user?.firstName ?? app.snapshotFullName.split(' ')[0] ?? '';
      const lastName = app.user?.lastName ?? app.snapshotFullName.split(' ').slice(1).join(' ') ?? '';
      const fullName = app.user
        ? `${firstName} ${lastName}`.trim()
        : app.snapshotFullName;
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
      const colors = avatarColor(initials);

      return {
        id: app.id,
        name: fullName || app.snapshotFullName,
        initials,
        avatarUrl: app.user?.avatarUrl,
        avatarBg: colors.bg,
        avatarFg: colors.fg,
        vagaTitle: app._vagaTitle,
        createdAt: app.createdAt,
      };
    });
  } catch (err) {
    error.value = 'Não foi possível carregar a atividade recente.';
    console.error('[RecentActivityFeed]', err);
  } finally {
    loading.value = false;
  }
});

/**
 * Tempo relativo simples usando Intl.RelativeTimeFormat.
 * Não extraído como util porque é uso único neste componente.
 */
function relativeTime(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = then - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffH = Math.round(diffMin / 60);
  const diffD = Math.round(diffH / 24);
  const diffW = Math.round(diffD / 7);
  const diffMo = Math.round(diffD / 30);

  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, 'second');
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute');
  if (Math.abs(diffH) < 24) return rtf.format(diffH, 'hour');
  if (Math.abs(diffD) < 7) return rtf.format(diffD, 'day');
  if (Math.abs(diffW) < 5) return rtf.format(diffW, 'week');
  return rtf.format(diffMo, 'month');
}

function formatAbsolute(isoDate: string): string {
  return new Date(isoDate).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

<style scoped>
.raf-card {
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.raf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.raf-title {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--text-primary);
}

/* Skeleton */
.raf-loading { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.raf-skeleton-row { display: flex; align-items: center; gap: var(--spacing-sm); }
.raf-skeleton-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  animation: raf-pulse 1.4s ease-in-out infinite;
}
.raf-skeleton-text { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.raf-skeleton-line {
  height: 10px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  animation: raf-pulse 1.4s ease-in-out infinite;
  animation-delay: 0.1s;
}
.raf-skeleton-line--wide { width: 80%; }
.raf-skeleton-line--narrow { width: 40%; }
@keyframes raf-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Error */
.raf-error {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--age-critical-text);
  padding: var(--spacing-sm);
  background: var(--status-error-bg, #fef2f2);
  border-radius: var(--radius-sm);
}

.raf-empty {
  font-size: var(--text-xs);
  color: var(--text-light);
  text-align: center;
  padding: var(--spacing-md) 0;
}

/* Feed list */
.raf-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.raf-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.raf-avatar {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  overflow: hidden;
}

.raf-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.raf-item-body {
  flex: 1;
  min-width: 0;
}

.raf-item-text {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.4;
}

.raf-name {
  font-weight: 600;
  color: var(--text-primary);
}

.raf-vaga {
  font-weight: 600;
  color: var(--primary);
}

.raf-time {
  display: block;
  font-size: 11px;
  color: var(--text-light);
  margin-top: 2px;
}
</style>
