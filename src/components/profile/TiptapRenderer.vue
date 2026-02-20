<template>
  <div class="tiptap-renderer">
    <EditorContent :editor="editor" />
  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { ResizableImage } from '../../utils/resizable-image-extension';

const props = defineProps<{ content: any }>();

const editor = useEditor({
  extensions: [
    StarterKit,
    Underline,
    Highlight,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Link.configure({ openOnClick: true }),
    ResizableImage.configure({ inline: false }),
  ],
  content: props.content || '',
  editable: false,
});

watch(() => props.content, (val) => {
  editor.value?.commands.setContent(val || '', false);
});

onBeforeUnmount(() => editor.value?.destroy());
</script>

<style scoped>
.tiptap-renderer :deep(.ProseMirror) {
  padding: 0;
  min-height: unset;
}
.tiptap-renderer :deep(.ProseMirror:focus) { outline: none; }
</style>
