<template>
  <div class="share-btn-wrap" ref="wrapRef">
    <button type="button" class="share-trigger-btn" @click="handleShare" title="Compartilhar">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    </button>

    <div v-if="showDropdown" class="share-dropdown">
      <a
        :href="`https://api.whatsapp.com/send?text=${encodeURIComponent(props.title + ' ' + props.url)}`"
        target="_blank"
        rel="noopener"
        class="share-option"
        @click="showDropdown = false"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.49"/></svg>
        WhatsApp
      </a>
      <a
        :href="`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`"
        target="_blank"
        rel="noopener"
        class="share-option"
        @click="showDropdown = false"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>
        LinkedIn
      </a>
      <button type="button" class="share-option" @click="copyLink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        {{ copied ? 'Copiado!' : 'Copiar link' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  url: string;
  title: string;
  text?: string;
}>();

const showDropdown = ref(false);
const copied = ref(false);
const wrapRef = ref<HTMLElement>();

async function handleShare() {
  if (navigator.share) {
    try {
      await navigator.share({ title: props.title, text: props.text, url: props.url });
    } catch {
      // user dismissed
    }
  } else {
    showDropdown.value = !showDropdown.value;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
      showDropdown.value = false;
    }, 2000);
  } catch {
    // fallback
  }
}

function onClickOutside(e: MouseEvent) {
  if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
    showDropdown.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.share-btn-wrap {
  position: relative;
  display: inline-block;
}

.share-trigger-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full, 9999px);
  border: 1px solid var(--border);
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s, background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.share-trigger-btn:hover {
  color: white;
  background: var(--primary);
  border-color: var(--primary);
}

.share-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  z-index: 1000;
  min-width: 200px;
  overflow: hidden;
}

.share-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--text-sm);
  color: var(--text-primary);
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.share-option:hover {
  background: var(--bg-secondary);
}
</style>
