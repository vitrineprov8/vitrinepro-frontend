import Image from '@tiptap/extension-image';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import ImageNodeView from '../components/dashboard/ImageNodeView.vue';

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) =>
          el.getAttribute('data-width') || el.style.width || null,
        renderHTML: (attrs) =>
          attrs.width
            ? { 'data-width': attrs.width, style: `width: ${attrs.width}; max-width: 100%;` }
            : {},
      },
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageNodeView);
  },
});
