<template>
  <div class="vt-root">
    <header class="vt-header">
      <div>
        <div class="vt-title">Timeline</div>
        <div class="vt-sub">Acompanhe suas vagas pelo tempo desde a abertura</div>
      </div>
      <div class="vt-filters" role="toolbar" aria-label="Agrupar por">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          class="vt-filter"
          :class="{ 'vt-filter--active': groupBy === f.id }"
          @click="groupBy = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </header>

    <div class="vt-scroller">
      <div class="vt-grid">
        <section
          v-for="b in buckets"
          :key="b.id"
          class="vt-col"
          :aria-label="`Coluna ${b.label}: ${b.vagas.length} vagas`"
        >
          <header class="vt-col-head" :data-age="b.id">
            <span>{{ b.label }}</span>
            <span class="vt-col-count">{{ b.vagas.length }}</span>
          </header>

          <div class="vt-col-body">
            <article v-for="v in b.vagas" :key="v.id" class="vt-card" :data-age="b.id">
              <div class="vt-card-title">{{ v.title }}</div>
              <div class="vt-card-meta">{{ v.company?.name ?? '' }}{{ v.location ? ` · ${v.location}` : '' }}</div>
              <div class="vt-card-foot">
                <span class="vt-card-date">Abertura {{ formatDate(v.createdAt ?? '') }}</span>
                <span class="vt-card-dot" :data-age="b.id">●</span>
              </div>
            </article>
            <div v-if="b.vagas.length === 0" class="vt-empty">Sem vagas neste intervalo</div>
            <button v-if="b.vagas.length > 0" type="button" class="vt-view-all">+ Ver todas</button>
          </div>
        </section>
      </div>
    </div>

    <aside v-if="showTip" class="vt-tip" role="status">
      <div class="vt-tip-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      </div>
      <div class="vt-tip-content">
        <strong>Dica:</strong> vagas com mais de 90 dias recebem menos visualizações. Atualize ou encerre.
      </div>
      <button class="vt-tip-close" type="button" aria-label="Fechar" @click="showTip = false">×</button>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Vaga } from '../../utils/api';

const props = defineProps<{ vagas: Vaga[] }>();

type BucketId = 'fresh' | 'recent' | 'normal' | 'warn' | 'late' | 'critical';
type FilterId = 'empresa' | 'cargo' | 'agente' | 'regiao';

const BUCKET_DEFS: Array<{ id: BucketId; label: string }> = [
  { id: 'fresh', label: '5 dias' },
  { id: 'recent', label: '15 dias' },
  { id: 'normal', label: '30 dias' },
  { id: 'warn', label: '60 dias' },
  { id: 'late', label: '90 dias' },
  { id: 'critical', label: '+100 dias' },
];

const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'empresa', label: 'Por empresa' },
  { id: 'cargo', label: 'Por cargo' },
  { id: 'agente', label: 'Por agente' },
  { id: 'regiao', label: 'Por região' },
];

const groupBy = ref<FilterId>('empresa');
const showTip = ref(true);

function daysSince(iso: string): number {
  if (!iso) return 0;
  const start = new Date(iso).getTime();
  const today = Date.now();
  return Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));
}

function ageBucket(days: number): BucketId {
  if (days <= 5) return 'fresh';
  if (days <= 15) return 'recent';
  if (days <= 30) return 'normal';
  if (days <= 60) return 'warn';
  if (days <= 90) return 'late';
  return 'critical';
}

const buckets = computed(() => {
  return BUCKET_DEFS.map((b) => ({
    ...b,
    vagas: props.vagas.filter((v) => ageBucket(daysSince(v.createdAt ?? '')) === b.id),
  }));
});

function formatDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
</script>

<style scoped>
.vt-root { display: flex; flex-direction: column; gap: var(--spacing-md); }
.vt-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}
.vt-title { font-size: var(--text-lg); font-weight: 600; color: var(--text-primary); }
.vt-sub { font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px; }

.vt-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.vt-filter {
  padding: 6px 12px;
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
  color: var(--text-secondary);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  font-family: var(--font-sans);
}
.vt-filter:hover { background: var(--bg-secondary); color: var(--text-primary); }
.vt-filter--active {
  background: var(--primary);
  color: #ffffff;
  border-color: var(--primary);
}

.vt-scroller {
  overflow-x: auto;
  padding-bottom: var(--spacing-sm);
  -webkit-overflow-scrolling: touch;
  /* Visual affordance for horizontal scroll on mobile */
  scroll-snap-type: x proximity;
  mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0, black 12px, black calc(100% - 12px), transparent 100%);
}
.vt-grid {
  display: grid;
  grid-template-columns: repeat(6, 170px);
  gap: var(--spacing-sm);
  min-width: calc(6 * 170px + 5 * var(--spacing-sm, 8px));
}
.vt-col { scroll-snap-align: start; }
.vt-col { display: flex; flex-direction: column; gap: var(--spacing-sm); }
.vt-col-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
}
.vt-col-head[data-age='fresh']    { background: var(--age-fresh-bg);    color: var(--age-fresh-text); }
.vt-col-head[data-age='recent']   { background: var(--age-recent-bg);   color: var(--age-recent-text); }
.vt-col-head[data-age='normal']   { background: var(--age-normal-bg);   color: var(--age-normal-text); }
.vt-col-head[data-age='warn']     { background: var(--age-warn-bg);     color: var(--age-warn-text); }
.vt-col-head[data-age='late']     { background: var(--age-late-bg);     color: var(--age-late-text); }
.vt-col-head[data-age='critical'] { background: var(--age-critical-bg); color: var(--age-critical-text); }
.vt-col-count {
  background: rgba(255, 255, 255, 0.6);
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-size: 11px;
}
.vt-col-body { display: flex; flex-direction: column; gap: var(--spacing-xs); }
.vt-card {
  padding: var(--spacing-sm);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.vt-card[data-age='critical'] { border-color: var(--age-critical); }
.vt-card[data-age='late']     { border-color: var(--age-late); }
.vt-card-title { font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); }
.vt-card-meta { font-size: 11px; color: var(--text-secondary); }
.vt-card-foot { display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
.vt-card-date { font-size: 11px; color: var(--text-light); }
.vt-card-dot { font-size: 8px; }
.vt-card-dot[data-age='fresh']    { color: var(--age-fresh); }
.vt-card-dot[data-age='recent']   { color: var(--age-recent); }
.vt-card-dot[data-age='normal']   { color: var(--age-normal); }
.vt-card-dot[data-age='warn']     { color: var(--age-warn); }
.vt-card-dot[data-age='late']     { color: var(--age-late); }
.vt-card-dot[data-age='critical'] { color: var(--age-critical); }

.vt-empty {
  padding: var(--spacing-md);
  text-align: center;
  font-size: 11px;
  color: var(--text-light);
  border: 1px dashed var(--border-dark);
  border-radius: var(--radius-md);
}
.vt-view-all {
  border: none;
  background: transparent;
  font-size: 11px;
  color: var(--primary);
  cursor: pointer;
  padding: 4px;
  min-height: 44px;
  text-align: center;
  font-family: var(--font-sans);
}
.vt-view-all:hover { text-decoration: underline; }

.vt-tip {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--status-pending-bg);
  color: var(--status-pending-text);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  flex-wrap: wrap;
}
.vt-tip-icon { display: flex; flex-shrink: 0; }
.vt-tip-content { flex: 1; min-width: 180px; }
.vt-tip-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0 4px;
  min-height: 44px;
  min-width: 44px;
}

@media (max-width: 768px) {
  .vt-root { gap: var(--spacing-sm); }
  .vt-header { flex-direction: column; align-items: flex-start; gap: var(--spacing-xs); }
  .vt-title { font-size: var(--text-base); }
  .vt-sub { font-size: 11px; }
  .vt-filters {
    gap: 4px;
    width: 100%;
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }
  .vt-filter {
    padding: 8px 12px;
    font-size: 11px;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .vt-grid {
    grid-template-columns: repeat(6, 140px);
    min-width: calc(6 * 140px + 5 * var(--spacing-sm, 8px));
  }
  .vt-col-head { padding: 8px 10px; font-size: 11px; }
  .vt-card { padding: var(--spacing-xs) var(--spacing-sm); }
  .vt-card-title { font-size: var(--text-xs); line-height: 1.3; }
  .vt-card-meta, .vt-card-date { font-size: 10px; }
  .vt-tip { padding: var(--spacing-sm); font-size: var(--text-xs); }
  .vt-tip-content { min-width: 0; }
}

@media (max-width: 480px) {
  .vt-grid {
    grid-template-columns: repeat(6, 130px);
    min-width: calc(6 * 130px + 5 * var(--spacing-sm, 8px));
  }
}
</style>
