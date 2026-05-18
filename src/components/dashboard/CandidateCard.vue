<template>
  <article
    class="cc-card"
    :class="{ 'cc-card--dragging': dragging }"
    :draggable="draggable"
    :tabindex="0"
    role="article"
    :aria-label="`Candidato ${candidate.fullName}, etapa atual ${stageLabel}`"
    @click="$emit('open', candidate)"
    @keydown.enter.prevent="$emit('open', candidate)"
    @keydown.space.prevent="$emit('open', candidate)"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
  >
    <header class="cc-head">
      <div class="cc-avatar" :style="{ background: avColor.bg, color: avColor.fg }">{{ candidate.initials }}</div>
      <div class="cc-id">
        <div class="cc-name">{{ candidate.fullName }}</div>
        <div class="cc-role">{{ candidate.role }}</div>
      </div>
      <div v-if="candidate.rating" class="cc-rating" :title="`Avaliação ${candidate.rating} de 5`">
        ★ {{ candidate.rating.toFixed(1) }}
      </div>
    </header>

    <div class="cc-meta">
      Candidatura em {{ formatDate(candidate.appliedAt) }}<span v-if="candidate.stageNote"> · {{ candidate.stageNote }}</span>
    </div>

    <div v-if="candidate.tags.length" class="cc-tags">
      <span v-for="tag in candidate.tags.slice(0, 3)" :key="tag" class="cc-tag">{{ tag }}</span>
      <span v-if="candidate.tags.length > 3" class="cc-tag cc-tag--more">+{{ candidate.tags.length - 3 }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, defineProps, defineEmits } from 'vue';
import { avatarColor, STAGE_LABELS, type MockCandidate } from '../../data/mock-recrutador';

const props = defineProps<{
  candidate: MockCandidate;
  draggable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'open', c: MockCandidate): void;
  (e: 'drag-start', c: MockCandidate): void;
  (e: 'drag-end', c: MockCandidate): void;
}>();

const dragging = ref(false);
const avColor = computed(() => avatarColor(props.candidate.fullName));
const stageLabel = computed(() => STAGE_LABELS[props.candidate.stage]);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function onDragStart(ev: DragEvent) {
  if (!props.draggable) return;
  dragging.value = true;
  if (ev.dataTransfer) {
    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', props.candidate.id);
  }
  emit('drag-start', props.candidate);
}

function onDragEnd() {
  dragging.value = false;
  emit('drag-end', props.candidate);
}
</script>

<style scoped>
.cc-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-family: var(--font-sans);
  text-align: left;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast), border-color var(--transition-fast);
}
.cc-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--primary-light);
}
.cc-card:focus-visible {
  outline: 2px solid var(--primary-light);
  outline-offset: 2px;
}
.cc-card--dragging {
  opacity: 0.6;
  transform: rotate(2deg) scale(1.02);
  box-shadow: var(--shadow-xl);
}
.cc-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}
.cc-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.cc-id {
  flex: 1;
  min-width: 0;
}
.cc-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cc-role {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cc-rating {
  font-size: 11px;
  color: var(--accent-dark);
  font-weight: 600;
  flex-shrink: 0;
}
.cc-meta {
  font-size: 11px;
  color: var(--text-light);
}
.cc-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.cc-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  white-space: nowrap;
}
.cc-tag--more {
  background: var(--bg-secondary);
  color: var(--text-light);
}
</style>
