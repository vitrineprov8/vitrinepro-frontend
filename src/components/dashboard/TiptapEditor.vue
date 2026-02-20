<template>
  <div class="tiptap-wrapper" @dragover.prevent @drop.prevent="onDrop">
    <div class="tiptap-toolbar" v-if="editor">
      <!-- Text style -->
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()" title="Negrito"><b>B</b></button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()" title="Itálico"><i>I</i></button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('underline') }" @click="editor.chain().focus().toggleUnderline().run()" title="Sublinhado"><u>U</u></button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('highlight') }" @click="editor.chain().focus().toggleHighlight().run()" title="Destaque">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.243 4.515l-6.738 6.737-.12 1.18 1.18-.12 6.737-6.737-1.059-1.06zM16.302 3.456l1.06 1.06 1.245-1.245a.75.75 0 0 0-1.06-1.06l-1.245 1.245zM3 17.25l5.69-5.69.707.707L3.707 18H3v-.75zm8.25-5.25l-1.5.15-.15 1.5-2.25 2.25H6v-1.5L8.25 12l.15-1.5 1.5-.15 2.25-2.25v1.5L9.9 11.25l-.15 1.5-1.5.15-1.5 1.5h1.5l1.5-1.5 1.5.15.15-1.5 1.5-1.5h-1.5l-1.5 1.5z"/></svg>
      </button>

      <div class="tiptap-toolbar-divider" />

      <!-- Headings -->
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" title="Título 1">H1</button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" title="Título 2">H2</button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" title="Título 3">H3</button>

      <div class="tiptap-toolbar-divider" />

      <!-- Lists -->
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()" title="Lista">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()" title="Lista numerada">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()" title="Citação">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('code') }" @click="editor.chain().focus().toggleCode().run()" title="Código inline">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('codeBlock') }" @click="editor.chain().focus().toggleCodeBlock().run()" title="Bloco de código">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 10 5 14 9 18"/><polyline points="15 10 19 14 15 18"/></svg>
      </button>
      <button type="button" class="tiptap-btn" @click="editor.chain().focus().setHorizontalRule().run()" title="Linha horizontal">—</button>

      <div class="tiptap-toolbar-divider" />

      <!-- Align -->
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }" @click="editor.chain().focus().setTextAlign('left').run()" title="Esquerda">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }" @click="editor.chain().focus().setTextAlign('center').run()" title="Centralizar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </button>
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }" @click="editor.chain().focus().setTextAlign('right').run()" title="Direita">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
      </button>

      <div class="tiptap-toolbar-divider" />

      <!-- Link -->
      <button type="button" class="tiptap-btn" :class="{ 'is-active': editor.isActive('link') }" @click="setLink" title="Link">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
      </button>

      <!-- Image upload -->
      <button type="button" class="tiptap-btn" @click="imageInput?.click()" :class="{ 'is-active': uploadingImage }" title="Inserir imagem">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <span v-if="uploadingImage" class="tiptap-img-uploading">...</span>
      </button>
      <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="onImageFile" />

      <div class="tiptap-toolbar-divider" />

      <!-- Undo/Redo -->
      <button type="button" class="tiptap-btn" @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" title="Desfazer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
      </button>
      <button type="button" class="tiptap-btn" @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" title="Refazer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
      </button>
    </div>

    <!-- Drop overlay -->
    <div v-if="isDragging" class="tiptap-drop-overlay">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span>Solte para inserir imagem</span>
    </div>

    <div class="tiptap-content">
      <EditorContent :editor="editor" @paste.native="onPaste" />
    </div>

    <div class="tiptap-footer" v-if="editor">
      {{ editor.storage.characterCount?.words() ?? 0 }} palavras · {{ editor.storage.characterCount?.characters() ?? 0 }} caracteres
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, onMounted } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { ResizableImage } from '../../utils/resizable-image-extension';
import Placeholder from '@tiptap/extension-placeholder';
import { uploadContentImage } from '../../utils/api';

const props = defineProps<{
  modelValue: any;
  placeholder?: string;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: any] }>();

const imageInput = ref<HTMLInputElement>();
const uploadingImage = ref(false);
const isDragging = ref(false);

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: false }),
    ResizableImage.configure({ inline: false, allowBase64: false }),
    CharacterCount,
    Placeholder.configure({ placeholder: props.placeholder || 'Escreva aqui...' }),
  ],
  content: props.modelValue || '',
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getJSON());
  },
});

watch(() => props.modelValue, (val) => {
  if (!editor.value) return;
  const current = editor.value.getJSON();
  if (JSON.stringify(current) !== JSON.stringify(val)) {
    editor.value.commands.setContent(val || '', false);
  }
});

function setLink() {
  const prev = editor.value?.getAttributes('link').href;
  const url = window.prompt('URL do link:', prev || 'https://');
  if (url === null) return;
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run();
    return;
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
}

async function uploadAndInsert(file: File) {
  if (!file.type.startsWith('image/')) return;
  uploadingImage.value = true;
  try {
    const { url } = await uploadContentImage(file);
    editor.value?.chain().focus().setImage({ src: url }).run();
  } catch {
    alert('Erro ao fazer upload da imagem. Tente novamente.');
  } finally {
    uploadingImage.value = false;
  }
}

function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) uploadAndInsert(file);
  (e.target as HTMLInputElement).value = '';
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) uploadAndInsert(file);
}

// Paste images from clipboard
function onPaste(e: ClipboardEvent) {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) uploadAndInsert(file);
      return;
    }
  }
}

// Drag over the wrapper to show overlay
onMounted(() => {
  const wrapper = document.querySelector('.tiptap-wrapper');
  if (!wrapper) return;
  wrapper.addEventListener('dragenter', () => { isDragging.value = true; });
  wrapper.addEventListener('dragleave', (e: any) => {
    if (!wrapper.contains(e.relatedTarget as Node)) isDragging.value = false;
  });
});

onBeforeUnmount(() => editor.value?.destroy());
</script>
