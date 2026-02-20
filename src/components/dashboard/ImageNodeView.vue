<template>
  <node-view-wrapper as="div" class="tiptap-img-wrapper">
    <div
      class="tiptap-img-container"
      :class="{ 'is-selected': selected }"
      :style="containerStyle"
      ref="containerRef"
    >
      <img :src="node.attrs.src" :alt="node.attrs.alt || ''" draggable="false" />

      <!-- Size preset toolbar (visible when selected) -->
      <div v-if="selected" class="tiptap-img-toolbar">
        <button
          v-for="p in presets"
          :key="p"
          class="tiptap-img-size-btn"
          :class="{ 'is-active': node.attrs.width === p }"
          @mousedown.prevent="setWidth(p)"
        >{{ p }}</button>
        <button
          class="tiptap-img-size-btn"
          :class="{ 'is-active': !node.attrs.width }"
          @mousedown.prevent="setWidth(null)"
        >Auto</button>
      </div>

      <!-- Drag-to-resize handle (bottom-right corner) -->
      <div
        v-if="selected"
        class="tiptap-img-resize-handle"
        @mousedown.prevent="startResize"
      />
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

const props = defineProps(nodeViewProps);

const containerRef = ref<HTMLElement>();
const presets = ['25%', '50%', '75%', '100%'];

const containerStyle = computed(() => {
  const w = props.node.attrs.width;
  return w ? { width: w } : {};
});

function setWidth(width: string | null) {
  props.updateAttributes({ width });
}

function startResize(e: MouseEvent) {
  const container = containerRef.value;
  if (!container) return;

  const startX = e.clientX;
  const startWidth = container.offsetWidth;
  const parentWidth = container.parentElement?.offsetWidth ?? startWidth;

  function onMove(ev: MouseEvent) {
    const delta = ev.clientX - startX;
    const newPx = Math.max(60, Math.min(parentWidth, startWidth + delta));
    container.style.width = `${Math.round((newPx / parentWidth) * 100)}%`;
  }

  function onUp(ev: MouseEvent) {
    const delta = ev.clientX - startX;
    const newPx = Math.max(60, Math.min(parentWidth, startWidth + delta));
    const pct = Math.round((newPx / parentWidth) * 100);
    props.updateAttributes({ width: `${pct}%` });
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  }

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}
</script>

<style>
/* Global (not scoped) so styles apply wherever this NodeView renders */
.tiptap-img-wrapper {
  display: block;
  line-height: 0;
  margin: 12px 0;
}

.tiptap-img-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
  line-height: 0;
  vertical-align: top;
}

.tiptap-img-container.is-selected {
  outline: 2px solid var(--primary, #6366f1);
  outline-offset: 2px;
  border-radius: 6px;
}

.tiptap-img-container img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 6px;
  user-select: none;
}

/* Floating size toolbar */
.tiptap-img-toolbar {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
  background: var(--bg-primary, #fff);
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 6px;
  padding: 3px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  z-index: 20;
  white-space: nowrap;
}

.tiptap-img-size-btn {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary, #64748b);
  transition: background 0.1s, color 0.1s;
  font-family: inherit;
}

.tiptap-img-size-btn:hover {
  background: var(--bg-tertiary, #f1f5f9);
  color: var(--text-primary, #1e293b);
}

.tiptap-img-size-btn.is-active {
  background: var(--primary, #6366f1);
  color: #fff;
}

/* Resize drag handle */
.tiptap-img-resize-handle {
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  background: var(--primary, #6366f1);
  border: 2px solid #fff;
  border-radius: 3px;
  cursor: se-resize;
  z-index: 20;
}
</style>
